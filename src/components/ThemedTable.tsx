import React, { useState } from "react";
import { Inbox } from "lucide-react";
import { getImageUrl } from "../utils/utils";

/* Simple themed table for short lists (dashboards, cards).
   For long, paginated lists keep using CustomDataTable. */

export interface ThemedColumn<T> {
  key: string;
  header: React.ReactNode;
  /** CSS grid track, e.g. "1.5fr", "120px", "minmax(160px,2fr)" */
  width?: string;
  align?: "left" | "right" | "center";
  className?: string;
  render: (row: T, index: number) => React.ReactNode;
}

interface Props<T> {
  columns: ThemedColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  /** min width before the table scrolls sideways */
  minWidth?: number;
  onRowClick?: (row: T) => void;
  className?: string;
}

function ThemedTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyTitle = "Nothing here yet",
  emptySubtitle,
  minWidth = 720,
  onRowClick,
  className = "",
}: Props<T>) {
  const template = columns.map((c) => c.width || "1fr").join(" ");
  const alignCls = (a?: string) => (a === "right" ? "text-right justify-end" : a === "center" ? "text-center justify-center" : "");

  return (
    <div className={`tt-wrap overflow-auto ${className}`}>
      <div style={{ minWidth }}>
        {/* header (sticky inside the scroll area) */}
        <div
          className="tt-head sticky top-0 z-[1] grid gap-4 px-4 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-wider text-black-50"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((c) => (
            <div key={c.key} className={`flex items-center ${alignCls(c.align)}`}>
              {c.header}
            </div>
          ))}
        </div>

        {loading && rows.length === 0 ? (
          <ul>
            {[0, 1, 2, 3, 4].map((i) => (
              <li
                key={i}
                className="grid gap-4 px-4 py-3.5 border-b border-gray-100 animate-pulse"
                style={{ gridTemplateColumns: template }}
              >
                {columns.map((c) => (
                  <div key={c.key} className="h-3.5 rounded bg-gray-100" style={{ width: `${55 + ((i * 17) % 40)}%` }} />
                ))}
              </li>
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary-20 text-primary mb-3">
              <Inbox size={22} />
            </span>
            <p className="text-sm font-semibold text-black-80">{emptyTitle}</p>
            {emptySubtitle && <p className="text-xs text-black-50 mt-1">{emptySubtitle}</p>}
          </div>
        ) : (
          <ul className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {rows.map((row, i) => (
              <li
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ gridTemplateColumns: template, animationDelay: `${Math.min(i, 12) * 25}ms` }}
                className={`tt-row grid gap-4 items-center px-4 py-3 border-b border-gray-100 last:border-b-0 text-sm text-black-80 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((c) => (
                  <div key={c.key} className={`min-w-0 flex items-center ${alignCls(c.align)} ${c.className || ""}`}>
                    {c.render(row, i)}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ThemedTable;

/* ---------- small shared cells ---------- */

const AVATAR_BG = ["#F17C04", "#0EA5E9", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B", "#14B8A6", "#EC4899"];

/** Photo if available, otherwise coloured initials. */
export const PersonCell: React.FC<{ name?: string | null; sub?: React.ReactNode; photo?: string | null }> = ({
  name,
  sub,
  photo,
}) => {
  const [failed, setFailed] = useState(false);
  const label = (name || "—").trim();
  const initials =
    label
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";
  const color = AVATAR_BG[[...label].reduce((s, ch) => s + ch.charCodeAt(0), 0) % AVATAR_BG.length];
  const src = photo ? getImageUrl(photo) : "";
  return (
    <div className="flex items-center gap-3 min-w-0">
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} className="w-8 h-8 rounded-full object-cover shrink-0" />
      ) : (
        <span
          className="grid place-items-center w-8 h-8 rounded-full text-white text-[11px] font-semibold shrink-0"
          style={{ backgroundColor: color }}
        >
          {initials}
        </span>
      )}
      <div className="min-w-0">
        <p className="font-medium text-black-80 truncate">{label}</p>
        {sub && <p className="text-[11px] text-black-50 truncate">{sub}</p>}
      </div>
    </div>
  );
};

export const Pill: React.FC<{ tone?: "orange" | "green" | "red" | "blue" | "gray" | "violet"; children: React.ReactNode }> = ({
  tone = "gray",
  children,
}) => {
  const cls = {
    orange: "bg-primary-20 text-primary",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-600",
    blue: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
    gray: "bg-gray-100 text-black-80",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {children}
    </span>
  );
};

export const WorkingNow: React.FC = () => (
  <Pill tone="green">
    <span className="relative flex w-2 h-2">
      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
      <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
    </span>
    Working now
  </Pill>
);

const formatSeconds = (secs: number) => {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (!h && !m) return s ? "<1m" : "0m";
  return h ? `${h}h ${m}m` : `${m}m`;
};

/** Hours bar: fill is relative to `max` seconds; green while still working. */
export const HoursBar: React.FC<{ seconds: number; max: number; live?: boolean; label?: string }> = ({
  seconds,
  max,
  live = false,
  label,
}) => (
  <div className="flex items-center gap-3 w-full min-w-0">
    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`att-bar h-full rounded-full ${live ? "bg-emerald-500" : "bg-primary"}`}
        style={{ width: `${seconds > 0 ? Math.max(3, Math.min(100, (seconds / Math.max(1, max)) * 100)) : 0}%` }}
      />
    </div>
    <span className={`w-16 text-right text-xs font-semibold shrink-0 ${seconds ? "text-black-80" : "text-black-50"}`}>
      {label ?? (seconds ? formatSeconds(seconds) : "—")}
    </span>
  </div>
);
