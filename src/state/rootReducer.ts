/* eslint-disable @typescript-eslint/no-explicit-any */
import { combineReducers, type Reducer } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import authReducer from "../features/auth/authSlice";
import employeeReducer from "../features/employee/employeeSlice";
import type { IAuthState } from "../features/auth/types";
import type { IEmployeeSliceInitialState } from "../features/employee/types";
import type {
  IAttendanceState,
  IHrDashboardState,
} from "../features/dashboard/types";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import dashboardHrReducer from "../features/dashboard/screens/dashboardHrSlice";
const combineReducer = combineReducers<IState>({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  dashboardHr: dashboardHrReducer,
  employee: employeeReducer,
  dashboard: dashboardReducer,
});

export type IState = {
  auth: Reducer<IAuthState>;
  employee: Reducer<IEmployeeSliceInitialState>;
  dashboard: Reducer<IAttendanceState>;
  dashboardHr: Reducer<IHrDashboardState>;
  [key: string]: Reducer;
};

// reducer with  dehydrating  state capabilities
const rootReducer = (state: any, action: { type: string }) => {
  if (action.type === "RESET") {
    state = undefined;
  }
  return combineReducer(state, action);
};
export default rootReducer;
