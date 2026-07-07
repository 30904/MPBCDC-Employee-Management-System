const mongoose = require('mongoose');
const Company = require('../../models/Company');
const User = require('../../models/User');
const { Employee, Department } = require('../../models/tenantScopedModels');
const { ROLES } = require('../../utils/roles');

const FIXTURE_PREFIX = 'TEST_ISO_';

function buildFixtureEmployee(companyId, employeeCode) {
  return {
    companyId,
    employeeCode,
    employeeName: `Fixture ${employeeCode}`,
    gender: 'Male',
    dateOfBirth: new Date('1990-01-01'),
    joiningDate: new Date('2020-01-01'),
    retirementDate: new Date('2040-12-01'),
    mobileNumber: '9000000001',
    email: `${employeeCode.toLowerCase()}@test.local`,
    aadhaarNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    department: 'Operations',
    designation: 'Associate',
    grade: 'A',
    region: 'North',
    district: 'District 1',
    reportingManager: new mongoose.Types.ObjectId(),
    employmentType: 'Permanent',
    status: 'Active',
    grossSalary: 50000,
  };
}

async function createFixtureEmployee(companyId, employeeCode) {
  const employee = await Employee.create(buildFixtureEmployee(companyId, employeeCode));
  employee.reportingManager = employee._id;
  await employee.save();
  return employee;
}

async function cleanupTenantIsolationFixture() {
  const companies = await Company.find({ code: new RegExp(`^${FIXTURE_PREFIX}`) }).select('_id');
  const companyIds = companies.map((company) => company._id);

  if (companyIds.length === 0) {
    return;
  }

  await Promise.all([
    User.deleteMany({ companyId: { $in: companyIds } }),
    Employee.deleteMany({ companyId: { $in: companyIds } }),
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
    createFixtureEmployee(companyA._id, `${FIXTURE_PREFIX}EMP_A`),
    createFixtureEmployee(companyB._id, `${FIXTURE_PREFIX}EMP_B`),
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
