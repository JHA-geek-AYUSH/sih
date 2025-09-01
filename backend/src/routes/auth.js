import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  logout 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateUserRegistration } from '../middleware/validation.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUserRegistration, register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', logout);

export default router;
