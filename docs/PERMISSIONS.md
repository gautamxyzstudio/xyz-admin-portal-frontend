# Role-Based Access Control (RBAC) System

This document explains how to use the role-based access control system implemented in the XYZ Portal Frontend.

## User Types

The system supports four user types:

- **Admin**: Full access to all features
- **HR**: Access to employee management, attendance, leaves, holidays, and blog
- **Employee**: Limited access to dashboard, attendance, leaves, and profile

## Route Permissions

### Admin Routes
- All routes are accessible

### HR Routes
- `/` (Dashboard)
- `/employees` (Employee List)
- `/attendance` (Attendance List)
- `/leaves` (Leave List)
- `/employees/register` (Add Employee)
- `/employees/:name` (Edit Employee)
- `/profile` (User Profile)
- `/holidays` (Holiday List)
- `/blog` (Blog Posts)
- `/blog/post_blog` (Create Blog)
- `/blog/edit_blog/:id` (Edit Blog)

### Employee Routes
- `/` (Dashboard)
- `/attendance` (Attendance List)
- `/leaves` (Leave List)
- `/leaves/create` (Create Leave)
- `/profile` (User Profile)
- `/holidays` (Holiday List)

## Usage

### 1. Automatic Route Protection

The `PrivateRoute` component automatically checks permissions for all protected routes. If a user tries to access a route they don't have permission for, they'll see an "Access Denied" page.

### 2. Using the Permission Hook

```typescript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { 
    user, 
    hasAccess, 
    isAdmin, 
    isHR, 
    isEmployee, 
    isSEO,
    canAccessRoute 
  } = usePermissions();

  // Check if user can access a specific route
  if (canAccessRoute('/employees')) {
    // Show employee management features
  }

  // Check user role
  if (isAdmin()) {
    // Show admin-only features
  }

  return (
    <div>
      {isHR() && <button>Manage Employees</button>}
      {isEmployee() && <button>View My Attendance</button>}
    </div>
  );
};
```

### 3. Using PermissionGuard Component

```typescript
import PermissionGuard from '../components/PermissionGuard';

const Navigation = () => {
  return (
    <nav>
      <PermissionGuard requiredRoute="/employees">
        <a href="/employees">Employees</a>
      </PermissionGuard>
      
      <PermissionGuard requiredRole="Admin">
        <a href="/billing">Billing</a>
      </PermissionGuard>
      
      <PermissionGuard requiredRoute="/blog" fallback={<span>No blog access</span>}>
        <a href="/blog">Blog</a>
      </PermissionGuard>
    </nav>
  );
};
```

### 4. Conditional Rendering

```typescript
const Dashboard = () => {
  const { isAdmin, isHR, isEmployee } = usePermissions();

  return (
    <div>
      {isAdmin() && <AdminDashboard />}
      {isHR() && <HRDashboard />}
      {isEmployee() && <EmployeeDashboard />}
    </div>
  );
};
```

## Adding New Routes

To add a new route with permissions:

1. **Update the enums file** (`src/shared/enums.ts`):
```typescript
export const ROUTE_PERMISSIONS: Record<UserType, readonly string[]> = {
  [UserType.ADMIN]: [
    // ... existing routes
    '/new-route',
  ],
  [UserType.HR]: [
    // ... existing routes
    '/new-route', // Add if HR should have access
  ],
  // ... other user types
};
```

2. **Add the route to App.tsx**:
```typescript
<Route
  path="new-route"
  element={
    <ThemeComponent>
      <NewRouteComponent />
    </ThemeComponent>
  }
/>
```

## Security Notes

- Route permissions are checked on both client and server side
- Users cannot bypass permissions by manually typing URLs
- The system automatically redirects unauthorized access attempts
- All permission checks are centralized in the `usePermissions` hook

## Testing Permissions

To test different user types:

1. Log in with different user accounts
2. Try accessing routes directly via URL
3. Verify that unauthorized routes show the access denied page
4. Check that navigation items are properly hidden/shown based on permissions 