const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['to_watch', 'in_progress', 'finished'],
    required: true,
    default: 'to_watch',
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  
  // For TV shows
  progress: {
    currentSeason: Number,
    currentEpisode: Number,
    lastWatchedDate: Date
  },
  
  // Custom lists this item belongs to
  customLists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomList'
  }],
  
  addedAt: {
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

// Compound indexes for efficient queries
watchlistItemSchema.index({ userId: 1, status: 1 });
watchlistItemSchema.index({ userId: 1, mediaId: 1 }, { unique: true });
watchlistItemSchema.index({ userId: 1, addedAt: -1 });
watchlistItemSchema.index({ userId: 1, rating: -1 });

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);
