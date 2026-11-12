/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  ChevronRight,
  Clock3,
  Download,
  FolderKanban,
  Search,
  Timer,
  Users,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import { useGetTimeLogsQuery } from "../timeLogApi";
import ThemedDateRange from "../../../components/ThemedDateRange";
import { rangePresets } from "../../../components/themedDates";
import { PersonCell } from "../../../components/ThemedTable";

/* =========================================================
   Time Log Analytics — day timelines built from timer sessions
========================================================= */

const IST = 5.5 * 3600 * 1000;
const DAY = 86400000;

/** IST calendar day of a timestamp */
const istDay = (ms: number) => new Date(ms + IST).toISOString().slice(0, 10);
/** minutes after IST midnight */
const istMinutes = (ms: number) => {
  const d = new Date(ms + IST);
  return d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
};
const istDayStart = (day: string) => Date.parse(`${day}T00:00:00Z`) - IST;
const todayIST = () => istDay(Date.now());

const fmtDur = (secs: number) => {
  const s = Math.max(0, Math.round(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (!h && !m) return s > 0 ? "<1m" : "0m";
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};
const fmtClock = (ms: number) => {
  const mins = Math.floor(istMinutes(ms));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};
const hourLabel = (h: number) => `${h % 12 || 12}${h >= 12 && h < 24 ? "pm" : "am"}`;

/* stable colour per project */
const PALETTE = [
  { bar: "#6366F1", soft: "#EEF2FF", text: "#4F46E5" },
  { bar: "#10B981", soft: "#ECFDF5", text: "#047857" },
  { bar: "#0EA5E9", soft: "#F0F9FF", text: "#0369A1" },
  { bar: "#F17C04", soft: "#FFF4E8", text: "#C2410C" },
  { bar: "#A855F7", soft: "#FAF5FF", text: "#7E22CE" },
  { bar: "#F43F5E", soft: "#FFF1F2", text: "#BE123C" },
  { bar: "#14B8A6", soft: "#F0FDFA", text: "#0F766E" },
  { bar: "#EAB308", soft: "#FEFCE8", text: "#A16207" },
];
const colorOf = (project: string) =>
  PALETTE[[...project].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7) % PALETTE.length];

/* ---------------- data model ---------------- */

interface Seg {
  key: string;
  workLogId: number | string;
  title: string;
  project: string;
  start: number; // ms
  end: number; // ms
  running: boolean;
}
interface TaskSum {
  workLogId: number | string;
  title: string;
  project: string;
  seconds: number;
  sessions: number;
  running: boolean;
}
interface EmpDay {
  id: string;
  employeeId: number;
  name: string;
  email: string | null;
  photo: string | null;
  date: string;
  seconds: number;
  segs: Seg[];
  tasks: TaskSum[];
  running: Seg | null;
}

/** Split sessions per IST day and build one row per employee per day. */
const buildRows = (employees: any[], from: string, to: string, now: number): EmpDay[] => {
  const rows: EmpDay[] = [];
  for (const emp of employees || []) {
    const byDay = new Map<string, Seg[]>();
    (emp.sessions || []).forEach((s: any, i: number) => {
      let a = Date.parse(s.start);
      const b = s.running ? now : Date.parse(s.end);
      if (isNaN(a) || isNaN(b) || b <= a) return;
      while (a < b) {
        const day = istDay(a);
        const end = Math.min(b, istDayStart(day) + DAY);
        if ((!from || day >= from) && (!to || day <= to)) {
          if (!byDay.has(day)) byDay.set(day, []);
          byDay.get(day)!.push({
            key: `${i}-${a}`,
            workLogId: s.work_log_id,
            title: s.title || "Untitled task",
            project: s.project_name || "General",
            start: a,
            end,
            running: !!s.running && end === b,
          });
        }
        a = end;
      }
    });

    const name = emp.employee_name || emp.employee_username || "Unknown";
    if (!byDay.size) {
      const day = to || from || todayIST();
      rows.push({
        id: `${emp.employee_id}-${day}`,
        employeeId: emp.employee_id,
        name,
        email: emp.email || null,
        photo: emp.photo_url || null,
        date: day,
        seconds: 0,
        segs: [],
        tasks: [],
        running: null,
      });
      continue;
    }

    for (const [day, segs] of byDay) {
      segs.sort((x, y) => x.start - y.start);
      const tasks = new Map<string, TaskSum>();
      let seconds = 0;
      for (const sg of segs) {
        const secs = (sg.end - sg.start) / 1000;
        seconds += secs;
        const k = String(sg.workLogId);
        const t = tasks.get(k) || {
          workLogId: sg.workLogId,
          title: sg.title,
          project: sg.project,
          seconds: 0,
          sessions: 0,
          running: false,
        };
        t.seconds += secs;
        t.sessions += 1;
        t.running = t.running || sg.running;
        tasks.set(k, t);
      }
      rows.push({
        id: `${emp.employee_id}-${day}`,
        employeeId: emp.employee_id,
        name,
        email: emp.email || null,
        photo: emp.photo_url || null,
        date: day,
        seconds,
        segs,
        tasks: [...tasks.values()].sort((a, b) => b.seconds - a.seconds),
        running: segs.find((s) => s.running) || null,
      });
    }
  }
  return rows;
};

/* ---------------- tooltip ---------------- */

type Tip = { seg: Seg; x: number; y: number } | null;

const SegmentTip: React.FC<{ tip: Tip }> = ({ tip }) => {
  if (!tip) return null;
  const c = colorOf(tip.seg.project);
  const w = 240;
  const left = Math.min(Math.max(8, tip.x - w / 2), window.innerWidth - w - 8);
  const top = tip.y - 12;
  return createPortal(
    <div
      className="tl-tip fixed z-[1700] pointer-events-none"
      style={{ left, top, width: w, transform: "translateY(-100%)" }}
    >
      <div className="rounded-xl bg-white border shadow-xl p-3" style={{ borderColor: c.soft }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.bar }} />
          <span className="text-[11px] font-semibold uppercase tracking-wide truncate" style={{ color: c.text }}>
            {tip.seg.project}
          </span>
          {tip.seg.running && (
            <span className="ml-auto text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              LIVE
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-black-80 mt-1 line-clamp-2">{tip.seg.title}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-black-50">
          <span>
            {fmtClock(tip.seg.start)} – {tip.seg.running ? "now" : fmtClock(tip.seg.end)}
          </span>
          <span className="font-semibold text-black-80">{fmtDur((tip.seg.end - tip.seg.start) / 1000)}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/* ---------------- timeline track ---------------- */

const Track: React.FC<{
  row: EmpDay;
  startMin: number;
  endMin: number;
  hours: number[];
  showNow: boolean;
  now: number;
  onTip: (t: Tip) => void;
  rowIndex: number;
}> = ({ row, startMin, endMin, hours, showNow, now, onTip, rowIndex }) => {
  const span = Math.max(1, endMin - startMin);
  const pct = (min: number) => `${((Math.min(endMin, Math.max(startMin, min)) - startMin) / span) * 100}%`;
  const nowMin = istMinutes(now);

  return (
    <div className="tl-track relative h-9 rounded-lg bg-[#f6f7f9] overflow-hidden">
      {/* hour grid */}
      {hours.map((h) => (
        <span key={h} className="absolute top-0 bottom-0 w-px bg-white" style={{ left: pct(h * 60) }} />
      ))}

      {row.segs.length === 0 ? (
        <span className="absolute inset-0 grid place-items-center text-[11px] text-black-50">No time tracked</span>
      ) : (
        row.segs.map((sg, i) => {
          const a = istMinutes(sg.start);
          const b = sg.end - sg.start >= DAY - 1000 ? 24 * 60 : istMinutes(sg.end) || 24 * 60;
          const c = colorOf(sg.project);
          return (
            <span
              key={sg.key}
              onMouseEnter={(e) => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                onTip({ seg: sg, x: r.left + r.width / 2, y: r.top });
              }}
              onMouseLeave={() => onTip(null)}
              className={`tl-seg absolute top-1.5 bottom-1.5 rounded-md cursor-pointer ${sg.running ? "tl-seg-live" : ""}`}
              style={{
                left: pct(a),
                width: `max(4px, calc(${pct(b)} - ${pct(a)}))`,
                background: c.bar,
                animationDelay: `${Math.min(rowIndex, 10) * 40 + i * 35}ms`,
              }}
            />
          );
        })
      )}

      {showNow && nowMin >= startMin && nowMin <= endMin && (
        <span className="tl-now absolute top-0 bottom-0 w-0.5 bg-rose-500" style={{ left: pct(nowMin) }} />
      )}
    </div>
  );
};

/* ---------------- page ---------------- */

const TimeLogAnalytics: React.FC = () => {
  const today = todayIST();
  const presets = rangePresets(today);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [tip, setTip] = useState<Tip>(null);
  const [sortBy, setSortBy] = useState<"time" | "name">("time");
  // clock for the "now" line and running sessions
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const includesToday = !to || to >= today;
  const { data, isLoading, isFetching, isError, refetch } = useGetTimeLogsQuery(
    { startDate: from, endDate: to },
    { pollingInterval: includesToday ? 60_000 : 0, refetchOnMountOrArgChange: true },
  );

  const allRows = useMemo(() => buildRows((data as any)?.employees || [], from, to, now), [data, from, to, now]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? allRows.filter(
          (r) =>
            r.name.toLowerCase().includes(term) ||
            r.tasks.some((t) => t.title.toLowerCase().includes(term) || t.project.toLowerCase().includes(term)),
        )
      : allRows;
    return list;
  }, [allRows, search]);

  /* group by day, newest first */
  const groups = useMemo(() => {
    const map = new Map<string, EmpDay[]>();
    for (const r of rows) {
      if (!map.has(r.date)) map.set(r.date, []);
      map.get(r.date)!.push(r);
    }
    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, list]) => {
        list.sort((a, b) =>
          sortBy === "name" ? a.name.localeCompare(b.name) : b.seconds - a.seconds || a.name.localeCompare(b.name),
        );
        // axis: 9am–8pm, widened to fit the day's sessions
        let minM = 9 * 60;
        let maxM = 20 * 60;
        for (const r of list)
          for (const s of r.segs) {
            minM = Math.min(minM, istMinutes(s.start));
            const e = s.end - s.start >= DAY - 1000 ? 24 * 60 : istMinutes(s.end) || 24 * 60;
            maxM = Math.max(maxM, e);
          }
        const startH = Math.max(0, Math.floor(minM / 60));
        const endH = Math.min(24, Math.ceil(maxM / 60));
        const hours = Array.from({ length: endH - startH + 1 }, (_, i) => startH + i);
        return {
          date,
          list,
          total: list.reduce((s, r) => s + r.seconds, 0),
          startMin: startH * 60,
          endMin: endH * 60,
          hours,
        };
      });
  }, [rows, sortBy]);

  /* summary */
  const stats = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.seconds, 0);
    const people = new Set(rows.filter((r) => r.seconds > 0).map((r) => r.employeeId));
    const active = new Set(rows.filter((r) => r.running).map((r) => r.employeeId));
    const projects = new Map<string, number>();
    for (const r of rows) for (const t of r.tasks) projects.set(t.project, (projects.get(t.project) || 0) + t.seconds);
    const projectList = [...projects.entries()].sort((a, b) => b[1] - a[1]);
    const days = new Set(rows.filter((r) => r.seconds > 0).map((r) => r.date)).size || 1;
    return {
      total,
      active: active.size,
      people: new Set(rows.map((r) => r.employeeId)).size,
      avg: people.size ? total / people.size / days : 0,
      projectList,
    };
  }, [rows]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exportCSV = () => {
    const out: string[][] = [["Employee", "Email", "Date", "Task", "Project", "Sessions", "Time (h:mm)", "Seconds"]];
    for (const g of groups)
      for (const r of g.list) {
        if (!r.tasks.length) out.push([r.name, r.email || "", r.date, "No tasks logged", "", "0", "0:00", "0"]);
        for (const t of r.tasks) {
          const h = Math.floor(t.seconds / 3600);
          const m = Math.floor((t.seconds % 3600) / 60);
          out.push([
            r.name,
            r.email || "",
            r.date,
            t.title,
            t.project,
            String(t.sessions),
            `${h}:${String(m).padStart(2, "0")}`,
            String(Math.round(t.seconds)),
          ]);
        }
      }
    const csv = "﻿" + out.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `time_logs_${from || "all"}_to_${to || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  let rowIndex = 0;

  return (
    <div className="w-full flex flex-col gap-4 pb-6">
      {/* ===== header card ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-black-80">Time Log Analytics</h2>
            <p className="text-xs text-black-50 mt-0.5">
              When the team tracked time, on what — from the task timers
              {isFetching && !isLoading && <span className="ml-2 text-primary">· refreshing…</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="att-search group flex items-center gap-2 w-64 h-10 px-3 rounded-xl border border-gray-200 bg-[#fafafa] transition-all">
              <Search size={15} className="text-gray-400 group-focus-within:text-primary shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee, task or project…"
                className="w-full bg-transparent outline-none text-sm text-black-80 placeholder:text-gray-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="grid place-items-center w-5 h-5 rounded-full text-gray-400 hover:text-primary cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </label>
            <ThemedDateRange
              from={from}
              to={to}
              max={today}
              className="[&_.tdd-boxed]:h-10 [&_.tdd-boxed]:rounded-xl [&_.tdd-boxed]:min-w-[150px]"
              presets={[presets.today, presets.yesterday, presets.last7, presets.thisMonth, presets.lastMonth]}
              onChange={(a, b) => {
                setFrom(a || today);
                setTo(b || a || today);
                setExpanded(new Set());
              }}
            />
            <button
              onClick={exportCSV}
              disabled={!rows.length}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:brightness-105 active:scale-[0.98] disabled:opacity-50 transition cursor-pointer"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Clock3, label: "Team time tracked", value: fmtDur(stats.total) },
            {
              icon: Activity,
              label: "Tracking right now",
              value: includesToday ? `${stats.active} / ${stats.people}` : "—",
              live: includesToday && stats.active > 0,
            },
            { icon: Timer, label: "Avg per person / day", value: fmtDur(stats.avg) },
            { icon: FolderKanban, label: "Top project", value: stats.projectList[0]?.[0] || "—" },
          ].map(({ icon: Icon, label, value, live }, i) => (
            <div
              key={label}
              style={{ animationDelay: `${i * 50}ms` }}
              className="att-stat flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3"
            >
              <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-primary-20 text-primary shrink-0">
                <Icon size={17} />
                {live && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-black-80 leading-tight truncate">{isLoading ? "…" : value}</p>
                <p className="text-[11px] text-black-50">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* project legend */}
        {stats.projectList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-black-50 mr-1">Projects</span>
            {stats.projectList.map(([p, secs], i) => {
              const c = colorOf(p);
              const share = stats.total ? Math.round((secs / stats.total) * 100) : 0;
              return (
                <button
                  key={p}
                  onClick={() => setSearch(search === p ? "" : p)}
                  style={{ background: c.soft, color: c.text, animationDelay: `${i * 30}ms` }}
                  className={`tl-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-shadow hover:shadow-sm ${
                    search === p ? "ring-2 ring-offset-1" : ""
                  }`}
                  title={`${fmtDur(secs)} · ${share}% of tracked time — click to filter`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: c.bar }} />
                  {p}
                  <span className="opacity-70">{fmtDur(secs)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== timelines ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-black-80">Timelines</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary-20 text-primary text-xs font-semibold">
              <Users size={12} className="inline -mt-0.5 mr-1" />
              {stats.people} {stats.people === 1 ? "employee" : "employees"}
            </span>
          </div>
          <div className="inline-flex p-0.5 rounded-xl bg-gray-100 text-xs font-medium">
            {(["time", "name"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={`px-3 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                  sortBy === k ? "bg-white text-primary shadow-sm" : "text-black-50 hover:text-black-80"
                }`}
              >
                {k === "time" ? "Most time" : "Name"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-[260px_110px_1fr] gap-4 items-center px-3 py-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100" />
                  <div className="h-3 w-28 rounded bg-gray-100" />
                </div>
                <div className="h-3 w-16 rounded bg-gray-100" />
                <div className="h-9 rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-14">
            <p className="text-sm font-semibold text-black-80">Couldn't load time logs</p>
            <button onClick={() => refetch()} className="mt-3 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer">
              Try again
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center text-center py-14">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary-20 text-primary mb-3">
              <Clock3 size={22} />
            </span>
            <p className="text-sm font-semibold text-black-80">No time logged</p>
            <p className="text-xs text-black-50 mt-1">
              {search ? "Nothing matches your search." : "Nobody tracked time in this range."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              {groups.map((g) => (
                <section key={g.date} className="mb-5 last:mb-0">
                  {/* day header + hour ruler */}
                  <div className="tl-day sticky top-0 z-[2] grid grid-cols-[260px_110px_1fr] gap-4 items-end px-3 pt-2.5 pb-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[11px] font-bold uppercase tracking-wide">
                        {g.date === today ? "Today" : dayjs(g.date).format("dddd")}
                      </span>
                      <span className="text-sm font-semibold text-black-80">{dayjs(g.date).format("DD MMM YYYY")}</span>
                      <span className="text-[11px] text-black-50">· {g.list.length} members</span>
                    </div>
                    <div className="text-xs text-black-50">
                      <span className="font-semibold text-black-80">{fmtDur(g.total)}</span> total
                    </div>
                    <div className="relative h-5">
                      {g.hours.map((h, i) => (
                        <span
                          key={h}
                          className="absolute bottom-0 text-[10px] text-black-50 -translate-x-1/2 whitespace-nowrap"
                          style={{
                            left: `${((h * 60 - g.startMin) / Math.max(1, g.endMin - g.startMin)) * 100}%`,
                            visibility: g.hours.length > 14 && i % 2 ? "hidden" : "visible",
                          }}
                        >
                          {hourLabel(h)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <ul className="mt-1">
                    {g.list.map((r) => {
                      const open = expanded.has(r.id);
                      const idx = rowIndex++;
                      const lastTask = r.segs[r.segs.length - 1];
                      return (
                        <li
                          key={r.id}
                          className="tl-row border-b border-gray-100 last:border-b-0"
                          style={{ animationDelay: `${Math.min(idx, 12) * 30}ms` }}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => r.tasks.length && toggle(r.id)}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && r.tasks.length && toggle(r.id)}
                            className={`grid grid-cols-[260px_110px_1fr] gap-4 items-center px-3 py-2.5 rounded-xl transition-colors ${
                              r.tasks.length ? "cursor-pointer hover:bg-primary-20/25" : ""
                            } ${open ? "bg-primary-20/25" : ""}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronRight
                                size={16}
                                className={`shrink-0 transition-transform duration-200 ${
                                  r.tasks.length ? "text-gray-400" : "text-transparent"
                                } ${open ? "rotate-90 text-primary" : ""}`}
                              />
                              <PersonCell
                                name={r.name}
                                photo={r.photo}
                                sub={
                                  r.running ? (
                                    <span className="text-emerald-600">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 align-middle animate-pulse" />
                                      {r.running.title}
                                    </span>
                                  ) : lastTask ? (
                                    `Last: ${lastTask.title}`
                                  ) : (
                                    "No tasks logged"
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${r.seconds ? "text-black-80" : "text-black-50"}`}>
                                {fmtDur(r.seconds)}
                              </p>
                              <p className="text-[11px] text-black-50">
                                {r.tasks.length} {r.tasks.length === 1 ? "task" : "tasks"} · {r.segs.length} sessions
                              </p>
                            </div>
                            <Track
                              row={r}
                              startMin={g.startMin}
                              endMin={g.endMin}
                              hours={g.hours}
                              showNow={g.date === today}
                              now={now}
                              onTip={setTip}
                              rowIndex={idx}
                            />
                          </div>

                          {/* breakdown */}
                          <div className={`tl-detail grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                            <div className="overflow-hidden">
                              <div className="ml-9 mr-3 mb-3 mt-1 grid grid-cols-1 xl:grid-cols-2 gap-3">
                                {/* by task */}
                                <div className="rounded-xl border border-gray-100 p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-wider text-black-50 mb-2">By task</p>
                                  <ul className="flex flex-col gap-2">
                                    {r.tasks.map((t) => {
                                      const c = colorOf(t.project);
                                      const share = r.seconds ? (t.seconds / r.seconds) * 100 : 0;
                                      return (
                                        <li key={String(t.workLogId)} className="min-w-0">
                                          <div className="flex items-center justify-between gap-3 text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.bar }} />
                                              <span className="truncate font-medium text-black-80">{t.title}</span>
                                              {t.running && (
                                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 rounded-full">
                                                  LIVE
                                                </span>
                                              )}
                                            </div>
                                            <span className="shrink-0 font-semibold text-black-80">{fmtDur(t.seconds)}</span>
                                          </div>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] px-1.5 rounded" style={{ background: c.soft, color: c.text }}>
                                              {t.project}
                                            </span>
                                            <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                                              <div className="att-bar h-full rounded-full" style={{ width: `${share}%`, background: c.bar }} />
                                            </div>
                                            <span className="text-[11px] text-black-50 w-16 text-right">
                                              {Math.round(share)}% · {t.sessions}×
                                            </span>
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>

                                {/* sessions */}
                                <div className="rounded-xl border border-gray-100 p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-wider text-black-50 mb-2">Sessions</p>
                                  <ol className="relative flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 [scrollbar-width:thin]">
                                    {r.segs.map((sg) => {
                                      const c = colorOf(sg.project);
                                      return (
                                        <li key={sg.key} className="flex items-center gap-3 text-xs">
                                          <span className="w-28 shrink-0 text-black-50 tabular-nums">
                                            {fmtClock(sg.start)} – {sg.running ? "now" : fmtClock(sg.end)}
                                          </span>
                                          <span className="w-1 self-stretch rounded-full" style={{ background: c.bar }} />
                                          <span className="flex-1 truncate text-black-80">{sg.title}</span>
                                          <span className={`shrink-0 font-semibold ${sg.running ? "text-emerald-600" : "text-black-80"}`}>
                                            {fmtDur((sg.end - sg.start) / 1000)}
                                          </span>
                                        </li>
                                      );
                                    })}
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>

      <SegmentTip tip={tip} />
    </div>
  );
};

export default TimeLogAnalytics;
