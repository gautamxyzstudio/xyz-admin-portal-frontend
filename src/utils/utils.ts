/* eslint-disable @typescript-eslint/no-explicit-any */
export const getImageUrl = (url: string) => {
  return url.startsWith("https")
    ? url
    : `${import.meta.env.VITE_API_BASE_URL}${url}`;
};

export const timeStringToDate = (timeString: string) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, seconds, 0);
  return now;
};

// Utility function to convert a Date object to a time string
export const dateToTimeString = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export const formatDateToMMDDYYYY = (date: Date | any): string => {
  // If it's a Dayjs object
  if (date.$isDayjsObject) {
    const month = (date.$M + 1).toString().padStart(2, "0");
    const day = date.$D.toString().padStart(2, "0");
    const year = date.$y;
    return `${year}-${month}-${day}`;
  }

  // If it's a Date object
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const formatTimeToHHMMSS = (time: string | any): string => {
  // If it's a Dayjs object
  if (time?.$isDayjsObject) {
    const hours = time.$H.toString().padStart(2, "0");
    const minutes = time.$m.toString().padStart(2, "0");
    const seconds = time.$s.toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  // If it's a string
  if (typeof time === "string") {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return "00:00:00";
};

export const convertTo12HourFormat = (time: string): string => {
  if (!time) {
    return "N/A";
  }
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${adjustedHours}:${minutes?.toString()?.padStart(2, "0")} ${period}`;
};

export const formatDateToReadable = (dateString: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


export const getWeekDates = (): {
  startDate: string;
  endDate: string;
} => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate days to subtract to get to Monday (1)
  // If today is Sunday (0), we need to go back 6 days to get to last Monday
  // If today is Monday (1), we need to go back 0 days
  // If today is Tuesday (2), we need to go back 1 day, etc.
  const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToSubtract);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: formatDateToMMDDYYYY(monday),
    endDate: formatDateToMMDDYYYY(sunday),
  };
};

export const getString = (value: string | undefined) => value ?? "";
export const getError = (error: { message?: string } | undefined) =>
  error?.message ?? "";

// export const formatDateTo = (date: Date): string => {
//   const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
//   const day = date.getDate().toString().padStart(2, '0');
//   const year = date.getFullYear();
//   return `${month}/${day}/${year}`;
// };

export const getLeaveStatusColor = (
  status: "pending" | "approved" | "rejected" | "declined"
) => {
  switch (status) {
    case "approved":
      return `text-green bg-lightGreen capitalize`;
    case "pending":
      return `text-[#7F41DF] bg-[#7F41DF29] capitalize`;
    case "rejected":
      return `text-red bg-lightRed capitalize`;
    case "declined":
      return `text-red bg-lightRed capitalize`;
    default:
      return `text-black-50 bg-background capitalize`;
  }
};
