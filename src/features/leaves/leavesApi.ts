import { baseApi } from '../../state/baseApi';
import { endpoints } from '../../state/endpoints';
import { ApiMethodType } from '../../state/types';
import type {
  IApplyLeaveArgs,
  IApproveLeaveResponse,
  ILeave,
  IUpdateLeaveArgs,
} from './leaves.types';

export const enhancedLeavesApi = baseApi.enhanceEndpoints({
  addTagTypes: ['Leaves'],
});

export const leavesApi = enhancedLeavesApi.injectEndpoints({
  endpoints: (builder) => ({
    applyLeave: builder.mutation<any, IApplyLeaveArgs>({
      query: (data) => ({
        url: endpoints.applyLeave,
        method: ApiMethodType.post,
        body: data,
      }),
      invalidatesTags: ['Leaves'],
    }),
    getUserLeaves: builder.query<
      {
        data: ILeave[];
        pagination: {
          page: number;
          pageSize: number;
          pageCount: number;
          total: number;
        };
      },
      string
    >({
      query: (id) => ({
        url: endpoints.getUserLeaves(id),
        method: ApiMethodType.get,
      }),
      providesTags: ['Leaves'],
      transformResponse: (response: any) => {
        const data = response.data.map((item) => ({
          ...item.attributes,
          id: item.id,
        }));
        return {
          data,
          pagination: response.meta.pagination,
        };
      },
    }),
    deleteLeave: builder.mutation<any, string>({
      query: (id) => ({
        url: endpoints.deleteLeave(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ['Leaves'],
    }),
    updateLeave: builder.mutation<any, { id: number; data: IUpdateLeaveArgs }>({
      query: ({ id, data }: { id: number; data: IUpdateLeaveArgs }) => ({
        url: endpoints.updateLeave(id),
        method: ApiMethodType.PUT,
        body: { data: { ...data } },
      }),
      invalidatesTags: ['Leaves'],
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
      providesTags: ['Leaves'],
      transformResponse: (response: any) => {
        const data = response.data.map((item) => ({
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
      invalidatesTags: ['Leaves'],
    }),
    rejectLeave: builder.mutation<IApproveLeaveResponse, { id: number }>({
      query: ({ id }: { id: number }) => ({
        url: endpoints.rejectLeave(id),
        method: ApiMethodType.post,
        invalidatesTags: ['Leaves'],
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
        providesTags: ['Leaves'],
        method: 'GET',
      }),
      transformResponse: (response:any) => {
        const data = response.data.map((item) => ({
         ...item
        }));
        return {
          data,
          pagination: response.meta.pagination,
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
} = leavesApi;
