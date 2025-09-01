import express from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import Reservation from '../models/Reservation.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
router.get('/analytics', protect, authorize('admin'), async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      data: {
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
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get pharmacy performance data
// @route   GET /api/admin/pharmacies
// @access  Private (Admin only)
router.get('/pharmacies', protect, authorize('admin'), async (req, res, next) => {
  try {
    const pharmacies = await User.find({ role: 'pharmacy', isActive: true })
      .select('name email pharmacyDetails location createdAt');

    const pharmacyData = await Promise.all(
      pharmacies.map(async (pharmacy) => {
        const medicineCount = await Inventory.countDocuments({ pharmacy: pharmacy._id });
        const lowStockCount = await Inventory.countDocuments({ 
          pharmacy: pharmacy._id, 
          status: { $in: ['low', 'out-of-stock'] }
        });
        
        const revenue = await Reservation.aggregate([
          { 
            $match: { 
              pharmacy: pharmacy._id, 
              status: 'completed',
              createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        return {
          id: pharmacy._id,
          name: pharmacy.pharmacyDetails?.pharmacyName || pharmacy.name,
          email: pharmacy.email,
          location: pharmacy.location,
          medicines: medicineCount,
          lowStock: lowStockCount,
          revenue: revenue[0]?.total || 0,
          joinedDate: pharmacy.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      count: pharmacyData.length,
      data: pharmacyData
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get demand trends
// @route   GET /api/admin/demand-trends
// @access  Private (Admin only)
router.get('/demand-trends', protect, authorize('admin'), async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      data: demandData
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get category distribution
// @route   GET /api/admin/category-distribution
// @access  Private (Admin only)
router.get('/category-distribution', protect, authorize('admin'), async (req, res, next) => {
  try {
    const distribution = await Medicine.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    
    const distributionWithPercentage = distribution.map(item => ({
      name: item._id,
      value: item.count,
      percentage: ((item.count / total) * 100).toFixed(1)
    }));

    res.status(200).json({
      success: true,
      data: distributionWithPercentage
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get system alerts
// @route   GET /api/admin/alerts
// @access  Private (Admin only)
router.get('/alerts', protect, authorize('admin'), async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      data: {
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
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get user management data
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), [
  query('role').optional().isIn(['patient', 'pharmacy', 'admin']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: users
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin only)
router.put('/users/:id/toggle-status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { id: user._id, isActive: user.isActive }
    });

  } catch (error) {
    next(error);
  }
});

export default router;
