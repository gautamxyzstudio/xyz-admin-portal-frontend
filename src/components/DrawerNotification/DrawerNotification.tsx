/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Drawer from "@mui/material/Drawer";
import dayjs from "dayjs";
import {
  AlertTriangle,
  Bell,
  BellOff,
  BookOpen,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Megaphone,
  X,
  XCircle,
} from "lucide-react";
import { userInState } from "../../features/auth/authSlice";
import LinearGradient from "../LinearGradient/LinearGradient";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "../../shared/api/sharedApi";
import { useGetTaskBoardProjectsQuery } from "../../features/taskBoard/taskBoardApi";
import {
  formatIstDateTime,
  formatIstRelativeTime,
  getIstTodayDateString,
  toIstDayjs,
} from "../../utils/istDateUtils";

type Props = {
  open: boolean;
  onClose: () => void;
};

const getNotificationDestination = (
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

/* ---------------- presentation helpers ---------------- */

type NotifKind = "task" | "leave_ok" | "leave_no" | "leave_new" | "handbook" | "announcement" | "alert" | "other";

const kindOf = (item: any): NotifKind => {
  const type = String(item?.notificationType || item?.type || "").toLowerCase();
  const title = String(item?.title || "").toLowerCase();
  if (type === "no_task_alert" || title.includes("alert")) return "alert";
  if (type.includes("task") || title.includes("task")) return "task";
  if (type === "leave_approved" || title.includes("approved")) return "leave_ok";
  if (type === "leave_declined" || title.includes("declined") || title.includes("rejected")) return "leave_no";
  if (type === "leave_applied" || title.includes("leave")) return "leave_new";
  if (type.includes("handbook") || title.includes("handbook")) return "handbook";
  if (type.includes("announcement") || title.includes("announcement")) return "announcement";
  return "other";
};

const KIND_STYLE: Record<NotifKind, { Icon: React.ElementType; cls: string; label: string }> = {
  task: { Icon: ClipboardList, cls: "bg-primary-20 text-primary", label: "Task" },
  leave_ok: { Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600", label: "Leave" },
  leave_no: { Icon: XCircle, cls: "bg-rose-50 text-rose-600", label: "Leave" },
  leave_new: { Icon: CalendarDays, cls: "bg-sky-50 text-sky-600", label: "Leave" },
  handbook: { Icon: BookOpen, cls: "bg-violet-50 text-violet-600", label: "Handbook" },
  announcement: { Icon: Megaphone, cls: "bg-amber-50 text-amber-600", label: "Announcement" },
  alert: { Icon: AlertTriangle, cls: "bg-amber-50 text-amber-600", label: "Alert" },
  other: { Icon: Bell, cls: "bg-gray-100 text-gray-500", label: "Update" },
};

// "2026-09-28" -> "28 Sep 2026"
const prettyDates = (text: string) =>
  text.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (m) => {
    const d = dayjs(m);
    return d.isValid() ? d.format("D MMM YYYY") : m;
  });

// message with "[MOZ-13]" task keys shown as small chips
const MessageText: React.FC<{ text: string }> = ({ text }) => {
  const parts = prettyDates(text || "").split(/(\[[A-Za-z0-9_-]+\])/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\[[A-Za-z0-9_-]+\]$/.test(p) ? (
          <span
            key={i}
            className="inline-block align-baseline px-1.5 py-px mr-0.5 rounded-md bg-gray-100 text-[10px] font-semibold text-black-80 tracking-wide"
          >
            {p.slice(1, -1)}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
};

const dayGroup = (createdAt: string) => {
  const d = toIstDayjs(createdAt);
  if (!d || !d.isValid()) return "Earlier";
  const today = getIstTodayDateString();
  const day = d.format("YYYY-MM-DD");
  if (day === today) return "Today";
  if (day === dayjs(today).subtract(1, "day").format("YYYY-MM-DD")) return "Yesterday";
  if (dayjs(today).diff(dayjs(day), "day") < 7) return "This week";
  return "Earlier";
};

/* ---------------- component ---------------- */

const DrawerNotification = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const user = useSelector(userInState);
  const { data: notifications = [], isLoading, isError, refetch } = useNotificationsQuery(undefined, {
    pollingInterval: 15000,
  });
  const { data: boardProjects = [] } = useGetTaskBoardProjectsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [tab, setTab] = useState<"all" | "unread">("all");

  // refresh as soon as the drawer opens instead of waiting for the next poll
  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const list = tab === "unread" ? notifications.filter((n: any) => !n.isRead) : notifications;

  const groups = useMemo(() => {
    const order = ["Today", "Yesterday", "This week", "Earlier"];
    const map = new Map<string, any[]>();
    for (const n of list) {
      const g = dayGroup(n.createdAt);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(n);
    }
    return order.filter((g) => map.has(g)).map((g) => ({ label: g, items: map.get(g)! }));
  }, [list]);

  const openItem = (item: any) => {
    if (!item.isRead) markRead(item.id);
    onClose();
    navigate(getNotificationDestination(item, user, boardProjects));
  };

  let index = 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          borderTopLeftRadius: "20px",
          borderBottomLeftRadius: "20px",
          width: { xs: "100%", sm: 400 },
          maxWidth: "100vw",
        },
      }}
    >
      <div className="flex flex-col h-full bg-white">
        {/* header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-black-80">Notifications</h3>
              {unreadCount > 0 && (
                <span className="notif-pop px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="grid place-items-center w-8 h-8 rounded-full text-gray-400 hover:text-primary hover:bg-primary-20 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="inline-flex p-0.5 rounded-xl bg-gray-100 text-xs font-medium">
              {(["all", "unread"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                    tab === t ? "bg-white text-primary shadow-sm" : "text-black-50 hover:text-black-80"
                  }`}
                >
                  {t === "all" ? "All" : `Unread${unreadCount ? ` (${unreadCount})` : ""}`}
                </button>
              ))}
            </div>
            <button
              onClick={() => markAllRead()}
              disabled={!unreadCount || markingAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary-20 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-default transition-colors cursor-pointer"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          </div>
        </div>
        <LinearGradient />

        {/* list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin]">
          {isLoading ? (
            <div className="flex flex-col gap-2 px-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-gray-100 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                    <div className="h-2.5 w-full rounded bg-gray-100" />
                    <div className="h-2.5 w-2/3 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center text-center py-16 px-6">
              <p className="text-sm font-semibold text-black-80">Couldn't load notifications</p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 px-6">
              <span className="notif-pop grid place-items-center w-14 h-14 rounded-2xl bg-primary-20 text-primary mb-3">
                {tab === "unread" ? <CheckCheck size={24} /> : <BellOff size={24} />}
              </span>
              <p className="text-sm font-semibold text-black-80">
                {tab === "unread" ? "You're all caught up" : "No notifications yet"}
              </p>
              <p className="text-xs text-black-50 mt-1">
                {tab === "unread"
                  ? "Nothing new since you last checked."
                  : "Task assignments, leave updates and announcements will show up here."}
              </p>
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.label} className="mb-3 last:mb-0">
                <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-black-50">
                  {g.label}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {g.items.map((item: any) => {
                    const kind = kindOf(item);
                    const { Icon, cls } = KIND_STYLE[kind];
                    const unread = !item.isRead;
                    const delay = Math.min(index++, 10) * 30;
                    return (
                      <li key={item.id} className="notif-item" style={{ animationDelay: `${delay}ms` }}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => openItem(item)}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openItem(item)}
                          className={`group relative flex gap-3 p-3 pl-3.5 rounded-xl border cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-50 ${
                            unread
                              ? "bg-primary-20/25 border-primary-20 hover:border-primary-50"
                              : "bg-white border-transparent hover:border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          {unread && (
                            <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary" />
                          )}
                          <span className={`grid place-items-center w-9 h-9 rounded-xl shrink-0 ${cls}`}>
                            <Icon size={17} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-[13px] leading-snug ${
                                  unread ? "font-semibold text-black-80" : "font-medium text-black-80/80"
                                }`}
                              >
                                {item.title}
                              </p>
                              <span
                                className="shrink-0 text-[10.5px] text-black-50 mt-0.5"
                                title={formatIstDateTime(item.createdAt)}
                              >
                                {formatIstRelativeTime(item.createdAt)}
                              </span>
                            </div>
                            <p
                              className={`text-xs mt-0.5 leading-relaxed line-clamp-3 ${
                                unread ? "text-black-80/75" : "text-black-50"
                              }`}
                            >
                              <MessageText text={item.message} />
                            </p>
                            <div className="mt-1.5 flex items-center justify-between">
                              <span className="text-[10.5px] text-black-50">
                                {formatIstDateTime(item.createdAt)}
                              </span>
                              {unread ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markRead(item.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-[10.5px] font-medium text-primary hover:underline transition-opacity cursor-pointer"
                                >
                                  Mark as read
                                </button>
                              ) : (
                                <ChevronRight
                                  size={14}
                                  className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default DrawerNotification;
