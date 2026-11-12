/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from "react";
import { baseApi } from "../../state/baseApi";
import { endpoints } from "../../api/endpoints";

/* Time-tracker totals (task timers), per user per IST day.
   Backend: GET /api/work-logs/tracked-time */

export interface ITrackedTimeResponse {
  days: Record<string, Record<string, number>>;
  running: Record<string, boolean>;
}

const trackedTimeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrackedTime: builder.query<
      ITrackedTimeResponse,
      { startDate: string; endDate: string; userIds?: string }
    >({
      query: (params) => ({ url: endpoints.trackedTime, method: "GET", params }),
      transformResponse: (res: any) => ({
        days: res?.days ?? {},
        running: res?.running ?? {},
      }),
    }),
  }),
});

export const { useGetTrackedTimeQuery } = trackedTimeApi;

const istToday = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

/**
 * Looks up tracked time for the rows a table is showing.
 * `items` = the (userId, YYYY-MM-DD date) pairs on screen.
 * Returns tracked(userId, date) -> { seconds, live } and loading state.
 */
export const useTrackedTime = (items: { userId?: number | string | null; date?: string | null }[]) => {
  const args = useMemo(() => {
    const ids = new Set<string>();
    let min = "";
    let max = "";
    for (const it of items) {
      if (!it.userId || !it.date) continue;
      ids.add(String(it.userId));
      if (!min || it.date < min) min = it.date;
      if (!max || it.date > max) max = it.date;
    }
    if (!ids.size) return null;
    return { startDate: min, endDate: max, userIds: [...ids].sort().join(",") };
  }, [items]);

  const today = istToday();
  const includesToday = !!args && args.endDate >= today;

  const { data, isLoading, isFetching } = useGetTrackedTimeQuery(args ?? { startDate: "", endDate: "" }, {
    skip: !args,
    // refresh while a range that includes today is on screen (running timers)
    pollingInterval: includesToday ? 60_000 : 0,
  });

  const tracked = useCallback(
    (userId?: number | string | null, date?: string | null) => {
      if (!userId || !date) return { seconds: 0, live: false };
      const uid = String(userId);
      return {
        seconds: data?.days?.[uid]?.[date] ?? 0,
        live: date === today && !!data?.running?.[uid],
      };
    },
    [data, today],
  );

  return { tracked, isLoading: !!args && isLoading, isFetching, ready: !!data };
};
