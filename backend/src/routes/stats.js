const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/overview', statsController.getOverview);
router.get('/yearly/:year', statsController.getYearlyStats);
router.get('/monthly/:year/:month', statsController.getMonthlyStats);
router.get('/genres', statsController.getGenreBreakdown);
router.get('/languages', statsController.getLanguageBreakdown);
router.get('/achievements', statsController.getAchievements);

module.exports = router;
