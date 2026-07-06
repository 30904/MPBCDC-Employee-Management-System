/**
 * Loan disbursement + EMI schedule checks (Sheet 03).
 *
 * Run: npm run test:loan-disbursement
 */
const { LOAN_APPLICATION_STATUS } = require('../constants/loanWorkflowStates');
const { buildEmiSchedule } = require('../services/loanScheduleService');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const schedule = buildEmiSchedule({
  loanNo: 'LN-2026-00001',
  principal: 300000,
  annualRate: 8,
  tenureMonths: 12,
  startDate: new Date('2026-08-01'),
});

record('EMI schedule generates one row per month', schedule.length === 12);
record('First EMI has emiNo 1', schedule[0]?.emiNo === 1);
record('Outstanding balance ends at zero', schedule[schedule.length - 1]?.outstandingBalance === 0);
record(
  'All EMI amounts are positive',
  schedule.every((row) => row.emiAmount > 0)
);

record(
  'FinanceApproved is the pre-disbursement status',
  LOAN_APPLICATION_STATUS.FINANCE_APPROVED === 'FinanceApproved'
);
record(
  'Disbursed is the post-disbursement status',
  LOAN_APPLICATION_STATUS.DISBURSED === 'Disbursed'
);

const failed = results.filter((item) => !item.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exit(1);
}
