import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../utils/auth.js';
import {
  resolveSettingsRouteAccess,
} from '../utils/portalAccess.js';

/** ESS has no settings module — client admin URLs are blocked even when typed directly. */
export default function SettingsBlockedRedirect() {
  const location = useLocation();
  const decision = resolveSettingsRouteAccess({
    token: getToken(),
    pathname: location.pathname,
  });

  if (decision.outcome === 'login') {
    return <Navigate to="/login" replace />;
  }

  if (decision.outcome === 'dashboard') {
    return <Navigate to="/dashboard" replace state={decision.state} />;
  }

  return <Navigate to="/dashboard" replace />;
}
