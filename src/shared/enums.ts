/* =========================
   ROLES / USER TYPES
========================= */

export const EmployeeRole = {
  HR: "Hr",
  EMPLOYEE: "Employee",
} as const;

export const EmergencyContactRelation = {
  father: "Father",
  mother: "Mother",
  husband: "Husband",
  wife: "Wife",
  guardian: "Guardian",
} as const;

export type EmployeeRole = (typeof EmployeeRole)[keyof typeof EmployeeRole];
export type EmergencyContactRelation =
  (typeof EmergencyContactRelation)[keyof typeof EmergencyContactRelation];

export const UserType = {
  ADMIN: "Admin",
  EMPLOYEE: EmployeeRole.EMPLOYEE,
  HR: EmployeeRole.HR,
  MANAGEMENT: "Management",
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

/* =========================
   ROUTE PERMISSIONS
========================= */

export const ROUTE_PERMISSIONS: Record<string, readonly string[]> = {
  [UserType.ADMIN]: [
    "/",
    "/employees",
    "/attendance",
    "/leaves",
    "/employees/register",
    "/employees/:name",
    "/profile",
    "/holidays",
    "/all-leaves",
    "/blog",
    "/blog/post_blog",
    "/all-employee-docs",
    "/blog/edit_blog/:id",
    "/notifications",
    "/announcement",
    "/time-log",
    "/projects",
    "/all-leaves/leave-balance",
    "/handbook",
    "/activity-logs",
  ],
  [UserType.HR]: [
    "/",
    "/employees",
    "/attendance",
    "/leaves",
    "/documents",
    "/employees/register",
    "/employees/:name",
    "/profile",
    "/all-leaves",
    "/all-employee-docs",
    "/holidays",
    "/blog",
    "/blog/post_blog",
    "/blog/edit_blog/:id",
    "/announcement",
    "/time-log",
    "/projects",
    "/all-leaves/leave-balance",
    "/handbook",
    "/activity-logs",
  ],
  [UserType.EMPLOYEE]: [
    "/",
    "/attendance",
    "/leaves",
    "/documents",
    "/profile",
    "/holidays",
    "/blog",
    "/blog/post_blog",
    "/blog/edit_blog/:id",
    "/handbook",
    "/tasks"
  ],

  [UserType.MANAGEMENT]: [
    "/",
    "/employees",
    "/attendance",
    "/leaves",
    "/employees/register",
    "/documents",
    "/employees/:name",
    "/profile",
    "/holidays",
    "/all-leaves",
    "/blog",
    "/blog/post_blog",
    "/all-employee-docs",
    "/blog/edit_blog/:id",
    "/notifications",
    "/announcement",
    "/time-log",
    "/projects",
    "/all-leaves/leave-balance",
    "/handbook",
    "/activity-logs",
  ],
} as const;

/* =========================
   ACCESS CHECK HELPER
========================= */

export const hasRouteAccess = (
  userType: string | undefined | null,
  pathname: string,
): boolean => {
  // 1. Guard against empty roles
  if (!userType) {
    console.warn("Access Denied: No user role provided.");
    return false;
  }

  // 2. Get permissions (Using type assertion to safely check the record)
  const allowedRoutes =
    ROUTE_PERMISSIONS[userType as keyof typeof ROUTE_PERMISSIONS];

  // 3. If the role (like 'Management') isn't found in our list
  if (!allowedRoutes) {
    console.error(
      `Access Denied: Role '${userType}' is not defined in ROUTE_PERMISSIONS.`,
    );
    return false;
  }

  // 4. Check for an exact match
  if (allowedRoutes.includes(pathname)) {
    return true;
  }

  // 5. Check for dynamic matches (e.g., /blog/edit_blog/123 matches /blog/edit_blog/:id)
  return allowedRoutes.some((route) => {
    if (!route.includes(":")) return false;

    // Creates a regex to match dynamic parameters
    const routePattern = route
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape dots/slashes
      .replace(/:[^/]+/g, "[^/]+"); // Match anything between slashes

    return new RegExp(`^${routePattern}$`).test(pathname);
  });
};

/* =========================
   LEAVE TYPES
========================= */

export const LeaveType = {
  CL: "CL",
  EL: "EL",
  SL: "SL",
  un_paid: "un_paid",
} as const;

export type LeaveType = (typeof LeaveType)[keyof typeof LeaveType];
