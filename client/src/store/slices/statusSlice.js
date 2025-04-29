import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  statuses: [],
  activeStatus: null,
  myStatuses: [],
  loading: false,
  error: null,
  viewedStatuses: new Set(),
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setStatuses: (state, action) => {
      state.statuses = action.payload;
    },
    addStatus: (state, action) => {
      const { userId, status } = action.payload;
      const userStatusIndex = state.statuses.findIndex(s => s.userId === userId);
      
      if (userStatusIndex !== -1) {
        state.statuses[userStatusIndex].items.unshift(status);
      } else {
        state.statuses.unshift({
          userId,
          items: [status],
        });
      }
    },
    setActiveStatus: (state, action) => {
      state.activeStatus = action.payload;
    },
    addMyStatus: (state, action) => {
      state.myStatuses.unshift(action.payload);
    },
    deleteMyStatus: (state, action) => {
      state.myStatuses = state.myStatuses.filter(
        status => status.id !== action.payload
      );
    },
    markStatusAsViewed: (state, action) => {
      const { statusId } = action.payload;
      state.viewedStatuses.add(statusId);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
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
  setStatuses,
  addStatus,
  setActiveStatus,
  addMyStatus,
  deleteMyStatus,
  markStatusAsViewed,
  setLoading,
  setError,
  clearError,
} = statusSlice.actions;

export default statusSlice.reducer;
