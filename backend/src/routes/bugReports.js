const express = require('express');
const router = express.Router();
const bugReportController = require('../controllers/bugReportController');
const { authenticate } = require('../middleware/auth');

// Submit bug report (requires authentication)
router.post('/', authenticate, bugReportController.submitBugReport);

// Get user's bug reports (requires authentication)
router.get('/my-reports', authenticate, bugReportController.getUserBugReports);

// Get all bug reports (admin only - add admin middleware later)
router.get('/all', authenticate, bugReportController.getAllBugReports);

module.exports = router;
