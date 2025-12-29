import { createSlice } from '@reduxjs/toolkit';
import type { IHrDashboardState } from '../types';
import type{ RootState } from '../../../state/store';

const initialState: IHrDashboardState = {
  leaveRequests: [],
};

export const dashboardHrSlice = createSlice({
  name: 'dashboardHr',
  initialState: initialState,
  reducers: {
    setLeaveRequests: (state, action) => {
      state.leaveRequests = action.payload;
    },
    approveLeaveRequest: (state, action) => {
      const { id } = action.payload;
      const index = state.leaveRequests.findIndex((leave) => leave.id === id);
      if (index !== -1) {
        state.leaveRequests.splice(index, 1);
      }
    },
    rejectLeaveRequest: (state, action) => {
      const { id } = action.payload;
      const index = state.leaveRequests.findIndex((leave) => leave.id === id);
      if (index !== -1) {
        state.leaveRequests.splice(index, 1);
      }
    },
  },
});

export const { setLeaveRequests, approveLeaveRequest, rejectLeaveRequest } =
  dashboardHrSlice.actions;
export default dashboardHrSlice.reducer;

export const selectLeaveRequests = (state: RootState) =>
  state.dashboardHr.leaveRequests;
