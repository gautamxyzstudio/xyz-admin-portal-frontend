import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dayParts, dayStr, localToday } from "./themedDates";

/* Dates are plain "YYYY-MM-DD" strings (calendar days, no time zone). */

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const monthTitle = (y: number, m: number) =>
  new Date(Date.UTC(y, m, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

interface Props {
  /** single mode: the chosen day; range mode: range start */
  from: string | null;
  /** range mode: range end (same as from in single mode) */
  to: string | null;
  /** the day that has been clicked first while picking a range */
  anchor?: string | null;
  onPick: (day: string) => void;
  min?: string;
  max?: string;
  isDisabled?: (day: string) => boolean;
  /** month shown first */
  initial?: string;
  footer?: React.ReactNode;
}

/** Month grid used by ThemedDatePicker and ThemedDateRange. */
const ThemedCalendar: React.FC<Props> = ({
  from,
  to,
  anchor = null,
  onPick,
  min,
  max,
  isDisabled,
  initial,
  footer,
}) => {
  const today = localToday();
  const [view, setView] = useState(() => {
    const p = dayParts(initial || to || from || today);
    return { y: p.y, m: p.m };
  });
  const [slide, setSlide] = useState<"l" | "r" | "">("");
  const [hover, setHover] = useState<string | null>(null);

  const moveMonth = (delta: number) => {
    setSlide(delta < 0 ? "l" : "r");
    setView((v) => {
      const t = new Date(Date.UTC(v.y, v.m + delta, 1));
      return { y: t.getUTCFullYear(), m: t.getUTCMonth() };
    });
  };

  // range drawn: live preview while picking, else the value
  const lo = anchor ? (hover && hover < anchor ? hover : anchor) : from;
  const hi = anchor ? (hover && hover > anchor ? hover : anchor) : to;

  const first = new Date(Date.UTC(view.y, view.m, 1));
  const offset = -first.getUTCDay();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const t = new Date(Date.UTC(view.y, view.m, 1 + offset + i));
    return { day: t.toISOString().slice(0, 10), inMonth: t.getUTCMonth() === view.m, num: t.getUTCDate() };
  });

  const prevDisabled = !!min && dayStr(view.y, view.m, 0) < min;
  const nextDisabled = !!max && dayStr(view.y, view.m + 1, 1) > max;

  return (
    <div className="tdr-cal">
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          type="button"
          className="tdr-nav"
          onClick={() => moveMonth(-1)}
          disabled={prevDisabled}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span key={`${view.y}-${view.m}`} className="tdr-title">
          {monthTitle(view.y, view.m)}
        </span>
        <button
          type="button"
          className="tdr-nav"
          onClick={() => moveMonth(1)}
          disabled={nextDisabled}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <span key={w} className="tdr-weekday">
            {w}
          </span>
        ))}
      </div>

      <div
        key={`${view.y}-${view.m}`}
        className={`grid grid-cols-7 gap-y-0.5 ${slide === "l" ? "tdr-slide-l" : slide === "r" ? "tdr-slide-r" : ""}`}
        onMouseLeave={() => setHover(null)}
      >
        {cells.map(({ day, inMonth, num }) => {
          const disabled = (!!min && day < min) || (!!max && day > max) || !!isDisabled?.(day);
          const inRange = !!lo && !!hi && day >= lo && day <= hi;
          const cls = [
            "tdr-day",
            !inMonth && "tdr-out",
            disabled && "tdr-disabled",
            inRange && "tdr-in-range",
            day === lo && "tdr-start",
            day === hi && "tdr-end",
            day === today && "tdr-today",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              className={cls}
              onMouseEnter={() => anchor && setHover(day)}
              onClick={() => onPick(day)}
            >
              <span>{num}</span>
            </button>
          );
        })}
      </div>

      {footer && (
        <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-gray-100">{footer}</div>
      )}
    </div>
  );
};

export default ThemedCalendar;
