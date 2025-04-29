const express = require('express');
const {
  getConversations,
  createConversation,
  getMessages,
  updateParticipants,
  deleteConversation,
  updateConversation,
  toggleMute,
  togglePin
} = require('../controllers/chat');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Conversation routes
router
  .route('/conversations')
  .get(getConversations)
  .post(createConversation);

router
  .route('/conversations/:conversationId')
  .put(updateConversation)
  .delete(deleteConversation);

// Message routes
router
  .route('/conversations/:conversationId/messages')
  .get(getMessages);

// Participant management
router
  .route('/conversations/:conversationId/participants')
  .put(updateParticipants);

// Conversation settings
router
  .route('/conversations/:conversationId/mute')
  .put(toggleMute);

router
  .route('/conversations/:conversationId/pin')
  .put(togglePin);

module.exports = router;
