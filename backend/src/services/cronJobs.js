import cron from 'node-cron';
import Reservation from '../models/Reservation.js';
import Inventory from '../models/Inventory.js';
import { sendSMS } from './smsService.js';
import logger from '../utils/logger.js';

// Clean up expired reservations every hour
export const cleanupExpiredReservations = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const expiredReservations = await Reservation.find({
        status: 'pending',
        expiresAt: { $lt: new Date() }
      });

      for (const reservation of expiredReservations) {
        // Update reservation status
        reservation.status = 'expired';
        await reservation.save();

        // Release reserved stock
        await Inventory.findOneAndUpdate(
          { medicine: reservation.medicine, pharmacy: reservation.pharmacy },
          { $inc: { reservedStock: -reservation.quantity } }
        );
      }

      if (expiredReservations.length > 0) {
        logger.info(`Cleaned up ${expiredReservations.length} expired reservations`);
      }

    } catch (error) {
      logger.error('Error cleaning up expired reservations:', error);
    }
  });
};

// Send low stock alerts every day at 9 AM
export const sendLowStockAlerts = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const lowStockItems = await Inventory.find({
        status: { $in: ['low', 'out-of-stock'] }
      })
      .populate('medicine', 'name category')
      .populate('pharmacy', 'name phone pharmacyDetails');

      const pharmacyAlerts = {};

      // Group alerts by pharmacy
      lowStockItems.forEach(item => {
        const pharmacyId = item.pharmacy._id.toString();
        if (!pharmacyAlerts[pharmacyId]) {
          pharmacyAlerts[pharmacyId] = {
            pharmacy: item.pharmacy,
            items: []
          };
        }
        pharmacyAlerts[pharmacyId].items.push(item);
      });

      // Send SMS alerts to pharmacies
      for (const [pharmacyId, alert] of Object.entries(pharmacyAlerts)) {
        const itemsList = alert.items.map(item => 
          `${item.medicine.name} (${item.currentStock} left)`
        ).join(', ');

        const message = `RHMS Alert: Low stock items at ${alert.pharmacy.pharmacyDetails?.pharmacyName || alert.pharmacy.name}: ${itemsList}. Please restock soon.`;

        await sendSMS(alert.pharmacy.phone, message);
      }

      if (Object.keys(pharmacyAlerts).length > 0) {
        logger.info(`Sent low stock alerts to ${Object.keys(pharmacyAlerts).length} pharmacies`);
      }

    } catch (error) {
      logger.error('Error sending low stock alerts:', error);
    }
  });
};

// Update inventory status every 6 hours
export const updateInventoryStatus = () => {
  cron.schedule('0 */6 * * *', async () => {
    try {
      const inventoryItems = await Inventory.find({});
      let updatedCount = 0;

      for (const item of inventoryItems) {
        let newStatus = item.status;

        // Check expiry
        if (item.expiryDate && item.expiryDate < new Date()) {
          newStatus = 'expired';
        }
        // Check stock levels
        else if (item.currentStock === 0) {
          newStatus = 'out-of-stock';
        } else if (item.currentStock < item.minStockLevel) {
          newStatus = 'low';
        } else {
          newStatus = 'available';
        }

        if (newStatus !== item.status) {
          item.status = newStatus;
          await item.save();
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        logger.info(`Updated status for ${updatedCount} inventory items`);
      }

    } catch (error) {
      logger.error('Error updating inventory status:', error);
    }
  });
};

// Initialize all cron jobs
export const initializeCronJobs = () => {
  cleanupExpiredReservations();
  sendLowStockAlerts();
  updateInventoryStatus();
  logger.info('Cron jobs initialized successfully');
};
