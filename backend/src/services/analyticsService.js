import Reservation from '../models/Reservation.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Analytics from '../models/Analytics.js';
import logger from '../utils/logger.js';

export class AnalyticsService {
  // Generate daily analytics
  static async generateDailyStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Daily reservations
      const dailyReservations = await Reservation.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      });

      // Daily revenue
      const dailyRevenue = await Reservation.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: today, $lt: tomorrow }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ]);

      // New users
      const newUsers = await User.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      });

      // Low stock alerts
      const lowStockCount = await Inventory.countDocuments({
        status: { $in: ['low', 'out-of-stock'] }
      });

      const stats = {
        date: today,
        reservations: dailyReservations,
        revenue: dailyRevenue[0]?.total || 0,
        newUsers,
        lowStockAlerts: lowStockCount
      };

      // Save to analytics collection
      await Analytics.create({
        type: 'daily_stats',
        date: today,
        data: stats
      });

      logger.info('Daily analytics generated successfully');
      return stats;

    } catch (error) {
      logger.error('Error generating daily analytics:', error);
      throw error;
    }
  }

  // Get pharmacy performance metrics
  static async getPharmacyPerformance(pharmacyId, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const performance = await Reservation.aggregate([
        {
          $match: {
            pharmacy: pharmacyId,
            createdAt: { $gte: startDate },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalReservations: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' },
            avgOrderValue: { $avg: '$totalPrice' }
          }
        }
      ]);

      const inventoryCount = await Inventory.countDocuments({ pharmacy: pharmacyId });
      const lowStockCount = await Inventory.countDocuments({ 
        pharmacy: pharmacyId, 
        status: { $in: ['low', 'out-of-stock'] }
      });

      return {
        reservations: performance[0]?.totalReservations || 0,
        revenue: performance[0]?.totalRevenue || 0,
        avgOrderValue: performance[0]?.avgOrderValue || 0,
        inventoryItems: inventoryCount,
        lowStockItems: lowStockCount,
        period: `${days} days`
      };

    } catch (error) {
      logger.error('Error calculating pharmacy performance:', error);
      throw error;
    }
  }

  // Get medicine demand trends
  static async getMedicineDemandTrends(medicineId, months = 6) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const trends = await Reservation.aggregate([
        {
          $match: {
            medicine: medicineId,
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalQuantity: { $sum: '$quantity' },
            totalRevenue: { $sum: '$totalPrice' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      return trends.map(trend => ({
        period: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
        quantity: trend.totalQuantity,
        revenue: trend.totalRevenue,
        orders: trend.orderCount
      }));

    } catch (error) {
      logger.error('Error getting medicine demand trends:', error);
      throw error;
    }
  }

  // Get regional analytics
  static async getRegionalAnalytics() {
    try {
      const regionalData = await User.aggregate([
        {
          $match: { role: 'pharmacy', isActive: true }
        },
        {
          $group: {
            _id: '$location.state',
            pharmacyCount: { $sum: 1 },
            districts: { $addToSet: '$location.district' }
          }
        },
        {
          $project: {
            state: '$_id',
            pharmacyCount: 1,
            districtCount: { $size: '$districts' }
          }
        }
      ]);

      return regionalData;

    } catch (error) {
      logger.error('Error getting regional analytics:', error);
      throw error;
    }
  }
}
