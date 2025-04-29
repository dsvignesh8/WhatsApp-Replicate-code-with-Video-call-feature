const Status = require('../models/Status');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all statuses visible to user
// @route   GET /api/v1/status
// @access  Private
exports.getStatuses = async (req, res, next) => {
  try {
    // Get user's contacts
    const user = await User.findById(req.user._id).select('contacts');
    
    // Get statuses from last 24 hours
    const statuses = await Status.find({
      $or: [
        { user: { $in: user.contacts } },
        { user: req.user._id }
      ],
      createdAt: { 
        $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) 
      }
    })
    .populate('user', 'name avatar')
    .populate('viewers.user', 'name avatar')
    .sort('-createdAt');

    // Group statuses by user
    const groupedStatuses = statuses.reduce((acc, status) => {
      const userId = status.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: status.user,
          statuses: []
        };
      }
      acc[userId].statuses.push(status);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: Object.values(groupedStatuses)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new status
// @route   POST /api/v1/status
// @access  Private
exports.createStatus = async (req, res, next) => {
  try {
    const { type, content, mediaUrl, caption, backgroundColor, font, privacy, visibleTo } = req.body;

    const status = await Status.create({
      user: req.user._id,
      type,
      content,
      mediaUrl,
      caption,
      backgroundColor,
      font,
      privacy,
      visibleTo: privacy === 'specific' ? visibleTo : undefined
    });

    await status.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      data: status
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single status
// @route   GET /api/v1/status/:id
// @access  Private
exports.getStatus = async (req, res, next) => {
  try {
    const status = await Status.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('viewers.user', 'name avatar');

    if (!status) {
      return next(new ErrorResponse('Status not found', 404));
    }

    // Check if user can view the status
    if (!status.canView(req.user._id)) {
      return next(new ErrorResponse('Not authorized to view this status', 403));
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete status
// @route   DELETE /api/v1/status/:id
// @access  Private
exports.deleteStatus = async (req, res, next) => {
  try {
    const status = await Status.findById(req.params.id);

    if (!status) {
      return next(new ErrorResponse('Status not found', 404));
    }

    // Make sure user owns status
    if (status.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to delete this status', 403));
    }

    await status.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark status as viewed
// @route   POST /api/v1/status/:id/view
// @access  Private
exports.viewStatus = async (req, res, next) => {
  try {
    const status = await Status.findById(req.params.id);

    if (!status) {
      return next(new ErrorResponse('Status not found', 404));
    }

    // Check if user can view the status
    if (!status.canView(req.user._id)) {
      return next(new ErrorResponse('Not authorized to view this status', 403));
    }

    // Add viewer if not already viewed
    if (!status.viewers.find(v => v.user.toString() === req.user._id.toString())) {
      status.viewers.push({
        user: req.user._id,
        viewedAt: Date.now()
      });
      await status.save();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get status viewers
// @route   GET /api/v1/status/:id/viewers
// @access  Private
exports.getStatusViewers = async (req, res, next) => {
  try {
    const status = await Status.findById(req.params.id)
      .populate('viewers.user', 'name avatar');

    if (!status) {
      return next(new ErrorResponse('Status not found', 404));
    }

    // Make sure user owns status
    if (status.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to view status viewers', 403));
    }

    res.status(200).json({
      success: true,
      data: status.viewers
    });
  } catch (err) {
    next(err);
  }
};
