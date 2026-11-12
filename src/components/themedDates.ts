/* Calendar-day helpers for the themed pickers. Days are "YYYY-MM-DD" strings. */

export const dayStr = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
export const dayParts = (d: string) => {
  const [y, m, dd] = d.split("-").map(Number);
  return { y, m: m - 1, d: dd };
};
export const shiftDayStr = (d: string, n: number) => {
  const p = dayParts(d);
  return dayStr(p.y, p.m, p.d + n);
};
/** today as YYYY-MM-DD in the browser's local time zone */
export const localToday = () => {
  const n = new Date();
  return dayStr(n.getFullYear(), n.getMonth(), n.getDate());
};
export const isDayStr = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export interface DateRangePreset {
  label: string;
  from: string;
  to: string;
}

/** Common range chips, built relative to a given "today" (YYYY-MM-DD). */
export const rangePresets = (today: string = localToday()) => {
  const monthStart = `${today.slice(0, 8)}01`;
  const lastMonthEnd = shiftDayStr(monthStart, -1);
  return {
    today: { label: "Today", from: today, to: today },
    yesterday: { label: "Yesterday", from: shiftDayStr(today, -1), to: shiftDayStr(today, -1) },
    last7: { label: "Last 7 days", from: shiftDayStr(today, -6), to: today },
    last30: { label: "Last 30 days", from: shiftDayStr(today, -29), to: today },
    thisMonth: { label: "This month", from: monthStart, to: today },
    lastMonth: { label: "Last month", from: `${lastMonthEnd.slice(0, 8)}01`, to: lastMonthEnd },
  } satisfies Record<string, DateRangePreset>;
};
