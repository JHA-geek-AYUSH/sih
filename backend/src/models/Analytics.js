import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['daily_stats', 'medicine_demand', 'pharmacy_performance', 'user_activity']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days TTL
  }
});

// Indexes for efficient querying
analyticsSchema.index({ type: 1, date: -1 });
analyticsSchema.index({ pharmacy: 1, date: -1 });
analyticsSchema.index({ medicine: 1, date: -1 });

export default mongoose.model('Analytics', analyticsSchema);
