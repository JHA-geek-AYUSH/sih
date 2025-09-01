import Reservation from '../models/Reservation.js';
import Inventory from '../models/Inventory.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import { NotificationService } from '../services/notificationService.js';
import logger from '../utils/logger.js';

// @desc    Create reservation
export const createReservation = async (req, res, next) => {
  try {
    const { pharmacyId, medicineId, quantity } = req.body;

    // Check if pharmacy exists
    const pharmacy = await User.findOne({ _id: pharmacyId, role: 'pharmacy' });
    if (!pharmacy) {
      return errorResponse(res, 'Pharmacy not found', 404);
    }

    // Check inventory availability
    const inventoryItem = await Inventory.findOne({
      pharmacy: pharmacyId,
      medicine: medicineId
    }).populate('medicine');

    if (!inventoryItem) {
      return errorResponse(res, 'Medicine not available at this pharmacy', 404);
    }

    if (inventoryItem.availableStock < quantity) {
      return errorResponse(res, `Insufficient stock. Available: ${inventoryItem.availableStock}`, 400);
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

    // Send notification
    await NotificationService.sendReservationConfirmation(
      populatedReservation, 
      req.user, 
      pharmacy
    );

    logger.info(`Reservation created: ${reservation.reservationCode} by patient: ${req.user.email}`);
    successResponse(res, populatedReservation, 'Reservation created successfully', 201);

  } catch (error) {
    next(error);
  }
};

// @desc    Get user reservations
export const getMyReservations = async (req, res, next) => {
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

// @desc    Get reservation by code
export const getReservationByCode = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({ 
      reservationCode: req.params.code 
    })
    .populate('patient', 'name phone')
    .populate('pharmacy', 'name pharmacyDetails phone location')
    .populate('medicine', 'name category');

    if (!reservation) {
      return errorResponse(res, 'Reservation not found', 404);
    }

    // Check authorization
    if (req.user.role === 'patient' && reservation.patient._id.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to access this reservation', 403);
    }

    if (req.user.role === 'pharmacy' && reservation.pharmacy._id.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to access this reservation', 403);
    }

    successResponse(res, reservation, 'Reservation retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation
export const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return errorResponse(res, 'Reservation not found', 404);
    }

    // Check authorization
    if (req.user.role === 'patient' && reservation.patient.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to cancel this reservation', 403);
    }

    if (req.user.role === 'pharmacy' && reservation.pharmacy.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to cancel this reservation', 403);
    }

    if (reservation.status === 'completed') {
      return errorResponse(res, 'Cannot cancel completed reservation', 400);
    }

    // Update reservation status
    reservation.status = 'cancelled';
    await reservation.save();

    // Release reserved stock
    await Inventory.findOneAndUpdate(
      { medicine: reservation.medicine, pharmacy: reservation.pharmacy },
      { $inc: { reservedStock: -reservation.quantity } }
    );

    successResponse(res, reservation, 'Reservation cancelled successfully');

  } catch (error) {
    next(error);
  }
};
