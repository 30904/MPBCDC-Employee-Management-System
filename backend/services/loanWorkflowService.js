const {
  LOAN_APPLICATION_STATUS,
  LOAN_APPROVAL_DECISION,
  LOAN_MODULE,
  QUEUE_STATUS_BY_APPROVER_ROLE,
  STATUS_AFTER_LEVEL_APPROVAL,
  TERMINAL_STATUSES,
} = require('../constants/loanWorkflowStates');
const { ROLES } = require('../utils/roles');

/** Default 3-level loan matrix when tenant has no configured rows. */
const DEFAULT_LOAN_APPROVAL_LEVELS = Object.freeze([
  { level: 1, approverRole: ROLES.REPORTING_MANAGER, slaDays: 3 },
  { level: 2, approverRole: ROLES.HR_OFFICER, slaDays: 3 },
  { level: 3, approverRole: ROLES.FINANCE_OFFICER, slaDays: 5 },
]);

function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

function normalizeMatrixLevels(matrixRows = []) {
  const activeLoanRows = matrixRows
    .filter((row) => row?.module === LOAN_MODULE && row.isActive !== false)
    .sort((left, right) => left.level - right.level);

  if (activeLoanRows.length === 0) {
    return [...DEFAULT_LOAN_APPROVAL_LEVELS];
  }

  return activeLoanRows.map((row) => ({
    level: row.level,
    approverRole: row.approverRole,
    slaDays: row.slaDays ?? 3,
    gradeId: row.gradeId ?? null,
    code: row.code,
  }));
}

function getLevelForStatus(status) {
  switch (status) {
    case LOAN_APPLICATION_STATUS.SUBMITTED:
      return 1;
    case LOAN_APPLICATION_STATUS.MANAGER_APPROVED:
      return 2;
    case LOAN_APPLICATION_STATUS.HR_APPROVED:
      return 3;
    default:
      return null;
  }
}

/**
 * Next approver role for an in-flight application, or null if complete / not approvable.
 */
function getNextApprover(application, matrixRows = []) {
  const levels = normalizeMatrixLevels(matrixRows);
  const pendingLevel = getLevelForStatus(application?.status);

  if (!pendingLevel) {
    return null;
  }

  const step = levels.find((row) => row.level === pendingLevel);
  return step?.approverRole ?? null;
}

/**
 * Whether the user may act on the application at its current workflow step.
 */
function canApprove(user, application, matrixRows = []) {
  if (!user || !application) {
    return { allowed: false, reason: 'User and application are required' };
  }

  if (TERMINAL_STATUSES.includes(application.status)) {
    return { allowed: false, reason: 'Application is already closed or rejected' };
  }

  const nextApproverRole = getNextApprover(application, matrixRows);

  if (!nextApproverRole) {
    return { allowed: false, reason: 'No pending approval step for this application' };
  }

  // Company admin may act at any pending workflow step (typical for small tenants).
  if (hasRole(user, ROLES.CLIENT_ADMIN)) {
    return { allowed: true, approverRole: nextApproverRole };
  }

  if (!hasRole(user, nextApproverRole)) {
    return {
      allowed: false,
      reason: `Only ${nextApproverRole} can approve at this stage`,
    };
  }

  return { allowed: true, approverRole: nextApproverRole };
}

/**
 * Resolve application status after an approval decision.
 */
function getStatusAfterDecision(application, decision, matrixRows = []) {
  if (decision === LOAN_APPROVAL_DECISION.REJECTED) {
    return LOAN_APPLICATION_STATUS.REJECTED;
  }

  const levels = normalizeMatrixLevels(matrixRows);
  const pendingLevel = getLevelForStatus(application?.status);

  if (!pendingLevel) {
    return application?.status ?? null;
  }

  const nextStatus = STATUS_AFTER_LEVEL_APPROVAL[pendingLevel];

  if (!nextStatus) {
    return application?.status ?? null;
  }

  const hasMoreLevels = levels.some((row) => row.level > pendingLevel);

  if (!hasMoreLevels && pendingLevel === levels.length) {
    return nextStatus;
  }

  return nextStatus;
}

/**
 * Application statuses shown in a role's approval queue.
 */
function getQueueStatusesForRole(role) {
  return QUEUE_STATUS_BY_APPROVER_ROLE[role] ?? [];
}

function canAccessQueue(user, matrixRows = []) {
  const levels = normalizeMatrixLevels(matrixRows);
  const userRoles = user?.roles ?? [];

  if (hasRole(user, ROLES.CLIENT_ADMIN)) {
    return levels.map((row) => ({
      level: row.level,
      approverRole: row.approverRole,
      statuses: getQueueStatusesForRole(row.approverRole),
      slaDays: row.slaDays,
    }));
  }

  return levels
    .filter((row) => userRoles.includes(row.approverRole))
    .map((row) => ({
      level: row.level,
      approverRole: row.approverRole,
      statuses: getQueueStatusesForRole(row.approverRole),
      slaDays: row.slaDays,
    }));
}

module.exports = {
  DEFAULT_LOAN_APPROVAL_LEVELS,
  normalizeMatrixLevels,
  getNextApprover,
  canApprove,
  getStatusAfterDecision,
  getQueueStatusesForRole,
  canAccessQueue,
};
