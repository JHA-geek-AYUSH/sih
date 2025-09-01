import mongoose from 'mongoose';

const mlModelSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true,
    unique: true
  },
  version: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['demand_prediction', 'stock_optimization', 'anomaly_detection'],
    required: true
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 1
  },
  trainingData: {
    size: Number,
    startDate: Date,
    endDate: Date
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trainedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('MLModel', mlModelSchema);
