import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { clearAuth, getToken, getUser, hasRole } from '../utils/auth.js';

const ALLOWED_ROLES = ['SUPER_ADMIN'];

export default function PrivateRoutes() {
  const location = useLocation();
  const token = getToken();
  const user = getUser();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isAllowed = ALLOWED_ROLES.some((role) => hasRole(user, role));
  if (!isAllowed) {
    clearAuth();
    return <Navigate to="/login" replace state={{ error: 'access-denied' }} />;
  }

  return <Outlet />;
}
