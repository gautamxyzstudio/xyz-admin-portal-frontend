import React from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import ThemedCalendar from "./ThemedCalendar";
import { localToday } from "./themedDates";
import { useThemedPopover } from "./useThemedPopover";

interface Props {
  /** "YYYY-MM-DD" or "" */
  value: string;
  onChange: (day: string) => void;
  min?: string;
  max?: string;
  isDisabled?: (day: string) => boolean;
  placeholder?: string;
  /** boxed = small pill (toolbars), field = full-size form field */
  variant?: "boxed" | "field";
  align?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  error?: boolean;
  /** display format; default DD/MM/YYYY */
  format?: (day: string) => string;
  className?: string;
  triggerClassName?: string;
  showTodayButton?: boolean;
  /** show an × on the field and a Clear chip (onChange gets "") */
  clearable?: boolean;
  /** quick-pick chips in the footer; replaces the default Today chip */
  shortcuts?: { label: string; day: string }[];
}

const ddmmyyyy = (d: string) => {
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
};

/** Single-date picker with the themed calendar (styles in index.css). */
const ThemedDatePicker: React.FC<Props> = ({
  value,
  onChange,
  min,
  max,
  isDisabled,
  placeholder = "Select date",
  variant = "field",
  align = "left",
  fullWidth = variant === "field",
  disabled = false,
  error = false,
  format = ddmmyyyy,
  className = "",
  triggerClassName = "",
  showTodayButton = true,
  clearable = false,
  shortcuts,
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
  } = useThemedPopover({ align, estHeight: 340 });
  const today = localToday();

  const allowed = (d: string) => !(min && d < min) && !(max && d > max) && !isDisabled?.(d);
  const chips = (shortcuts ?? (showTodayButton ? [{ label: "Today", day: today }] : [])).filter((c) =>
    allowed(c.day),
  );

  const pick = (d: string) => {
    onChange(d);
    hide();
  };

  return (
    <div className={`relative ${fullWidth ? "block w-full" : "inline-block"} ${className}`}>
      <button
        type="button"
        ref={bindTrigger}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={togglePop}
        className={`tdd-trigger tdd-${variant} ${fullWidth ? "tdd-full" : ""} ${isOpen ? "tdd-open" : ""} ${
          error ? "tdd-error" : ""
        } ${triggerClassName}`}
      >
        <CalendarDays size={variant === "field" ? 16 : 14} className="tdr-icon shrink-0" />
        <span className={`min-w-0 flex-1 truncate text-left ${value ? "" : "tdd-placeholder"}`}>
          {value ? format(value) : placeholder}
        </span>
        {clearable && value && !disabled ? (
          <span className="w-4 shrink-0" />
        ) : (
          <ChevronDown size={variant === "field" ? 16 : 14} className="tdd-chevron shrink-0" />
        )}
      </button>
      {clearable && value && !disabled && (
        <button
          type="button"
          title="Clear date"
          aria-label="Clear date"
          onClick={() => onChange("")}
          className="tdr-clear"
        >
          <X size={14} />
        </button>
      )}

      {popOpen &&
        createPortal(
          <div
            ref={bindPop}
            role="dialog"
            aria-label="Choose date"
            style={{ ...pos.style, minWidth: undefined, width: undefined, maxHeight: undefined }}
            className={`tdd-menu tdr-panel ${pos.placement === "top" ? "tdd-up" : ""} ${
              closing ? "tdd-menu-out" : "tdd-menu-in"
            }`}
          >
            <ThemedCalendar
              from={value || null}
              to={value || null}
              onPick={pick}
              min={min}
              max={max}
              isDisabled={isDisabled}
              footer={
                chips.length || clearable ? (
                  <>
                    <span className="text-[11px] text-black-50">{value ? format(value) : "No date"}</span>
                    <div className="flex gap-1">
                      {chips.map((c) => (
                        <button key={c.label} type="button" className="tdr-chip" onClick={() => pick(c.day)}>
                          {c.label}
                        </button>
                      ))}
                      {clearable && value && (
                        <button
                          type="button"
                          className="tdr-chip tdr-chip-muted"
                          onClick={() => {
                            onChange("");
                            hide();
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </>
                ) : undefined
              }
            />
          </div>,
          portalEl,
        )}
    </div>
  );
};

export default ThemedDatePicker;
