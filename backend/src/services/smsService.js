import twilio from 'twilio';
import logger from '../utils/logger.js';

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendSMS = async (to, message) => {
  try {
    if (!client) {
      logger.warn('SMS service not configured - Twilio credentials missing');
      return { success: false, message: 'SMS service not configured' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    logger.info(`SMS sent successfully to ${to}, SID: ${result.sid}`);
    return { success: true, sid: result.sid };

  } catch (error) {
    logger.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendBulkSMS = async (recipients, message) => {
  try {
    const results = await Promise.allSettled(
      recipients.map(phone => sendSMS(phone, message))
    );

    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
    const failed = results.length - successful;

    logger.info(`Bulk SMS completed: ${successful} successful, ${failed} failed`);
    
    return {
      success: true,
      sent: successful,
      failed,
      total: recipients.length
    };

  } catch (error) {
    logger.error('Bulk SMS failed:', error);
    return { success: false, error: error.message };
  }
};
