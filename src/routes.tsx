/* eslint-disable @typescript-eslint/no-explicit-any */
import Dashboard from './features/dashboard/screens/Dashboard';
import Login from './features/auth/screens/login/Login';
import Icon from '@mui/material/Icon';
import HolidaysList from './features/holydayList/screens/holydayList/HolydayList';
import Employees from './features/employee/screens/employeeList/EmployeeList';
import LeaveList from './features/leaves/screens/leaveList/LeaveList';
import HolydayList from './features/holydayList/screens/holydayList/HolydayList';
import ProfileList from './features/profile/screens/profileList/ProfileList';
import EmployeeDocs from './features/documents/screens/employee/EmployeeDocs';
import AllLeaves from './features/leaves/screens/allLeaves/AllLeaves';
import AllEmployeeDocs from './features/documents/screens/allEmployeeDocs/AllEmployeeDocs';
import AttendanceList from './features/AttendanceList/screens/AttendanceList';

// Define routes with permissions
const routes = [
  {
    type: 'collapse',
    name: 'Dashboard',
    key: 'dashboard',
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: '/',
    component: <Dashboard />,
    permissions: ['Admin', 'Employee', 'Hr', 'Seo', 'Manager'], // All users can access dashboard
  },
  {
    type: 'collapse',
    name: 'Employees',
    key: 'employees',
    icon: <Icon fontSize="small">people</Icon>,
    route: '/employees',
    component: <Employees />,
    permissions: ['Admin', 'Hr'], // Only Admin and HR can manage employees
  },
  {
    type: 'collapse',
    name: 'Leaves History',
    key: 'all-leaves',
    icon: <Icon fontSize="small">calendar_month</Icon>,
    route: '/all-leaves',
    component: <AllLeaves />,
    permissions: ['Admin', 'Hr'], // Only Admin and HR can manage employees
  },
  {
    type: 'collapse',
    name: 'Attendance',
    key: 'attendance',
    icon: <Icon fontSize="small">list_alt</Icon>,
    route: '/attendance',
    component: <AttendanceList />,
    permissions: ['Employee', 'Seo', 'Hr', 'Admin'], // Admin, HR, and Employees can view attendance
  },
  {
    type: 'collapse',
    name: 'Leaves',
    key: 'leaves',
    icon: <Icon fontSize="small">calendar_month</Icon>,
    route: '/leaves',
    component: <LeaveList />,
    permissions: ['Employee', 'Seo'], // Admin, HR, and Employees can manage leaves
  },
  {
    type: 'collapse',
    name: 'Holidays',
    key: 'holidays',
    icon: <Icon fontSize="small">calendar_month</Icon>,
    route: '/holidays',
    component: <HolydayList />,
    permissions: ['Admin', 'Employee', 'Hr', 'Seo'], // Admin, HR, and Employees can view holidays
  },
  {
    type: 'collapse',
    name: 'Blog List',
    key: 'blog',
    icon: <Icon fontSize="small">chat</Icon>,
    route: '/blog',
    component: <HolidaysList />,
    permissions: ['Admin', 'Seo'], // Admin, HR, and SEO can manage blog
  },
  {
    type: 'collapse',
    name: 'Documents',
    key: 'documents',
    icon: <Icon fontSize="small">file_present</Icon>,
    route: '/documents',
    component: <EmployeeDocs />,
    permissions: ['Employee', 'Hr', 'Seo'], // Admin, HR, and Employees can manage documents
  },
  {
    type: 'collapse',
    name: 'All Employee Docs',
    key: 'all-employee-docs',
    icon: <Icon fontSize="small">file_present</Icon>,
    route: '/all-employee-docs',
    component: <AllEmployeeDocs />,
    permissions: ['Admin', 'Hr'], // Admin, HR, and Employees can manage documents
  },
  {
    type: 'collapse',
    name: 'Profile',
    key: 'profile',
    icon: <Icon fontSize="small">person</Icon>,
    route: '/profile',
    component: <ProfileList />,
    permissions: ['Employee', 'Seo', 'Hr'], // All users can access profile
  },
  {
    type: 'collapse',
    name: 'Log Out',
    key: 'log-out',
    icon: <Icon fontSize="small">logout</Icon>,
    route: '/login',
    component: <Login />,
    permissions: ['Admin', 'Employee', 'Hr', 'Seo'], // All users can logout
  },
];

// Function to filter routes based on user permissions
export const getFilteredRoutes = (userType:any) => {
  if (!userType) return [];

  return routes.filter((route) => {
    // Always show logout
    if (route.key === 'log-out') return true;

    // Check if user has permission for this route
    return route.permissions && route.permissions.includes(userType);
  });
};

export default routes;
