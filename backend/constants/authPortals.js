const AUTH_PORTALS = Object.freeze({
  ADMIN: 'admin',
  CLIENT: 'client',
  EMPLOYEE: 'employee',
});

const AUTH_PORTAL_VALUES = Object.values(AUTH_PORTALS);

module.exports = {
  AUTH_PORTALS,
  AUTH_PORTAL_VALUES,
};
