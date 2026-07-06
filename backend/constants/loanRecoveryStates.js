/**
 * Loan recovery lifecycle (Sheet 03 — Task 28).
 * Payroll deduction records per loan per month.
 */

const LOAN_RECOVERY_STATUS = Object.freeze({
  PENDING: 'Pending',
  DEDUCTED: 'Deducted',
  SKIPPED: 'Skipped',
});

const PAYROLL_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

module.exports = {
  LOAN_RECOVERY_STATUS,
  PAYROLL_MONTH_PATTERN,
};
