import { Navigate, useLocation } from 'react-router-dom';
import { clearAuth, getToken, getUser } from '../utils/auth.js';
import {
  readForeignPortalSession,
  resolveSettingsRouteAccess,
} from '../utils/portalAccess.js';

/** ESS has no settings module — client admin URLs are blocked even when typed directly. */
export default function SettingsBlockedRedirect() {
  const location = useLocation();
  const decision = resolveSettingsRouteAccess({
    token: getToken(),
    user: getUser(),
    foreignSession: readForeignPortalSession(localStorage),
    pathname: location.pathname,
  });

  if (decision.outcome === 'login') {
    return <Navigate to="/login" replace />;
  }

  if (decision.outcome === 'access-denied') {
    if (decision.clearAuth) {
      clearAuth();
    }
    return <Navigate to="/login" replace state={{ error: 'access-denied' }} />;
  }

  if (decision.outcome === 'dashboard') {
    return <Navigate to="/dashboard" replace state={decision.state} />;
  }

  return <Navigate to="/dashboard" replace />;
}
