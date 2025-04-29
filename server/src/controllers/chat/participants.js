const Conversation = require('../../models/Conversation');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Add/Remove participants from group
// @route   PUT /api/v1/chat/conversations/:conversationId/participants
// @access  Private
exports.updateParticipants = async (req, res, next) => {
  try {
    const { action, participantIds } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return next(new ErrorResponse('Conversation not found', 404));
    }

    // Check if user is group admin
    if (conversation.type === 'group' && 
        conversation.groupAdmin.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Only group admin can modify participants', 403));
    }

    // For private chats, don't allow participant modifications
    if (conversation.type === 'private') {
      return next(new ErrorResponse('Cannot modify participants in private chat', 400));
    }

    if (action === 'add') {
      // Prevent adding existing participants
      const newParticipants = participantIds.filter(
        id => !conversation.participants.includes(id)
      );
      conversation.participants.addToSet(...newParticipants);
    } else if (action === 'remove') {
      // Prevent removing the group admin
      if (participantIds.includes(conversation.groupAdmin.toString())) {
        return next(new ErrorResponse('Cannot remove group admin', 400));
      }
      conversation.participants.pull(...participantIds);
    } else {
      return next(new ErrorResponse('Invalid action specified', 400));
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
