import express from 'express';
import { body, validationResult } from 'express-validator';
import Reservation from '../models/Reservation.js';
import Inventory from '../models/Inventory.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendSMS } from '../services/smsService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private (Patient only)
router.post('/', protect, authorize('patient'), [
  body('pharmacyId').isMongoId().withMessage('Valid pharmacy ID is required'),
  body('medicineId').isMongoId().withMessage('Valid medicine ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
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

    const { pharmacyId, medicineId, quantity } = req.body;

    // Check if pharmacy exists
    const pharmacy = await User.findOne({ _id: pharmacyId, role: 'pharmacy' });
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    // Check inventory availability
    const inventoryItem = await Inventory.findOne({
      pharmacy: pharmacyId,
      medicine: medicineId
    }).populate('medicine');

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not available at this pharmacy'
      });
    }

    if (inventoryItem.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${inventoryItem.availableStock}`
      });
    }

    // Calculate total price
    const totalPrice = inventoryItem.price * quantity;

    // Create reservation
    const reservation = await Reservation.create({
      patient: req.user.id,
      pharmacy: pharmacyId,
      medicine: medicineId,
      quantity,
      totalPrice
    });

    // Update reserved stock
    await Inventory.findByIdAndUpdate(inventoryItem._id, {
      $inc: { reservedStock: quantity }
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('pharmacy', 'name pharmacyDetails phone')
      .populate('medicine', 'name category')
      .populate('patient', 'name phone');

    // Send SMS notification
    try {
      await sendSMS(
        req.user.phone,
        `Medicine Reserved! ${inventoryItem.medicine.name} (${quantity} units) at ${pharmacy.pharmacyDetails?.pharmacyName || pharmacy.name}. Code: ${reservation.reservationCode}. Valid for 24 hours.`
      );
    } catch (smsError) {
      logger.error('SMS sending failed:', smsError);
    }

    logger.info(`Reservation created: ${reservation.reservationCode} by patient: ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: populatedReservation
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get user reservations
// @route   GET /api/reservations/my
// @access  Private
router.get('/my', protect, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'pharmacy') {
      query.pharmacy = req.user.id;
    }

    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('patient', 'name phone')
      .populate('pharmacy', 'name pharmacyDetails phone location')
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

// @desc    Get reservation by code
// @route   GET /api/reservations/code/:code
// @access  Private
router.get('/code/:code', protect, async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({ 
      reservationCode: req.params.code 
    })
    .populate('patient', 'name phone')
    .populate('pharmacy', 'name pharmacyDetails phone location')
    .populate('medicine', 'name category');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user has access to this reservation
    if (req.user.role === 'patient' && reservation.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this reservation'
      });
    }

    if (req.user.role === 'pharmacy' && reservation.pharmacy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this reservation'
      });
    }

    res.status(200).json({
      success: true,
      data: reservation
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && reservation.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation'
      });
    }

    if (req.user.role === 'pharmacy' && reservation.pharmacy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation'
      });
    }

    if (reservation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed reservation'
      });
    }

    // Update reservation status
    reservation.status = 'cancelled';
    await reservation.save();

    // Release reserved stock
    await Inventory.findOneAndUpdate(
      { medicine: reservation.medicine, pharmacy: reservation.pharmacy },
      { $inc: { reservedStock: -reservation.quantity } }
    );

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });

  } catch (error) {
    next(error);
  }
});

export default router;
