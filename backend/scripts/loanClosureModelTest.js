/**
 * LoanClosure model schema checks (Sheet 03 — Task 31).
 *
 * Run: npm run test:loan-closure-model
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LoanClosure = require('../models/LoanClosure');
const { LOAN_CLOSURE_TYPE } = require('../constants/loanClosureStates');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const schema = LoanClosure.schema;
const closureTypeEnum = schema.path('closureType').enumValues;

record(
  'closureType enum includes Regular, Prepayment, Settlement',
  closureTypeEnum.includes(LOAN_CLOSURE_TYPE.REGULAR) &&
    closureTypeEnum.includes(LOAN_CLOSURE_TYPE.PREPAYMENT) &&
    closureTypeEnum.includes(LOAN_CLOSURE_TYPE.SETTLEMENT)
);

const requiredPaths = [
  'closureNo',
  'loanNo',
  'closureDate',
  'outstandingAmount',
  'closureType',
];

record(
  'required tracker fields are marked required',
  requiredPaths.every((path) => schema.path(path).isRequired)
);

record('certificateNo is optional', !schema.path('certificateNo').isRequired);

async function runDbChecks() {
  await connectDB();

  const companyId = new mongoose.Types.ObjectId();
  const invalid = new LoanClosure({
    companyId,
    closureNo: 'LC-2026-00001',
    loanNo: 'LN-2026-00001',
    closureDate: new Date(),
    outstandingAmount: 0,
    closureType: 'InvalidType',
  });

  let invalidFailed = false;
  try {
    await invalid.validate();
  } catch {
    invalidFailed = true;
  }

  record('invalid closureType fails validation', invalidFailed);

  const valid = await LoanClosure.forTenant(companyId).create({
    closureNo: 'LC-TEST-00001',
    loanNo: 'LN-TEST-00001',
    closureDate: new Date('2026-07-01'),
    outstandingAmount: 0,
    closureType: LOAN_CLOSURE_TYPE.REGULAR,
    certificateNo: 'LCC-2026-00001',
  });

  record('valid closure document persists', Boolean(valid._id), valid._id?.toString());
  record('certificateNo persists when provided', valid.certificateNo === 'LCC-2026-00001');

  await LoanClosure.deleteMany({ companyId });
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
