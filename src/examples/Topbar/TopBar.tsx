/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from "react-redux";
import { Icons } from "../../assets/myAssets/exporter";
import CustomBox from "../../components/CustomBox/CustomBox";
import { userDetailsInState } from "../../features/auth/authSlice";
import { useNavigate } from "react-router";
import { useState } from "react";
import HistoryIcon from "@mui/icons-material/History";
import DrawerNotification from "../../components/DrawerNotification/DrawerNotification";
import { Logout } from "@mui/icons-material";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useNotificationsQuery } from "../../shared/api/sharedApi";
import ChangePasswordModal from "../../components/ChangePasswordModal/ChangePasswordModal";

const TopBar = () => {
  const navigate = useNavigate();
  const dispatcher = useDispatch();
  const user = useSelector(userDetailsInState);
  const canViewActivityLogs =
    user?.role === "Admin" ||
    user?.role === "Hr" ||
    user?.role === "Management";
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const { data } = useNotificationsQuery(undefined, {
    pollingInterval: 5000,
  });

  const unread = data?.filter((n: any) => !n.isRead).length;

  const openOutlook = () => {
    window.location.href = "ms-outlook://";
    setTimeout(() => {
      window.open("https://outlook.office.com/mail/", "_blank");
    }, 1000);
  };

  const handleLinkPress = (href: string) => {
    if (href === "Log Out") {
      dispatcher({ type: "RESET" });
      navigate("/login");
    }
  };

  return (
    <CustomBox customClasses="w-full rounded-xl p-3.5 flex items-center justify-between sticky top-0 shadow z-99">
      <p className="text-black-50 ml-2.5 font-semibold">Dashboard</p>

      <div className="flex items-center gap-2.5">
        <div
          className="w-10 h-10 p-2 flex items-center justify-center rounded-xl bg-gray-100 cursor-pointer "
          onClick={openOutlook}
        >
          <img src={Icons.OUTLOOK} alt="" />
        </div>

        <div
          onClick={() => setOpenDrawer(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 cursor-pointer relative"
        >
          <img src={Icons.NOTIFICATION} alt="" />

          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in fade-in zoom-in duration-300">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
        <div className="dropdown dropdown-hover dropdown-end">
          <img
            src={
              user?.photo?.startsWith("http")
                ? user?.photo
                : `${import.meta.env.VITE_API_BASE_URL}${user?.photo}`
            }
            onClick={() => navigate("/profile")}
            alt="profile"
            className="w-10 h-10 rounded-xl object-cover cursor-pointer"
            tabIndex={0}
            role="button"
          />
          <div
            tabIndex={-1}
            className="dropdown-content menu bg-white rounded-2xl z-999 p-2 shadow-2xl border border-gray-100 gap-y-1 w-64 mt-1"
          >
            {/* User Profile Header */}
            <div
              className="flex items-center gap-3 p-2.5 rounded-xl bg-linear-to-r from-slate-50 to-gray-50 border border-slate-100 mb-1 cursor-pointer hover:bg-slate-100/70 transition-colors"
              onClick={() => navigate("/profile")}
            >
              <img
                src={
                  user?.photo?.startsWith("http")
                    ? user?.photo
                    : `${import.meta.env.VITE_API_BASE_URL}${user?.photo}`
                }
                alt="avatar"
                className="w-10 h-10 rounded-xl object-cover border border-white shadow-sm"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {user?.name || "User Account"}
                </span>
                <span className="text-[11px] text-gray-500 truncate">
                  {user?.designation || user?.email || "Employee"}
                </span>
              </div>
            </div>

            <div className="my-1 border-t border-gray-100" />

            <button
              className="flex items-center gap-3 w-full cursor-pointer group hover:bg-background px-3 py-2 rounded-xl transition-all duration-200 ease-in-out text-sm font-medium text-gray-700"
              onClick={() => navigate("/profile")}
            >
              <div className="w-8 h-8 rounded-lg bg-primary-20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <PermIdentityIcon fontSize="small" />
              </div>
              <span>Profile</span>
            </button>

            {canViewActivityLogs && (
              <button
                className="flex items-center gap-3 w-full cursor-pointer group hover:bg-background px-3 py-2 rounded-xl transition-all duration-200 ease-in-out text-sm font-medium text-gray-700"
                onClick={() => navigate("/activity-logs")}
              >
                <div className="w-8 h-8 rounded-lg bg-primary-20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <HistoryIcon className="group-hover:text-primary" />
                </div>
                Activity Log
              </button>
            )}

            <button
              className="flex items-center gap-3 w-full cursor-pointer group hover:bg-background px-3 py-2 rounded-xl transition-all duration-200 ease-in-out text-sm font-medium text-gray-700"
              onClick={() => setOpenChangePasswordModal(true)}
            >
              <div className="w-8 h-8 rounded-lg bg-primary-20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <LockResetIcon fontSize="small" />
              </div>
              <span>Change Password</span>
            </button>

            <div className="my-1 border-t border-gray-100" />

            <button
              className="flex items-center gap-3 w-full cursor-pointer group hover:bg-rose-50 px-3 py-2 rounded-xl transition-all duration-200 ease-in-out text-sm font-medium text-rose-600"
              onClick={() => handleLinkPress("Log Out")}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Logout fontSize="small" />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      <DrawerNotification
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
      <ChangePasswordModal
        open={openChangePasswordModal}
        onClose={() => setOpenChangePasswordModal(false)}
      />
    </CustomBox>
  );
};

export default TopBar;
