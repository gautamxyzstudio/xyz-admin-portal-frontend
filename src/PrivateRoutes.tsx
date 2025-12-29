
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { userInState } from './features/auth/authSlice';
import { hasRouteAccess, UserType } from './shared/enums';
import UnauthorizedAccess from './components/UnauthorizedAccess';

const PrivateRoute = () => {
  const user = useSelector(userInState);
  const location = useLocation();

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has access to the current route
  const hasAccess = hasRouteAccess(
    user.user_type as UserType,
    location.pathname
  );

  if (!hasAccess) {
    // Show unauthorized access page instead of redirecting
    return <UnauthorizedAccess />;
  }

  return <Outlet />;
};

export default PrivateRoute;
