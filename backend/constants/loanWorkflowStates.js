/**
 * Loan application lifecycle (Sheet 03 — Approval Workflow).
 * Draft → Submitted → Manager → HR → Finance → Disbursed → Closed
 * Rejected is terminal from any approval stage.
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

/** Status reached after each approval level completes successfully. */
const STATUS_AFTER_LEVEL_APPROVAL = Object.freeze({
  1: LOAN_APPLICATION_STATUS.MANAGER_APPROVED,
  2: LOAN_APPLICATION_STATUS.HR_APPROVED,
  3: LOAN_APPLICATION_STATUS.FINANCE_APPROVED,
});

/** Application statuses visible in each approver's queue. */
const QUEUE_STATUS_BY_APPROVER_ROLE = Object.freeze({
  REPORTING_MANAGER: [LOAN_APPLICATION_STATUS.SUBMITTED],
  HR_OFFICER: [LOAN_APPLICATION_STATUS.MANAGER_APPROVED],
  FINANCE_OFFICER: [LOAN_APPLICATION_STATUS.HR_APPROVED],
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
  QUEUE_STATUS_BY_APPROVER_ROLE,
  TERMINAL_STATUSES,
};
