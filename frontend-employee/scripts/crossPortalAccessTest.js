/**
 * Cross-portal access checks for the Employee ESS app (Task 15).
 *
 * Run: npm run test:cross-portal
 */
import assert from 'node:assert/strict';
import {
  resolvePrivateRouteAccess,
  resolveSettingsRouteAccess,
} from '../src/utils/portalAccess.js';

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const icon = passed ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${name}${detail ? ` — ${detail}` : ''}`);
}

function clientAdminUser() {
  return {
    id: 'user-1',
    loginId: 'client.admin',
    roles: ['CLIENT_ADMIN'],
    companyId: 'company-1',
  };
}

function employeeUser() {
  return {
    id: 'user-2',
    loginId: 'EMP001',
    roles: ['EMPLOYEE'],
    companyId: 'company-1',
    employeeId: 'emp-1',
  };
}

// CLIENT_ADMIN session only exists in client namespace → ESS private route denies access.
record(
  'CLIENT_ADMIN foreign session blocks ESS private routes',
  resolvePrivateRouteAccess({
    token: null,
    user: null,
    foreignSession: {
      namespace: 'hrms_client_admin',
      token: 'client-jwt',
      user: clientAdminUser(),
    },
  }).outcome === 'access-denied'
);

// Wrong role stored in ESS namespace → clear ESS auth and deny.
const wrongRoleInEss = resolvePrivateRouteAccess({
  token: 'ess-jwt',
  user: clientAdminUser(),
  foreignSession: null,
});
record(
  'CLIENT_ADMIN token in ESS namespace is rejected',
  wrongRoleInEss.outcome === 'access-denied' && wrongRoleInEss.clearAuth === true
);

// Valid employee may use ESS routes.
record(
  'EMPLOYEE session is allowed',
  resolvePrivateRouteAccess({
    token: 'ess-jwt',
    user: employeeUser(),
    foreignSession: null,
  }).outcome === 'allow'
);

// Anonymous user with no foreign session → login prompt.
record(
  'Anonymous user is sent to login',
  resolvePrivateRouteAccess({
    token: null,
    user: null,
    foreignSession: null,
  }).outcome === 'login'
);

// Employee cannot open client settings URLs directly.
const settingsWhileLoggedIn = resolveSettingsRouteAccess({
  token: 'ess-jwt',
  user: employeeUser(),
  pathname: '/settings/organization',
});
record(
  'Employee /settings/* redirects to dashboard with denial state',
  settingsWhileLoggedIn.outcome === 'dashboard' &&
    settingsWhileLoggedIn.state?.error === 'module-access-denied'
);

record(
  'CLIENT_ADMIN foreign session on /settings/* redirects to login with access-denied',
  resolveSettingsRouteAccess({
    token: null,
    user: null,
    foreignSession: {
      namespace: 'hrms_client_admin',
      token: 'client-jwt',
      user: clientAdminUser(),
    },
    pathname: '/settings/organization',
  }).outcome === 'access-denied'
);

record(
  'CLIENT_ADMIN token on /settings/* is rejected',
  resolveSettingsRouteAccess({
    token: 'ess-jwt',
    user: clientAdminUser(),
    pathname: '/settings/users',
  }).outcome === 'access-denied'
);

record(
  'Guest /settings/* redirects to login',
  resolveSettingsRouteAccess({
    token: null,
    pathname: '/settings/users',
  }).outcome === 'login'
);

const failed = results.filter((item) => !item.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exit(1);
}

console.log('\nExpected manual check:');
console.log('- Log into Client portal as CLIENT_ADMIN, open Employee portal /dashboard → login + access-denied');
console.log('- Log into ESS as EMPLOYEE, open /settings/organization → dashboard + permission warning');
