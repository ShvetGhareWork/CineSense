const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['watched', 'rated', 'reviewed', 'listed', 'achievement', 'followed'],
    index: true
  },
  data: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 2592000 // Auto-delete after 30 days
  }
});

// Compound index for activity feed
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
