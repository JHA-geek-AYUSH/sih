import User from '../models/User.js';
import { sendTokenResponse } from '../utils/jwt.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import logger from '../utils/logger.js';

// @desc    Register user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, location, pharmacyDetails } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User already exists with this email', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      location,
      pharmacyDetails: role === 'pharmacy' ? pharmacyDetails : undefined
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      logger.error('Welcome email failed:', emailError);
    }

    logger.info(`New user registered: ${email} with role: ${role}`);
    sendTokenResponse(user, 201, res);

  } catch (error) {
    next(error);
  }
};

// @desc    Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Account has been deactivated', 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);
    sendTokenResponse(user, 200, res);

  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    successResponse(res, user, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    const { name, phone, location, pharmacyDetails } = req.body;

    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (location) fieldsToUpdate.location = location;
    if (pharmacyDetails && req.user.role === 'pharmacy') {
      fieldsToUpdate.pharmacyDetails = pharmacyDetails;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  successResponse(res, null, 'User logged out successfully');
};
