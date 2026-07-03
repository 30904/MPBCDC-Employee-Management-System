/**
 * Role → menu visibility map (Appendix A, implementation guide).
 * Sidebar is built from this — do not rely on hiding links alone.
 */
export const menuSections = [
  {
    label: 'Main',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        roles: [
          'CLIENT_ADMIN',
          'HR_OFFICER',
          'FINANCE_OFFICER',
          'REPORTING_MANAGER',
          'REGIONAL_MANAGER',
        ],
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        to: '/settings/organization',
        label: 'Organization',
        roles: ['CLIENT_ADMIN'],
      },
      {
        to: '/settings/employees',
        label: 'Employee Management',
        roles: ['CLIENT_ADMIN', 'HR_OFFICER'],
      },
      {
        to: '/settings/loan',
        label: 'Loan Setup',
        roles: ['CLIENT_ADMIN'],
      },
      {
        to: '/settings/leave',
        label: 'Leave Setup',
        roles: ['CLIENT_ADMIN'],
      },
      {
        to: '/settings/workflow',
        label: 'Approval Matrix',
        roles: ['CLIENT_ADMIN'],
      },
      {
        to: '/settings/notifications',
        label: 'Notifications',
        roles: ['CLIENT_ADMIN'],
      },
      {
        to: '/settings/users',
        label: 'Users & Roles',
        roles: ['CLIENT_ADMIN'],
      },
    ],
  },
  {
    label: 'Transactions',
    items: [
      {
        to: '/transactions/loans',
        label: 'Loan Transactions',
        roles: [
          'CLIENT_ADMIN',
          'HR_OFFICER',
          'FINANCE_OFFICER',
          'REPORTING_MANAGER',
        ],
      },
      {
        to: '/transactions/loans/applications',
        label: 'Loan Applications',
        roles: ['HR_OFFICER', 'FINANCE_OFFICER', 'REPORTING_MANAGER'],
      },
      {
        to: '/transactions/loans/approval-queue',
        label: 'Loan Approval Queue',
        roles: ['HR_OFFICER', 'FINANCE_OFFICER', 'REPORTING_MANAGER'],
      },
      {
        to: '/transactions/loans/disbursement',
        label: 'Loan Disbursement',
        roles: ['HR_OFFICER', 'FINANCE_OFFICER', 'REPORTING_MANAGER'],
      },
      {
        to: '/transactions/leaves',
        label: 'Leave Transactions',
        roles: ['HR_OFFICER', 'REPORTING_MANAGER'],
      },
      {
        to: '/transactions/leaves/applications',
        label: 'Leave Applications',
        roles: ['HR_OFFICER', 'REPORTING_MANAGER'],
      },
      {
        to: '/transactions/leaves/approval-queue',
        label: 'Leave Approval Queue',
        roles: ['HR_OFFICER', 'REPORTING_MANAGER'],
      },
      {
        to: '/service-records',
        label: 'Service Records',
        roles: ['CLIENT_ADMIN', 'HR_OFFICER', 'REPORTING_MANAGER'],
      },
      {
        to: '/service-records/book',
        label: 'Service Book',
        roles: ['CLIENT_ADMIN', 'HR_OFFICER', 'REPORTING_MANAGER'],
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        to: '/reports',
        label: 'Reports',
        roles: [
          'CLIENT_ADMIN',
          'HR_OFFICER',
          'FINANCE_OFFICER',
          'REPORTING_MANAGER',
          'REGIONAL_MANAGER',
        ],
      },
    ],
  },
];

export function getMenuForUser(user) {
  return menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.roles.some((role) => user?.roles?.includes(role))
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function getRouteRoles(path) {
  for (const section of menuSections) {
    for (const item of section.items) {
      if (item.to === path) return item.roles;
    }
  }
  return null;
}
