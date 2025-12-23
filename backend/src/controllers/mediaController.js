const tmdbService = require('../services/tmdbService');

// ========================================
// PERSON ENDPOINTS
// ========================================

// Get person details (actor/director profile)
exports.getPersonDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Person ID is required'
      });
    }

    const person = await tmdbService.getPerson(id);

    res.json({
      success: true,
      data: person
    });
  } catch (error) {
    next(error);
  }
};

// Get person's combined credits (filmography)
exports.getPersonCredits = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Person ID is required'
      });
    }

    const credits = await tmdbService.getPersonCredits(id);

    // Sort by release date (descending)
    if (credits.cast) {
      credits.cast.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '0000';
        const dateB = b.release_date || b.first_air_date || '0000';
        return dateB.localeCompare(dateA);
      });
    }

    if (credits.crew) {
      credits.crew.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '0000';
        const dateB = b.release_date || b.first_air_date || '0000';
        return dateB.localeCompare(dateA);
      });
    }

    res.json({
      success: true,
      data: credits
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// VIDEO ENDPOINTS
// ========================================

// Get videos (trailers, teasers, clips)
exports.getVideos = async (req, res, next) => {
  try {
    const { type, id } = req.params;

    if (!['movie', 'tv'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be movie or tv'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Media ID is required'
      });
    }

    const videos = await tmdbService.getVideos(type, id);

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// REVIEW ENDPOINTS
// ========================================

// Get reviews
exports.getReviews = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { page = 1 } = req.query;

    if (!['movie', 'tv'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be movie or tv'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Media ID is required'
      });
    }

    const reviews = await tmdbService.getReviews(type, id, page);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// SIMILAR CONTENT ENDPOINTS
// ========================================

// Get similar content
exports.getSimilar = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { page = 1 } = req.query;

    if (!['movie', 'tv'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be movie or tv'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Media ID is required'
      });
    }

    const similar = await tmdbService.getSimilarEnhanced(type, id, page);

    res.json({
      success: true,
      data: similar
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// COMBINED RECOMMENDATIONS & SIMILAR
// ========================================

// Get combined recommendations and similar content (deduplicated)
exports.getCombinedRecommendations = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { page = 1, watchlistIds = '' } = req.query;

    if (!['movie', 'tv'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be movie or tv'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Media ID is required'
      });
    }

    // Fetch both recommendations and similar content
    const [recommendations, similar] = await Promise.all([
      tmdbService.getRecommendationsEnhanced(type, id, page),
      tmdbService.getSimilarEnhanced(type, id, page)
    ]);

    // Parse watchlist IDs
    const watchlistIdArray = watchlistIds 
      ? watchlistIds.split(',').map(id => parseInt(id))
      : [];

    // Deduplicate
    const combined = tmdbService.deduplicateResults(
      recommendations.results || [],
      similar.results || [],
      watchlistIdArray
    );

    res.json({
      success: true,
      data: {
        results: combined,
        page: parseInt(page),
        total_results: combined.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// WATCH PROVIDERS (ENHANCED)
// ========================================

// Get watch providers (region-aware)
exports.getWatchProviders = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { region = 'IN' } = req.query;

    if (!['movie', 'tv'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be movie or tv'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Media ID is required'
      });
    }

    const providers = await tmdbService.getWatchProvidersEnhanced(type, id, region);

    if (!providers) {
      return res.json({
        success: true,
        data: null,
        message: 'No watch providers available for this region'
      });
    }

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
