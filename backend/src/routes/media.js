const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');

// Search movies/TV shows
router.get('/search', async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = await tmdbService.searchMulti(query, page);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

// Get trending or discovered results
router.get('/trending', async (req, res, next) => {
  try {
    const { mediaType = 'all', timeWindow = 'week', page = 1, with_genres, sort_by } = req.query;
    
    let results;
    // If filters are provided, use discover instead of trending
    if (with_genres || sort_by) {
      const type = mediaType === 'all' ? 'movie' : mediaType;
      results = await tmdbService.discover(type, {
        with_genres,
        sort_by: sort_by || 'popularity.desc',
        page
      });
    } else {
      results = await tmdbService.getTrending(mediaType, timeWindow, page);
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

// ========================================
// PERSON ENDPOINTS (MUST BE BEFORE :type/:id)
// ========================================

const mediaController = require('../controllers/mediaController');

// Person endpoints
router.get('/person/:id', mediaController.getPersonDetails);
router.get('/person/:id/credits', mediaController.getPersonCredits);

// ========================================
// PARAMETERIZED ROUTES (:type/:id)
// ========================================

// Get media details
router.get('/:type/:id', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    
    if (!['movie', 'tv'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be movie or tv'
      });
    }

    const details = await tmdbService.getDetails(type, id);

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    next(error);
  }
});

// Get credits (cast/crew)
router.get('/:type/:id/credits', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    
    if (!['movie', 'tv'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be movie or tv'
      });
    }

    const credits = await tmdbService.getCredits(type, id);

    res.json({
      success: true,
      data: credits
    });
  } catch (error) {
    next(error);
  }
});

// Get TV show season details with episodes
router.get('/tv/:id/season/:seasonNumber', async (req, res, next) => {
  try {
    const { id, seasonNumber } = req.params;
    
    const seasonDetails = await tmdbService.getSeasonDetails(id, seasonNumber);

    res.json({
      success: true,
      data: seasonDetails
    });
  } catch (error) {
    next(error);
  }
});

// Get recommendations
router.get('/:type/:id/recommendations', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { page = 1 } = req.query;
    
    const recommendations = await tmdbService.getRecommendations(type, id, page);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
});

// ========================================
// ADDITIONAL MEDIA ENDPOINTS
// ========================================

// Video endpoints
router.get('/:type/:id/videos', mediaController.getVideos);

// Review endpoints
router.get('/:type/:id/reviews', mediaController.getReviews);

// Similar content endpoints
router.get('/:type/:id/similar', mediaController.getSimilar);

// Combined recommendations + similar (deduplicated)
router.get('/:type/:id/combined', mediaController.getCombinedRecommendations);

// Enhanced watch providers (region-aware)
router.get('/:type/:id/providers', mediaController.getWatchProviders);

module.exports = router;
