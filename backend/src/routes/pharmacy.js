import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Inventory from '../models/Inventory.js';
import Medicine from '../models/Medicine.js';
import Reservation from '../models/Reservation.js';
import { protect, authorize } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @desc    Get pharmacy inventory
// @route   GET /api/pharmacy/inventory
// @access  Private (Pharmacy only)
router.get('/inventory', protect, authorize('pharmacy'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const skip = (page - 1) * limit;

    let query = { pharmacy: req.user.id };
    if (status) query.status = status;

    const inventory = await Inventory.find(query)
      .populate('medicine')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });

    // Filter by category if specified
    let filteredInventory = inventory;
    if (category) {
      filteredInventory = inventory.filter(item => item.medicine.category === category);
    }

    const total = await Inventory.countDocuments(query);

    res.status(200).json({
      success: true,
      count: filteredInventory.length,
      total,
      data: filteredInventory
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Add medicine to inventory
// @route   POST /api/pharmacy/inventory
// @access  Private (Pharmacy only)
router.post('/inventory', protect, authorize('pharmacy'), [
  body('medicineId').isMongoId().withMessage('Valid medicine ID is required'),
  body('currentStock').isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minStockLevel').isInt({ min: 0 }).withMessage('Min stock level must be a non-negative integer'),
  body('maxStockLevel').isInt({ min: 1 }).withMessage('Max stock level must be a positive integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('batchNumber').optional().trim(),
  body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format'),
  body('supplier').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { medicineId, currentStock, minStockLevel, maxStockLevel, price, batchNumber, expiryDate, supplier } = req.body;

    // Check if medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Check if inventory item already exists
    const existingInventory = await Inventory.findOne({
      medicine: medicineId,
      pharmacy: req.user.id
    });

    if (existingInventory) {
      return res.status(400).json({
        success: false,
        message: 'Medicine already exists in your inventory. Use update endpoint instead.'
      });
    }

    const inventoryItem = await Inventory.create({
      medicine: medicineId,
      pharmacy: req.user.id,
      currentStock,
      minStockLevel,
      maxStockLevel,
      price,
      batchNumber,
      expiryDate,
      supplier
    });

    const populatedItem = await Inventory.findById(inventoryItem._id).populate('medicine');

    logger.info(`Medicine added to inventory: ${medicine.name} by pharmacy: ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: populatedItem
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Update inventory item
// @route   PUT /api/pharmacy/inventory/:id
// @access  Private (Pharmacy only)
router.put('/inventory/:id', protect, authorize('pharmacy'), [
  body('currentStock').optional().isInt({ min: 0 }),
  body('minStockLevel').optional().isInt({ min: 0 }),
  body('maxStockLevel').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('batchNumber').optional().trim(),
  body('expiryDate').optional().isISO8601(),
  body('supplier').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const inventoryItem = await Inventory.findOne({
      _id: req.params.id,
      pharmacy: req.user.id
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('medicine');

    res.status(200).json({
      success: true,
      data: updatedItem
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get pharmacy dashboard stats
// @route   GET /api/pharmacy/stats
// @access  Private (Pharmacy only)
router.get('/stats', protect, authorize('pharmacy'), async (req, res, next) => {
  try {
    const pharmacyId = req.user.id;

    // Get inventory statistics
    const totalItems = await Inventory.countDocuments({ pharmacy: pharmacyId });
    const lowStockItems = await Inventory.countDocuments({ 
      pharmacy: pharmacyId, 
      status: { $in: ['low', 'out-of-stock'] }
    });
    
    const inventoryValue = await Inventory.aggregate([
      { $match: { pharmacy: pharmacyId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$price'] } } } }
    ]);

    // Get recent reservations
    const recentReservations = await Reservation.find({ 
      pharmacy: pharmacyId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        inventoryValue: inventoryValue[0]?.total || 0,
        recentReservations,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get pharmacy reservations
// @route   GET /api/pharmacy/reservations
// @access  Private (Pharmacy only)
router.get('/reservations', protect, authorize('pharmacy'), [
  query('status').optional().isIn(['pending', 'confirmed', 'ready', 'completed', 'cancelled', 'expired']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { pharmacy: req.user.id };
    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('patient', 'name phone')
      .populate('medicine', 'name category')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Reservation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      data: reservations
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Update reservation status
// @route   PUT /api/pharmacy/reservations/:id
// @access  Private (Pharmacy only)
router.put('/reservations/:id', protect, authorize('pharmacy'), [
  body('status').isIn(['confirmed', 'ready', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      pharmacy: req.user.id
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    const { status, notes } = req.body;

    // Update inventory if completing reservation
    if (status === 'completed' && reservation.status !== 'completed') {
      await Inventory.findOneAndUpdate(
        { medicine: reservation.medicine, pharmacy: req.user.id },
        { 
          $inc: { 
            currentStock: -reservation.quantity,
            reservedStock: -reservation.quantity
          }
        }
      );
    }

    // Update reservation
    reservation.status = status;
    if (notes) reservation.notes = notes;
    await reservation.save();

    const updatedReservation = await Reservation.findById(reservation._id)
      .populate('patient', 'name phone')
      .populate('medicine', 'name category');

    res.status(200).json({
      success: true,
      data: updatedReservation
    });

  } catch (error) {
    next(error);
  }
});

export default router;
