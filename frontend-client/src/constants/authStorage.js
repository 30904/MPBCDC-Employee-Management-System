/**
 * Client portal — namespaced localStorage keys.
 * Isolated from hrms_super_admin and hrms_employee so portals can coexist in one browser.
 *
 * Tenant context comes from the JWT `companyId` claim (also stored on the user object at login).
 * Client users must not send x-company-id — the backend resolves tenant from the token only.
 */
export const STORAGE_NAMESPACE = 'hrms_client_admin';

export const AUTH_KEYS = {
  token: 'token',
  user: 'user',
};

export function storageKey(key) {
  return `${STORAGE_NAMESPACE}:${key}`;
}

/** Resolved localStorage key for the session token: hrms_client_admin:token */
export const TOKEN_STORAGE_KEY = storageKey(AUTH_KEYS.token);
