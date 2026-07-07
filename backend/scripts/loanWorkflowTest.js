/**
 * Loan workflow unit checks (no database).
 *
 * Run: npm run test:loan-workflow
 */
const { LOAN_APPLICATION_STATUS } = require('../constants/loanWorkflowStates');
const { ROLES } = require('../utils/roles');
const {
  getNextApprover,
  canApprove,
  getStatusAfterDecision,
  getQueueStatusesForRole,
  getAllPendingQueueStatuses,
} = require('../services/loanWorkflowService');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const clientAdmin = { roles: [ROLES.CLIENT_ADMIN] };
const employee = { roles: [ROLES.EMPLOYEE] };

const submitted = { status: LOAN_APPLICATION_STATUS.SUBMITTED };
const legacyManagerApproved = { status: LOAN_APPLICATION_STATUS.MANAGER_APPROVED };

record(
  'Submitted application routes to admin approver',
  getNextApprover(submitted) === ROLES.CLIENT_ADMIN
);

record(
  'Admin can approve submitted application',
  canApprove(clientAdmin, submitted).allowed === true
);

record(
  'Employee cannot approve submitted application',
  canApprove(employee, submitted).allowed === false
);

record(
  'Single approval advances submitted application to FinanceApproved',
  getStatusAfterDecision(submitted, 'Approved') === LOAN_APPLICATION_STATUS.FINANCE_APPROVED
);

record(
  'Legacy in-flight application can still be approved by admin',
  canApprove(clientAdmin, legacyManagerApproved).allowed === true
);

record(
  'Admin queue includes all pending statuses',
  getQueueStatusesForRole(ROLES.CLIENT_ADMIN).length === getAllPendingQueueStatuses().length
);

const failed = results.filter((item) => !item.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exit(1);
}
