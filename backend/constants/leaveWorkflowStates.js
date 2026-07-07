/**
 * Leave application lifecycle (Sheet 04 — Approval Workflow, row 13).
 * Submitted → Manager → HR (optional per leave type) → Approved
 * Rejected is terminal from any approval stage.
 */

const LEAVE_MODULE = 'LEAVE';

const LEAVE_APPLICATION_STATUS = Object.freeze({
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  MANAGER_APPROVED: 'ManagerApproved',
  HR_APPROVED: 'HRApproved',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
});

const LEAVE_APPROVAL_DECISION = Object.freeze({
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
});

/** Status reached after each approval level completes successfully. */
const STATUS_AFTER_LEVEL_APPROVAL = Object.freeze({
  1: LEAVE_APPLICATION_STATUS.MANAGER_APPROVED,
  2: LEAVE_APPLICATION_STATUS.APPROVED,
});

/** Application statuses visible in each approver's queue. */
const QUEUE_STATUS_BY_APPROVER_ROLE = Object.freeze({
  REPORTING_MANAGER: [LEAVE_APPLICATION_STATUS.SUBMITTED],
  HR_OFFICER: [LEAVE_APPLICATION_STATUS.MANAGER_APPROVED],
});

const TERMINAL_STATUSES = Object.freeze([
  LEAVE_APPLICATION_STATUS.APPROVED,
  LEAVE_APPLICATION_STATUS.REJECTED,
]);

module.exports = {
  LEAVE_MODULE,
  LEAVE_APPLICATION_STATUS,
  LEAVE_APPROVAL_DECISION,
  STATUS_AFTER_LEVEL_APPROVAL,
  QUEUE_STATUS_BY_APPROVER_ROLE,
  TERMINAL_STATUSES,
};
