import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Update conversation last message
      const conversation = state.conversations.find(
        conv => conv.id === action.payload.conversationId
      );
      if (conversation) {
        conversation.lastMessage = action.payload;
        conversation.updatedAt = new Date().toISOString();
        // Sort conversations by latest message
        state.conversations.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      }
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find(msg => msg.id === messageId);
      if (message) {
        message.status = status;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const {
  setConversations,
  addConversation,
  setActiveConversation,
  setMessages,
  addMessage,
  updateMessageStatus,
  setLoading,
  setError,
  incrementUnreadCount,
  resetUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;
