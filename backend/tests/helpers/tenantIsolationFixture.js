const Company = require('../../models/Company');
const User = require('../../models/User');
const { MpbcdcEmployee, Department } = require('../../models/tenantScopedModels');
const { ROLES } = require('../../utils/roles');

const FIXTURE_PREFIX = 'TEST_ISO_';

async function cleanupTenantIsolationFixture() {
  const companies = await Company.find({ code: new RegExp(`^${FIXTURE_PREFIX}`) }).select('_id');
  const companyIds = companies.map((company) => company._id);

  if (companyIds.length === 0) {
    return;
  }

  await Promise.all([
    User.deleteMany({ companyId: { $in: companyIds } }),
    MpbcdcEmployee.deleteMany({ companyId: { $in: companyIds } }),
    Department.deleteMany({ companyId: { $in: companyIds } }),
    Company.deleteMany({ _id: { $in: companyIds } }),
  ]);
}

async function seedTenantIsolationFixture() {
  await cleanupTenantIsolationFixture();

  const [companyA, companyB] = await Company.create([
    { name: 'Isolation Test Company A', code: `${FIXTURE_PREFIX}A`, status: 'Active' },
    { name: 'Isolation Test Company B', code: `${FIXTURE_PREFIX}B`, status: 'Active' },
  ]);

  const passwordHash = await User.hashPassword('Test@123456');

  const [employeeUserA, employeeUserB] = await Promise.all([
    User.forTenant(companyA._id).create({
      loginId: `${FIXTURE_PREFIX}employee_a`,
      passwordHash,
      roles: [ROLES.EMPLOYEE],
      status: 'Active',
    }),
    User.forTenant(companyB._id).create({
      loginId: `${FIXTURE_PREFIX}employee_b`,
      passwordHash,
      roles: [ROLES.EMPLOYEE],
      status: 'Active',
    }),
  ]);

  const [employeeA, employeeB] = await Promise.all([
    MpbcdcEmployee.forTenant(companyA._id).create({ employeeCode: `${FIXTURE_PREFIX}EMP_A` }),
    MpbcdcEmployee.forTenant(companyB._id).create({ employeeCode: `${FIXTURE_PREFIX}EMP_B` }),
  ]);

  const [departmentA, departmentB] = await Promise.all([
    Department.forTenant(companyA._id).create({ name: `${FIXTURE_PREFIX}DEPT_A` }),
    Department.forTenant(companyB._id).create({ name: `${FIXTURE_PREFIX}DEPT_B` }),
  ]);

  return {
    companyA,
    companyB,
    employeeUserA,
    employeeUserB,
    employeeA,
    employeeB,
    departmentA,
    departmentB,
  };
}

module.exports = {
  FIXTURE_PREFIX,
  cleanupTenantIsolationFixture,
  seedTenantIsolationFixture,
};
