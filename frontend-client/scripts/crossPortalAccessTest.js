/**
 * Cross-portal access checks for the Client portal.
 *
 * Run: npm run test:cross-portal
 */
import assert from 'node:assert/strict';
import { resolvePrivateRouteAccess } from '../src/utils/portalAccess.js';

const results = [];

function record(name, passed) {
  results.push({ name, passed });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}`);
}

function clientUser(role = 'CLIENT_ADMIN') {
  return { loginId: 'client.user', roles: [role], companyId: 'company-1' };
}

record(
  'CLIENT_ADMIN with company context is allowed',
  resolvePrivateRouteAccess({
    token: 'jwt',
    user: clientUser(),
    foreignSession: null,
    hasCompanyContext: true,
  }).outcome === 'allow'
);

record(
  'EMPLOYEE token is rejected',
  resolvePrivateRouteAccess({
    token: 'jwt',
    user: { roles: ['EMPLOYEE'], companyId: 'company-1' },
    foreignSession: null,
    hasCompanyContext: true,
  }).outcome === 'access-denied'
);

record(
  'Client user without company context is rejected',
  resolvePrivateRouteAccess({
    token: 'jwt',
    user: clientUser(),
    foreignSession: null,
    hasCompanyContext: false,
  }).reason === 'no-company'
);

record(
  'ESS foreign session blocks client private routes',
  resolvePrivateRouteAccess({
    token: null,
    user: null,
    foreignSession: { namespace: 'hrms_employee', token: 'ess-jwt', user: { roles: ['EMPLOYEE'] } },
    hasCompanyContext: false,
  }).outcome === 'access-denied'
);

record(
  'Anonymous user is sent to login',
  resolvePrivateRouteAccess({
    token: null,
    user: null,
    foreignSession: null,
    hasCompanyContext: false,
  }).outcome === 'login'
);

const failed = results.filter((item) => !item.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) process.exit(1);
