import Inventory from '../models/Inventory.js';
import Medicine from '../models/Medicine.js';
import Reservation from '../models/Reservation.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import { AnalyticsService } from '../services/analyticsService.js';
import logger from '../utils/logger.js';

// @desc    Get pharmacy inventory
export const getInventory = async (req, res, next) => {
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

    paginatedResponse(res, filteredInventory, {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      total
    }, 'Inventory retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Add medicine to inventory
export const addToInventory = async (req, res, next) => {
  try {
    const { medicineId, currentStock, minStockLevel, maxStockLevel, price, batchNumber, expiryDate, supplier } = req.body;

    // Check if medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    // Check if inventory item already exists
    const existingInventory = await Inventory.findOne({
      medicine: medicineId,
      pharmacy: req.user.id
    });

    if (existingInventory) {
      return errorResponse(res, 'Medicine already exists in your inventory. Use update endpoint instead.', 400);
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
    successResponse(res, populatedItem, 'Medicine added to inventory successfully', 201);

  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item
export const updateInventory = async (req, res, next) => {
  try {
    const inventoryItem = await Inventory.findOne({
      _id: req.params.id,
      pharmacy: req.user.id
    });

    if (!inventoryItem) {
      return errorResponse(res, 'Inventory item not found', 404);
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('medicine');

    successResponse(res, updatedItem, 'Inventory updated successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const pharmacyId = req.user.id;

    // Get basic stats
    const totalItems = await Inventory.countDocuments({ pharmacy: pharmacyId });
    const lowStockItems = await Inventory.countDocuments({ 
      pharmacy: pharmacyId, 
      status: { $in: ['low', 'out-of-stock'] }
    });
    
    const inventoryValue = await Inventory.aggregate([
      { $match: { pharmacy: pharmacyId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$price'] } } } }
    ]);

    // Get performance metrics
    const performance = await AnalyticsService.getPharmacyPerformance(pharmacyId, 30);

    successResponse(res, {
      totalItems,
      lowStockItems,
      inventoryValue: inventoryValue[0]?.total || 0,
      performance,
      lastUpdated: new Date()
    }, 'Dashboard stats retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy reservations
export const getReservations = async (req, res, next) => {
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

    paginatedResponse(res, reservations, {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      total
    }, 'Reservations retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status
export const updateReservationStatus = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      pharmacy: req.user.id
    });

    if (!reservation) {
      return errorResponse(res, 'Reservation not found', 404);
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

    successResponse(res, updatedReservation, 'Reservation updated successfully');

  } catch (error) {
    next(error);
  }
};
