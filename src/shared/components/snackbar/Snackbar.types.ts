import type { SnackbarCloseReason } from "@mui/material";

export interface ISnackbarProps {
  open: boolean;
  handleClose: (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => void;
  message: string;
  type: "success" | "error" | "warning";
}

export const getGgColorThroughToastType = (
  type: "success" | "error" | "warning"
) => {
  switch (type) {
    case "success":
      return "bg-Green";
    case "error":
      return "bg-Red";
    case "warning":
      return "bg-yellow";
    default:
      return "bg-Red";
  }
};
