import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { clearAuth, getToken, getUser, hasRole } from '../utils/auth.js';

const EMPLOYEE_ROLE = 'EMPLOYEE';

export default function PrivateRoutes() {
  const location = useLocation();
  const token = getToken();
  const user = getUser();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user || !hasRole(user, EMPLOYEE_ROLE)) {
    clearAuth();
    return <Navigate to="/login" replace state={{ error: 'access-denied' }} />;
  }

  return <Outlet />;
}
