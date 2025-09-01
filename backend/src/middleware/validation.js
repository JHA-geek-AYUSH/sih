import { body, validationResult } from 'express-validator';

// Common validation middleware
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .isIn(['patient', 'pharmacy', 'admin'])
    .withMessage('Role must be patient, pharmacy, or admin'),
  
  validateRequest
];

// Medicine validation
export const validateMedicine = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medicine name must be between 2 and 100 characters'),
  
  body('category')
    .isIn(['Pain Relief', 'Antibiotic', 'Diabetes', 'Cardiovascular', 'Respiratory', 'General', 'Emergency'])
    .withMessage('Invalid medicine category'),
  
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Manufacturer name cannot exceed 100 characters'),
  
  body('dosage.form')
    .optional()
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops'])
    .withMessage('Invalid dosage form'),
  
  validateRequest
];

// Inventory validation
export const validateInventory = [
  body('medicineId')
    .isMongoId()
    .withMessage('Valid medicine ID is required'),
  
  body('currentStock')
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer'),
  
  body('minStockLevel')
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a non-negative integer'),
  
  body('maxStockLevel')
    .isInt({ min: 1 })
    .withMessage('Maximum stock level must be a positive integer'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
  
  validateRequest
];

// Reservation validation
export const validateReservation = [
  body('pharmacyId')
    .isMongoId()
    .withMessage('Valid pharmacy ID is required'),
  
  body('medicineId')
    .isMongoId()
    .withMessage('Valid medicine ID is required'),
  
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  validateRequest
];
