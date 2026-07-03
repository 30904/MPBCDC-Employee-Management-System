const { sendError } = require('../utils/apiResponse');
const { ROLES } = require('../utils/roles');

function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

function tenantResolver(req, res, next) {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'companyId')) {
    delete req.body.companyId;
  }

  const isSuperAdmin = hasRole(req.user, ROLES.SUPER_ADMIN);

  if (isSuperAdmin) {
    const headerCompanyId = req.headers['x-company-id'];
    req.companyId = headerCompanyId || req.user.companyId || null;
    return next();
  }

  if (!req.user.companyId) {
    return sendError(res, 'Tenant context missing from token', 403);
  }

  req.companyId = req.user.companyId;
  return next();
}

module.exports = tenantResolver;
