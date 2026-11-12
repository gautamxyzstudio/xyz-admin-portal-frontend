import { userInState } from "../../auth/authSlice.js";
import { useSelector } from "react-redux";
import { convertTo12HourFormat } from "../../../utils/utils.js";
import { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { CalendarCheck, Clock3, LogIn, LogOut, Timer } from "lucide-react";
import { useGetAttendanceListQuery } from "../attendanceApi.js";
import CustomBox from "../../../components/CustomBox/CustomBox.js";
import ThemedDateRange from "../../../components/ThemedDateRange";
import { localToday, rangePresets } from "../../../components/themedDates";
import dayjs from "dayjs";
import { useTrackedTime } from "../../../shared/hooks/useTrackedTime";

/* ---------- helpers ---------- */

// "HH:mm[:ss]" -> minutes after midnight
const toMinutes = (t: string | null | undefined) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : null;
};

const minutesToClock = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return convertTo12HourFormat(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
};

const formatHours = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (!h && !m) return "0m";
  return h ? `${h}h ${m}m` : `${m}m`;
};

type Row = {
  id: number;
  date: string; // YYYY-MM-DD
  in: string | null;
  out: string | null;
  workingNow: boolean;
  seconds: number;
};

const AttendanceEmployee = () => {
  const user = useSelector(userInState);
  const today = localToday();
  const presets = rangePresets(today);

  // empty "from" = whole history up to "to"
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(today);

  // tick every minute so "working now" hours stay live
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const queryArgs = useMemo(
    () => ({
      id: user?.id ?? 0,
      startDate: from || undefined,
      endDate: to || undefined,
    }),
    [user?.id, from, to],
  );
  const {
    data = [],
    isLoading,
    isFetching,
  } = useGetAttendanceListQuery(queryArgs, {
    skip: !user?.id,
    refetchOnMountOrArgChange: true,
  });

  const rows: Row[] = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any[]).map((r) => {
        const date = dayjs(r.Date).format("YYYY-MM-DD");
        const inMin = toMinutes(r.in);
        const outMin = toMinutes(r.out);
        const workingNow = !!r.in && !r.out && date === today;
        let seconds = Number(r.attendance_seconds) || 0;
        if (!seconds && inMin != null) {
          if (outMin != null) seconds = Math.max(0, (outMin - inMin) * 60);
          else if (workingNow) {
            const d = new Date(now);
            seconds = Math.max(0, (d.getHours() * 60 + d.getMinutes() - inMin) * 60);
          }
        }
        return { id: r.id, date, in: r.in, out: r.out, workingNow, seconds };
      }),
    [data, today, now],
  );

  // hours worked come from the time tracker (task timers)
  const trackedItems = useMemo(() => rows.map((r) => ({ userId: user?.id, date: r.date })), [rows, user?.id]);
  const { tracked } = useTrackedTime(trackedItems);
  const workedOf = (r: Row) => tracked(user?.id, r.date);

  const summary = useMemo(() => {
    const present = rows.filter((r) => r.in);
    const ins = present.map((r) => toMinutes(r.in)!).filter((v) => v != null);
    const outs = rows.map((r) => toMinutes(r.out)).filter((v): v is number => v != null);
    const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
    const avgIn = avg(ins);
    const avgOut = avg(outs);
    return {
      days: present.length,
      avgIn: avgIn != null ? minutesToClock(avgIn) : "—",
      avgOut: avgOut != null ? minutesToClock(avgOut) : "—",
      total: formatHours(rows.reduce((s, r) => s + tracked(user?.id, r.date).seconds, 0)),
    };
  }, [rows, tracked, user?.id]);

  const longest = Math.max(1, ...rows.map((r) => workedOf(r).seconds));

  if (!user || user.id === undefined) return null;

  const stats = [
    { icon: CalendarCheck, label: "Days present", value: String(summary.days) },
    { icon: LogIn, label: "Avg check-in", value: summary.avgIn },
    { icon: LogOut, label: "Avg check-out", value: summary.avgOut },
    { icon: Timer, label: "Hours tracked", value: summary.total },
  ];

  return (
    <CustomBox customClasses="w-full h-full p-5 pb-3 flex flex-col gap-y-5 min-h-0">
      {/* header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-black-80">Attendance</h2>
          <p className="text-xs text-black-50 mt-0.5">Your check-in and check-out history</p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && <CircularProgress size={14} sx={{ color: "var(--primary)" }} />}
          <ThemedDateRange
            from={from}
            to={to}
            max={today}
            placeholder="All time"
            onChange={(a, b) => {
              setFrom(a);
              setTo(b || today);
            }}
            presets={[
              presets.today,
              presets.yesterday,
              presets.last7,
              presets.thisMonth,
              presets.lastMonth,
              { label: "All time", from: "", to: today },
            ]}
          />
        </div>
      </div>

      {/* summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value }, i) => (
          <div
            key={label}
            style={{ animationDelay: `${i * 50}ms` }}
            className="att-stat flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3"
          >
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary-20 text-primary shrink-0">
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-black-80 leading-tight truncate">{value}</p>
              <p className="text-[11px] text-black-50">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* table */}
      <div className="flex-1 min-h-0 rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-black-50 uppercase tracking-wide">
          <span>Date</span>
          <span>Check in</span>
          <span>Check out</span>
          <span>Hours worked</span>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <CircularProgress size={28} sx={{ color: "var(--primary)" }} />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary-20 text-primary mb-3">
                <Clock3 size={22} />
              </span>
              <p className="text-sm font-semibold text-black-80">No attendance found</p>
              <p className="text-xs text-black-50 mt-1">Try a different date range, or check in to start.</p>
            </div>
          ) : (
            <ul className={`divide-y divide-gray-100 ${isFetching ? "opacity-60" : ""} transition-opacity`}>
              {rows.map((r, i) => {
                const d = dayjs(r.date);
                const isToday = r.date === today;
                return (
                  <li
                    key={r.id ?? r.date}
                    style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
                    className={`att-row grid grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-4 items-center px-5 py-3 text-sm hover:bg-primary-20/30 transition-colors ${
                      isToday ? "bg-primary-20/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 leading-none ${
                          isToday ? "bg-primary text-white" : "bg-gray-100 text-black-80"
                        }`}
                      >
                        <span className="text-sm font-semibold">{d.format("DD")}</span>
                        <span className="text-[9px] uppercase opacity-80">{d.format("MMM")}</span>
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-black-80 truncate">
                          {isToday ? "Today" : d.format("dddd")}
                        </p>
                        <p className="text-[11px] text-black-50">{d.format("DD/MM/YYYY")}</p>
                      </div>
                    </div>

                    <span className="text-black-80">{r.in ? convertTo12HourFormat(r.in) : "—"}</span>

                    <span>
                      {r.out ? (
                        <span className="text-black-80">{convertTo12HourFormat(r.out)}</span>
                      ) : r.workingNow ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                          <span className="relative flex w-2 h-2">
                            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                            <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
                          </span>
                          Working now
                        </span>
                      ) : (
                        <span className="text-xs text-orange-500">Not checked out</span>
                      )}
                    </span>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`att-bar h-full rounded-full ${workedOf(r).live ? "bg-emerald-500" : "bg-primary"}`}
                          style={{ width: `${workedOf(r).seconds ? Math.max(3, (workedOf(r).seconds / longest) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs font-semibold text-black-80 shrink-0">
                        {workedOf(r).seconds ? formatHours(workedOf(r).seconds) : "—"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </CustomBox>
  );
};

export default AttendanceEmployee;
