import { Navigate, useLocation } from 'react-router-dom';
import { getRouteRoles } from '../utils/roleMenuMap.js';
import SubModuleGuard from './SubModuleGuard.jsx';

/**
 * Enforces route access from roleMenuMap — not just hidden sidebar links.
 */
export default function ModuleRouteGuard({ children }) {
  const { pathname } = useLocation();
  const roles = getRouteRoles(pathname);

  if (!roles) {
    return (
      <Navigate to="/dashboard" replace state={{ error: 'module-access-denied' }} />
    );
  }

  return <SubModuleGuard roles={roles}>{children}</SubModuleGuard>;
}
