const {
  LOAN_APPLICATION_STATUS,
  LOAN_APPROVAL_DECISION,
  LOAN_MODULE,
  QUEUE_STATUS_BY_LEVEL,
  PENDING_APPROVAL_STATUSES,
  STATUS_AFTER_LEVEL_APPROVAL,
  TERMINAL_STATUSES,
} = require('../constants/loanWorkflowStates');
const { ROLES } = require('../utils/roles');

/** Single admin approval step when tenant has no configured rows. */
const DEFAULT_LOAN_APPROVAL_LEVELS = Object.freeze([
  { level: 1, approverRole: ROLES.CLIENT_ADMIN, slaDays: 5 },
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

  const primary = activeLoanRows[0];

  return [
    {
      level: 1,
      approverRole: ROLES.CLIENT_ADMIN,
      slaDays: primary.slaDays ?? 5,
      gradeId: primary.gradeId ?? null,
      code: primary.code ?? 'LOAN_DEFAULT',
    },
  ];
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
    return { allowed: false, reason: 'Application is already closed or rejected' };
  }

  if (!getLevelForStatus(application.status)) {
    return { allowed: false, reason: 'No pending approval step for this application' };
  }

  if (!hasRole(user, ROLES.CLIENT_ADMIN)) {
    return {
      allowed: false,
      reason: 'Only company admin can approve loan applications',
    };
  }

  return { allowed: true, approverRole: ROLES.CLIENT_ADMIN };
}

function getStatusAfterDecision(application, decision) {
  if (decision === LOAN_APPROVAL_DECISION.REJECTED) {
    return LOAN_APPLICATION_STATUS.REJECTED;
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

  const [level] = DEFAULT_LOAN_APPROVAL_LEVELS;

  return [
    {
      level: level.level,
      approverRole: level.approverRole,
      statuses: getQueueStatusesForLevel(level.level),
      slaDays: level.slaDays,
    },
  ];
}

module.exports = {
  DEFAULT_LOAN_APPROVAL_LEVELS,
  normalizeMatrixLevels,
  getNextApprover,
  canApprove,
  getStatusAfterDecision,
  getQueueStatusesForLevel,
  getQueueStatusesForRole,
  getAllPendingQueueStatuses,
  canAccessQueue,
};
