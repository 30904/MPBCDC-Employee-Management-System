/**
 * Leave application lifecycle (3-role system).
 * Submitted → Admin approval → Approved
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

/** Status after the single admin approval step. */
const STATUS_AFTER_LEVEL_APPROVAL = Object.freeze({
  1: LEAVE_APPLICATION_STATUS.APPROVED,
});

/** All statuses waiting for admin review (includes legacy in-flight statuses). */
const PENDING_APPROVAL_STATUSES = Object.freeze([
  LEAVE_APPLICATION_STATUS.SUBMITTED,
  LEAVE_APPLICATION_STATUS.MANAGER_APPROVED,
  LEAVE_APPLICATION_STATUS.HR_APPROVED,
]);

const QUEUE_STATUS_BY_LEVEL = Object.freeze({
  1: [...PENDING_APPROVAL_STATUSES],
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
  QUEUE_STATUS_BY_LEVEL,
  PENDING_APPROVAL_STATUSES,
  TERMINAL_STATUSES,
};
