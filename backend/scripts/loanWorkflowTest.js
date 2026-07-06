/**
 * Loan workflow service checks (Sheet 03 — Approval Workflow).
 *
 * Run: npm run test:loan-workflow
 */
const {
  LOAN_APPLICATION_STATUS,
  LOAN_APPROVAL_DECISION,
} = require('../constants/loanWorkflowStates');
const { ROLES } = require('../utils/roles');
const {
  getNextApprover,
  canApprove,
  getStatusAfterDecision,
  getQueueStatusesForRole,
} = require('../services/loanWorkflowService');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const manager = { roles: [ROLES.REPORTING_MANAGER] };
const hr = { roles: [ROLES.HR_OFFICER] };
const finance = { roles: [ROLES.FINANCE_OFFICER] };

const submitted = { status: LOAN_APPLICATION_STATUS.SUBMITTED };
const managerApproved = { status: LOAN_APPLICATION_STATUS.MANAGER_APPROVED };
const hrApproved = { status: LOAN_APPLICATION_STATUS.HR_APPROVED };

record(
  'Submitted application routes to REPORTING_MANAGER next',
  getNextApprover(submitted) === ROLES.REPORTING_MANAGER
);

record(
  'Manager can approve Submitted application',
  canApprove(manager, submitted).allowed === true
);

record(
  'HR cannot approve before Manager',
  canApprove(hr, submitted).allowed === false
);

const clientAdmin = { roles: [ROLES.CLIENT_ADMIN] };

record(
  'Client admin can approve Submitted application',
  canApprove(clientAdmin, submitted).allowed === true
);

record(
  'Client admin approval acts as current workflow role',
  canApprove(clientAdmin, submitted).approverRole === ROLES.REPORTING_MANAGER
);

record(
  'HR queue only shows ManagerApproved applications',
  getQueueStatusesForRole(ROLES.HR_OFFICER).includes(LOAN_APPLICATION_STATUS.MANAGER_APPROVED) &&
    !getQueueStatusesForRole(ROLES.HR_OFFICER).includes(LOAN_APPLICATION_STATUS.SUBMITTED)
);

record(
  'HR can approve after Manager approval',
  canApprove(hr, managerApproved).allowed === true
);

record(
  'Finance can approve after HR approval',
  canApprove(finance, hrApproved).allowed === true
);

record(
  'Finance cannot approve before HR',
  canApprove(finance, managerApproved).allowed === false
);

record(
  'Approval advances Submitted to ManagerApproved',
  getStatusAfterDecision(submitted, LOAN_APPROVAL_DECISION.APPROVED) ===
    LOAN_APPLICATION_STATUS.MANAGER_APPROVED
);

record(
  'Rejection sets terminal Rejected status',
  getStatusAfterDecision(submitted, LOAN_APPROVAL_DECISION.REJECTED) ===
    LOAN_APPLICATION_STATUS.REJECTED
);

const failed = results.filter((item) => !item.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exit(1);
}
