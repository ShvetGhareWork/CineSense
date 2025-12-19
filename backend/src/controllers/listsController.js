const CustomList = require('../models/CustomList');
const WatchlistItem = require('../models/WatchlistItem');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Get user's custom lists
exports.getLists = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const lists = await CustomList.find({ userId })
      .populate('items')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: lists
    });
  } catch (error) {
    next(error);
  }
};

// Get single list
exports.getList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const list = await CustomList.findOne({ _id: id, userId })
      .populate({
        path: 'items',
        populate: { path: 'mediaId' }
      });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
};

// Create custom list
exports.createList = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, icon, color, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'List name is required'
      });
    }

    const list = await CustomList.create({
      userId,
      name,
      description,
      icon: icon || '📋',
      color: color || '#6C63FF',
      isPublic: isPublic || false,
      items: []
    });

    // Create activity
    await Activity.create({
      userId,
      type: 'listed',
      data: {
        listId: list._id,
        listName: list.name
      }
    });

    // Award XP
    await User.findByIdAndUpdate(userId, {
      $inc: { 'gamification.xp': 10 }
    });

    res.status(201).json({
      success: true,
      data: list,
      message: 'List created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update list
exports.updateList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, description, icon, color, isPublic } = req.body;

    const list = await CustomList.findOneAndUpdate(
      { _id: id, userId },
      { name, description, icon, color, isPublic },
      { new: true, runValidators: true }
    );

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    res.json({
      success: true,
      data: list,
      message: 'List updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete list
exports.deleteList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const list = await CustomList.findOneAndDelete({ _id: id, userId });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    res.json({
      success: true,
      message: 'List deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add item to list
exports.addItemToList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Verify item belongs to user
    const item = await WatchlistItem.findOne({ _id: itemId, userId });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Add to list
    const list = await CustomList.findOneAndUpdate(
      { _id: id, userId },
      { $addToSet: { items: itemId } },
      { new: true }
    ).populate({
      path: 'items',
      populate: { path: 'mediaId' }
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Update watchlist item
    await WatchlistItem.findByIdAndUpdate(itemId, {
      $addToSet: { customLists: id }
    });

    res.json({
      success: true,
      data: list,
      message: 'Item added to list'
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from list
exports.removeItemFromList = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.user._id;

    const list = await CustomList.findOneAndUpdate(
      { _id: id, userId },
      { $pull: { items: itemId } },
      { new: true }
    ).populate({
      path: 'items',
      populate: { path: 'mediaId' }
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Update watchlist item
    await WatchlistItem.findByIdAndUpdate(itemId, {
      $pull: { customLists: id }
    });

    res.json({
      success: true,
      data: list,
      message: 'Item removed from list'
    });
  } catch (error) {
    next(error);
  }
};

// Get community lists
exports.getCommunityLists = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const lists = await CustomList.find({ isPublic: true })
      .populate('userId', 'displayName photoURL')
      .populate({
        path: 'items',
        populate: { path: 'mediaId' }
      })
      .sort({ likes: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CustomList.countDocuments({ isPublic: true });

    res.json({
      success: true,
      data: lists,
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

// Follow/like a public list
exports.followList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const list = await CustomList.findById(id);

    if (!list || !list.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'List not found or not public'
      });
    }

    // Toggle follow
    const isFollowing = list.followers.includes(userId);
    
    if (isFollowing) {
      list.followers = list.followers.filter(f => !f.equals(userId));
      list.likes = Math.max(0, list.likes - 1);
    } else {
      list.followers.push(userId);
      list.likes += 1;
    }

    await list.save();

    res.json({
      success: true,
      data: { isFollowing: !isFollowing, likes: list.likes },
      message: isFollowing ? 'Unfollowed list' : 'Following list'
    });
  } catch (error) {
    next(error);
  }
};
