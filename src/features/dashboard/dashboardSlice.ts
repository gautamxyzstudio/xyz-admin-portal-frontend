import { createSlice } from "@reduxjs/toolkit";
import type { IAttendanceState } from "./types";
import type { RootState } from "../../state/store";

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    checkInTime: null,
    checkOutTime: null,
    attendanceId: null,
  } as IAttendanceState,
  reducers: {
    checkIn: (state, action) => {
      state.checkInTime = action.payload;
    },
    checkOut: (state, action) => {
      state.checkOutTime = action.payload;
    },
    setAttendanceId: (state, action) => {
      state.attendanceId = action.payload;
    },
  },
});

export const { checkIn, checkOut, setAttendanceId } = dashboardSlice.actions;

export default dashboardSlice.reducer;

export const selectCheckInTime = (state: RootState) =>
  state.dashboard.checkInTime;
export const selectCheckOutTime = (state: RootState) =>
  state.dashboard.checkOutTime;
export const selectAttendanceId = (state: RootState) =>
  state.dashboard.attendanceId;
