/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../state/baseApi";
import { endpoints } from "../../state/endpoints";
import { ApiMethodType } from "../../state/types";
import type {
  IApplyLeaveArgs,
  IApproveLeaveResponse,
  ILeave,
  ILeaveDetailsResponse,
  IUpdateLeaveArgs,
} from "./leaves.types";

export const enhancedLeavesApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Leaves"],
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
        // console.log(data, "leave");
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
        invalidatesTags: ["Leaves"],
        body: {},
      }),
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
        pageSize: number;
        startDate: string;
        endDate: string;
        search?: string;
        leaveType?: string;
      }
    >({
      query: ({ page, pageSize, startDate, endDate, search, leaveType }) => ({
        url: endpoints.getLeavesList(
          page,
          pageSize,
          startDate,
          endDate,
          search,
          leaveType
        ),
        providesTags: ["Leaves"],
        method: "GET",
      }),
      transformResponse: (response: any) => {
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
        };
      },
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
} = leavesApi;
