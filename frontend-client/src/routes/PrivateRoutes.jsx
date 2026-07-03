import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { clearAuth, CLIENT_ROLES, getToken, getUser, hasAnyRole } from '../utils/auth.js';

export default function PrivateRoutes() {
  const location = useLocation();
  const token = getToken();
  const user = getUser();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user || !hasAnyRole(user, CLIENT_ROLES)) {
    clearAuth();
    return <Navigate to="/login" replace state={{ error: 'access-denied' }} />;
  }

  return <Outlet />;
}
