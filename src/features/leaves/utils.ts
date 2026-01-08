export const getLeaveType = (type: "Causal Leave" | "Earn Leave" | "Sick Leave" | "Unpaid Leave") => {
  switch (type) {
    case "Causal Leave":
      return "CL";
    case "Earn Leave":
      return "EL";
    case "Sick Leave":
      return "SL";
    case "Unpaid Leave":
      return "un_paid";
    default:
      return "";
  }
};

export const getLeaveCategory = (category: "Full Day" | "Half Day" | "Short Leave") => {
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

