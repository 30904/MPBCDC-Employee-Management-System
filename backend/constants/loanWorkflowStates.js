/**
 * Loan application lifecycle.
 * Draft → Submitted → Admin approval → FinanceApproved → Disbursed → Closed
 */

const LOAN_MODULE = 'LOAN';

const LOAN_APPLICATION_STATUS = Object.freeze({
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  MANAGER_APPROVED: 'ManagerApproved',
  HR_APPROVED: 'HRApproved',
  FINANCE_APPROVED: 'FinanceApproved',
  DISBURSED: 'Disbursed',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
});

const LOAN_APPROVAL_DECISION = Object.freeze({
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
});

/** Status after the single admin approval step. */
const STATUS_AFTER_LEVEL_APPROVAL = Object.freeze({
  1: LOAN_APPLICATION_STATUS.FINANCE_APPROVED,
});

/** All statuses waiting for admin review (includes legacy in-flight statuses). */
const PENDING_APPROVAL_STATUSES = Object.freeze([
  LOAN_APPLICATION_STATUS.SUBMITTED,
  LOAN_APPLICATION_STATUS.MANAGER_APPROVED,
  LOAN_APPLICATION_STATUS.HR_APPROVED,
]);

const QUEUE_STATUS_BY_LEVEL = Object.freeze({
  1: [...PENDING_APPROVAL_STATUSES],
});

const TERMINAL_STATUSES = Object.freeze([
  LOAN_APPLICATION_STATUS.CLOSED,
  LOAN_APPLICATION_STATUS.REJECTED,
]);

module.exports = {
  LOAN_MODULE,
  LOAN_APPLICATION_STATUS,
  LOAN_APPROVAL_DECISION,
  STATUS_AFTER_LEVEL_APPROVAL,
  QUEUE_STATUS_BY_LEVEL,
  PENDING_APPROVAL_STATUSES,
  TERMINAL_STATUSES,
};
