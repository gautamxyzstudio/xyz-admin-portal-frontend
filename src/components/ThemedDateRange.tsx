import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown } from "lucide-react";
import ThemedCalendar from "./ThemedCalendar";
import { localToday, rangePresets } from "./themedDates";
import type { DateRangePreset } from "./themedDates";
import { useThemedPopover } from "./useThemedPopover";

/* Dates are plain "YYYY-MM-DD" strings (calendar days, no time zone).
   An empty string means "open" on that side (e.g. from "" = from the beginning). */

export type { DateRangePreset };

interface Props {
  from: string;
  to: string;
  /** latest selectable day, e.g. today */
  max?: string;
  min?: string;
  onChange: (from: string, to: string) => void;
  variant?: "boxed" | "field";
  align?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
  /** quick-pick chips shown above the calendar; defaults to Today / Yesterday */
  presets?: DateRangePreset[];
  /** label when no dates are set */
  placeholder?: string;
}

const pretty = (d: string, withYear = false) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });

/** Date-range picker: click a start day, then an end day, or use a chip. */
const ThemedDateRange: React.FC<Props> = ({
  from,
  to,
  max,
  min,
  onChange,
  variant = "boxed",
  align = "right",
  fullWidth = false,
  className = "",
  presets,
  placeholder = "All dates",
}) => {
  const {
    open: popOpen,
    closing,
    isOpen,
    hide,
    toggle: togglePop,
    bindTrigger,
    bindPop,
    pos,
    portalEl,
  } = useThemedPopover({ align, estHeight: 400 });
  const [anchor, setAnchor] = useState<string | null>(null);
  const today = max && max < localToday() ? max : localToday();
  const p = rangePresets(today);
  const chips = presets ?? [p.today, p.yesterday];

  const toggle = () => {
    setAnchor(null);
    togglePop();
  };

  const pick = (d: string) => {
    if (!anchor) {
      setAnchor(d);
      return;
    }
    const [a, b] = anchor <= d ? [anchor, d] : [d, anchor];
    setAnchor(null);
    onChange(a, b);
    hide();
  };

  const quick = (a: string, b: string) => {
    setAnchor(null);
    onChange(a, b);
    hide();
  };

  const activeChip = chips.find((c) => c.from === from && c.to === to);
  const label = activeChip
    ? activeChip.label
    : from && to
      ? from === to
        ? pretty(from, true)
        : `${pretty(from)} – ${pretty(to, true)}`
      : to
        ? `Up to ${pretty(to, true)}`
        : from
          ? `From ${pretty(from, true)}`
          : placeholder;

  return (
    <div className={`relative ${fullWidth ? "block w-full" : "inline-block"} ${className}`}>
      <button
        type="button"
        ref={bindTrigger}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={toggle}
        className={`tdd-trigger tdd-${variant} ${fullWidth ? "tdd-full" : ""} ${isOpen ? "tdd-open" : ""}`}
      >
        <CalendarDays size={variant === "field" ? 16 : 14} className="tdr-icon shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        {activeChip && from && to && from !== to && (
          <span className="tdr-sub hidden sm:inline">
            {pretty(from)} – {pretty(to)}
          </span>
        )}
        <ChevronDown size={variant === "field" ? 16 : 14} className="tdd-chevron shrink-0" />
      </button>

      {popOpen &&
        createPortal(
          <div
            ref={bindPop}
            role="dialog"
            aria-label="Choose date range"
            style={{ ...pos.style, minWidth: undefined, width: undefined, maxHeight: undefined }}
            className={`tdd-menu tdr-panel ${pos.placement === "top" ? "tdd-up" : ""} ${
              closing ? "tdd-menu-out" : "tdd-menu-in"
            }`}
          >
            {chips.length > 0 && (
              <div className="tdr-presets">
                {chips.map((c, i) => (
                  <button
                    key={c.label}
                    type="button"
                    style={{ animationDelay: `${i * 25}ms` }}
                    className={`tdr-chip ${c === activeChip ? "tdr-chip-active" : ""}`}
                    onClick={() => quick(c.from, c.to)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            <ThemedCalendar
              from={from || null}
              to={to || null}
              anchor={anchor}
              onPick={pick}
              min={min}
              max={max}
              footer={
                <span className="text-[11px] text-black-50">
                  {anchor
                    ? `From ${pretty(anchor, true)} — now pick the end date`
                    : "Click a start date, then an end date"}
                </span>
              }
            />
          </div>,
          portalEl,
        )}
    </div>
  );
};

export default ThemedDateRange;
