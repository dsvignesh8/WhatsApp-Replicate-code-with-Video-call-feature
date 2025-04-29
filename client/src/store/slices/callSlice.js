import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeCall: null,
  callHistory: [],
  isIncoming: false,
  isOutgoing: false,
  isMuted: false,
  isVideoEnabled: true,
  localStream: null,
  remoteStream: null,
  error: null,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setActiveCall: (state, action) => {
      state.activeCall = action.payload;
    },
    addToCallHistory: (state, action) => {
      state.callHistory.unshift(action.payload);
    },
    setIncomingCall: (state, action) => {
      state.isIncoming = action.payload;
    },
    setOutgoingCall: (state, action) => {
      state.isOutgoing = action.payload;
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    toggleVideo: (state) => {
      state.isVideoEnabled = !state.isVideoEnabled;
    },
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
    endCall: (state) => {
      state.activeCall = null;
      state.isIncoming = false;
      state.isOutgoing = false;
      state.localStream = null;
      state.remoteStream = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setActiveCall,
  addToCallHistory,
  setIncomingCall,
  setOutgoingCall,
  toggleMute,
  toggleVideo,
  setLocalStream,
  setRemoteStream,
  endCall,
  setError,
  clearError,
} = callSlice.actions;

export default callSlice.reducer;
