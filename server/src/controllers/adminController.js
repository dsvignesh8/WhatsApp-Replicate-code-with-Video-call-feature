const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Call = require('../models/Call');
const Status = require('../models/Status');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users with pagination and filters
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const query = {};
    
    // Add filters
    if (req.query.role) query.role = req.query.role;
    if (req.query.online) query.online = req.query.online === 'true';
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system analytics
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const timeRange = req.query.range || '24h';
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 24 * 60 * 60 * 1000);
    }

    const analytics = {
      users: {
        total: await User.countDocuments(),
        online: await User.countDocuments({ online: true }),
        new: await User.countDocuments({ createdAt: { $gte: startDate } })
      },
      messages: {
        total: await Message.countDocuments(),
        new: await Message.countDocuments({ createdAt: { $gte: startDate } }),
        byType: await Message.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ])
      },
      calls: {
        total: await Call.countDocuments(),
        new: await Call.countDocuments({ createdAt: { $gte: startDate } }),
        byType: await Call.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        byStatus: await Call.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      },
      statuses: {
        total: await Status.countDocuments(),
        new: await Status.countDocuments({ createdAt: { $gte: startDate } }),
        byType: await Status.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ])
      }
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reported content
// @route   GET /api/v1/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const reports = await Message.find({ reported: true })
      .populate('sender', 'name email avatar')
      .populate('conversation')
      .sort('-reportedAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Message.countDocuments({ reported: true });

    res.status(200).json({
      success: true,
      count: reports.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Handle reported content
// @route   PUT /api/v1/admin/reports/:id
// @access  Private/Admin
exports.handleReport = async (req, res, next) => {
  try {
    const { action } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    if (action === 'delete') {
      await message.remove();
    } else if (action === 'dismiss') {
      message.reported = false;
      message.reportReason = undefined;
      message.reportedAt = undefined;
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/v1/admin/users/:id/ban
// @access  Private/Admin
exports.toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    user.banned = !user.banned;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
