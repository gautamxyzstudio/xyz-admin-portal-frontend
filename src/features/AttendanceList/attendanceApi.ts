import { baseApi } from "../../state/baseApi";
import { endpoints } from "../../api/endpoints";
import type { IAttendance } from "../dashboard/types";

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceList: builder.query<
      IAttendance[],
      { id: number; startDate?: string; endDate?: string }
    >({
      query: ({ id, startDate, endDate }) => ({
        url: endpoints.getAttendance(Number(id), startDate, endDate),
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAttendanceListQuery } = attendanceApi;
