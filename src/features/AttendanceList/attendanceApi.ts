import { baseApi } from '../../state/baseApi';
import { endpoints } from '../../state/endpoints';
import type { IAttendance } from '../dashboard/types';

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceList: builder.query<IAttendance[], { id: number }>({
      query: ({ id }) => ({
        url: endpoints.getAttendance(Number(id)),
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetAttendanceListQuery } = attendanceApi;
