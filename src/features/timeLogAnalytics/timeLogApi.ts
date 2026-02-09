import { baseApi } from "../../state/baseApi";
import { endpoints } from "../../api/endpoints";
import { type TimeLogAnalyticsResponse } from "./timeLog.types";

export const enhancedTimeLogApi = baseApi.enhanceEndpoints({
  addTagTypes: ["TimeLogs"],
});

export const timeLogApi = enhancedTimeLogApi.injectEndpoints({
  endpoints: (builder) => ({
    getTimeLogs: builder.query<
      TimeLogAnalyticsResponse,
      { startDate: string; endDate: string; search?: string }
    >({
      query: ({ startDate, endDate, search }) => ({
        url: endpoints.getTimeLogs(startDate, endDate, search),
        method: "GET",
      }),
    }),
  }),
});

export const { useGetTimeLogsQuery, useLazyGetTimeLogsQuery } = timeLogApi;
