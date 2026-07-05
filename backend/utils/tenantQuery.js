const { sendError } = require('./apiResponse');
const mongoose = require('mongoose');

function toCompanyObjectId(companyId) {
  if (companyId instanceof mongoose.Types.ObjectId) {
    return companyId;
  }

  return new mongoose.Types.ObjectId(String(companyId));
}

/**
 * Build a Mongoose filter scoped to the current tenant.
 * Use in every controller query for tenant-scoped collections.
 */
function tenantFilter(companyId, extra = {}) {
  if (!companyId) {
    throw new Error('companyId is required for tenant-scoped queries');
  }

  return {
    companyId: toCompanyObjectId(companyId),
    ...extra,
  };
}

/**
 * Resolve companyId from request (set by tenantResolver middleware).
 */
function getTenantId(req) {
  return req.companyId ?? null;
}

/**
 * Resolve tenant id from request or an explicit fallback (e.g. SUPER_ADMIN route param).
 */
function resolveTenantId(req, fallbackCompanyId = null) {
  return getTenantId(req) ?? fallbackCompanyId;
}

/**
 * Respond with 403 if tenant context is missing on a tenant-scoped route.
 */
function requireTenantContext(req, res) {
  if (!req.companyId) {
    sendError(res, 'Tenant context required', 403);
    return false;
  }

  if (!mongoose.Types.ObjectId.isValid(req.companyId)) {
    sendError(res, 'Invalid tenant context', 403);
    return false;
  }

  return true;
}

/**
 * Verify a loaded document belongs to the active tenant.
 */
function belongsToTenant(document, companyId) {
  if (!document?.companyId || !companyId) {
    return false;
  }

  return String(document.companyId) === String(companyId);
}

/**
 * Reject cross-tenant document access in controllers.
 */
function assertBelongsToTenant(document, companyId, res, label = 'Record') {
  if (!document) {
    sendError(res, `${label} not found`, 404);
    return false;
  }

  if (!belongsToTenant(document, companyId)) {
    sendError(res, 'Access denied', 403);
    return false;
  }

  return true;
}

module.exports = {
  tenantFilter,
  toCompanyObjectId,
  getTenantId,
  resolveTenantId,
  requireTenantContext,
  belongsToTenant,
  assertBelongsToTenant,
};
