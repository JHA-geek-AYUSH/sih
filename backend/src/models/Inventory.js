import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  batchNumber: String,
  expiryDate: Date,
  supplier: String,
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['available', 'low', 'out-of-stock', 'expired'],
    default: function() {
      if (this.currentStock === 0) return 'out-of-stock';
      if (this.currentStock < this.minStockLevel) return 'low';
      return 'available';
    }
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0
  },
  availableStock: {
    type: Number,
    default: function() {
      return this.currentStock - this.reservedStock;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update status before saving
inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.currentStock === 0) {
    this.status = 'out-of-stock';
  } else if (this.currentStock < this.minStockLevel) {
    this.status = 'low';
  } else if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = 'expired';
  } else {
    this.status = 'available';
  }
  
  this.availableStock = this.currentStock - this.reservedStock;
  next();
});

// Compound index for efficient queries
inventorySchema.index({ pharmacy: 1, medicine: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ 'medicine.name': 'text' });

export default mongoose.model('Inventory', inventorySchema);
