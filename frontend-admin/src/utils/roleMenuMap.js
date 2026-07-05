/**
 * Role → menu visibility map (Super Admin portal).
 * Sidebar is built from this — route guards use the same map via getRouteRoles().
 */
export const menuSections = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', roles: ['SUPER_ADMIN'] },
      {
        to: '/companies',
        label: 'Companies',
        roles: ['SUPER_ADMIN'],
        pathPrefix: '/companies',
      },
      {
        to: '/audit-logs',
        label: 'Audit Logs',
        roles: ['SUPER_ADMIN'],
        pathPrefix: '/audit-logs',
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

/** Flat nav list for sidebar (no section headers). */
export function getNavItemsForUser(user) {
  return getMenuForUser(user).flatMap((section) => section.items);
}

function isWithinRoutePrefix(pathname, pathPrefix) {
  return pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`);
}

export function getRouteRoles(pathname) {
  let prefixMatch = null;

  for (const section of menuSections) {
    for (const item of section.items) {
      if (item.to === pathname) {
        return item.roles;
      }

      if (item.pathPrefix && isWithinRoutePrefix(pathname, item.pathPrefix)) {
        prefixMatch = item.roles;
      }
    }
  }

  return prefixMatch;
}
