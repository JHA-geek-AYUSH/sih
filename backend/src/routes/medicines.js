import express from 'express';
import {
  searchMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAllMedicines
} from '../controllers/medicineController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateMedicine } from '../middleware/validation.js';
import { searchLimiter } from '../middleware/security.js';

const router = express.Router();

// Apply rate limiting to search
router.use('/search', searchLimiter);

// @desc    Search medicines
// @route   GET /api/medicines/search
// @access  Public
router.get('/search', searchMedicines);

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
router.get('/', getAllMedicines);

// @desc    Get medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
router.get('/:id', getMedicineById);

// @desc    Create medicine
// @route   POST /api/medicines
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), validateMedicine, createMedicine);

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), validateMedicine, updateMedicine);

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteMedicine);

export default router;
