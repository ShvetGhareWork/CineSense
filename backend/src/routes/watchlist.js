const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

router.get('/', watchlistController.getWatchlist);
router.post('/', watchlistController.addToWatchlist);
router.get('/:id', watchlistController.getWatchlistItem);
router.put('/:id/status', watchlistController.updateStatus);
router.put('/:id/rating', watchlistController.updateRating);
router.put('/:id/notes', watchlistController.updateNotes);
router.put('/:id/progress', watchlistController.updateProgress);
router.delete('/:id', watchlistController.deleteFromWatchlist);

module.exports = router;
