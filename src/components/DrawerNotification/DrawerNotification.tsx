/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useSelector } from "react-redux";
import { tokenInState, userInState } from "../../features/auth/authSlice";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import LinearGradient from "../LinearGradient/LinearGradient";
import axios from "axios";
import { endpoints } from "../../api/endpoints";
import { useNotificationsQuery } from "../../shared/api/sharedApi";
import { Link } from "react-router";

type Props = {
  open: boolean;
  onClose: () => void;
};

const DrawerNotification = ({ open, onClose }: Props) => {
  const [notifications, setNotifications] = useState<any>("");
  const { data, isLoading } = useNotificationsQuery(undefined, {
    pollingInterval: 60000,
  });
  const user = useSelector(userInState);

  useEffect(() => {
    if (open && data) {
      setNotifications(data);
    }
  }, [open, data]);

  const token = useSelector(tokenInState);

  const handleMarkAsRead = async (id: number | string) => {
    if (!token) return;
    try {
      await axios.put(
        endpoints.markNotificationRead(id),
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNotifications((prev: any) =>
        prev.map((n: any) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Mark Read Error:", error);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          borderTopLeftRadius: "20px",
          borderBottomLeftRadius: "20px",
          width: "350px",
        },
      }}
    >
      <div className="p-4 flex flex-col h-full bg-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-black">Notification</h3>
          </div>
          <button onClick={onClose}>
            <CloseIcon
              className="text-gray-400 cursor-pointer"
              fontSize="small"
            />
          </button>
        </div>
        <LinearGradient />

        <div className="flex-1 overflow-y-auto flex flex-col gap-3 mt-4 scrollbar-hide">
          {isLoading ? (
            <p className="text-center text-gray-400 text-sm mt-5">Loading...</p>
          ) : notifications?.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-5">
              No notifications
            </p>
          ) : (
            notifications.map((item: any) =>
              item.notificationType === "handbook_created" ||
              item.notificationType === "handbook_updated" ? (
                <Link to="/handbook" key={item.id} onClick={onClose}>
                  <div
                    onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                    className={`rounded-xl p-3 cursor-pointer transition border ${
                      !item.isRead
                        ? "bg-blue-50 border-blue-100"
                        : "bg-white border-gray-100"
                    } hover:shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <p
                        className={`text-sm ${!item.isRead ? "font-bold text-primary" : "text-gray-700"}`}
                      >
                        {item.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  to={
                    user?.user_type === "Employee" ? "/leaves" : "/all-leaves"
                  }
                  key={item.id}
                  onClick={onClose}
                >
                  <div
                    onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                    className={`rounded-xl p-3 cursor-pointer transition border ${
                      !item.isRead
                        ? "bg-blue-50 border-blue-100"
                        : "bg-white border-gray-100"
                    } hover:shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <p
                        className={`text-sm ${!item.isRead ? "font-bold text-primary" : "text-gray-700"}`}
                      >
                        {item.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ),
            )
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default DrawerNotification;
