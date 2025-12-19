const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    // Validation
    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and display name'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      displayName
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Registration successful'
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { displayName, photoURL } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { displayName, photoURL },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const { theme, language, notifications, privacy } = req.body;

    const updateData = {};
    if (theme) updateData['preferences.theme'] = theme;
    if (language) updateData['preferences.language'] = language;
    if (notifications) updateData['preferences.notifications'] = notifications;
    if (privacy) updateData['preferences.privacy'] = privacy;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
