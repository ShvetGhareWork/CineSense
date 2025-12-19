const WatchlistItem = require('../models/WatchlistItem');
const Media = require('../models/Media');
const User = require('../models/User');
const Activity = require('../models/Activity');
const tmdbService = require('../services/tmdbService');

// Get watchlist
exports.getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, sort = 'addedAt', order = 'desc', page = 1, limit = 20 } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const items = await WatchlistItem.find(query)
      .populate('mediaId')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WatchlistItem.countDocuments(query);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single watchlist item
exports.getWatchlistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const item = await WatchlistItem.findOne({ _id: id, userId })
      .populate('mediaId');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Add to watchlist
exports.addToWatchlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { tmdbId, type, status = 'to_watch' } = req.body;

    if (!tmdbId || !type) {
      return res.status(400).json({
        success: false,
        message: 'tmdbId and type are required'
      });
    }

    // Check if media exists in database
    let media = await Media.findOne({ tmdbId, type });

    // If not, fetch from TMDb and create
    if (!media) {
      const tmdbData = await tmdbService.getDetails(type, tmdbId);
      
      media = await Media.create({
        tmdbId,
        type,
        title: tmdbData.title || tmdbData.name,
        originalTitle: tmdbData.original_title || tmdbData.original_name,
        posterPath: tmdbData.poster_path,
        backdropPath: tmdbData.backdrop_path,
        overview: tmdbData.overview,
        releaseDate: tmdbData.release_date || tmdbData.first_air_date,
        genres: tmdbData.genres,
        languages: tmdbData.spoken_languages?.map(l => l.iso_639_1) || [],
        runtime: tmdbData.runtime || tmdbData.episode_run_time?.[0],
        numberOfSeasons: tmdbData.number_of_seasons,
        numberOfEpisodes: tmdbData.number_of_episodes,
        voteAverage: tmdbData.vote_average,
        voteCount: tmdbData.vote_count,
        popularity: tmdbData.popularity,
        imdbId: tmdbData.external_ids?.imdb_id,
        tmdbData
      });
    }

    // Check for duplicates
    const existing = await WatchlistItem.findOne({
      userId,
      mediaId: media._id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This item is already in your watchlist'
      });
    }

    // Create watchlist item
    const watchlistItem = await WatchlistItem.create({
      userId,
      mediaId: media._id,
      status
    });

    await watchlistItem.populate('mediaId');

    // Create activity
    await Activity.create({
      userId,
      type: 'listed',
      data: {
        mediaId: media._id,
        mediaTitle: media.title,
        status
      }
    });

    // Award XP
    await User.findByIdAndUpdate(userId, {
      $inc: { 'gamification.xp': 5 }
    });

    res.status(201).json({
      success: true,
      data: watchlistItem,
      message: 'Added to watchlist successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update status
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { status } = req.body;

    if (!['to_watch', 'in_progress', 'finished'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const item = await WatchlistItem.findOneAndUpdate(
      { _id: id, userId },
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('mediaId');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Create activity if marked as finished
    if (status === 'finished') {
      await Activity.create({
        userId,
        type: 'watched',
        data: {
          mediaId: item.mediaId._id,
          mediaTitle: item.mediaId.title,
          mediaType: item.mediaId.type
        }
      });

      // Award XP
      const xpAmount = item.mediaId.type === 'movie' ? 10 : 5;
      await User.findByIdAndUpdate(userId, {
        $inc: { 'gamification.xp': xpAmount }
      });
    }

    res.json({
      success: true,
      data: item,
      message: 'Status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update rating
exports.updateRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 10'
      });
    }

    const item = await WatchlistItem.findOneAndUpdate(
      { _id: id, userId },
      { rating, updatedAt: new Date() },
      { new: true }
    ).populate('mediaId');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Create activity
    await Activity.create({
      userId,
      type: 'rated',
      data: {
        mediaId: item.mediaId._id,
        mediaTitle: item.mediaId.title,
        rating
      }
    });

    // Award XP
    await User.findByIdAndUpdate(userId, {
      $inc: { 'gamification.xp': 5 }
    });

    res.json({
      success: true,
      data: item,
      message: 'Rating updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update notes
exports.updateNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { notes } = req.body;

    const item = await WatchlistItem.findOneAndUpdate(
      { _id: id, userId },
      { notes, updatedAt: new Date() },
      { new: true }
    ).populate('mediaId');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    res.json({
      success: true,
      data: item,
      message: 'Notes updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update progress (TV shows)
exports.updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { currentSeason, currentEpisode } = req.body;

    const item = await WatchlistItem.findOneAndUpdate(
      { _id: id, userId },
      {
        progress: {
          currentSeason,
          currentEpisode,
          lastWatchedDate: new Date()
        },
        updatedAt: new Date()
      },
      { new: true }
    ).populate('mediaId');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Check if season completed
    let suggestion = null;
    if (item.mediaId.type === 'tv' && item.mediaId.numberOfSeasons) {
      if (currentSeason < item.mediaId.numberOfSeasons) {
        suggestion = {
          message: `Season ${currentSeason} completed! Start Season ${currentSeason + 1}?`,
          nextSeason: currentSeason + 1
        };
      }
    }

    res.json({
      success: true,
      data: item,
      suggestion,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete from watchlist
exports.deleteFromWatchlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const item = await WatchlistItem.findOneAndDelete({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    res.json({
      success: true,
      message: 'Removed from watchlist successfully'
    });
  } catch (error) {
    next(error);
  }
};
