import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  reservationCode: {
    type: String,
    unique: true,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  },
  pickupInstructions: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique reservation code
reservationSchema.pre('save', function(next) {
  if (!this.reservationCode) {
    this.reservationCode = 'RES' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
reservationSchema.index({ patient: 1, status: 1 });
reservationSchema.index({ pharmacy: 1, status: 1 });
reservationSchema.index({ reservationCode: 1 });
reservationSchema.index({ expiresAt: 1 });

export default mongoose.model('Reservation', reservationSchema);
