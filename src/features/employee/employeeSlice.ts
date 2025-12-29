import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IEmployeeFromResponse, IEmployeeSliceInitialState } from './types';
import { employeeApis } from './employeeApis';
import { getImageUrl } from '../../utils/utils';
import type  { RootState } from '../../state/store';

const initialState: IEmployeeSliceInitialState = {
  employeeList: [],
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      employeeApis.endpoints.getEmployeeList.matchFulfilled,
      (state, action: PayloadAction<IEmployeeFromResponse[]>) => {
        state.employeeList = action.payload.map((employee) => ({
          id: employee?.id ?? 0,
          name: employee?.user_detial?.name ?? '',
          designation: employee?.user_detial?.designation ?? '',
          empCode: employee?.user_detial?.empCode ?? '',
          phoneNumber: employee?.user_detial?.phoneNumber ?? '',
          joiningDate: employee?.user_detial?.joiningDate ?? '',
          role: employee?.role?.name ?? '',
          status: employee?.user_detial?.status,
          leave_balance: employee?.user_detial?.leave_balance ?? 0,
          unpaid_leave_balance: employee?.unpaid_leave_balance ?? 0,
          image: getImageUrl(employee?.user_detial?.Photo[0].url) ?? '',
          imageId: employee?.user_detial?.Photo[0].id ?? 0,
          email: employee?.email ?? '',
          details_id: employee?.user_detial?.id ?? 0,
        }));
      }
    );
  },
});

export default employeeSlice.reducer;

export const employeeListInState = (state: RootState) =>
  state.employee.employeeList;
