import { Icons } from "./assets/myAssets/exporter";
import type { IUserAdvance, } from "./features/auth/types";

export const getRoutes = (user: IUserAdvance | null) => {
  return [
    {
      name: "Dashboard",
      key: "dashboard",
      icon: Icons.DASHBOARD,
      iconFill: Icons.DASHBOARD_FILL,
      route: "/",
      permissions: ["Admin", "Employee", "Hr", "Manager"],
    },
    {
      name: "Employees",
      key: "employees",
      icon: Icons.EMPLOYEE,
      iconFill: Icons.EMPLOYEE_FILL,
      route: "/employees",
      permissions: ["Admin", "Hr"],
    },
    {
      name: "Leaves",
      key: "all-leaves",
      icon: Icons.LEAVES,
      iconFill: Icons.LEAVES_FILL,
      route: "/all-leaves",
      permissions: ["Admin", "Hr"],
    },
    {
      name: "Attendance",
      key: "attendance",
      icon: Icons.ATTENDANCE,
      iconFill: Icons.ATTENDANCE_FILL,
      route: "/attendance",
      permissions: ["Employee", "Hr", "Admin"],
    },
    {
      name: "Leaves",
      key: "leaves",
      icon: Icons.LEAVES,
      iconFill: Icons.LEAVES_FILL,
      route: "/leaves",
      permissions: ["Employee"],
    },
    {
      name: "Announcement",
      key: "announcement",
      icon: Icons.ANNOUNCEMENT_MENU,
      iconFill: Icons.ANNOUNCEMENT_MENU_FILL,
      route: "/announcement",
      permissions: ["Hr", "Admin"],
    },
    {
      name: "Time Log Analytics",
      key: "time-log-analytics",
      icon: Icons.TIMELOG_UNFILL,
      iconFill: Icons.TIMELOG,
      route: "/time-log",
      permissions: ["Hr", "Admin"],
    },
    {
      name: "Projects",
      key: "projects",
      icon: Icons.TIMELOG_UNFILL,
      iconFill: Icons.TIMELOG,
      route: "/projects",
      permissions: ["Hr", "Admin"],
    },
    {
      name: "Holidays",
      key: "holidays",
      icon: Icons.HOLIDAYS,
      iconFill: Icons.HOLIDAYS_FILL,
      route: "/holidays",
      permissions: ["Admin", "Employee", "Hr"],
    },
    ...(user?.active_blogs
      ? [
          {
            name: "Blog List",
            key: "blog",
            icon: Icons.BLOG,
            iconFill: Icons.BLOG_FILL,
            route: "/blog",
            permissions: ["Admin", "Employee", 'Hr'],
          },
        ]
      : []),
    {
      name: "Documents",
      key: "documents",
      icon: Icons.DOCUMENT,
      iconFill: Icons.DOCUMENT_FILL,
      route: "/documents",
      permissions: ["Employee", "Hr"],
    },
    {
      name: "All Employee Docs",
      key: "all-employee-docs",
      icon: Icons.ALL_EMP_DOC,
      iconFill: Icons.ALL_EMP_DOC_FILL,
      route: "/all-employee-docs",
      permissions: ["Admin", "Hr"],
    },
  ];
};
