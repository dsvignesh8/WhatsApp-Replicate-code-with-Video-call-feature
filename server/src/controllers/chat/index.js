const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get all conversations for a user
// @route   GET /api/v1/chat/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'name email avatar online lastSeen status')
    .populate('lastMessage')
    .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new conversation
// @route   POST /api/v1/chat/conversations
// @access  Private
exports.createConversation = async (req, res, next) => {
  try {
    const { participantId, type, name } = req.body;

    const participant = await User.findById(participantId);
    if (!participant) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (type === 'private') {
      const existingConversation = await Conversation.findOne({
        type: 'private',
        participants: {
          $all: [req.user._id, participantId],
          $size: 2
        }
      });

      if (existingConversation) {
        return res.status(200).json({
          success: true,
          data: existingConversation
        });
      }
    }

    const conversation = await Conversation.create({
      type,
      name: type === 'group' ? name : undefined,
      participants: type === 'private' ? [req.user._id, participantId] : [req.user._id],
      groupAdmin: type === 'group' ? req.user._id : undefined
    });

    await conversation.populate('participants', 'name email avatar online lastSeen status');

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/v1/chat/conversations/:conversationId/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return next(new ErrorResponse('Conversation not found', 404));
    }

    if (!conversation.participants.includes(req.user._id)) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;

    const messages = await Message.find({ 
      conversation: req.params.conversationId,
      deletedFor: { $ne: req.user._id }
    })
      .populate('sender', 'name avatar')
      .populate('replyTo')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Message.countDocuments({ 
      conversation: req.params.conversationId,
      deletedFor: { $ne: req.user._id }
    });

    // Update message status to read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        status: { $ne: 'read' }
      },
      { status: 'read' }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

// Import other chat controller functions
const { updateParticipants } = require('./participants');
const { deleteConversation } = require('./conversation');

// Export all functions
module.exports = {
  ...exports,
  updateParticipants,
  deleteConversation
};
