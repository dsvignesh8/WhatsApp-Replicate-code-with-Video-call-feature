const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Delete conversation
// @route   DELETE /api/v1/chat/conversations/:conversationId
// @access  Private
exports.deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return next(new ErrorResponse('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return next(new ErrorResponse('Not authorized to delete this conversation', 403));
    }

    if (conversation.type === 'private') {
      // For private conversations, only mark messages as deleted for the user
      await Message.updateMany(
        { conversation: conversation._id },
        { $addToSet: { deletedFor: req.user._id } }
      );

      // Remove user from participants
      conversation.participants.pull(req.user._id);

      if (conversation.participants.length === 0) {
        // If no participants left, delete the conversation
        await Message.deleteMany({ conversation: conversation._id });
        await conversation.remove();
      } else {
        await conversation.save();
      }
    } else if (conversation.type === 'group') {
      // For group conversations, only admin can delete
      if (conversation.groupAdmin.toString() !== req.user._id.toString()) {
        return next(new ErrorResponse('Only group admin can delete the group', 403));
      }

      // Delete all messages and the conversation
      await Message.deleteMany({ conversation: conversation._id });
      await conversation.remove();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update conversation settings
// @route   PUT /api/v1/chat/conversations/:conversationId
// @access  Private
exports.updateConversation = async (req, res, next) => {
  try {
    const { name, groupAvatar } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return next(new ErrorResponse('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return next(new ErrorResponse('Not authorized to update this conversation', 403));
    }

    // For group conversations, only admin can update settings
    if (conversation.type === 'group') {
      if (conversation.groupAdmin.toString() !== req.user._id.toString()) {
        return next(new ErrorResponse('Only group admin can update group settings', 403));
      }

      if (name) conversation.name = name;
      if (groupAvatar) conversation.groupAvatar = groupAvatar;
    } else {
      return next(new ErrorResponse('Cannot update settings for private conversation', 400));
    }

    await conversation.save();
    await conversation.populate('participants', 'name email avatar online lastSeen status');

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mute/Unmute conversation
// @route   PUT /api/v1/chat/conversations/:conversationId/mute
// @access  Private
exports.toggleMute = async (req, res, next) => {
  try {
    const { until } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return next(new ErrorResponse('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    const muteIndex = conversation.muted.findIndex(
      m => m.user.toString() === req.user._id.toString()
    );

    if (muteIndex > -1) {
      // If already muted, unmute
      conversation.muted.splice(muteIndex, 1);
    } else {
      // Mute conversation
      conversation.muted.push({
        user: req.user._id,
        until: until || new Date(Date.now() + 8 * 60 * 60 * 1000) // Default 8 hours
      });
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Pin/Unpin conversation
// @route   PUT /api/v1/chat/conversations/:conversationId/pin
// @access  Private
exports.togglePin = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return next(new ErrorResponse('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    const isPinned = conversation.pinnedBy.includes(req.user._id);

    if (isPinned) {
      conversation.pinnedBy.pull(req.user._id);
    } else {
      conversation.pinnedBy.push(req.user._id);
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (err) {
    next(err);
  }
};
