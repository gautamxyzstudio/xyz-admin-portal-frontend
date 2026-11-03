import { formatIstDateTime } from '../../utils/istDateUtils';
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
import { useGetTaskBoardProjectsQuery } from "../../features/taskBoard/taskBoardApi";
import { Link } from "react-router";

type Props = {
  open: boolean;
  onClose: () => void;
};


export const getNotificationDestination = (
  item: any,
  user: any,
  boardProjects: any[] = []
): string => {
  // 1. Direct link / url if provided by backend
  if (item?.link) return item.link;
  if (item?.url) return item.url;
  if (item?.data?.link) return item.data.link;
  if (item?.data?.url) return item.data.url;

  const type = (item?.notificationType || item?.type || "").toLowerCase();
  const title = (item?.title || "").toLowerCase();
  const rawMessage = item?.message || "";
  const message = rawMessage.toLowerCase();

  // 2. Handbook notifications
  if (
    type === "handbook_created" ||
    type === "handbook_updated" ||
    type.includes("handbook") ||
    title.includes("handbook")
  ) {
    return "/handbook";
  }

  // 3. Task notifications (e.g. "New Task Assigned", "task_assigned", etc.)
  if (
    type.includes("task") ||
    title.includes("task") ||
    message.includes("task")
  ) {
    let targetProject =
      item?.project?.title ||
      item?.project?.name ||
      (typeof item?.project === "string" ? item.project : null) ||
      item?.projectName ||
      item?.project_name ||
      item?.data?.project?.title ||
      item?.data?.project?.name ||
      (typeof item?.data?.project === "string" ? item.data.project : null) ||
      item?.data?.projectName ||
      item?.data?.project_name ||
      "";

    let targetTaskId =
      item?.taskId ||
      item?.task_id ||
      item?.taskItem ||
      item?.task_item ||
      item?.task?.taskId ||
      item?.task?.id ||
      item?.data?.taskId ||
      item?.data?.task_id ||
      item?.data?.taskItem ||
      item?.data?.task_item ||
      "";

    // Check message for [KEY-123] pattern like [BC-3], [WOL-1], [FIT-12]
    const keyMatch = rawMessage.match(/\[([A-Za-z0-9_-]+)\]/);
    if (keyMatch) {
      if (!targetTaskId) {
        targetTaskId = keyMatch[1]; // e.g. "BC-3"
      }
      if (!targetProject && boardProjects.length > 0) {
        const prefix = keyMatch[1].split("-")[0].toLowerCase();
        const found = boardProjects.find((p: any) => {
          const pTitle = (p.title || "").toLowerCase();
          const cleanPTitle = pTitle.replace(/[^a-z0-9]/g, "");
          const acronym = pTitle
            .split(/\s+/)
            .map((w: string) => w[0])
            .join("");
          return (
            acronym === prefix ||
            cleanPTitle.startsWith(prefix) ||
            pTitle.startsWith(prefix)
          );
        });
        if (found) {
          targetProject = found.title;
        }
      }
    }

    // Also match any known project title in message text
    if (!targetProject && boardProjects.length > 0) {
      for (const p of boardProjects) {
        if (p.title && message.includes(p.title.toLowerCase())) {
          targetProject = p.title;
          break;
        }
      }
    }

    if (targetProject) {
      const params = new URLSearchParams();
      params.set("project", targetProject);
      if (targetTaskId) {
        params.set("taskId", String(targetTaskId));
      }
      return `/tasks?${params.toString()}`;
    }

    if (targetTaskId) {
      return `/tasks?taskId=${encodeURIComponent(String(targetTaskId))}`;
    }

    return "/task-board";
  }

  // 4. Announcement notifications
  if (type.includes("announcement") || title.includes("announcement")) {
    return "/announcement";
  }

  // 5. Leave notifications / default fallback
  return user?.user_type === "Employee" ? "/leaves" : "/all-leaves";
};

const DrawerNotification = ({ open, onClose }: Props) => {
  const [notifications, setNotifications] = useState<any>("");
  const { data, isLoading } = useNotificationsQuery(undefined, {
    pollingInterval: 15000,
  });
  const user = useSelector(userInState);
  const { data: boardProjects = [] } = useGetTaskBoardProjectsQuery();

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
            notifications.map((item: any) => {
              const destination = getNotificationDestination(item, user, boardProjects);
              return (
                <Link to={destination} key={item.id} onClick={onClose}>
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
                      {formatIstDateTime(item.createdAt)}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default DrawerNotification;
