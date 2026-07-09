const LeaveApplication = require('../models/LeaveApplication');
const LeaveApproval = require('../models/LeaveApproval');
const ApprovalMatrix = require('../models/ApprovalMatrix');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const leaveApplicationService = require('../services/leaveApplicationService');
const {
  LEAVE_MODULE,
  LEAVE_APPROVAL_DECISION,
} = require('../constants/leaveWorkflowStates');
const {
  canApprove,
  canAccessQueue,
  getNextApprover,
  getStatusAfterDecision,
  getAllPendingQueueStatuses,
  shouldDeductBalance,
} = require('../services/leaveWorkflowService');
const leaveBalanceService = require('../services/leaveBalanceService');
const notificationService = require('../services/notificationService');

function tenantApplications(req) {
  return LeaveApplication.forTenant(req.companyId);
}

async function loadLeaveMatrix(companyId) {
  return ApprovalMatrix.forTenant(companyId).find({ module: LEAVE_MODULE, isActive: { $ne: false } });
}

async function listApplications(req, res) {
  const { items, pagination } = await leaveApplicationService.listApplications({
    companyId: req.companyId,
    query: req.query,
  });

  return sendPaginatedSuccess(res, items, pagination);
}

async function getApplication(req, res) {
  const application = await leaveApplicationService.getApplicationById({
    companyId: req.companyId,
    applicationId: req.params.id,
  });

  return sendSuccess(res, application);
}

async function listApprovalQueue(req, res) {
  const matrixRows = await loadLeaveMatrix(req.companyId);
  const statuses = getAllPendingQueueStatuses();

  const applications =
    statuses.length > 0
      ? await tenantApplications(req)
          .find({ status: { $in: statuses } })
          .populate('leaveTypeId', 'code name')
          .populate('employeeId', 'employeeCode employeeName')
          .sort({ updatedAt: -1 })
      : [];

  const enriched = applications.map((application) => {
    const approvalCheck = canApprove(req.user, application, matrixRows);

    return {
      ...application.toObject(),
      nextApproverRole: 'Admin',
      canCurrentUserApprove: approvalCheck.allowed,
      approvalBlockReason: approvalCheck.allowed ? null : approvalCheck.reason,
    };
  });

  return sendSuccess(res, {
    queues: canAccessQueue(req.user),
    applications: enriched,
    workflow: matrixRows.sort((left, right) => left.level - right.level),
  });
}

async function recordApprovalDecision(req, res) {
  const { decision, remarks = '' } = req.body;

  if (![LEAVE_APPROVAL_DECISION.APPROVED, LEAVE_APPROVAL_DECISION.REJECTED].includes(decision)) {
    throw new AppError('decision must be Approved or Rejected', 400, 'VALIDATION_ERROR');
  }

  const application = await tenantApplications(req).findById(req.params.id);

  if (!application) {
    throw new AppError('Leave application not found', 404, 'NOT_FOUND');
  }

  const matrixRows = await loadLeaveMatrix(req.companyId);
  const approvalCheck = canApprove(req.user, application, matrixRows);

  if (!approvalCheck.allowed) {
    throw new AppError(approvalCheck.reason, 403, 'APPROVAL_NOT_ALLOWED');
  }

  const nextStatus = getStatusAfterDecision(application, decision, matrixRows);
  const nextApproverRole =
    decision === LEAVE_APPROVAL_DECISION.APPROVED
      ? getNextApprover({ ...application.toObject(), status: nextStatus }, matrixRows)
      : null;

  let balance = null;

  if (shouldDeductBalance(decision, nextStatus)) {
    balance = await leaveBalanceService.deductOnApproval({
      companyId: req.companyId,
      employeeId: application.employeeId,
      leaveTypeId: application.leaveTypeId,
      days: leaveApplicationService.getChargeableDays(application),
      fromDate: application.fromDate,
      applicationNo: application.applicationNo,
    });

    application.balanceAfter = Number(balance?.closingBalance ?? application.balanceAfter);
  }

  application.status = nextStatus;
  await application.save();

  const approval = await LeaveApproval.forTenant(req.companyId).create({
    applicationId: application._id,
    applicationNo: application.applicationNo,
    approverRole: approvalCheck.approverRole,
    approverUserId: req.user.id,
    approvedAt: new Date(),
    decision,
    remarks,
    nextApproverRole,
  });

  const decisionLabel = decision === LEAVE_APPROVAL_DECISION.APPROVED ? 'approved' : 'rejected';
  await notificationService.notifyEmployee({
    companyId: req.companyId,
    employeeId: application.employeeId,
    title: `Leave ${decisionLabel}`,
    message: `Your leave application ${application.applicationNo} was ${decisionLabel}.`,
    entityType: 'LEAVE_APPLICATION',
    entityId: application._id,
  });

  return sendSuccess(res, {
    application,
    approval,
    nextApproverRole,
    balance,
  });
}

module.exports = {
  listApplications,
  getApplication,
  listApprovalQueue,
  recordApprovalDecision,
};
