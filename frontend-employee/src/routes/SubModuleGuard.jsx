import { Navigate } from 'react-router-dom';
import { getUser, hasRole } from '../utils/auth.js';

/**
 * Blocks employees from admin-only paths (e.g. /settings/*) even via direct URL.
 */
export default function SubModuleGuard({ roles = ['EMPLOYEE'], children }) {
  const user = getUser();

  const isAllowed = roles.some((role) => hasRole(user, role));
  if (!isAllowed) {
    return <Navigate to="/dashboard" replace state={{ error: 'access-denied' }} />;
  }

  return children;
}
