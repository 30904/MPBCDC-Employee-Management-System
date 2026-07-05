/**
 * Remove client-supplied companyId from request payloads.
 * Tenant context is always resolved server-side (JWT / x-company-id header).
 */

function stripCompanyIdFromValue(value) {
  if (!value || typeof value !== 'object') {
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

/**
 * Strip companyId from req.body (top-level and nested).
 */
function stripCompanyIdFromBody(body) {
  stripCompanyIdFromValue(body);
}

/**
 * Strip companyId from query string — clients must not select tenant via URL.
 */
function stripCompanyIdFromQuery(query) {
  if (!query || typeof query !== 'object') {
    return;
  }

  if (Object.prototype.hasOwnProperty.call(query, 'companyId')) {
    delete query.companyId;
  }
}

/**
 * Apply all client-side companyId stripping for an Express request.
 */
function stripClientCompanyId(req) {
  stripCompanyIdFromBody(req.body);
  stripCompanyIdFromQuery(req.query);
}

module.exports = {
  stripCompanyIdFromBody,
  stripCompanyIdFromQuery,
  stripClientCompanyId,
};
