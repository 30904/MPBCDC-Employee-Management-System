const LoanApplication = require('../models/LoanApplication');
require('../models/Employee');

const LoanApproval = require('../models/LoanApproval');

const ApprovalMatrix = require('../models/ApprovalMatrix');

const AppError = require('../utils/AppError');

const {

  LOAN_MODULE,

  LOAN_APPROVAL_DECISION,

} = require('../constants/loanWorkflowStates');

const {

  canApprove,

  canAccessQueue,

  getNextApprover,

  getStatusAfterDecision,

  getQueueStatusesForRole,
  getAllPendingQueueStatuses,
} = require('../services/loanWorkflowService');

const loanApplicationService = require('../services/loanApplicationService');

const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');

const { ROLES } = require('../utils/roles');



const APPROVER_ROLES = [ROLES.CLIENT_ADMIN];



function tenantApplications(req) {

  return LoanApplication.forTenant(req.companyId);

}



async function loadLoanMatrix(companyId) {

  return ApprovalMatrix.forTenant(companyId).find({ module: LOAN_MODULE, isActive: { $ne: false } });

}



function getUserQueueRoles(user) {
  const roles = user?.roles ?? [];
  return APPROVER_ROLES.filter((role) => roles.includes(role) && role !== ROLES.CLIENT_ADMIN);
}



async function createApplication(req, res) {

  const employeeId = req.selfScope?.employeeId;



  if (!employeeId) {

    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');

  }



  const application = await loanApplicationService.createDraft({

    companyId: req.companyId,

    employeeId,

    payload: req.body,

  });



  return sendSuccess(res, application, 201);

}



async function submitApplication(req, res) {

  const employeeId = req.selfScope?.employeeId;



  if (!employeeId) {

    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');

  }



  const application = await loanApplicationService.submitApplication({

    companyId: req.companyId,

    employeeId,

    applicationId: req.params.id,

  });



  return sendSuccess(res, application);

}



async function listMyApplications(req, res) {

  const employeeId = req.selfScope?.employeeId;



  if (!employeeId) {

    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');

  }



  const { items, pagination } = await loanApplicationService.listApplications({

    companyId: req.companyId,

    query: req.query,

    employeeId,

  });



  return sendPaginatedSuccess(res, items, pagination);

}



async function listApplications(req, res) {

  const { items, pagination } = await loanApplicationService.listApplications({

    companyId: req.companyId,

    query: req.query,

  });



  return sendPaginatedSuccess(res, items, pagination);

}



async function getApplication(req, res) {

  const employeeId = req.user.roles.includes(ROLES.EMPLOYEE)

    ? req.selfScope?.employeeId

    : null;



  const application = await loanApplicationService.getApplicationById({

    companyId: req.companyId,

    applicationId: req.params.id,

    employeeId,

  });



  return sendSuccess(res, application);

}



async function listApprovalQueue(req, res) {

  const matrixRows = await loadLoanMatrix(req.companyId);

  const userRoles = getUserQueueRoles(req.user);

  const isClientAdmin = req.user.roles.includes(ROLES.CLIENT_ADMIN);

  const statuses = isClientAdmin
    ? getAllPendingQueueStatuses()
    : [...new Set(userRoles.flatMap((role) => getQueueStatusesForRole(role)))];



  const applications =
    statuses.length > 0
      ? await tenantApplications(req)
          .find({ status: { $in: statuses } })
          .populate('loanTypeId', 'code name')
          .populate('employeeId', 'employeeCode')
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

    queues: canAccessQueue(req.user, matrixRows),

    applications: enriched,

    workflow: matrixRows.sort((left, right) => left.level - right.level),

  });

}



async function recordApprovalDecision(req, res) {

  const { decision, remarks = '' } = req.body;



  if (![LOAN_APPROVAL_DECISION.APPROVED, LOAN_APPROVAL_DECISION.REJECTED].includes(decision)) {

    throw new AppError('decision must be Approved or Rejected', 400, 'VALIDATION_ERROR');

  }



  const application = await tenantApplications(req).findById(req.params.id);



  if (!application) {

    throw new AppError('Loan application not found', 404, 'NOT_FOUND');

  }



  const matrixRows = await loadLoanMatrix(req.companyId);

  const approvalCheck = canApprove(req.user, application, matrixRows);



  if (!approvalCheck.allowed) {

    throw new AppError(approvalCheck.reason, 403, 'APPROVAL_NOT_ALLOWED');

  }



  const nextStatus = getStatusAfterDecision(application, decision, matrixRows);

  const nextApproverRole =

    decision === LOAN_APPROVAL_DECISION.APPROVED

      ? getNextApprover({ ...application.toObject(), status: nextStatus }, matrixRows)

      : null;



  application.status = nextStatus;

  await application.save();



  const approval = await LoanApproval.forTenant(req.companyId).create({

    applicationId: application._id,

    approverRole: approvalCheck.approverRole,

    approverUserId: req.user.id,

    approvedAt: new Date(),

    decision,

    remarks,

    nextApproverRole,

  });



  return sendSuccess(res, {

    application,

    approval,

    nextApproverRole,

  });

}



module.exports = {

  createApplication,

  submitApplication,

  listMyApplications,

  listApplications,

  getApplication,

  listApprovalQueue,

  recordApprovalDecision,

};

