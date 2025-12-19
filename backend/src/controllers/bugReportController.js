const BugReport = require('../models/BugReport');

// Submit bug report
exports.submitBugReport = async (req, res) => {
  try {
    const { title, description, category, priority, deviceInfo } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required',
      });
    }

    const bugReport = new BugReport({
      userId: req.user._id,
      title,
      description,
      category: category || 'bug',
      priority: priority || 'medium',
      deviceInfo,
    });

    await bugReport.save();

    res.status(201).json({
      success: true,
      data: bugReport,
      message: 'Bug report submitted successfully',
    });
  } catch (error) {
    console.error('Submit bug report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit bug report',
    });
  }
};

// Get user's bug reports
exports.getUserBugReports = async (req, res) => {
  try {
    const bugReports = await BugReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: bugReports,
    });
  } catch (error) {
    console.error('Get bug reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bug reports',
    });
  }
};

// Get all bug reports (admin only)
exports.getAllBugReports = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const bugReports = await BugReport.find(query)
      .populate('userId', 'displayName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await BugReport.countDocuments(query);

    res.json({
      success: true,
      data: bugReports,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Get all bug reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bug reports',
    });
  }
};
