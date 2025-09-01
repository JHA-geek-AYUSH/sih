// Application constants
export const USER_ROLES = {
  PATIENT: 'patient',
  PHARMACY: 'pharmacy',
  ADMIN: 'admin'
};

export const MEDICINE_CATEGORIES = [
  'Pain Relief',
  'Antibiotic', 
  'Diabetes',
  'Cardiovascular',
  'Respiratory',
  'General',
  'Emergency'
];

export const DOSAGE_FORMS = [
  'tablet',
  'capsule',
  'syrup',
  'injection',
  'cream',
  'drops'
];

export const INVENTORY_STATUS = {
  AVAILABLE: 'available',
  LOW: 'low',
  OUT_OF_STOCK: 'out-of-stock',
  EXPIRED: 'expired'
};

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

export const ML_ALERT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const API_LIMITS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SEARCH_MIN_LENGTH: 1,
  SEARCH_MAX_LENGTH: 100
};

export const RESERVATION_EXPIRY_HOURS = 24;
