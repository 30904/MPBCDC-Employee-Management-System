const {
  LEAVE_APPLICATION_STATUS,
  LEAVE_APPROVAL_DECISION,
  LEAVE_MODULE,
  PENDING_APPROVAL_STATUSES,
  QUEUE_STATUS_BY_LEVEL,
  STATUS_AFTER_LEVEL_APPROVAL,
  TERMINAL_STATUSES,
} = require('../constants/leaveWorkflowStates');
const { ROLES } = require('../utils/roles');

/** Single admin approval step when tenant has no configured rows. */
const DEFAULT_LEAVE_APPROVAL_LEVELS = Object.freeze([
  { level: 1, approverRole: ROLES.CLIENT_ADMIN, slaDays: 3 },
]);

const WORKFLOW_FLOW = 'Submitted → Admin approval → Approved → Balance Update';

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

  const primary = activeLeaveRows[0];

  return [
    {
      level: 1,
      approverRole: ROLES.CLIENT_ADMIN,
      slaDays: primary.slaDays ?? 3,
      gradeId: primary.gradeId ?? null,
      code: primary.code ?? 'LEAVE_DEFAULT',
    },
  ];
}

function getEffectiveLevels(matrixRows = []) {
  return normalizeMatrixLevels(matrixRows);
}

function getLevelForStatus(status) {
  if (PENDING_APPROVAL_STATUSES.includes(status)) {
    return 1;
  }

  return null;
}

function getNextApprover(application) {
  const pendingLevel = getLevelForStatus(application?.status);

  if (!pendingLevel) {
    return null;
  }

  return ROLES.CLIENT_ADMIN;
}

function canApprove(user, application) {
  if (!user || !application) {
    return { allowed: false, reason: 'User and application are required' };
  }

  if (TERMINAL_STATUSES.includes(application.status)) {
    return { allowed: false, reason: 'Application is already approved or rejected' };
  }

  if (!getLevelForStatus(application.status)) {
    return { allowed: false, reason: 'No pending approval step for this application' };
  }

  if (!hasRole(user, ROLES.CLIENT_ADMIN)) {
    return {
      allowed: false,
      reason: 'Only company admin can approve leave applications',
    };
  }

  return { allowed: true, approverRole: ROLES.CLIENT_ADMIN };
}

function getStatusAfterDecision(application, decision) {
  if (decision === LEAVE_APPROVAL_DECISION.REJECTED) {
    return LEAVE_APPLICATION_STATUS.REJECTED;
  }

  const pendingLevel = getLevelForStatus(application?.status);

  if (!pendingLevel) {
    return application?.status ?? null;
  }

  return STATUS_AFTER_LEVEL_APPROVAL[pendingLevel];
}

function getQueueStatusesForLevel(level) {
  return QUEUE_STATUS_BY_LEVEL[level] ?? [];
}

function getAllPendingQueueStatuses() {
  return [...PENDING_APPROVAL_STATUSES];
}

function getQueueStatusesForRole(role) {
  if (role === ROLES.CLIENT_ADMIN) {
    return getAllPendingQueueStatuses();
  }

  return [];
}

function canAccessQueue(user) {
  if (!hasRole(user, ROLES.CLIENT_ADMIN)) {
    return [];
  }

  const [level] = DEFAULT_LEAVE_APPROVAL_LEVELS;

  return [
    {
      level: level.level,
      approverRole: level.approverRole,
      statuses: getQueueStatusesForLevel(level.level),
      slaDays: level.slaDays,
    },
  ];
}

function isFullyApproved(application) {
  return application?.status === LEAVE_APPLICATION_STATUS.APPROVED;
}

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
  getNextApprover,
  canApprove,
  getStatusAfterDecision,
  getQueueStatusesForLevel,
  getQueueStatusesForRole,
  getAllPendingQueueStatuses,
  canAccessQueue,
  isFullyApproved,
  shouldDeductBalance,
};
