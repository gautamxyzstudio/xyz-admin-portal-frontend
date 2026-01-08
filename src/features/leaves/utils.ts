export const getLeaveCategory = (category: "Causal Leave" | "Earn Leave" | "Sick Leave" | "Unpaid Leave") => {
  switch (category) {
    case "Causal Leave":
      return "CL";
    case "Earn Leave":
      return "EL";
    case "Sick Leave":
      return "SL";
    case "Unpaid Leave":
      return "un_paid";
    default:
      return "Leave";
  }
};
