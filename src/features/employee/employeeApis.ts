/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from '../../state/baseApi';
import { endpoints } from '../../state/endpoints';
import { ApiMethodType } from '../../state/types';
import type {
  IAddEmployeeArgs,
  IEditEmployeeArgs,
  IRegisterUserArgs,
  IRegisterUserResponse,
  IUpdateLeaveBalanceArgs,
} from './types';

export const enhancedEmployeeApi = baseApi.enhanceEndpoints({
  addTagTypes: ['Employee'],
});

export const employeeApis = enhancedEmployeeApi.injectEndpoints({
  endpoints: (builder) => ({
    registerEmployee: builder.mutation<
      IRegisterUserResponse,
      IRegisterUserArgs
    >({
      query: (data) => ({
        url: endpoints.register,
        method: ApiMethodType.post,
        body: data,
      }),
    }),
    addEmployeeDetails: builder.mutation<any, IAddEmployeeArgs>({
      query: (data) => ({
        url: endpoints.employeeDetails,
        method: ApiMethodType.post,
        body: {
          data: data,
        },
      }),
      invalidatesTags: ['Employee'],
    }),
    updateUserLeaveBalance: builder.mutation<
      any,
      { id: string; data: IUpdateLeaveBalanceArgs }
    >({
      query: ({ id, data }) => ({
        url: endpoints.updateUserLeaveBalance(id),
        method: ApiMethodType.PUT,
        body: data,
      }),
    }),
    getEmployeeLeaveBalance: builder.query<any, { id: string }>({
      query: ({ id }) => ({
        url: endpoints.getEmployeeLeaveBalance(id),
        method: ApiMethodType.get,
      }),
    }),
    updateEmployeeDetails: builder.mutation<
      any,
      { id: string; data: IEditEmployeeArgs }
    >({
      query: ({ id, data }) => ({
        url: endpoints.updateEmployeeDetails(id),
        method: ApiMethodType.PUT,
        body: {
          data: data,
        },
      }),
      invalidatesTags: ['Employee'],
    }),
    deleteUser: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: endpoints.deleteUser(id),
        method: ApiMethodType.delete,
      }),
    }),
    deleteEmployee: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: endpoints.deleteEmployee(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ['Employee'],
    }),

    getEmployeeList: builder.query<any, { user_type: string }>({
      query: ({ user_type }) => ({
        url: endpoints.employeeList(user_type),
        method: ApiMethodType.get,
      }),
      providesTags: ['Employee'],
    }),
  }),
});

export const {
  useRegisterEmployeeMutation,
  useAddEmployeeDetailsMutation,
  useUpdateEmployeeDetailsMutation,
  useUpdateUserLeaveBalanceMutation,
  useGetEmployeeListQuery,
  useGetEmployeeLeaveBalanceQuery,
  useDeleteUserMutation,
  useDeleteEmployeeMutation,
} = employeeApis;
