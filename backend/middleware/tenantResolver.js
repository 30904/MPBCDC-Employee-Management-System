const mongoose = require('mongoose');
const Company = require('../models/Company');
const { TENANT_HEADER } = require('../constants/tenantHeaders');
const { sendError } = require('../utils/apiResponse');
const { ROLES } = require('../utils/roles');
const { stripClientCompanyId } = require('../utils/stripCompanyId');

function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

/**
 * Resolve tenant companyId:
 * - Tenant users: JWT companyId only (x-company-id header is ignored)
 * - SUPER_ADMIN: x-company-id header to act on a tenant, else JWT companyId if present
 */
function resolveCompanyId(user, headers = {}) {
  const isSuperAdmin = hasRole(user, ROLES.SUPER_ADMIN);

  if (isSuperAdmin) {
    const headerValue = headers[TENANT_HEADER];
    if (headerValue) {
      return String(headerValue).trim();
    }
  }

  if (user.companyId) {
    return String(user.companyId);
  }

  return null;
}

function superAdminUsedTenantHeader(req) {
  return hasRole(req.user, ROLES.SUPER_ADMIN) && Boolean(req.headers[TENANT_HEADER]);
}

async function tenantResolver(req, res, next) {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    stripClientCompanyId(req);

    const companyId = resolveCompanyId(req.user, req.headers);

    if (!companyId) {
      const message = hasRole(req.user, ROLES.SUPER_ADMIN)
        ? 'Tenant context required — provide x-company-id header'
        : 'Tenant context missing from token';

      return sendError(res, message, 403);
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return sendError(res, 'Invalid tenant context', 403);
    }

    if (superAdminUsedTenantHeader(req)) {
      const company = await Company.findById(companyId).select('_id status name code');

      if (!company) {
        return sendError(res, 'Company not found for x-company-id header', 404);
      }

      if (!company.isActive()) {
        return sendError(res, 'Cannot act on an inactive company', 403);
      }

      req.tenantCompany = company;
    }

    req.companyId = companyId;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = tenantResolver;
module.exports.resolveCompanyId = resolveCompanyId;
module.exports.TENANT_HEADER = TENANT_HEADER;
