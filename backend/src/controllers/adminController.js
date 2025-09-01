import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import Reservation from '../models/Reservation.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import { AnalyticsService } from '../services/analyticsService.js';
import logger from '../utils/logger.js';

// @desc    Get admin dashboard analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get key metrics
    const totalPharmacies = await User.countDocuments({ role: 'pharmacy', isActive: true });
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });
    const totalMedicines = await Medicine.countDocuments({ isActive: true });
    
    // Critical alerts (low stock items)
    const criticalAlerts = await Inventory.countDocuments({ 
      status: { $in: ['low', 'out-of-stock'] }
    });

    // Recent activity
    const newPatientsThisWeek = await User.countDocuments({
      role: 'patient',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const reservationsThisMonth = await Reservation.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    successResponse(res, {
      overview: {
        totalPharmacies,
        totalPatients,
        totalMedicines,
        criticalAlerts,
        newPatientsThisWeek,
        reservationsThisMonth
      },
      timeframe,
      lastUpdated: new Date()
    }, 'Analytics retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy performance data
export const getPharmacies = async (req, res, next) => {
  try {
    const pharmacies = await User.find({ role: 'pharmacy', isActive: true })
      .select('name email pharmacyDetails location createdAt');

    const pharmacyData = await Promise.all(
      pharmacies.map(async (pharmacy) => {
        const performance = await AnalyticsService.getPharmacyPerformance(pharmacy._id, 30);
        
        return {
          id: pharmacy._id,
          name: pharmacy.pharmacyDetails?.pharmacyName || pharmacy.name,
          email: pharmacy.email,
          location: pharmacy.location,
          ...performance,
          joinedDate: pharmacy.createdAt
        };
      })
    );

    successResponse(res, pharmacyData, 'Pharmacy data retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Get demand trends
export const getDemandTrends = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    // Get monthly demand data for the last N months
    const demandData = await Reservation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { 
            $gte: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000) 
          }
        }
      },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine',
          foreignField: '_id',
          as: 'medicineInfo'
        }
      },
      { $unwind: '$medicineInfo' },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            category: '$medicineInfo.category'
          },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $group: {
          _id: { month: '$_id.month', year: '$_id.year' },
          categories: {
            $push: {
              category: '$_id.category',
              quantity: '$totalQuantity',
              revenue: '$totalRevenue'
            }
          },
          totalQuantity: { $sum: '$totalQuantity' },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    successResponse(res, demandData, 'Demand trends retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Get system alerts
export const getAlerts = async (req, res, next) => {
  try {
    // Get low stock alerts
    const lowStockAlerts = await Inventory.find({ 
      status: { $in: ['low', 'out-of-stock'] }
    })
    .populate('medicine', 'name category')
    .populate('pharmacy', 'name pharmacyDetails')
    .sort({ currentStock: 1 });

    // Get expired reservations
    const expiredReservations = await Reservation.find({
      status: 'pending',
      expiresAt: { $lt: new Date() }
    }).countDocuments();

    // Get inactive pharmacies (no activity in 7 days)
    const inactivePharmacies = await User.find({
      role: 'pharmacy',
      lastLogin: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).countDocuments();

    successResponse(res, {
      lowStockAlerts: lowStockAlerts.map(item => ({
        id: item._id,
        medicine: item.medicine.name,
        category: item.medicine.category,
        pharmacy: item.pharmacy.pharmacyDetails?.pharmacyName || item.pharmacy.name,
        currentStock: item.currentStock,
        minStock: item.minStockLevel,
        status: item.status
      })),
      expiredReservations,
      inactivePharmacies,
      totalAlerts: lowStockAlerts.length + expiredReservations + inactivePharmacies
    }, 'System alerts retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Get user management data
export const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    paginatedResponse(res, users, {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      total
    }, 'Users retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    successResponse(res, 
      { id: user._id, isActive: user.isActive }, 
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );

  } catch (error) {
    next(error);
  }
};
