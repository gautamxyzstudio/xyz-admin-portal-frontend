/* =========================
   ROLES / USER TYPES
========================= */

export const EmployeeRole = {
  HR: "Hr",
  EMPLOYEE: "Employee",
  SEO: "Seo",
} as const;

export type EmployeeRole = (typeof EmployeeRole)[keyof typeof EmployeeRole];

export const UserType = {
  ADMIN: "Admin",
  EMPLOYEE: EmployeeRole.EMPLOYEE,
  HR: EmployeeRole.HR,
  SEO: EmployeeRole.SEO,
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

/* =========================
   ROUTE PERMISSIONS
========================= */

export const ROUTE_PERMISSIONS: Record<UserType, readonly string[]> = {
  [UserType.ADMIN]: [
    "/",
    "/employees",
    "/attendance",
    "/leaves",
    "/leaves/create",
    "/leaves/update",
    "/employees/register",
    "/employees/:name",
    "/profile",
    "/holidays",
    "/holidays/add",
    "/holidays/edit/:id",
    "/all-leaves",
    "/blog",
    "/blog/post_blog",
    "/all-employee-docs",
    "/blog/edit_blog/:id",
    "/billing",
    "/notifications",
  ],
  [UserType.HR]: [
    "/",
    "/employees",
    "/attendance",
    "/leaves",
    "/leaves/create",
    "/leaves/update",
    "/documents",
    "/employees/register",
    "/employees/:name",
    "/profile",
    "/all-leaves",
    "/all-employee-docs",
    "/holidays",
    "/holidays/add",
    "/holidays/edit/:id",
    "/blog",
    "/blog/post_blog",
    "/blog/edit_blog/:id",
  ],
  [UserType.EMPLOYEE]: [
    "/",
    "/attendance",
    "/leaves",
    "/documents",
    "/leaves/create",
    "/leaves/update",
    "/profile",
    "/holidays",
  ],
  [UserType.SEO]: [
    "/",
    "/profile",
    "/documents",
    "/leaves",
    "/attendance",
    "/blog",
    "/holidays",
    "/blog/post_blog",
    "/leaves/create",
    "/leaves/update",
    "/blog/edit_blog/:id",
  ],
} as const;

/* =========================
   ACCESS CHECK HELPER
========================= */

export const hasRouteAccess = (
  userType: UserType,
  pathname: string
): boolean => {
  const allowedRoutes = ROUTE_PERMISSIONS[userType];

  // Exact match
  if (allowedRoutes.includes(pathname)) {
    return true;
  }

  // Dynamic route match (e.g. /employees/:name)
  return allowedRoutes.some((route) => {
    if (!route.includes(":")) return false;

    const routePattern = route.replace(/:[^/]+/g, "[^/]+");
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
