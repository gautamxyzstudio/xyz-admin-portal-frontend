import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

export const IST_TIMEZONE = "Asia/Kolkata";
export { dayjs };

/**
 * Safely parses any date/timestamp input into a Dayjs instance in Asia/Kolkata (IST).
 * Handles:
 * - UTC strings with trailing 'Z' (e.g. "2026-10-29T10:32:00.000Z")
 * - UTC strings without 'Z' (e.g. "2026-10-29T10:32:00.000", "2026-10-29 10:32:00")
 * - Strings with existing offset (e.g. "+05:30")
 * - Date objects, numeric epoch timestamps, Dayjs objects
 */
export const toIstDayjs = (
  dateInput?: string | number | Date | null | dayjs.Dayjs
): dayjs.Dayjs | null => {
  if (!dateInput) return null;
  if (dayjs.isDayjs(dateInput)) return dateInput.tz(IST_TIMEZONE);

  if (typeof dateInput === "number") {
    const d = dayjs(dateInput).tz(IST_TIMEZONE);
    return d.isValid() ? d : null;
  }

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    return dayjs(dateInput).tz(IST_TIMEZONE);
  }

  let clean = String(dateInput).trim();
  if (!clean) return null;

  // Numeric timestamp string
  if (/^\d+$/.test(clean)) {
    const d = dayjs(Number(clean)).tz(IST_TIMEZONE);
    return d.isValid() ? d : null;
  }

  // Pure date YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return dayjs.tz(clean, IST_TIMEZONE);
  }

  // MySQL datetime format: replace space between date and time with 'T'
  if (clean.includes(" ") && !clean.includes("T")) {
    clean = clean.replace(" ", "T");
  }

  // Backend UTC timestamps typically lack offset or end in Z
  // Ensure UTC parsing by appending Z if no offset exists
  if (!clean.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(clean)) {
    clean += "Z";
  }

  const d = dayjs.utc(clean).tz(IST_TIMEZONE);
  if (d.isValid()) return d;

  const fallback = dayjs(dateInput).tz(IST_TIMEZONE);
  return fallback.isValid() ? fallback : null;
};

/**
 * Parses UTC timestamp to JS Date object
 */
export const parseUtcToDate = (
  dateInput?: string | number | Date | null
): Date | null => {
  const d = toIstDayjs(dateInput);
  return d && d.isValid() ? d.toDate() : null;
};

/**
 * Formats a timestamp into 12-hour IST time (e.g. "3:34 pm" or "3:34 PM")
 */
export const formatIstTime = (
  dateInput?: string | number | Date | null | dayjs.Dayjs,
  options?: { hour12?: boolean; uppercase?: boolean; includeSeconds?: boolean }
): string => {
  const d = toIstDayjs(dateInput);
  if (!d || !d.isValid()) return "";

  if (options?.hour12 === false) {
    return d.format(options?.includeSeconds ? "HH:mm:ss" : "HH:mm");
  }

  const pattern = options?.includeSeconds
    ? options?.uppercase ? "h:mm:ss A" : "h:mm:ss a"
    : options?.uppercase ? "h:mm A" : "h:mm a";

  return d.format(pattern);
};

/**
 * Formats a timestamp into an IST date string
 * - "short": "29 Oct"
 * - "medium": "29 Oct 2026"
 * - "long": "29 October 2026"
 * - "numeric": "29/10/2026"
 * - "iso": "2026-10-29"
 */
export const formatIstDate = (
  dateInput?: string | number | Date | null | dayjs.Dayjs,
  format: "short" | "medium" | "long" | "numeric" | "iso" = "medium"
): string => {
  const d = toIstDayjs(dateInput);
  if (!d || !d.isValid()) return "";

  switch (format) {
    case "short":
      return d.format("D MMM");
    case "medium":
      return d.format("D MMM YYYY");
    case "long":
      return d.format("D MMMM YYYY");
    case "numeric":
      return d.format("DD/MM/YYYY");
    case "iso":
      return d.format("YYYY-MM-DD");
    default:
      return d.format("D MMM YYYY");
  }
};

/**
 * Formats a timestamp into an IST date and time string
 * e.g. "29 Oct, 4:02 pm" or "29/10/2026, 4:02 PM"
 */
export const formatIstDateTime = (
  dateInput?: string | number | Date | null | dayjs.Dayjs,
  options?: { numericDate?: boolean; uppercase?: boolean }
): string => {
  const d = toIstDayjs(dateInput);
  if (!d || !d.isValid()) return "";

  const datePart = options?.numericDate
    ? d.format("DD/MM/YYYY")
    : d.format("D MMM");
  const timePart = options?.uppercase
    ? d.format("h:mm A")
    : d.format("h:mm a");

  return `${datePart}, ${timePart}`;
};

/**
 * Returns today's date in IST formatted as YYYY-MM-DD
 */
export const getIstTodayDateString = (): string => {
  return dayjs().tz(IST_TIMEZONE).format("YYYY-MM-DD");
};

/**
 * Calculates human-readable relative time in IST
 * (e.g. "just now", "15m ago", "2h ago", "1d ago")
 */
export const formatIstRelativeTime = (
  dateInput?: string | number | Date | null | dayjs.Dayjs
): string => {
  if (!dateInput) return "just now";
  const d = toIstDayjs(dateInput);
  if (!d || !d.isValid()) return "just now";

  const now = dayjs().tz(IST_TIMEZONE);
  const diffSecs = Math.max(0, now.diff(d, "second"));

  if (diffSecs < 45) return "just now";

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  if (diffDays <= 7 && remainingHours > 0) {
    return `${diffDays}d ${remainingHours}h ago`;
  }
  return `${diffDays}d ago`;
};

/**
 * Formats task card footer timestamp for Kanban cards
 */
export const formatTaskCardTimestamp = (
  task: {
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    estimatedMinutes?: number;
    attributes?: {
      createdAt?: string;
      updatedAt?: string;
      status?: string;
      estimatedMinutes?: number;
    };
  },
  formatMinutesFn?: (mins?: number) => string
): { icon: string; text: string } | null => {
  if (!task) return null;

  const rawCreatedAt = task.createdAt || task.attributes?.createdAt;
  const rawUpdatedAt = task.updatedAt || task.attributes?.updatedAt;
  const status = task.status || task.attributes?.status;
  const estMins = task.estimatedMinutes ?? task.attributes?.estimatedMinutes;

  if (status === "completed") {
    const dateStr = rawUpdatedAt || rawCreatedAt;
    if (!dateStr) return null;
    const d = toIstDayjs(dateStr);
    if (!d || !d.isValid()) return null;

    const formattedDate = d.format("D MMM");
    const formattedTime = d.format("h:mm a");
    const timeSpent =
      formatMinutesFn && estMins
        ? formatMinutesFn(estMins)
        : estMins
          ? `${estMins}m`
          : "45m";

    return {
      icon: "✓",
      text: `Completed ${formattedDate}, ${formattedTime} · took ${timeSpent}`,
    };
  }

  const dateStr = rawCreatedAt || rawUpdatedAt;
  if (!dateStr) return null;
  const d = toIstDayjs(dateStr);
  if (!d || !d.isValid()) return null;

  const formattedDate = d.format("D MMM");
  const formattedTime = d.format("h:mm a");
  const relative = formatIstRelativeTime(d);

  return {
    icon: "▶",
    text: `Created ${formattedDate}, ${formattedTime} · ${relative}`,
  };
};
