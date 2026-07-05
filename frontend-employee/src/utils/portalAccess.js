import { EMPLOYEE_ROLE } from './auth.js';

/** Other portal namespaces — used to block cross-portal navigation. */
export const FOREIGN_PORTAL_SESSIONS = [
  { namespace: 'hrms_client_admin', tokenKey: 'token' },
  { namespace: 'hrms_super_admin', tokenKey: 'auth_token' },
];

export const SETTINGS_PATH_PREFIX = '/settings';

function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

export function isEmployeePortalUser(user) {
  return hasRole(user, EMPLOYEE_ROLE);
}

/**
 * Detect an active session from another HRMS portal in localStorage.
 */
export function readForeignPortalSession(storage) {
  if (!storage) {
    return null;
  }

  for (const { namespace, tokenKey } of FOREIGN_PORTAL_SESSIONS) {
    const token = storage.getItem(`${namespace}:${tokenKey}`);
    if (!token) {
      continue;
    }

    let user = null;
    const userRaw = storage.getItem(`${namespace}:user`);
    if (userRaw) {
      try {
        user = JSON.parse(userRaw);
      } catch {
        user = null;
      }
    }

    return { namespace, token, user };
  }

  return null;
}

/**
 * Private route gate for the ESS portal.
 */
export function resolvePrivateRouteAccess({
  token,
  user,
  foreignSession = null,
}) {
  if (token) {
    if (user && isEmployeePortalUser(user)) {
      return { outcome: 'allow' };
    }

    return { outcome: 'access-denied', clearAuth: true };
  }

  if (foreignSession) {
    return { outcome: 'access-denied', clearAuth: false };
  }

  return { outcome: 'login' };
}

/**
 * Block client-portal settings URLs from the ESS app.
 */
export function resolveSettingsRouteAccess({
  token,
  user,
  foreignSession = null,
  pathname,
}) {
  if (!pathname.startsWith(SETTINGS_PATH_PREFIX)) {
    return { outcome: 'allow' };
  }

  if (token) {
    if (user && isEmployeePortalUser(user)) {
      return {
        outcome: 'dashboard',
        state: { error: 'module-access-denied' },
      };
    }

    return { outcome: 'access-denied', clearAuth: true };
  }

  if (foreignSession) {
    return { outcome: 'access-denied', clearAuth: false };
  }

  return { outcome: 'login' };
}
