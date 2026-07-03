/**
 * Role → menu visibility map (Employee ESS portal).
 * Sidebar is built from this — route guards use the same map via getRouteRoles().
 */
export const menuSections = [
  {
    label: 'Main',
    items: [{ to: '/dashboard', label: 'Dashboard', roles: ['EMPLOYEE'] }],
  },
  {
    label: 'Leaves',
    items: [
      { to: '/leaves/apply', label: 'Apply Leave', roles: ['EMPLOYEE'] },
      { to: '/leaves/history', label: 'Leave History', roles: ['EMPLOYEE'] },
      { to: '/leaves/balance', label: 'Leave Balance', roles: ['EMPLOYEE'] },
    ],
  },
  {
    label: 'Loans',
    items: [
      { to: '/loans/apply', label: 'Apply Loan', roles: ['EMPLOYEE'] },
      {
        to: '/loans/applied',
        label: 'My Loans',
        roles: ['EMPLOYEE'],
        pathPrefix: '/loans/',
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile', roles: ['EMPLOYEE'] },
      { to: '/documents', label: 'Documents', roles: ['EMPLOYEE'] },
      { to: '/notifications', label: 'Notifications', roles: ['EMPLOYEE'] },
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

/** Flat nav list for sidebar (no section headers). */
export function getNavItemsForUser(user) {
  return getMenuForUser(user).flatMap((section) => section.items);
}

export function getRouteRoles(pathname) {
  let prefixMatch = null;

  for (const section of menuSections) {
    for (const item of section.items) {
      if (item.to === pathname) {
        return item.roles;
      }

      if (item.pathPrefix && pathname.startsWith(item.pathPrefix)) {
        prefixMatch = item.roles;
      }
    }
  }

  return prefixMatch;
}
