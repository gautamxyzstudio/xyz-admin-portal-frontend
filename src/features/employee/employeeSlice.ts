import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  IEmployeeFromResponse,
  IEmployeeSliceInitialState,
} from "./types";
import { employeeApis } from "./employeeApis";
import { getImageUrl } from "../../utils/utils";
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
      (state, action: PayloadAction<IEmployeeFromResponse[]>) => {
        state.employeeList = action.payload.map((employee) => {
          const photo = employee?.user_detial?.Photo?.[0];
          return {
            id: employee?.id ?? 0,
            name: employee?.user_detial?.name ?? "",
            designation: employee?.user_detial?.designation ?? "",
            empCode: employee?.user_detial?.empCode ?? "",
            phoneNumber: employee?.user_detial?.phoneNumber ?? "",
            joiningDate: employee?.user_detial?.joinig_date ?? "",
            role: employee?.role?.name ?? "",
            status: employee?.user_detial?.status ?? "",
            image: photo?.url ? getImageUrl(photo.url) : "",
            imageId: photo?.id ?? 0,
            email: employee?.email ?? "",
            details_id: employee?.user_detial?.id ?? 0,
            dateOfBirth: employee?.user_detial?.date_of_birth ?? "0",
            active_blogs: employee.user_detial.active_blogs ?? false,
            coverImage: employee.user_detial.coverImage ?? ''
          };
        });
    
      }
    );
  },
});

export default employeeSlice.reducer;

export const employeeListInState = (state: RootState) =>
  state.employee.employeeList;
