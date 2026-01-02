/* eslint-disable @typescript-eslint/no-explicit-any */

import { Icons } from "./assets/myAssets/exporter";

// Define routes with permissions
const routes = [
  {
    name: "Dashboard",
    key: "dashboard",
    icon: Icons.DASHBOARD,
    iconFill: Icons.DASHBOARD_FILL,
    route: "/",
    permissions: ["Admin", "Employee", "Hr", "Seo", "Manager"], // All users can access dashboard
  },
  {
    name: "Employees",
    key: "employees",
    icon: Icons.EMPLOYEE,
    iconFill: Icons.EMPLOYEE_FILL,
    route: "/employees",
    permissions: ["Admin", "Hr"], // Only Admin and HR can manage employees
  },
  {
    name: "Leaves History",
    key: "all-leaves",
    icon: Icons.LEAVES,
    iconFill: Icons.LEAVES_FILL,
    route: "/all-leaves",
    permissions: ["Admin", "Hr"], // Only Admin and HR can manage employees
  },
  {
    name: "Attendance",
    key: "attendance",
    icon: Icons.ATTENDANCE,
    iconFill: Icons.ATTENDANCE_FILL,
    route: "/attendance",
    permissions: ["Employee", "Seo", "Hr", "Admin"], // Admin, HR, and Employees can view attendance
  },
  {
    name: "Leaves",
    key: "leaves",
    icon: Icons.LEAVES,
    iconFill: Icons.LEAVES_FILL,
    route: "/leaves",
    permissions: ["Employee", "Seo"], // Admin, HR, and Employees can manage leaves
  },
  {
    name: "Holidays",
    key: "holidays",
    icon: Icons.HOLIDAYS,
    iconFill: Icons.HOLIDAYS_FILL,
    route: "/holidays",
    permissions: ["Admin", "Employee", "Hr", "Seo"], // Admin, HR, and Employees can view holidays
  },
  {
    name: "Blog List",
    key: "blog",
    icon: Icons.BLOG,
    iconFill: Icons.BLOG_FILL,
    route: "/blog",
    permissions: ["Admin", "Seo"], // Admin, HR, and SEO can manage blog
  },
  {
    name: "Documents",
    key: "documents",
    icon: Icons.DOCUMENT,
    iconFill: Icons.DOCUMENT_FILL,
    route: "/documents",
    permissions: ["Employee", "Hr", "Seo"], // Admin, HR, and Employees can manage documents
  },
  {
    name: "All Employee Docs",
    key: "all-employee-docs",
    icon: Icons.ALL_EMP_DOC,
    iconFill: Icons.ALL_EMP_DOC_FILL,
    route: "/all-employee-docs",
    permissions: ["Admin", "Hr"], // Admin, HR, and Employees can manage documents
  },
  {
    name: "Profile",
    key: "profile",
    icon: Icons.LEAVES,
    iconFill: Icons.LEAVES_FILL,
    route: "/profile",
    permissions: ["Employee", "Seo", "Hr"], // All users can access profile
  },
];

// Function to filter routes based on user permissions
export const getFilteredRoutes = (userType: any) => {
  if (!userType) return [];

  return routes.filter((route) => {
    // Always show logout
    if (route.key === "log-out") return true;

    // Check if user has permission for this route
    return route.permissions && route.permissions.includes(userType);
  });
};

export default routes;
