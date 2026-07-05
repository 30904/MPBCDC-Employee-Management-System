import { AUTH_KEYS, storageKey } from '../constants/authStorage.js';

const LEGACY_UNSCOPED_KEYS = [
  { legacy: 'auth_token', target: AUTH_KEYS.token },
  { legacy: 'token', target: AUTH_KEYS.token },
  { legacy: 'user', target: AUTH_KEYS.user },
  { legacy: 'selected_company_id', target: AUTH_KEYS.selectedCompanyId },
];

let migrationDone = false;

function migrateLegacyStorage() {
  if (migrationDone || typeof localStorage === 'undefined') {
    return;
  }

  migrationDone = true;

  const namespacedTokenKey = storageKey(AUTH_KEYS.token);

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

  // Earlier scaffold used hrms_super_admin:token instead of auth_token.
  const wrongNamespacedToken = localStorage.getItem(storageKey('token'));
  if (wrongNamespacedToken && !localStorage.getItem(namespacedTokenKey)) {
    localStorage.setItem(namespacedTokenKey, wrongNamespacedToken);
  }
  localStorage.removeItem(storageKey('token'));
}

migrateLegacyStorage();

export function getToken() {
  return localStorage.getItem(storageKey(AUTH_KEYS.token));
}

export function setToken(token) {
  localStorage.setItem(storageKey(AUTH_KEYS.token), token);
}

export function clearAuth() {
  localStorage.removeItem(storageKey(AUTH_KEYS.token));
  localStorage.removeItem(storageKey(AUTH_KEYS.user));
  localStorage.removeItem(storageKey(AUTH_KEYS.selectedCompanyId));
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
 * Optional tenant context for SUPER_ADMIN — sent as x-company-id on API requests only.
 * Not required for platform routes (companies list, audit logs, etc.).
 */
export function getSelectedCompanyId() {
  return localStorage.getItem(storageKey(AUTH_KEYS.selectedCompanyId));
}

export function setSelectedCompanyId(companyId) {
  if (companyId) {
    localStorage.setItem(storageKey(AUTH_KEYS.selectedCompanyId), companyId);
  } else {
    localStorage.removeItem(storageKey(AUTH_KEYS.selectedCompanyId));
  }
}

export function clearSelectedCompanyId() {
  setSelectedCompanyId(null);
}

export function hasSelectedCompanyContext() {
  return Boolean(getSelectedCompanyId());
}
