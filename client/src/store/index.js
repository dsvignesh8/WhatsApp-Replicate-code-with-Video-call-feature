import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import callReducer from './slices/callSlice';
import statusReducer from './slices/statusSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    call: callReducer,
    status: statusReducer,
  },
});
