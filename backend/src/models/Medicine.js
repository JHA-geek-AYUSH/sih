import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    index: true
  },
  genericName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Pain Relief', 'Antibiotic', 'Diabetes', 'Cardiovascular', 'Respiratory', 'General', 'Emergency']
  },
  manufacturer: {
    type: String,
    trim: true
  },
  description: String,
  sideEffects: [String],
  dosage: {
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops']
    },
    strength: String,
    instructions: String
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Text search index
medicineSchema.index({ 
  name: 'text', 
  genericName: 'text', 
  category: 'text' 
});

export default mongoose.model('Medicine', medicineSchema);
