/**
 * LoanRecovery model schema checks (Sheet 03 — Task 28).
 *
 * Run: npm run test:loan-recovery-model
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LoanRecovery = require('../models/LoanRecovery');
const { LOAN_RECOVERY_STATUS, PAYROLL_MONTH_PATTERN } = require('../constants/loanRecoveryStates');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

record('payrollMonth pattern accepts YYYY-MM', PAYROLL_MONTH_PATTERN.test('2026-07'));
record('payrollMonth pattern rejects invalid month', !PAYROLL_MONTH_PATTERN.test('2026-13'));

const schema = LoanRecovery.schema;
const statusEnum = schema.path('status').enumValues;

record(
  'status enum includes Pending, Deducted, Skipped',
  statusEnum.includes(LOAN_RECOVERY_STATUS.PENDING) &&
    statusEnum.includes(LOAN_RECOVERY_STATUS.DEDUCTED) &&
    statusEnum.includes(LOAN_RECOVERY_STATUS.SKIPPED)
);

const requiredPaths = ['loanNo', 'payrollMonth', 'emiAmount', 'balanceOutstanding'];
record(
  'required tracker fields are marked required',
  requiredPaths.every((path) => schema.path(path).isRequired)
);

async function runDbChecks() {
  await connectDB();

  const companyId = new mongoose.Types.ObjectId();
  const invalid = new LoanRecovery({
    companyId,
    loanNo: 'LN-2026-00001',
    payrollMonth: '2026-13',
    emiAmount: 5000,
    balanceOutstanding: 100000,
  });

  let invalidFailed = false;
  try {
    await invalid.validate();
  } catch {
    invalidFailed = true;
  }

  record('invalid payrollMonth fails validation', invalidFailed);

  const valid = await LoanRecovery.forTenant(companyId).create({
    loanNo: 'LN-TEST-00001',
    payrollMonth: '2026-08',
    emiAmount: 6082.92,
    balanceOutstanding: 295000,
    status: LOAN_RECOVERY_STATUS.PENDING,
  });

  record('valid recovery document persists', Boolean(valid._id), valid._id?.toString());

  await LoanRecovery.deleteMany({ companyId });
}

runDbChecks()
  .then(() => {
    const failed = results.filter((item) => !item.passed);
    console.log(`\n${results.length - failed.length}/${results.length} passed`);
    process.exit(failed.length > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
