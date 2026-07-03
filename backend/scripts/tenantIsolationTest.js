require('dotenv').config();

const assert = require('node:assert/strict');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const { buildToken } = require('../controllers/authController');
const { Department } = require('../models/tenantScopedModels');
const User = require('../models/User');
const {
  cleanupTenantIsolationFixture,
  seedTenantIsolationFixture,
} = require('../tests/helpers/tenantIsolationFixture');
const { TENANT_HEADER } = require('../constants/tenantHeaders');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const icon = passed ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${name}${detail ? ` — ${detail}` : ''}`);
}

function runMiddlewareChain(middlewares, req) {
  return new Promise((resolve, reject) => {
    let index = 0;

    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        resolve({ req, res: this });
        return this;
      },
    };

    const next = (error) => {
      if (error) {
        reject(error);
        return;
      }
      dispatch();
    };

    async function dispatch() {
      if (index >= middlewares.length) {
        resolve({ req, res });
        return;
      }

      const middleware = middlewares[index];
      index += 1;

      try {
        await middleware(req, res, next);
      } catch (error) {
        reject(error);
      }
    }

    dispatch();
  });
}

async function testReadIsolation(fixture) {
  const { companyA, companyB, departmentA, departmentB } = fixture;

  const visibleToA = await Department.forTenant(companyA._id).find();
  const visibleToB = await Department.forTenant(companyB._id).find();

  const aIds = visibleToA.map((row) => String(row._id));
  const bIds = visibleToB.map((row) => String(row._id));

  record(
    'READ: Company A list excludes Company B departments',
    aIds.includes(String(departmentA._id)) &&
      !aIds.includes(String(departmentB._id)) &&
      bIds.includes(String(departmentB._id)) &&
      !bIds.includes(String(departmentA._id))
  );

  const crossRead = await Department.forTenant(companyA._id).findById(departmentB._id);
  record(
    'READ: Company A cannot fetch Company B department by id',
    crossRead === null
  );
}

async function testWriteIsolation(fixture) {
  const { companyA, companyB, departmentB } = fixture;

  const updateResult = await Department.forTenant(companyA._id).updateOne(
    { _id: departmentB._id },
    { $set: { name: 'HACKED_BY_A' } }
  );

  record(
    'WRITE: Company A cannot update Company B department',
    updateResult.matchedCount === 0 && updateResult.modifiedCount === 0
  );

  const freshB = await Department.forTenant(companyB._id).findById(departmentB._id);
  record(
    'WRITE: Company B department unchanged after cross-tenant update attempt',
    freshB?.name !== 'HACKED_BY_A'
  );

  const deleteResult = await Department.forTenant(companyA._id).deleteOne({ _id: departmentB._id });
  const stillExists = await Department.forTenant(companyB._id).findById(departmentB._id);

  record(
    'WRITE: Company A cannot delete Company B department',
    deleteResult.deletedCount === 0 && stillExists !== null
  );

  const created = await Department.forTenant(companyA._id).create({
    name: 'ISO_CREATE_A',
  });

  record(
    'WRITE: create via forTenant always assigns Company A',
    String(created.companyId) === String(companyA._id)
  );

  await Department.forTenant(companyA._id).deleteOne({ _id: created._id });
}

async function testMiddlewareIsolation(fixture) {
  const { companyA, companyB, employeeUserA } = fixture;
  const token = buildToken(employeeUserA);

  const baseReq = {
    headers: {
      authorization: `Bearer ${token}`,
      [TENANT_HEADER]: String(companyB._id),
    },
    body: { companyId: String(companyB._id), nested: { companyId: String(companyB._id) } },
    query: { companyId: String(companyB._id) },
  };

  const afterAuth = await runMiddlewareChain([authMiddleware], { ...baseReq, body: { ...baseReq.body } });
  record(
    'AUTH: valid Company A employee token accepted',
    afterAuth.req.user?.companyId === String(companyA._id)
  );

  const afterTenant = await runMiddlewareChain(
    [authMiddleware, tenantResolver],
    { ...baseReq, body: { ...baseReq.body } }
  );

  record(
    'MIDDLEWARE: x-company-id header ignored for tenant employee',
    afterTenant.req.companyId === String(companyA._id)
  );
  record(
    'MIDDLEWARE: companyId stripped from body and query',
    afterTenant.req.body.companyId === undefined &&
      afterTenant.req.body.nested.companyId === undefined &&
      afterTenant.req.query.companyId === undefined
  );
}

async function testApiScopedCount(fixture) {
  const { companyA, companyB, employeeUserA, employeeUserB } = fixture;

  const usersA = await User.forTenant(companyA._id).find().select('_id');
  const usersB = await User.forTenant(companyB._id).find().select('_id');

  const aIds = usersA.map((user) => String(user._id));
  const bIds = usersB.map((user) => String(user._id));

  record(
    'API-SCOPE: Company A user queries exclude Company B users',
    aIds.includes(String(employeeUserA._id)) &&
      !aIds.includes(String(employeeUserB._id)) &&
      bIds.includes(String(employeeUserB._id)) &&
      !bIds.includes(String(employeeUserA._id))
  );

  const token = buildToken(employeeUserA);
  const { req } = await runMiddlewareChain([authMiddleware, tenantResolver], {
    headers: { authorization: `Bearer ${token}` },
    body: {},
    query: {},
  });

  const scopedUsers = await User.forTenant(req.companyId).find().select('_id');
  const scopedIds = scopedUsers.map((user) => String(user._id));

  record(
    'API-SCOPE: resolved req.companyId scopes user queries to Company A',
    scopedIds.includes(String(employeeUserA._id)) &&
      !scopedIds.includes(String(employeeUserB._id))
  );
}

async function testUnscopedQueryRisk(fixture) {
  const { departmentA, departmentB } = fixture;

  const unscoped = await Department.find({
    name: { $regex: /^TEST_ISO_/ },
  });

  const hasBothTenants = unscoped.some((row) => String(row._id) === String(departmentA._id)) &&
    unscoped.some((row) => String(row._id) === String(departmentB._id));

  record(
    'GUARD: unscoped queries can leak cross-tenant data (controllers must use forTenant)',
    hasBothTenants,
    'Use Model.forTenant(req.companyId) in every controller'
  );
}

async function main() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set (see backend/.env.example)');
  }

  console.log('Tenant isolation test — Acceptance criteria #9\n');

  await connectDB();
  const fixture = await seedTenantIsolationFixture();

  try {
    await testReadIsolation(fixture);
    await testWriteIsolation(fixture);
    await testMiddlewareIsolation(fixture);
    await testApiScopedCount(fixture);
    await testUnscopedQueryRisk(fixture);
  } finally {
    await cleanupTenantIsolationFixture();
    await mongoose.disconnect();
  }

  const failed = results.filter((result) => !result.passed);
  const passed = results.length - failed.length;

  console.log(`\n${passed}/${results.length} checks passed`);

  if (failed.length > 0) {
    console.error('\nFailed checks:');
    failed.forEach((result) => console.error(`  - ${result.name}: ${result.detail}`));
    process.exit(1);
  }

  console.log('\nTenant isolation verified: Company A token cannot read/write Company B data.');
  process.exit(0);
}

main().catch(async (error) => {
  console.error('Tenant isolation test error:', error.message);
  try {
    await cleanupTenantIsolationFixture();
    await mongoose.disconnect();
  } catch {
    // ignore cleanup errors
  }
  process.exit(1);
});
