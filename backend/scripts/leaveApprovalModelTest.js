/**
 * LeaveApproval model schema checks (Sheet 04 — Approval Workflow, row 14).
 *
 * Run: npm run test:leave-approval-model
 */
const LeaveApproval = require('../models/LeaveApproval');
const { LEAVE_APPROVAL_DECISION } = require('../constants/leaveWorkflowStates');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const schema = LeaveApproval.schema;
const decisionEnum = schema.path('decision').enumValues;
const escalationEnum = schema.path('escalationStatus').enumValues;

record(
  'decision enum includes Approved and Rejected',
  decisionEnum.includes(LEAVE_APPROVAL_DECISION.APPROVED) &&
    decisionEnum.includes(LEAVE_APPROVAL_DECISION.REJECTED)
);

record(
  'escalationStatus enum includes OnTime, Escalated, Overdue',
  escalationEnum.includes('OnTime') &&
    escalationEnum.includes('Escalated') &&
    escalationEnum.includes('Overdue')
);

const requiredPaths = [
  'applicationId',
  'applicationNo',
  'approverRole',
  'approverUserId',
  'decision',
];

record(
  'tracker fields are marked required',
  requiredPaths.every((path) => schema.path(path).isRequired)
);

record('applicationNo path exists', Boolean(schema.path('applicationNo')));
record('approvedAt path exists', Boolean(schema.path('approvedAt')));
record('remarks path defaults to empty string', schema.path('remarks').defaultValue === '');
record(
  'escalationStatus defaults to OnTime',
  schema.path('escalationStatus').defaultValue === 'OnTime'
);

const failed = results.filter((item) => !item.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exit(1);
}
