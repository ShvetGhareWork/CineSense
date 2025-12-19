const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  text: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index: one review per user per media
reviewSchema.index({ userId: 1, mediaId: 1 }, { unique: true });
reviewSchema.index({ mediaId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
