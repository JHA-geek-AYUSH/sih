import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Create transporter
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('Email service not configured - missing credentials');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"RHMS System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully to ${to}`);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    logger.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Rural Healthcare Management System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to RHMS, ${user.name}!</h2>
      <p>Thank you for joining our Rural Healthcare Management System.</p>
      
      ${user.role === 'patient' ? `
        <h3>As a Patient, you can:</h3>
        <ul>
          <li>Search for medicines in nearby pharmacies</li>
          <li>Check real-time availability and prices</li>
          <li>Reserve medicines for pickup</li>
          <li>Track your reservation status</li>
        </ul>
      ` : user.role === 'pharmacy' ? `
        <h3>As a Pharmacy, you can:</h3>
        <ul>
          <li>Manage your medicine inventory</li>
          <li>View AI-powered demand predictions</li>
          <li>Handle patient reservations</li>
          <li>Monitor stock levels and alerts</li>
        </ul>
      ` : `
        <h3>As an Admin, you can:</h3>
        <ul>
          <li>Monitor system-wide analytics</li>
          <li>Manage pharmacy network</li>
          <li>View ML insights and predictions</li>
          <li>Oversee user management</li>
        </ul>
      `}
      
      <p style="margin-top: 20px;">
        <strong>Your login credentials:</strong><br>
        Email: ${user.email}<br>
        Role: ${user.role}
      </p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated message from RHMS. Please do not reply to this email.
      </p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text: `Welcome to RHMS, ${user.name}! Your account has been created successfully.`
  });
};
