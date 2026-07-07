const {
  LEAVE_APPLICATION_STATUS,
  LEAVE_APPROVAL_DECISION,
  LEAVE_MODULE,
  QUEUE_STATUS_BY_APPROVER_ROLE,
  STATUS_AFTER_LEVEL_APPROVAL,
  TERMINAL_STATUSES,
} = require('../constants/leaveWorkflowStates');
const { ROLES } = require('../utils/roles');

/**
 * Default 2-level leave matrix when tenant has no configured rows.
 * Employee → Reporting Manager (L1) → HR Officer (L2, skipped at runtime when leave type does not require HR).
 */
const DEFAULT_LEAVE_APPROVAL_LEVELS = Object.freeze([
  { level: 1, approverRole: ROLES.REPORTING_MANAGER, slaDays: 3 },
  { level: 2, approverRole: ROLES.HR_OFFICER, slaDays: 3 },
]);

const WORKFLOW_FLOW =
  'Submitted → Manager (L1) → HR (L2, optional per leave type) → Approved → Balance Update';

function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

function normalizeMatrixLevels(matrixRows = []) {
  const activeLeaveRows = matrixRows
    .filter((row) => row?.module === LEAVE_MODULE && row.isActive !== false)
    .sort((left, right) => left.level - right.level);

  if (activeLeaveRows.length === 0) {
    return [...DEFAULT_LEAVE_APPROVAL_LEVELS];
  }

  return activeLeaveRows.map((row) => ({
    level: row.level,
    approverRole: row.approverRole,
    slaDays: row.slaDays ?? 3,
    gradeId: row.gradeId ?? null,
    code: row.code,
  }));
}

/**
 * Levels that apply for a given leave type (HR step omitted when requiresHrApproval is false).
 */
function getEffectiveLevels(matrixRows = [], { requiresHrApproval = true } = {}) {
  const levels = normalizeMatrixLevels(matrixRows);

  if (requiresHrApproval) {
    return levels;
  }

  return levels.filter((row) => row.approverRole !== ROLES.HR_OFFICER);
}

function resolveRequiresHrApproval(application, options = {}) {
  if (options.requiresHrApproval !== undefined) {
    return Boolean(options.requiresHrApproval);
  }

  if (application?.requiresHrApproval !== undefined) {
    return Boolean(application.requiresHrApproval);
  }

  if (application?.leaveType?.requiresHrApproval !== undefined) {
    return Boolean(application.leaveType.requiresHrApproval);
  }

  return true;
}

function getLevelForStatus(status) {
  switch (status) {
    case LEAVE_APPLICATION_STATUS.SUBMITTED:
      return 1;
    case LEAVE_APPLICATION_STATUS.MANAGER_APPROVED:
      return 2;
    default:
      return null;
  }
}

/**
 * Next approver role for an in-flight application, or null if complete / not approvable.
 */
function getNextApprover(application, matrixRows = [], options = {}) {
  const requiresHrApproval = resolveRequiresHrApproval(application, options);
  const levels = getEffectiveLevels(matrixRows, { requiresHrApproval });
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
function canApprove(user, application, matrixRows = [], options = {}) {
  if (!user || !application) {
    return { allowed: false, reason: 'User and application are required' };
  }

  if (TERMINAL_STATUSES.includes(application.status)) {
    return { allowed: false, reason: 'Application is already approved or rejected' };
  }

  const nextApproverRole = getNextApprover(application, matrixRows, options);

  if (!nextApproverRole) {
    return { allowed: false, reason: 'No pending approval step for this application' };
  }

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
function getStatusAfterDecision(application, decision, matrixRows = [], options = {}) {
  if (decision === LEAVE_APPROVAL_DECISION.REJECTED) {
    return LEAVE_APPLICATION_STATUS.REJECTED;
  }

  const requiresHrApproval = resolveRequiresHrApproval(application, options);
  const levels = getEffectiveLevels(matrixRows, { requiresHrApproval });
  const pendingLevel = getLevelForStatus(application?.status);

  if (!pendingLevel) {
    return application?.status ?? null;
  }

  const isLastLevel = !levels.some((row) => row.level > pendingLevel);

  if (isLastLevel) {
    return LEAVE_APPLICATION_STATUS.APPROVED;
  }

  return STATUS_AFTER_LEVEL_APPROVAL[pendingLevel] ?? application?.status ?? null;
}

/**
 * Application statuses shown in a role's approval queue.
 */
function getQueueStatusesForRole(role) {
  return QUEUE_STATUS_BY_APPROVER_ROLE[role] ?? [];
}

function canAccessQueue(user, matrixRows = [], options = {}) {
  const requiresHrApproval = resolveRequiresHrApproval(options.application ?? {}, options);
  const levels = getEffectiveLevels(matrixRows, { requiresHrApproval });
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

function isFullyApproved(application) {
  return application?.status === LEAVE_APPLICATION_STATUS.APPROVED;
}

/**
 * Balance deduction runs only after final approval — never on rejection or intermediate steps.
 */
function shouldDeductBalance(decision, nextStatus) {
  if (decision === LEAVE_APPROVAL_DECISION.REJECTED) {
    return false;
  }

  return nextStatus === LEAVE_APPLICATION_STATUS.APPROVED;
}

module.exports = {
  WORKFLOW_FLOW,
  DEFAULT_LEAVE_APPROVAL_LEVELS,
  normalizeMatrixLevels,
  getEffectiveLevels,
  resolveRequiresHrApproval,
  getNextApprover,
  canApprove,
  getStatusAfterDecision,
  getQueueStatusesForRole,
  canAccessQueue,
  isFullyApproved,
  shouldDeductBalance,
};
