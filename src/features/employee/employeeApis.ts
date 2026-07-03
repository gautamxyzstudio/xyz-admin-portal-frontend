/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../state/baseApi";
import { getImageUrl } from "../../utils/utils";
import { endpoints } from "../../api/endpoints";
import { ApiMethodType } from "../../state/types";
import type {
  IAddEmployeeArgs,
  IEditEmployeeArgs,
  IRegisterUserArgs,
  IRegisterUserResponse,
  IUpdateLeaveBalanceArgs,
} from "./types";

export const enhancedEmployeeApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Employee"],
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
      invalidatesTags: ["Employee"],
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
      invalidatesTags: ["Employee"],
    }),
    deleteUser: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: endpoints.deleteUser(id),
        method: ApiMethodType.delete,
      }),
    }),
    updateUser: builder.mutation<any, { id: string; status: boolean }>({
      query: ({ id, status }) => ({
        url: endpoints.updateUser(id),
        method: ApiMethodType.PUT,
        body: {
          checkout_email_enabled: status,
        },
      }),
    }),
    deleteEmployee: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: endpoints.deleteEmployee(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ["Employee"],
    }),

    getEmployeeList: builder.query<any, { user_type: string; search?: string }>(
      {
        query: ({ user_type, search }) => ({
          url: endpoints.employeeList(user_type, search),
          method: ApiMethodType.get,
        }),
        transformResponse: (response: any[]) => {
          return response.map((employee: any) => {
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
              active_blogs: employee?.user_detial?.active_blogs ?? false,
              coverImage: employee?.user_detial?.coverImage ?? "",
              checkout_email_enabled: employee?.checkout_email_enabled ?? false,
              emergency_contact: employee?.user_detial?.emergency_contact ?? "",
              relation_of: employee?.user_detial?.relation_of ?? "",
            };
          });
        },
        providesTags: ["Employee"],
      },
    ),
  }),
});

export const {
  useRegisterEmployeeMutation,
  useAddEmployeeDetailsMutation,
  useUpdateEmployeeDetailsMutation,
  useUpdateUserLeaveBalanceMutation,
  useGetEmployeeListQuery,
  useDeleteUserMutation,
  useDeleteEmployeeMutation,
  useUpdateUserMutation,
} = employeeApis;
