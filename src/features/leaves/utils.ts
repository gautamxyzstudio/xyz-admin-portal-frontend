import type { UIStatus } from "./leaves.types";

export const getLeaveType = (
  type: "Causal Leave" | "Earn Leave" | "Sick Leave" | "Unpaid Leave"
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
  category: "Full Day" | "Half Day" | "Short Leave"
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
      return "";
  }
};


export const mapStatusToUI = (
  status?: "pending" | "approved" | "declined"
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

