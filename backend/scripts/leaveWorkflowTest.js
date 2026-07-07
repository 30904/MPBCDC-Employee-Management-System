/**
 * Leave workflow service checks (Sheet 04 — Approval Workflow, rows 13 & 15).
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

const manager = { roles: [ROLES.REPORTING_MANAGER] };
const hr = { roles: [ROLES.HR_OFFICER] };
const clientAdmin = { roles: [ROLES.CLIENT_ADMIN] };

const submittedHrRequired = { status: LEAVE_APPLICATION_STATUS.SUBMITTED, requiresHrApproval: true };
const submittedNoHr = { status: LEAVE_APPLICATION_STATUS.SUBMITTED, requiresHrApproval: false };
const managerApproved = {
  status: LEAVE_APPLICATION_STATUS.MANAGER_APPROVED,
  requiresHrApproval: true,
};

record('Workflow flow documents Manager then optional HR', WORKFLOW_FLOW.includes('Manager'));
record('Default leave matrix has 2 levels', DEFAULT_LEAVE_APPROVAL_LEVELS.length === 2);
record(
  'Level 1 is REPORTING_MANAGER',
  DEFAULT_LEAVE_APPROVAL_LEVELS[0].approverRole === ROLES.REPORTING_MANAGER
);
record('Level 2 is HR_OFFICER', DEFAULT_LEAVE_APPROVAL_LEVELS[1].approverRole === ROLES.HR_OFFICER);

record(
  'Empty matrix falls back to default levels',
  normalizeMatrixLevels([]).length === 2 &&
    normalizeMatrixLevels([])[0].approverRole === ROLES.REPORTING_MANAGER
);

record(
  'Tenant LEAVE rows override defaults',
  normalizeMatrixLevels([
    {
      module: LEAVE_MODULE,
      level: 1,
      approverRole: ROLES.REPORTING_MANAGER,
      slaDays: 5,
      isActive: true,
      code: 'CUSTOM',
    },
  ])[0].slaDays === 5
);

record(
  'HR level omitted when requiresHrApproval is false',
  getEffectiveLevels([], { requiresHrApproval: false }).length === 1 &&
    getEffectiveLevels([], { requiresHrApproval: false })[0].approverRole === ROLES.REPORTING_MANAGER
);

record(
  'Both levels kept when requiresHrApproval is true',
  getEffectiveLevels([], { requiresHrApproval: true }).length === 2
);

record(
  'Submitted application routes to REPORTING_MANAGER next',
  getNextApprover(submittedHrRequired) === ROLES.REPORTING_MANAGER
);

record(
  'Manager can approve Submitted application',
  canApprove(manager, submittedHrRequired).allowed === true
);

record(
  'HR cannot approve before Manager',
  canApprove(hr, submittedHrRequired).allowed === false
);

record(
  'Client admin can approve Submitted application',
  canApprove(clientAdmin, submittedHrRequired).allowed === true
);

record(
  'Client admin approval acts as current workflow role',
  canApprove(clientAdmin, submittedHrRequired).approverRole === ROLES.REPORTING_MANAGER
);

record(
  'HR queue only shows ManagerApproved applications',
  getQueueStatusesForRole(ROLES.HR_OFFICER).includes(LEAVE_APPLICATION_STATUS.MANAGER_APPROVED) &&
    !getQueueStatusesForRole(ROLES.HR_OFFICER).includes(LEAVE_APPLICATION_STATUS.SUBMITTED)
);

record(
  'HR can approve after Manager approval when HR is required',
  canApprove(hr, managerApproved).allowed === true
);

record(
  'Manager approval with HR required advances to ManagerApproved',
  getStatusAfterDecision(submittedHrRequired, LEAVE_APPROVAL_DECISION.APPROVED) ===
    LEAVE_APPLICATION_STATUS.MANAGER_APPROVED
);

record(
  'Manager approval without HR requirement advances directly to Approved',
  getStatusAfterDecision(submittedNoHr, LEAVE_APPROVAL_DECISION.APPROVED) ===
    LEAVE_APPLICATION_STATUS.APPROVED
);

record(
  'HR approval after Manager advances to Approved',
  getStatusAfterDecision(managerApproved, LEAVE_APPROVAL_DECISION.APPROVED) ===
    LEAVE_APPLICATION_STATUS.APPROVED
);

record(
  'ManagerApproved is not fully approved — waits for HR',
  isFullyApproved({ status: LEAVE_APPLICATION_STATUS.MANAGER_APPROVED }) === false
);

record(
  'Rejection sets terminal Rejected status',
  getStatusAfterDecision(submittedHrRequired, LEAVE_APPROVAL_DECISION.REJECTED) ===
    LEAVE_APPLICATION_STATUS.REJECTED
);

record(
  'Rejection must not trigger balance deduction',
  shouldDeductBalance(LEAVE_APPROVAL_DECISION.REJECTED, LEAVE_APPLICATION_STATUS.REJECTED) === false
);

record(
  'ManagerApproved intermediate step must not trigger balance deduction',
  shouldDeductBalance(
    LEAVE_APPROVAL_DECISION.APPROVED,
    LEAVE_APPLICATION_STATUS.MANAGER_APPROVED
  ) === false
);

record(
  'Final Approved status triggers balance deduction',
  shouldDeductBalance(LEAVE_APPROVAL_DECISION.APPROVED, LEAVE_APPLICATION_STATUS.APPROVED) === true
);

record(
  'HR cannot approve CL/SL path before manager even if HR tries early',
  canApprove(hr, submittedNoHr).allowed === false
);

const failed = results.filter((item) => !item.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exit(1);
}
