import { sendSMS } from './smsService.js';
import { sendEmail } from './emailService.js';
import logger from '../utils/logger.js';

export class NotificationService {
  // Send reservation confirmation
  static async sendReservationConfirmation(reservation, patient, pharmacy) {
    try {
      const message = `Medicine Reserved! ${reservation.medicine.name} (${reservation.quantity} units) at ${pharmacy.pharmacyDetails?.pharmacyName || pharmacy.name}. Code: ${reservation.reservationCode}. Valid for 24 hours.`;
      
      await sendSMS(patient.phone, message);
      
      logger.info(`Reservation confirmation sent to ${patient.phone}`);
    } catch (error) {
      logger.error('Failed to send reservation confirmation:', error);
    }
  }

  // Send stock alert to pharmacy
  static async sendStockAlert(pharmacy, medicines) {
    try {
      const medicineList = medicines.map(m => `${m.name} (${m.currentStock} left)`).join(', ');
      const message = `RHMS Alert: Low stock at ${pharmacy.pharmacyDetails?.pharmacyName || pharmacy.name}: ${medicineList}. Please restock soon.`;
      
      await sendSMS(pharmacy.phone, message);
      
      logger.info(`Stock alert sent to pharmacy: ${pharmacy.email}`);
    } catch (error) {
      logger.error('Failed to send stock alert:', error);
    }
  }

  // Send bulk notifications
  static async sendBulkNotification(recipients, message, type = 'sms') {
    try {
      const results = [];
      
      for (const recipient of recipients) {
        if (type === 'sms') {
          const result = await sendSMS(recipient.phone, message);
          results.push({ recipient: recipient.phone, success: result.success });
        } else if (type === 'email') {
          const result = await sendEmail({
            to: recipient.email,
            subject: 'RHMS Notification',
            text: message
          });
          results.push({ recipient: recipient.email, success: result.success });
        }
      }

      const successful = results.filter(r => r.success).length;
      logger.info(`Bulk notification sent: ${successful}/${recipients.length} successful`);
      
      return { successful, total: recipients.length, results };
    } catch (error) {
      logger.error('Bulk notification failed:', error);
      return { successful: 0, total: recipients.length, error: error.message };
    }
  }
}
