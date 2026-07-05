/**
 * Super Admin portal — namespaced localStorage keys.
 * Isolated from hrms_client_admin and hrms_employee so portals can coexist in one browser.
 *
 * Tenant context for cross-company API calls is optional: set via x-company-id header
 * (selected_company_id), never embedded in the JWT storage payload or request body.
 */
export const STORAGE_NAMESPACE = 'hrms_super_admin';

export const AUTH_KEYS = {
  token: 'auth_token',
  user: 'user',
  selectedCompanyId: 'selected_company_id',
};

/** HTTP header for optional SUPER_ADMIN tenant context (see backend tenantResolver). */
export const TENANT_HEADER = 'x-company-id';

export function storageKey(key) {
  return `${STORAGE_NAMESPACE}:${key}`;
}
