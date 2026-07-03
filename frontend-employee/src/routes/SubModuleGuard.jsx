import { Navigate, useLocation } from 'react-router-dom';
import { getUser, hasAnyRole } from '../utils/auth.js';

/**
 * Guards ESS routes — redirects to dashboard if role lacks permission.
 */
export default function SubModuleGuard({ roles, children }) {
  const user = getUser();
  const { pathname } = useLocation();

  if (!roles || roles.length === 0) {
    return children;
  }

  if (!hasAnyRole(user, roles)) {
    if (pathname === '/dashboard') {
      return <Navigate to="/login" replace state={{ error: 'access-denied' }} />;
    }

    return <Navigate to="/dashboard" replace state={{ error: 'module-access-denied' }} />;
  }

  return children;
}

