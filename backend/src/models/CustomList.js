const mongoose = require('mongoose');

const customListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  icon: {
    type: String,
    default: '📋'
  },
  color: {
    type: String,
    default: '#6C63FF'
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  isCommunity: {
    type: Boolean,
    default: false
  },
  
  // Array of watchlist item IDs
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatchlistItem'
  }],
  
  // Social features
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: {
    type: Number,
    default: 0
  },
  
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

// Indexes
customListSchema.index({ userId: 1, name: 1 });
customListSchema.index({ isPublic: 1, likes: -1 });
customListSchema.index({ isCommunity: 1 });

module.exports = mongoose.model('CustomList', customListSchema);
