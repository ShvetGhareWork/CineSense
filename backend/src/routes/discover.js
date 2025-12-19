const express = require('express');
const router = express.Router();
const discoverController = require('../controllers/discoverController');

// AI-powered recommendations
router.get('/recommendations', discoverController.getRecommendations);
router.get('/mood/:mood', discoverController.getMoodRecommendations);
router.get('/journeys', discoverController.getGuidedJourney);
router.get('/genres/:genre', discoverController.getGenreRecommendations);
router.get('/where-to-watch/:type/:tmdbId', discoverController.getWhereToWatch);

module.exports = router;
