import { AUTH_KEYS, storageKey } from '../constants/authStorage.js';

const LEGACY_UNSCOPED_KEYS = [
  { legacy: 'token', target: AUTH_KEYS.token },
  { legacy: 'auth_token', target: AUTH_KEYS.token },
  { legacy: 'user', target: AUTH_KEYS.user },
];

let migrationDone = false;

function migrateLegacyStorage() {
  if (migrationDone || typeof localStorage === 'undefined') {
    return;
  }

  migrationDone = true;

  for (const { legacy, target } of LEGACY_UNSCOPED_KEYS) {
    const value = localStorage.getItem(legacy);
    const namespacedTarget = storageKey(target);

    if (value && !localStorage.getItem(namespacedTarget)) {
      localStorage.setItem(namespacedTarget, value);
    }

    if (value) {
      localStorage.removeItem(legacy);
    }
  }
}

migrateLegacyStorage();

function decodeJwtPayload(token) {
  if (!token) {
    return null;
  }

  try {
    const segment = token.split('.')[1];
    if (!segment) {
      return null;
    }

    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(storageKey(AUTH_KEYS.token));
}

export function setToken(token) {
  localStorage.setItem(storageKey(AUTH_KEYS.token), token);
}

export function clearAuth() {
  localStorage.removeItem(storageKey(AUTH_KEYS.token));
  localStorage.removeItem(storageKey(AUTH_KEYS.user));
}

export function setUser(user) {
  localStorage.setItem(storageKey(AUTH_KEYS.user), JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(storageKey(AUTH_KEYS.user));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

export function hasAnyRole(user, roles) {
  return roles.some((role) => hasRole(user, role));
}

/**
 * Tenant companyId from JWT (preferred) or cached user profile from login.
 * Never read from localStorage directly — backend enforces the same claim server-side.
 */
export function getCompanyId() {
  const tokenPayload = decodeJwtPayload(getToken());
  if (tokenPayload?.companyId) {
    return String(tokenPayload.companyId);
  }

  const userCompanyId = getUser()?.companyId;
  return userCompanyId ? String(userCompanyId) : null;
}

export function hasCompanyContext() {
  return Boolean(getCompanyId());
}

export const CLIENT_ROLES = [
  'CLIENT_ADMIN',
  'HR_OFFICER',
  'FINANCE_OFFICER',
  'REPORTING_MANAGER',
  'REGIONAL_MANAGER',
];
