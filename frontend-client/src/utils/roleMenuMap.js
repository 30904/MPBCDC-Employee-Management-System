import { ROLES } from '../constants/roles.js';

const ADMIN = ROLES.CLIENT_ADMIN;

/**
 * Role → menu visibility map (Client portal).
 * Only three official user roles exist: Super Admin, Admin, Employee.
 * This portal is for Admin (CLIENT_ADMIN) only.
 */
export const menuSections = [
  {
    label: 'Main',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        roles: [ADMIN],
      },
      {
        to: '/settings',
        label: 'Settings',
        roles: [ADMIN],
        pathPrefix: '/settings',
      },
    ],
  },
  {
    label: 'Transactions',
    items: [
      {
        to: '/transactions/loans',
        label: 'Loan Transactions',
        roles: [ADMIN],
        pathPrefix: '/transactions/loans',
      },
      {
        to: '/transactions/leaves',
        label: 'Leave Transactions',
        roles: [ADMIN],
        pathPrefix: '/transactions/leaves',
      },
      {
        to: '/transactions/service-records',
        label: 'Service Records',
        roles: [ADMIN],
        pathPrefix: '/transactions/service-records',
      },
      {
        to: '/service-records/book',
        label: 'Service Book',
        roles: [ADMIN],
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        to: '/reports',
        label: 'Reports',
        roles: [ADMIN],
        pathPrefix: '/reports',
      },
    ],
  },
];

export const settingsRouteRules = [
  {
    pathPrefix: '/settings/employees',
    roles: [ADMIN],
  },
  {
    pathPrefix: '/settings/loan',
    roles: [ADMIN],
  },
  {
    pathPrefix: '/settings/leave',
    roles: [ADMIN],
  },
  {
    pathPrefix: '/settings',
    roles: [ADMIN],
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

function isWithinRoutePrefix(pathname, pathPrefix) {
  return pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`);
}

function collectRouteRules(pathname) {
  const rules = [];

  for (const section of menuSections) {
    for (const item of section.items) {
      if (item.to === pathname) {
        rules.push({ pathPrefix: item.to, roles: item.roles });
      }

      if (item.pathPrefix && isWithinRoutePrefix(pathname, item.pathPrefix)) {
        rules.push({ pathPrefix: item.pathPrefix, roles: item.roles });
      }
    }
  }

  for (const rule of settingsRouteRules) {
    if (isWithinRoutePrefix(pathname, rule.pathPrefix)) {
      rules.push(rule);
    }
  }

  return rules;
}

export function getRouteRoles(pathname) {
  const rules = collectRouteRules(pathname);

  if (!rules.length) {
    return null;
  }

  const roles = new Set();
  rules.forEach((rule) => {
    rule.roles.forEach((role) => roles.add(role));
  });

  return [...roles];
}
