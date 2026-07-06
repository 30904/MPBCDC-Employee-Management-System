const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const loanApplicationService = require('../services/loanApplicationService');
const loanDisbursementService = require('../services/loanDisbursementService');

function buildResponse(req, moduleName, action, extra = {}) {
  return {
    module: moduleName,
    action,
    companyId: req.selfScope?.companyId || req.companyId || null,
    employeeId: req.selfScope?.employeeId || null,
    userId: req.selfScope?.userId || null,
    ...extra,
  };
}

async function applyLeave(req, res) {
  return sendSuccess(
    res,
    buildResponse(req, 'leave', 'apply', {
      requestedEmployeeId: req.body?.employeeId || null,
    }),
    201
  );
}

async function leaveHistory(req, res) {
  return sendSuccess(res, buildResponse(req, 'leave', 'history'));
}

async function leaveBalance(req, res) {
  return sendSuccess(res, buildResponse(req, 'leave', 'balance'));
}

async function applyLoan(req, res) {
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  const application = await loanApplicationService.createAndSubmit({
    companyId: req.companyId,
    employeeId,
    payload: req.body,
  });

  return sendSuccess(res, application, 201);
}

async function appliedLoans(req, res) {
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

async function repaymentSchedule(req, res) {
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  const result = await loanDisbursementService.getScheduleForApplication({
    companyId: req.companyId,
    applicationId: req.params.id,
    employeeId,
  });

  return sendSuccess(res, result);
}

module.exports = {
  applyLeave,
  leaveHistory,
  leaveBalance,
  applyLoan,
  appliedLoans,
  repaymentSchedule,
};