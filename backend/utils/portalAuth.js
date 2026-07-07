const { AUTH_PORTALS } = require('../constants/authPortals');
const { USER_PROVISION_SOURCES } = require('../constants/userProvisionSources');
const {
  ROLES,
  ADMIN_PORTAL_ROLES,
  CLIENT_PORTAL_ROLES,
  EMPLOYEE_PORTAL_ROLES,
} = require('./roles');

function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

function hasAnyRole(user, roles) {
  return roles.some((role) => hasRole(user, role));
}

function assertPortalAccess(user, portal) {
  if (!portal) {
    return { allowed: false, message: 'Portal context is required', code: 'PORTAL_REQUIRED' };
  }

  if (portal === AUTH_PORTALS.ADMIN) {
    if (!hasRole(user, ROLES.SUPER_ADMIN)) {
      return { allowed: false, message: 'Access denied for this portal', code: 'PORTAL_ACCESS_DENIED' };
    }
    return { allowed: true };
  }

  if (portal === AUTH_PORTALS.CLIENT) {
    if (!hasAnyRole(user, CLIENT_PORTAL_ROLES)) {
      return { allowed: false, message: 'Access denied for this portal', code: 'PORTAL_ACCESS_DENIED' };
    }
    if (hasRole(user, ROLES.EMPLOYEE)) {
      return {
        allowed: false,
        message: 'Employee accounts must use the ESS portal',
        code: 'PORTAL_ACCESS_DENIED',
      };
    }
    return { allowed: true };
  }

  if (portal === AUTH_PORTALS.EMPLOYEE) {
    if (!hasRole(user, ROLES.EMPLOYEE)) {
      return { allowed: false, message: 'Access denied for this portal', code: 'PORTAL_ACCESS_DENIED' };
    }
    if (user.provisionSource !== USER_PROVISION_SOURCES.CLIENT_ADMIN) {
      return {
        allowed: false,
        message: 'Employee account must be created by company admin',
        code: 'EMPLOYEE_PROVISION_DENIED',
      };
    }
    return { allowed: true };
  }

  return { allowed: false, message: 'Invalid portal context', code: 'INVALID_PORTAL' };
}

module.exports = {
  assertPortalAccess,
};
