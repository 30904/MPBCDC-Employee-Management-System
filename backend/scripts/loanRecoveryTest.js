/**
 * Loan recovery service checks (Sheet 03 — Task 29).
 *
 * Run: npm run test:loan-recovery
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LoanDisbursement = require('../models/LoanDisbursement');
const LoanEmiSchedule = require('../models/LoanEmiSchedule');
const LoanRecovery = require('../models/LoanRecovery');
const { LOAN_RECOVERY_STATUS } = require('../constants/loanRecoveryStates');
const {
  payrollMonthFromDate,
  recordRecovery,
  listPendingRecoveries,
} = require('../services/loanRecoveryService');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

record(
  'payrollMonthFromDate formats due date',
  payrollMonthFromDate(new Date('2026-08-15')) === '2026-08'
);

async function runIntegration() {
  await connectDB();

  const companyId = new mongoose.Types.ObjectId();
  const loanNo = `LN-TEST-RECOVERY-${Date.now()}`;

  await LoanDisbursement.forTenant(companyId).create({
    disbursementNo: `LD-TEST-${Date.now()}`,
    loanNo,
    disbursedAmount: 120000,
    interestRate: 8,
    tenureMonths: 2,
    monthlyEmi: 60000,
    disbursedAt: new Date('2026-07-01'),
    firstEmiDate: new Date('2026-08-01'),
    status: 'Active',
  });

  await LoanEmiSchedule.forTenant(companyId).create({
    loanNo,
    emiNo: 1,
    dueDate: new Date('2026-08-01'),
    emiAmount: 60000,
    principalComponent: 58000,
    interestComponent: 2000,
    outstandingBalance: 62000,
    status: 'Pending',
  });

  const pending = await listPendingRecoveries({
    companyId,
    payrollMonth: '2026-08',
  });

  record('pending recoveries lists due EMI', pending.length === 1 && pending[0].loanNo === loanNo);

  const { recovery, scheduleRow } = await recordRecovery({
    companyId,
    loanNo,
    payrollMonth: '2026-08',
    recoveryDate: '2026-08-31',
  });

  record('recovery is marked Deducted', recovery.status === LOAN_RECOVERY_STATUS.DEDUCTED);
  record('schedule row is marked Paid', scheduleRow.status === 'Paid');
  record('recovery stores EMI amount', Number(recovery.emiAmount) === 60000);

  let duplicateFailed = false;
  try {
    await recordRecovery({ companyId, loanNo, payrollMonth: '2026-08' });
  } catch (error) {
    duplicateFailed = error.statusCode === 409;
  }

  record('duplicate recovery is rejected', duplicateFailed);

  await LoanRecovery.deleteMany({ companyId });
  await LoanEmiSchedule.deleteMany({ companyId });
  await LoanDisbursement.deleteMany({ companyId });
}

runIntegration()
  .then(() => {
    const failed = results.filter((item) => !item.passed);
    console.log(`\n${results.length - failed.length}/${results.length} passed`);
    process.exit(failed.length > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
