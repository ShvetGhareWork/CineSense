const WatchlistItem = require('../models/WatchlistItem');
const User = require('../models/User');
const Achievement = require('../models/Achievement');

// Get overview stats
exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get basic counts
    const [toWatch, inProgress, finished] = await Promise.all([
      WatchlistItem.countDocuments({ userId, status: 'to_watch' }),
      WatchlistItem.countDocuments({ userId, status: 'in_progress' }),
      WatchlistItem.countDocuments({ userId, status: 'finished' })
    ]);

    // Get user's gamification data
    const user = await User.findById(userId).select('gamification');

    // Get total watch time (estimate based on finished items)
    const finishedItems = await WatchlistItem.find({ userId, status: 'finished' })
      .populate('mediaId', 'runtime numberOfEpisodes type');

    let totalMinutes = 0;
    finishedItems.forEach(item => {
      if (item.mediaId.type === 'movie' && item.mediaId.runtime) {
        totalMinutes += item.mediaId.runtime;
      } else if (item.mediaId.type === 'tv' && item.mediaId.numberOfEpisodes) {
        // Estimate 45 min per episode
        totalMinutes += item.mediaId.numberOfEpisodes * 45;
      }
    });

    const totalHours = Math.round(totalMinutes / 60);

    // Get recent achievements
    const recentAchievements = await Achievement.find({ userId, completed: true })
      .sort({ unlockedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        counts: {
          toWatch,
          inProgress,
          finished,
          total: toWatch + inProgress + finished
        },
        gamification: user.gamification,
        watchTime: {
          totalMinutes,
          totalHours,
          days: Math.round(totalHours / 24)
        },
        recentAchievements
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get yearly stats
exports.getYearlyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { year } = req.params;

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    // Get items added this year
    const yearlyItems = await WatchlistItem.aggregate([
      {
        $match: {
          userId: userId,
          addedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'media',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'media'
        }
      },
      { $unwind: '$media' },
      {
        $group: {
          _id: { $month: '$addedAt' },
          count: { $sum: 1 },
          movies: {
            $sum: { $cond: [{ $eq: ['$media.type', 'movie'] }, 1, 0] }
          },
          tvShows: {
            $sum: { $cond: [{ $eq: ['$media.type', 'tv'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get finished items this year
    const finishedThisYear = await WatchlistItem.countDocuments({
      userId,
      status: 'finished',
      updatedAt: { $gte: startDate, $lte: endDate }
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        monthlyBreakdown: yearlyItems,
        totalAdded: yearlyItems.reduce((sum, m) => sum + m.count, 0),
        totalFinished: finishedThisYear
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get monthly stats
exports.getMonthlyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.params;

    const startDate = new Date(`${year}-${month.padStart(2, '0')}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const monthlyItems = await WatchlistItem.find({
      userId,
      addedAt: { $gte: startDate, $lt: endDate }
    }).populate('mediaId');

    const finished = monthlyItems.filter(i => i.status === 'finished').length;
    const movies = monthlyItems.filter(i => i.mediaId.type === 'movie').length;
    const tvShows = monthlyItems.filter(i => i.mediaId.type === 'tv').length;

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        totalAdded: monthlyItems.length,
        finished,
        movies,
        tvShows,
        items: monthlyItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get genre breakdown
exports.getGenreBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const genreStats = await WatchlistItem.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: 'media',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'media'
        }
      },
      { $unwind: '$media' },
      { $unwind: '$media.genres' },
      {
        $group: {
          _id: '$media.genres.name',
          count: { $sum: 1 },
          finished: {
            $sum: { $cond: [{ $eq: ['$status', 'finished'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: genreStats
    });
  } catch (error) {
    next(error);
  }
};

// Get language breakdown
exports.getLanguageBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const languageStats = await WatchlistItem.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: 'media',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'media'
        }
      },
      { $unwind: '$media' },
      { $unwind: '$media.languages' },
      {
        $group: {
          _id: '$media.languages',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: languageStats
    });
  } catch (error) {
    next(error);
  }
};

// Get achievements
exports.getAchievements = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check and create achievements if they don't exist
    await checkAndCreateAchievements(userId);

    const achievements = await Achievement.find({ userId })
      .sort({ completed: -1, progress: -1 });

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to check and create achievements
async function checkAndCreateAchievements(userId) {
  const items = await WatchlistItem.find({ userId });
  const finished = items.filter(i => i.status === 'finished');

  const achievementTemplates = [
    {
      type: 'milestone',
      name: 'Getting Started',
      description: 'Add your first item to watchlist',
      icon: '🎬',
      target: 1,
      progress: items.length
    },
    {
      type: 'milestone',
      name: 'Movie Buff',
      description: 'Finish 10 movies or shows',
      icon: '🍿',
      target: 10,
      progress: finished.length
    },
    {
      type: 'milestone',
      name: 'Cinephile',
      description: 'Finish 50 movies or shows',
      icon: '🎭',
      target: 50,
      progress: finished.length
    },
    {
      type: 'milestone',
      name: 'Legend',
      description: 'Finish 100 movies or shows',
      icon: '👑',
      target: 100,
      progress: finished.length
    }
  ];

  for (const template of achievementTemplates) {
    const existing = await Achievement.findOne({
      userId,
      type: template.type,
      name: template.name
    });

    if (!existing) {
      await Achievement.create({
        userId,
        ...template,
        completed: template.progress >= template.target,
        unlockedAt: template.progress >= template.target ? new Date() : null
      });
    } else if (!existing.completed && template.progress >= template.target) {
      existing.completed = true;
      existing.unlockedAt = new Date();
      existing.progress = template.progress;
      await existing.save();

      // Award XP
      await User.findByIdAndUpdate(userId, {
        $inc: { 'gamification.xp': 50 }
      });
    } else {
      existing.progress = template.progress;
      await existing.save();
    }
  }
}

module.exports = exports;
