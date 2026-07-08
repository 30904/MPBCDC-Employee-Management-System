/**
 * Leave workflow service checks (3-role system — admin approval only).
 *
 * Run: npm run test:leave-workflow
 */
const {
  LEAVE_APPLICATION_STATUS,
  LEAVE_APPROVAL_DECISION,
  LEAVE_MODULE,
} = require('../constants/leaveWorkflowStates');
const { ROLES } = require('../utils/roles');
const {
  DEFAULT_LEAVE_APPROVAL_LEVELS,
  WORKFLOW_FLOW,
  normalizeMatrixLevels,
  getEffectiveLevels,
  getNextApprover,
  canApprove,
  getStatusAfterDecision,
  getQueueStatusesForRole,
  isFullyApproved,
  shouldDeductBalance,
} = require('../services/leaveWorkflowService');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const admin = { roles: [ROLES.CLIENT_ADMIN] };
const employee = { roles: [ROLES.EMPLOYEE] };

const submitted = { status: LEAVE_APPLICATION_STATUS.SUBMITTED };
const legacyPending = { status: LEAVE_APPLICATION_STATUS.MANAGER_APPROVED };

record('Workflow flow uses admin approval', WORKFLOW_FLOW.includes('Admin'));
record('Default leave matrix has 1 admin level', DEFAULT_LEAVE_APPROVAL_LEVELS.length === 1);
record(
  'Default approver is CLIENT_ADMIN',
  DEFAULT_LEAVE_APPROVAL_LEVELS[0].approverRole === ROLES.CLIENT_ADMIN
);

record(
  'Empty matrix falls back to admin default',
  normalizeMatrixLevels([])[0].approverRole === ROLES.CLIENT_ADMIN
);

record(
  'Configured matrix normalizes to single admin level',
  normalizeMatrixLevels([
    {
      module: LEAVE_MODULE,
      level: 2,
      approverRole: ROLES.CLIENT_ADMIN,
      slaDays: 5,
      isActive: true,
      code: 'CUSTOM',
    },
  ])[0].slaDays === 5
);

record('Effective levels always return admin step', getEffectiveLevels([]).length === 1);

record(
  'Submitted application routes to CLIENT_ADMIN',
  getNextApprover(submitted) === ROLES.CLIENT_ADMIN
);

record('Admin can approve submitted application', canApprove(admin, submitted).allowed === true);

record('Employee cannot approve', canApprove(employee, submitted).allowed === false);

record(
  'Admin queue includes submitted applications',
  getQueueStatusesForRole(ROLES.CLIENT_ADMIN).includes(LEAVE_APPLICATION_STATUS.SUBMITTED)
);

record(
  'Legacy pending status still routes to admin',
  getNextApprover(legacyPending) === ROLES.CLIENT_ADMIN
);

record(
  'Admin can approve legacy pending applications',
  canApprove(admin, legacyPending).allowed === true
);

record(
  'Approval advances submitted to Approved',
  getStatusAfterDecision(submitted, LEAVE_APPROVAL_DECISION.APPROVED) ===
    LEAVE_APPLICATION_STATUS.APPROVED
);

record(
  'Rejection sets terminal Rejected status',
  getStatusAfterDecision(submitted, LEAVE_APPROVAL_DECISION.REJECTED) ===
    LEAVE_APPLICATION_STATUS.REJECTED
);

record('Rejection must not trigger balance deduction', shouldDeductBalance(LEAVE_APPROVAL_DECISION.REJECTED, LEAVE_APPLICATION_STATUS.REJECTED) === false);

record(
  'Approved status triggers balance deduction',
  shouldDeductBalance(LEAVE_APPROVAL_DECISION.APPROVED, LEAVE_APPLICATION_STATUS.APPROVED) === true
);

record(
  'Approved application is fully approved',
  isFullyApproved({ status: LEAVE_APPLICATION_STATUS.APPROVED }) === true
);

const failed = results.filter((item) => !item.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exit(1);
}
