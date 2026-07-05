import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  clearAuth,
  getToken,
  getUser,
} from '../utils/auth.js';
import {
  readForeignPortalSession,
  resolvePrivateRouteAccess,
} from '../utils/portalAccess.js';

export default function PrivateRoutes() {
  const location = useLocation();
  const token = getToken();
  const user = getUser();
  const foreignSession = readForeignPortalSession(localStorage);
  const decision = resolvePrivateRouteAccess({ token, user, foreignSession });

  if (decision.outcome === 'login') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (decision.outcome === 'access-denied') {
    if (decision.clearAuth) {
      clearAuth();
    }
    return <Navigate to="/login" replace state={{ error: 'access-denied' }} />;
  }

  return <Outlet />;
}
