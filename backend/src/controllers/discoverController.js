const WatchlistItem = require('../models/WatchlistItem');
const geminiService = require('../services/geminiService');
const tmdbService = require('../services/tmdbService');

// Get personalized recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { count = 10 } = req.query;

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI recommendations are not available. Please configure GEMINI_API_KEY.'
      });
    }

    // Get user's watch history
    const watchHistory = await WatchlistItem.find({ userId })
      .populate('mediaId')
      .sort({ updatedAt: -1 })
      .limit(50);

    if (watchHistory.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'Add some items to your watchlist to get personalized recommendations'
      });
    }

    // Get AI recommendations
    const aiRecommendations = await geminiService.generateRecommendations(
      req.user,
      watchHistory,
      parseInt(count)
    );

    // Enrich with TMDb data
    const enrichedRecommendations = await Promise.all(
      aiRecommendations.map(async (rec) => {
        try {
          // Search TMDb for the title
          const searchResults = await tmdbService.searchMulti(rec.title, 1);
          const match = searchResults.results.find(r => 
            (r.media_type === 'movie' || r.media_type === 'tv') &&
            (r.title === rec.title || r.name === rec.title)
          );

          if (match) {
            return {
              ...rec,
              tmdbId: match.id.toString(),
              posterPath: match.poster_path,
              voteAverage: match.vote_average,
              overview: match.overview
            };
          }

          return rec;
        } catch (error) {
          return rec;
        }
      })
    );

    res.json({
      success: true,
      data: enrichedRecommendations
    });
  } catch (error) {
    next(error);
  }
};

// Get mood-based recommendations
exports.getMoodRecommendations = async (req, res, next) => {
  try {
    const { mood } = req.params;
    const { count = 10 } = req.query;

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI recommendations are not available. Please configure GEMINI_API_KEY.'
      });
    }

    const validMoods = ['happy', 'sad', 'excited', 'relaxed', 'romantic', 'scared', 'inspired'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mood. Valid moods: ${validMoods.join(', ')}`
      });
    }

    // Get AI recommendations for mood
    const aiRecommendations = await geminiService.getMoodBasedRecommendations(
      mood,
      parseInt(count)
    );

    // Enrich with TMDb data
    const enrichedRecommendations = await Promise.all(
      aiRecommendations.map(async (rec) => {
        try {
          const searchResults = await tmdbService.searchMulti(rec.title, 1);
          const match = searchResults.results[0];

          if (match) {
            return {
              ...rec,
              tmdbId: match.id.toString(),
              type: match.media_type,
              posterPath: match.poster_path,
              voteAverage: match.vote_average
            };
          }

          return rec;
        } catch (error) {
          return rec;
        }
      })
    );

    res.json({
      success: true,
      data: {
        mood,
        recommendations: enrichedRecommendations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get guided journey
exports.getGuidedJourney = async (req, res, next) => {
  try {
    const { theme, count = 10 } = req.query;

    if (!theme) {
      return res.status(400).json({
        success: false,
        message: 'Theme is required'
      });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI recommendations are not available. Please configure GEMINI_API_KEY.'
      });
    }

    // Get AI guided journey
    const journey = await geminiService.getGuidedJourney(theme, parseInt(count));

    // Enrich with TMDb data
    const enrichedJourney = await Promise.all(
      journey.map(async (item) => {
        try {
          const searchResults = await tmdbService.searchMulti(item.title, 1);
          const match = searchResults.results[0];

          if (match) {
            return {
              ...item,
              tmdbId: match.id.toString(),
              type: match.media_type,
              posterPath: match.poster_path,
              voteAverage: match.vote_average,
              overview: match.overview
            };
          }

          return item;
        } catch (error) {
          return item;
        }
      })
    );

    res.json({
      success: true,
      data: {
        theme,
        journey: enrichedJourney.sort((a, b) => a.order - b.order)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get genre-based recommendations
exports.getGenreRecommendations = async (req, res, next) => {
  try {
    const { genre } = req.params;
    const { page = 1 } = req.query;

    // Use TMDb discover endpoint
    const results = await tmdbService.discover('movie', {
      with_genres: genre,
      sort_by: 'popularity.desc',
      page
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// Get where to watch
exports.getWhereToWatch = async (req, res, next) => {
  try {
    const { type, tmdbId } = req.params;

    const providers = await tmdbService.getWatchProviders(type, tmdbId);

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
