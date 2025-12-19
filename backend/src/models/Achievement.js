const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'milestone',
      'genre_master',
      'language_explorer',
      'binge_watcher',
      'critic',
      'social_butterfly',
      'streak_keeper'
    ]
  },
  name: String,
  description: String,
  icon: String,
  progress: {
    type: Number,
    default: 0
  },
  target: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  unlockedAt: Date
}, {
  timestamps: true
});

achievementSchema.index({ userId: 1, type: 1 });
achievementSchema.index({ userId: 1, completed: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
