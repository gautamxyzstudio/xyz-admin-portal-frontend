import type { ILeaveDay, UIStatus } from "./leaves.types";

export const getLeaveType = (
  type: "Causal Leave" | "Earn Leave" | "Sick Leave" | "Unpaid Leave",
) => {
  switch (type) {
    case "Causal Leave":
      return "CL";
    case "Earn Leave":
      return "EL";
    case "Sick Leave":
      return "SL";
    case "Unpaid Leave":
      return "un-paid";
    default:
      return "";
  }
};

export const getLeaveCategory = (
  category: "Full Day" | "Half Day" | "Short Leave",
) => {
  switch (category) {
    case "Full Day":
      return "full_day";
    case "Half Day":
      return "half_day";
    case "Short Leave":
      return "short_leave";
    default:
      return " ";
  }
};

export const getLeaveCategoryTitle = (type?: string) => {
  switch (type) {
    case "short_leave":
      return "Short Day Leave";
    case "full_day":
      return "Full Day Leave";
    case "half_day":
      return "Half Day Leave";
  }
};

export const getLeaveTypeTitle = (type?: "CL" | "EL" | "SL" | "un-paid") => {
  switch (type) {
    case "CL":
      return "Causal Leave";
    case "EL":
      return "Earn Leave";
    case "SL":
      return "Sick Leave";
    case "un-paid":
      return "Unpaid Leave";
    default:
      return "Short Leave";
  }
};

export const mapStatusToUI = (
  status?: "pending" | "approved" | "declined",
): UIStatus => {
  switch (status) {
    case "approved":
      return "Approved";
    case "declined":
      return "Declined";
    default:
      return "Pending";
  }
};

export const normalizeStatusToBackend = (status: UIStatus) =>
  status.toLowerCase() as Lowercase<UIStatus>;

export const isLeavePartiallyApproved = (
  leave?: { status?: string; leave_days?: ILeaveDay[] } | null
): boolean => {
  if (!leave) return false;
  const status = leave.status?.toLowerCase();
  if (status !== "approved") return false;

  const leaveDays: ILeaveDay[] = leave.leave_days || [];
  if (leaveDays.length <= 1) return false;

  const hasApproved = leaveDays.some(
    (d) =>
      (d.approval_status === "approved" || !d.approval_status) &&
      d.leave_type !== "Holiday" &&
      d.editable !== false
  );
  const hasDeclined = leaveDays.some(
    (d) => d.approval_status === "declined"
  );

  return Boolean(hasApproved && hasDeclined);
};

