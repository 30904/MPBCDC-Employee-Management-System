/**
 * Remove client-supplied companyId from outbound API payloads.
 * Tenant context is resolved server-side (JWT / x-company-id header).
 */

function stripCompanyIdFromValue(value) {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (value instanceof FormData) {
    value.delete('companyId');
    return;
  }

  if (value instanceof URLSearchParams) {
    value.delete('companyId');
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(stripCompanyIdFromValue);
    return;
  }

  if (Object.prototype.hasOwnProperty.call(value, 'companyId')) {
    delete value.companyId;
  }

  Object.values(value).forEach(stripCompanyIdFromValue);
}

export function stripCompanyIdFromQuery(query) {
  if (!query || typeof query !== 'object') {
    return;
  }

  if (Object.prototype.hasOwnProperty.call(query, 'companyId')) {
    delete query.companyId;
  }
}

/**
 * Strip companyId from an Axios request config (body + query params).
 */
export function stripCompanyIdFromAxiosConfig(config) {
  const { data } = config;

  if (data !== undefined && data !== null) {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        stripCompanyIdFromValue(parsed);
        config.data = JSON.stringify(parsed);
      } catch {
        // Non-JSON body — leave unchanged.
      }
    } else {
      stripCompanyIdFromValue(data);
    }
  }

  stripCompanyIdFromQuery(config.params);
}
