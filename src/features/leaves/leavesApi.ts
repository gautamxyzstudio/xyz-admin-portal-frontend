/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../state/baseApi";
import { endpoints } from "../../api/endpoints";
import { ApiMethodType } from "../../state/types";
import type {
  IApplyLeaveArgs,
  IApproveLeaveResponse,
  ILeave,
  ILeaveDetailsResponse,
  ILeaveResponse,
  IUpdateLeaveArgs,
} from "./leaves.types";

export const enhancedLeavesApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Leaves", "LeaveBalance"],
});

export const leavesApi = enhancedLeavesApi.injectEndpoints({
  endpoints: (builder) => ({
    applyLeave: builder.mutation<any, IApplyLeaveArgs>({
      query: (data) => ({
        url: endpoints.applyLeave,
        method: ApiMethodType.post,
        body: data,
      }),
      invalidatesTags: ["Leaves"],
    }),
    getUserLeaves: builder.query<
      {
        data: ILeave[];
      },
      void
    >({
      query: () => ({
        url: endpoints.getUserLeaves,
        method: ApiMethodType.get,
      }),
      providesTags: ["Leaves"],
      transformResponse: (response: any) => {
        const data = response.data.map((item: ILeave) => ({ ...item }));
        return {
          data,
        };
      },
    }),
    deleteLeave: builder.mutation<any, { id: number }>({
      query: ({ id }: { id: number }) => ({
        url: endpoints.deleteLeave(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ["Leaves"],
    }),
    updateLeave: builder.mutation<any, { id: number; data: IUpdateLeaveArgs }>({
      query: ({ id, data }: { id: number; data: IUpdateLeaveArgs }) => ({
        url: endpoints.updateLeave(id),
        method: ApiMethodType.PUT,
        body: { data: { ...data } },
      }),
      invalidatesTags: ["Leaves"],
    }),
    getLeaveRequests: builder.query<
      {
        data: ILeave[];
        pagination: {
          page: number;
          pageSize: number;
          pageCount: number;
          total: number;
        };
      },
      void
    >({
      query: () => ({
        url: endpoints.getLeaveRequests,
        method: ApiMethodType.get,
      }),
      providesTags: ["Leaves"],
      transformResponse: (response: any) => {
        const data = response.data.map((item: any) => ({
          ...item.attributes,
          id: item.id,
        }));

        return {
          data,
          pagination: response.meta.pagination,
        };
      },
    }),
    approveLeave: builder.mutation<IApproveLeaveResponse, { id: number }>({
      query: ({ id }: { id: number }) => ({
        url: endpoints.approveLeave(id),
        method: ApiMethodType.post,
        body: {},
      }),
      invalidatesTags: ["Leaves"],
    }),
    rejectLeave: builder.mutation<IApproveLeaveResponse, { id: number }>({
      query: ({ id }: { id: number }) => ({
        url: endpoints.rejectLeave(id),
        method: ApiMethodType.post,
        body: {},
      }),
      invalidatesTags: ["Leaves"],
    }),
    getAllLeaves: builder.query<
      {
        data: ILeave[];
        pagination: {
          page: number;
          pageSize: number;
          pageCount: number;
          total: number;
        };
      },
      {
        page: number;
        search?: string;
      }
    >({
      query: ({ page, search }) => ({
        url: endpoints.getLeavesList(page, search),
        method: "GET",
      }),
      providesTags: ["Leaves"],
      transformResponse: (response: ILeaveResponse) => {
        const data = response.data.map((item: any) => ({
          ...item,
        }));
        return {
          data,
          pagination: response.meta.pagination,
        };
      },
    }),
    getLeavesDetials: builder.query({
      query: (id: string) => ({
        url: endpoints.updateLeave(Number(id)),
        method: ApiMethodType.get,
      }),
      transformResponse: (response: any): ILeaveDetailsResponse => {
        const attributes = response.data.attributes;
        return {
          id: response.data.id,
          start_date: attributes.start_date,
          end_date: attributes.end_date,
          status: attributes.status,
          createdAt: attributes.createdAt,
          description: attributes.description,
          decline_reason: attributes.decline_reason,
          title: attributes.title,
          leave_category: attributes.leave_category,
          half_day_type: attributes.half_day_type,
          start_time: attributes.start_time,
          days: attributes.days,
          leave_type: attributes.leave_type,
          leave_days: attributes.leave_days,
        };
      },
    }),
    getAllUserLeaves: builder.query<
      {
        data: ILeave[];
        pagination: {
          page: number;
          pageSize: number;
          pageCount: number;
          total: number;
        };
      },
      {
        page: number;
        username?: string;
      }
    >({
      query: ({ page, username }) => ({
        url: endpoints.getUserALlLeaves(page, username),
        method: "GET",
      }),
      providesTags: ["Leaves"],
      transformResponse: (response: ILeaveResponse) => {
        const data = response.data.map((item: any) => ({
          ...item,
        }));
        return {
          data,
          pagination: response.meta.pagination,
        };
      },
    }),
    geLeaveBalance: builder.query<any, void>({
      query: () => ({
        url: endpoints.getLeaveBalance,
        method: ApiMethodType.get,
      }),
      providesTags: ["Leaves"],
    }),

    getAllLeaveBalance: builder.query<any[], void>({
      query: () => ({
        url: endpoints.allLeaveBalance,
        method: ApiMethodType.get,
      }),
      transformResponse: (response: any[]) =>
        response.map((item) => ({
          ...item,
          id: item.id,
        })),
      providesTags: ["Leaves"],
    }),
    updateLeaveBalance: builder.mutation<
      any,
      { id: number | string; data: any }
    >({
      query: ({ id, data }) => ({
        url: endpoints.updateLeaveBalance(id),
        method: "PUT",
        body:  {
          data: data,
        },
      }),
      invalidatesTags: ["LeaveBalance"],
    }),
  }),
});

export const {
  useApplyLeaveMutation,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
  useUpdateLeaveMutation,
  useGetUserLeavesQuery,
  useDeleteLeaveMutation,
  useLazyGetAllLeavesQuery,
  useGetLeaveRequestsQuery,
  useGetLeavesDetialsQuery,
  useLazyGetAllUserLeavesQuery,
  useGeLeaveBalanceQuery,
  useGetAllLeaveBalanceQuery,
  useUpdateLeaveBalanceMutation,
} = leavesApi;
