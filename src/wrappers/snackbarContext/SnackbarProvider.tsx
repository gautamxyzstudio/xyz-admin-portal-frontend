/* eslint-disable react-refresh/only-export-components */
"use client";

import React, { useState } from "react";
import type { SnackbarCloseReason } from "@mui/material";
import CustomSnackbar from "../../shared/components/snackbar/Snackbar";

export type SnackBarContextTypes = {
  displaySnackbar: (
    type: "success" | "error" | "warning",
    message: string
  ) => void;
};

export const SnackBarContext = React.createContext<SnackBarContextTypes | null>(
  null
);

const SnackBarProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"success" | "error" | "warning">("success");

  const displaySnackBarHandler = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setType(type);
    setMessage(message);
    setOpen(true);
  };

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;

    setOpen(false);
    setMessage("");
  };

  return (
    <SnackBarContext.Provider
      value={{ displaySnackbar: displaySnackBarHandler }}
    >
      {children}
      <CustomSnackbar
        type={type}
        message={message}
        open={open}
        handleClose={handleClose}
      />
    </SnackBarContext.Provider>
  );
};

export default SnackBarProvider;
