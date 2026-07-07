const { sendError } = require('../utils/apiResponse');
const { ROLES } = require('../utils/roles');

function normalizeId(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

function resolveEmployeeScopeId(user) {
  return normalizeId(user?.employeeId);
}

function assertEmployeeSelfScope(req, res, next) {
  if (!req.user || !Array.isArray(req.user.roles) || !req.user.roles.includes(ROLES.EMPLOYEE)) {
    return next();
  }

  const scopeEmployeeId = resolveEmployeeScopeId(req.user);

  if (!scopeEmployeeId) {
    return sendError(res, 'Employee scope missing from token', 403);
  }

  const requestIds = [
    req.body?.employeeId,
    req.body?.userId,
    req.body?.ownerId,
    req.query?.employeeId,
    req.query?.userId,
    req.query?.ownerId,
  ]
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map(normalizeId);

  const mismatchedId = requestIds.find((requestId) => requestId !== scopeEmployeeId);
  if (mismatchedId) {
    return sendError(res, 'You can only access your own requests', 403);
  }

  req.selfScope = {
    userId: normalizeId(req.user.id),
    employeeId: scopeEmployeeId,
    companyId: req.companyId || req.user.companyId || null,
  };

  if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'employeeId')) {
    req.body.employeeId = scopeEmployeeId;
  }

  if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'userId')) {
    req.body.userId = normalizeId(req.user.id);
  }

  return next();
}

module.exports = assertEmployeeSelfScope;