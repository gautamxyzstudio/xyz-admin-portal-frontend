/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { getIstTodayDateString } from "../../../utils/istDateUtils";
import dayjs from "dayjs";

interface TaskDueDatePickerProps {
  value: string; // YYYY-MM-DD or ""
  onChange: (dateStr: string) => void;
  disabled?: boolean;
}

export const TaskDueDatePicker: React.FC<TaskDueDatePickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const todayStr = getIstTodayDateString();

  const initialDate = value ? new Date(value) : new Date(todayStr);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const currentMonthToday = new Date(todayStr).getMonth();
  const currentYearToday = new Date(todayStr).getFullYear();
  const isPrevDisabled =
    currentYear < currentYearToday ||
    (currentYear === currentYearToday && currentMonth <= currentMonthToday);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPrevDisabled) return;

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button styled identically to other task modal inputs */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full h-[46px] px-4 py-2.5 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs flex items-center justify-between gap-2 transition-all shadow-2xs select-none cursor-pointer ${
          isOpen
            ? "border-primary bg-white ring-2 ring-orange-500/10"
            : "hover:border-slate-300 hover:bg-white"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon
            size={15}
            className={value ? "text-primary" : "text-slate-400"}
          />
          {value ? (
            <span className="font-semibold text-slate-800">
              {dayjs(value).format("DD MMM YYYY")}
            </span>
          ) : (
            <span className="text-slate-400">Select Due Date</span>
          )}
        </div>

        {value && !disabled ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 transition cursor-pointer"
            title="Clear due date"
          >
            <X size={14} />
          </button>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">
            Optional
          </span>
        )}
      </div>

      {/* Floating Calendar Popover */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full mt-2 left-0 w-72 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isPrevDisabled}
                onClick={handlePrevMonth}
                className={`p-1 rounded-md transition ${
                  isPrevDisabled
                    ? "text-slate-200 cursor-not-allowed"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-400">
                {d}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedDate = `${currentYear}-${String(
                currentMonth + 1,
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = value === formattedDate;
              // Past dates are strictly disabled!
              const isDisabled = formattedDate < todayStr;
              const isToday = formattedDate === todayStr;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(formattedDate);
                      setIsOpen(false);
                    }
                  }}
                  className={`h-8 w-8 text-xs flex items-center justify-center rounded-xl transition ${
                    isDisabled
                      ? "text-slate-200 cursor-not-allowed pointer-events-none"
                      : isSelected
                        ? "bg-primary text-white font-bold shadow-xs cursor-pointer"
                        : isToday
                          ? "border border-primary text-primary font-bold hover:bg-orange-50 cursor-pointer"
                          : "text-slate-700 hover:bg-slate-100 cursor-pointer font-medium"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Options */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = dayjs(todayStr)
                  .add(1, "day")
                  .format("YYYY-MM-DD");
                onChange(tomorrow);
                setIsOpen(false);
              }}
              className="text-slate-600 font-medium hover:text-slate-800 hover:underline cursor-pointer"
            >
              Tomorrow
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="text-rose-500 font-semibold hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDueDatePicker;

