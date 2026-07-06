/**
 * Pure eligibility rule checks (no database).
 *
 * Run: npm run test:loan-eligibility
 */
const assert = require('node:assert/strict');
const {
  calculateEligibility,
  calculateMonthlyEmi,
} = require('../services/loanEligibilityService');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const employee = {
  grossSalary: 50000,
  dateOfJoining: new Date('2020-01-01'),
  retirementDate: new Date('2040-12-01'),
};

const loanType = {
  code: 'EDU',
  name: 'Education Loan',
  maxAmount: 500000,
  maxTenureMonths: 60,
  interestRate: 8,
  minServiceYears: 0,
};

const rule = {
  ruleCode: 'DEFAULT',
  minServiceMonths: 0,
  maxEmiPercentOfGross: 60,
  retirementBufferMonths: 3,
};

const emi = calculateMonthlyEmi(300000, 8, 60);
record('EMI calculation returns a positive value', emi > 0, `emi=${emi.toFixed(2)}`);

const eligible = calculateEligibility(employee, loanType, 300000, 60, {
  rule,
  existingActiveLoanEmiTotal: 0,
  asOfDate: new Date('2026-07-01'),
});
record('Eligible case passes', eligible.eligible === true);

const highEmi = calculateEligibility(employee, loanType, 600000, 60, {
  rule,
  existingActiveLoanEmiTotal: 0,
  asOfDate: new Date('2026-07-01'),
});
record(
  'High amount fails max eligible amount',
  !highEmi.eligible && highEmi.reasons.some((reason) => reason.includes('maximum eligible'))
);

const emiCap = calculateEligibility(employee, loanType, 300000, 60, {
  rule,
  existingActiveLoanEmiTotal: 25000,
  asOfDate: new Date('2026-07-01'),
});
record(
  'Existing EMIs count toward 60% gross cap',
  !emiCap.eligible && emiCap.reasons.some((reason) => reason.includes('EMI'))
);

const retirement = calculateEligibility(employee, loanType, 200000, 120, {
  rule,
  existingActiveLoanEmiTotal: 0,
  asOfDate: new Date('2039-06-01'),
});
record(
  'Loan must close before retirement buffer',
  !retirement.eligible &&
    retirement.reasons.some((reason) => reason.includes('retirement'))
);

const retain = calculateEligibility(employee, loanType, 300000, 60, {
  rule,
  existingActiveLoanEmiTotal: 25000,
  asOfDate: new Date('2026-07-01'),
});
record(
  'Must retain at least 40% of gross salary',
  !retain.eligible && retain.reasons.some((reason) => reason.includes('40%'))
);

const failed = results.filter((item) => !item.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exit(1);
}
