const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLIENT_ADMIN: 'CLIENT_ADMIN',
  EMPLOYEE: 'EMPLOYEE',
};

const ALL_ROLES = Object.values(ROLES);

const ADMIN_PORTAL_ROLES = [ROLES.SUPER_ADMIN];

const CLIENT_PORTAL_ROLES = [ROLES.CLIENT_ADMIN];

const EMPLOYEE_PORTAL_ROLES = [ROLES.EMPLOYEE];

const ROLE_METADATA = {
  [ROLES.SUPER_ADMIN]: {
    displayName: 'Super Admin',
    description: 'System administrator with full access to all companies',
    portal: 'admin',
    order: 1,
  },
  [ROLES.CLIENT_ADMIN]: {
    displayName: 'Admin',
    description: 'Company administrator with full access to the client portal',
    portal: 'client',
    order: 2,
  },
  [ROLES.EMPLOYEE]: {
    displayName: 'Employee',
    description: 'Employee accessing self-service features',
    portal: 'employee',
    order: 3,
  },
};

module.exports = {
  ROLES,
  ALL_ROLES,
  ADMIN_PORTAL_ROLES,
  CLIENT_PORTAL_ROLES,
  EMPLOYEE_PORTAL_ROLES,
  ROLE_METADATA,
};
