import { CLIENT_ROLES, hasAnyRole } from './auth.js';

/** Other portal namespaces — block cross-portal sessions. */
export const FOREIGN_PORTAL_SESSIONS = [
  { namespace: 'hrms_super_admin', tokenKey: 'auth_token' },
  { namespace: 'hrms_employee', tokenKey: 'token' },
];

export function isClientPortalUser(user) {
  return hasAnyRole(user, CLIENT_ROLES);
}

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
 * Private route gate for the client portal.
 */
export function resolvePrivateRouteAccess({ token, user, foreignSession, hasCompanyContext }) {
  if (token) {
    if (!user || !isClientPortalUser(user)) {
      return { outcome: 'access-denied', clearAuth: true, reason: 'wrong-role' };
    }

    if (!hasCompanyContext) {
      return { outcome: 'access-denied', clearAuth: true, reason: 'no-company' };
    }

    return { outcome: 'allow' };
  }

  if (foreignSession) {
    return { outcome: 'access-denied', clearAuth: false, reason: 'foreign-portal' };
  }

  return { outcome: 'login' };
}
