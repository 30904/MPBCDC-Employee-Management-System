/**
 * Employee ESS portal — namespaced localStorage keys.
 * Isolated from hrms_super_admin and hrms_client_admin so portals can coexist in one browser.
 *
 * Tenant context comes from the JWT `companyId` claim (also stored on the user object at login).
 * Employees must not send x-company-id — the backend resolves tenant from the token only.
 */
export const STORAGE_NAMESPACE = 'hrms_employee';

export const AUTH_KEYS = {
  token: 'token',
  user: 'user',
};

export function storageKey(key) {
  return `${STORAGE_NAMESPACE}:${key}`;
}

/** Resolved localStorage key for the session token: hrms_employee:token */
export const TOKEN_STORAGE_KEY = storageKey(AUTH_KEYS.token);
