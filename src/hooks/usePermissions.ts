import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { userInState } from '../features/auth/authSlice';
import { hasRouteAccess, UserType, ROUTE_PERMISSIONS } from '../shared/enums';

export const usePermissions = () => {
  const user = useSelector(userInState);
  const location = useLocation();

  const hasAccess = (pathname: string): boolean => {
    if (!user) return false;
    return hasRouteAccess(user.user_type as UserType, pathname);
  };

  const hasCurrentRouteAccess = (): boolean => {
    return hasAccess(location.pathname);
  };

  const getAllowedRoutes = (): string[] => {
    if (!user) return [];
    return [...ROUTE_PERMISSIONS[user.user_type as UserType]];
  };

  const canAccessRoute = (route: string): boolean => {
    return hasAccess(route);
  };

  const isAdmin = (): boolean => {
    return user?.user_type === UserType.ADMIN;
  };

  const isHR = (): boolean => {
    return user?.user_type === UserType.HR;
  };

  const isEmployee = (): boolean => {
    return user?.user_type === UserType.EMPLOYEE;
  };

  // const isSEO = (): boolean => {
  //   return user?.user_type === UserType.SEO;
  // };

  return {
    user,
    hasAccess,
    hasCurrentRouteAccess,
    getAllowedRoutes,
    canAccessRoute,
    isAdmin,
    isHR,
    isEmployee,
    // isSEO,
  };
};
