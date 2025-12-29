import { createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type { IAuthState, ILoginResponse, IUserDetailsResponse } from './types';
import { authApi } from './authApi';
import type { RootState } from '../../state/store';
import { getImageUrl } from '../../utils/utils';

const initialState: IAuthState = {
  user: null,
  userDetails: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, action: PayloadAction<ILoginResponse>) => {
          state.user = {
            id: action?.payload?.user?.id,
            email: action?.payload?.user?.email,
            user_type: action?.payload?.user?.user_type,
            leave_balance: action?.payload?.user?.leave_balance,
            unpaid_leave_balance: action?.payload?.user?.unpaid_leave_balance,
            token: action.payload.jwt,
          };
        }
      )
      .addMatcher(
        authApi.endpoints.userDetails.matchFulfilled,
        (state, action: PayloadAction<IUserDetailsResponse>) => {
          console.log('-=-=-=-=-=-=-executed-=-=-=-=-=-=-=-=-=-=-=-');
          console.log(action?.payload, 'action?.payload');
          console.log('-=-=-=-=-=-=-executed-=-=-=-=-=-=-=-=-=-=-=-');
          state.userDetails = {
            details_id: action?.payload?.user_detial?.id,
            email: action?.payload?.email,
            role: action?.payload?.role?.name,
            name: action?.payload?.user_detial?.name,
            leave_balance: action?.payload?.leave_balance,
            unpaid_leave_balance: action?.payload?.unpaid_leave_balance,
            designation: action?.payload?.user_detial?.designation,
            joining_date: action?.payload?.user_detial?.joiningDate,
            status: action?.payload?.user_detial?.status,
            phoneNumber: action?.payload?.user_detial?.phoneNumber,
            empCode: action?.payload?.user_detial?.empCode,
            photo: getImageUrl(action?.payload?.user_detial?.Photo[0]?.url),
          };
        }
      );
  },
});

export default authSlice.reducer;
export const userInState = (state: RootState) => state.auth.user;
export const userDetailsInState = (state: RootState) => state.auth.userDetails;
export const tokenInState = (state: RootState) => state.auth.user?.token;
