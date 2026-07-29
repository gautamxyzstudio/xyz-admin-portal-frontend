import React, { useState } from "react";
import {
  Dialog,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import LockResetIcon from "@mui/icons-material/LockReset";
import LockIcon from "@mui/icons-material/LockOutlined";
import VpnKeyIcon from "@mui/icons-material/VpnKeyOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import { toast } from "react-toastify";
import { useChangePasswordMutation } from "../../features/auth/authApi";
import CustomBox from "../CustomBox/CustomBox";
import LinearGradient from "../LinearGradient/LinearGradient";
import CustomButton from "../CustomButton/CustomButton";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      toast.error("Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password cannot be the same as current password.");
      return;
    }

    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      toast.success(response?.message || "Password changed successfully!");
      handleClose();
    } catch (err: any) {
      const errorMessage =
        err?.data?.error?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to change password. Please check your current password.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          padding: 0,
          overflow: "hidden",
        },
      }}
    >
      <CustomBox customClasses="p-6 flex flex-col gap-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold flex items-center gap-2 text-black">
              <LockResetIcon className="text-primary" fontSize="medium" />
              Change Password
            </h4>
            <p className="text-xs text-black-50 mt-1">
              Enter your credentials to update your password
            </p>
          </div>
          <IconButton onClick={handleClose} size="small" disabled={isLoading}>
            <CloseIcon />
          </IconButton>
        </div>

        <LinearGradient />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          <TextField
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            required
            variant="outlined"
            size="medium"
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary)",
                },
              },
              "& label.Mui-focused": {
                color: "var(--primary)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKeyIcon className="text-primary" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            variant="outlined"
            size="medium"
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary)",
                },
              },
              "& label.Mui-focused": {
                color: "var(--primary)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon className="text-primary" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            variant="outlined"
            size="medium"
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary)",
                },
              },
              "& label.Mui-focused": {
                color: "var(--primary)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon className="text-primary" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Security Tip Box */}
          <div className="bg-primary-20/40 border border-primary-20/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-black-50">
            <ShieldIcon fontSize="small" className="text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Use a strong password with at least 6 characters combining numbers, letters, and symbols.
            </p>
          </div>

          <LinearGradient customClasses="my-2" />

          {/* Action Buttons using App's CustomButton */}
          <div className="flex items-center justify-end gap-x-3">
            <CustomButton
              type="submit"
              label={isLoading ? "Updating..." : "Change Password"}
              disabled={isLoading}
              buttonStyle={isLoading ? "disabled" : "primary"}
              icon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            />
            <CustomButton
              type="button"
              label="Cancel"
              onClick={handleClose}
              disabled={isLoading}
              buttonStyle="secondary"
            />
          </div>
        </form>
      </CustomBox>
    </Dialog>
  );
};

export default ChangePasswordModal;
