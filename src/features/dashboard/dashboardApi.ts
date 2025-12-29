import { baseApi } from '../../state/baseApi';
import { endpoints } from '../../state/endpoints';
import type {
  IAttendance,
  ICheckInRequest,
  ICheckOutRequest,
  IGetAllAttendanceResponse,
  IGetTodayAttendanceRequest,
  IUpdateAttendanceRequest,
} from './types';

const enhancedAttendanceApi = baseApi.enhanceEndpoints({
  addTagTypes: ['Attendance'],
});

export const attendanceApi = enhancedAttendanceApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAttendance: builder.query<
      IGetAllAttendanceResponse,
      {
        page: number;
        pageSize: number;
        startDate: string;
        endDate: string;
        search?: string;
      }
    >({
      query: ({ page, pageSize, startDate, endDate, search }) => ({
        url: endpoints.getAllAttendance(
          page,
          pageSize,
          startDate,
          endDate,
          search
        ),
        method: 'GET',
      }),
    }),
    getTodayAttendance: builder.query<IAttendance, IGetTodayAttendanceRequest>({
      query: ({ id }) => ({
        url: endpoints.getTodayAttendance(id),
      }),
      providesTags: ['Attendance'],
      transformResponse: (response: IAttendance[]) => {
        return response[0];
      },
    }),
    checkIn: builder.mutation<IAttendance, ICheckInRequest>({
      query: (data) => ({
        url: endpoints.checkIn,
        method: 'POST',
        invalidatesTags: ['Attendance'],
        body: data,
      }),
    }),
    checkOut: builder.mutation<IAttendance, ICheckOutRequest>({
      query: (data) => ({
        url: endpoints.checkOut,
        method: 'POST',
        body: data,
        invalidatesTags: ['Attendance'],
      }),
    }),
    updateAttendance: builder.mutation<IAttendance, IUpdateAttendanceRequest>({
      query: (data) => ({
        url: endpoints.updateAttendance,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTodayAttendanceQuery,
  useCheckInMutation,
  useUpdateAttendanceMutation,
  useLazyGetAllAttendanceQuery,
  useCheckOutMutation,
} = attendanceApi;
