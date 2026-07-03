import { Navigate } from 'react-router-dom';
import { getUser, hasAnyRole } from '../utils/auth.js';

/**
 * Guards sensitive routes — redirects to dashboard if role lacks permission.
 */
export default function SubModuleGuard({ roles, children }) {
  const user = getUser();

  if (!roles || roles.length === 0) {
    return children;
  }

  if (!hasAnyRole(user, roles)) {
    return <Navigate to="/dashboard" replace state={{ error: 'module-access-denied' }} />;
  }

  return children;
}
