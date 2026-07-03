/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { IEmployeeSliceInitialState } from "./types";
import { employeeApis } from "./employeeApis";
import type { RootState } from "../../state/store";

const initialState: IEmployeeSliceInitialState = {
  employeeList: [],
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      employeeApis.endpoints.getEmployeeList.matchFulfilled,
      (state, action: any) => {
        const search = action.meta?.arg?.originalArgs?.search;
        if (!search) {
          state.employeeList = action.payload;
        }
      },
    );
  },
});

export default employeeSlice.reducer;

export const employeeListInState = (state: RootState) =>
  state.employee.employeeList;
