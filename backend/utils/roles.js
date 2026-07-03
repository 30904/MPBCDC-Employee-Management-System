const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLIENT_ADMIN: 'CLIENT_ADMIN',
  HR_OFFICER: 'HR_OFFICER',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  REPORTING_MANAGER: 'REPORTING_MANAGER',
  REGIONAL_MANAGER: 'REGIONAL_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

const ALL_ROLES = Object.values(ROLES);

// Portal-level role groupings
const ADMIN_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.CLIENT_ADMIN,
];

const CLIENT_PORTAL_ROLES = [
  ROLES.CLIENT_ADMIN,
  ROLES.HR_OFFICER,
  ROLES.FINANCE_OFFICER,
  ROLES.REPORTING_MANAGER,
  ROLES.REGIONAL_MANAGER,
];

const EMPLOYEE_PORTAL_ROLES = [
  ROLES.EMPLOYEE,
];

// Role metadata for display and documentation
const ROLE_METADATA = {
  [ROLES.SUPER_ADMIN]: {
    displayName: 'Super Admin',
    description: 'System administrator with full access to all companies and features',
    portal: 'admin',
    order: 1,
  },
  [ROLES.CLIENT_ADMIN]: {
    displayName: 'Client Admin',
    description: 'Company administrator with full access to company data and users',
    portal: 'client',
    order: 2,
  },
  [ROLES.HR_OFFICER]: {
    displayName: 'HR Officer',
    description: 'HR personnel managing employee records, leaves, and documents',
    portal: 'client',
    order: 3,
  },
  [ROLES.FINANCE_OFFICER]: {
    displayName: 'Finance Officer',
    description: 'Finance personnel managing financial records and transactions',
    portal: 'client',
    order: 4,
  },
  [ROLES.REPORTING_MANAGER]: {
    displayName: 'Reporting Manager',
    description: 'Manager viewing reports and team performance metrics',
    portal: 'client',
    order: 5,
  },
  [ROLES.REGIONAL_MANAGER]: {
    displayName: 'Regional Manager',
    description: 'Regional manager overseeing multiple locations',
    portal: 'client',
    order: 6,
  },
  [ROLES.EMPLOYEE]: {
    displayName: 'Employee',
    description: 'Company employee accessing personal dashboard and self-service features',
    portal: 'employee',
    order: 7,
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
