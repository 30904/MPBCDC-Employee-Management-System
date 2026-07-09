const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const loanApplicationService = require('../services/loanApplicationService');
const loanDisbursementService = require('../services/loanDisbursementService');
const leaveApplicationService = require('../services/leaveApplicationService');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/LeaveType');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');
require('../models/Employee');
require('../models/LeaveType');

async function leaveTypeOptions(req, res) {
  const options = await LeaveType.forTenant(req.companyId)
    .find({ isActive: true })
    .sort({ code: 1 })
    .select('_id code name applySandwichRule allowsHalfDay');

  return sendSuccess(res, options);
}

async function previewLeave(req, res) {
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  const preview = await leaveApplicationService.previewLeaveDays({
    companyId: req.companyId,
    payload: {
      employeeId,
      leaveTypeId: req.query.leaveTypeId || req.body?.leaveTypeId,
      fromDate: req.query.fromDate || req.body?.fromDate,
      toDate: req.query.toDate || req.body?.toDate,
      reason: req.body?.reason,
      isHalfDay: req.query.isHalfDay || req.body?.isHalfDay,
    },
  });

  return sendSuccess(res, preview);
}

async function applyLeave(req, res) {
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  const application = await leaveApplicationService.createAndSubmit({
    companyId: req.companyId,
    employeeId,
    payload: req.body,
  });

  return sendSuccess(res, application, 201);
}

async function createLeaveDraft(req, res) {
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  const application = await leaveApplicationService.createDraft({
    companyId: req.companyId,
    employeeId,
    payload: req.body,
  });

  return sendSuccess(res, application, 201);
}

async function submitLeaveDraft(req, res) {
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  const application = await leaveApplicationService.submitApplication({
    companyId: req.companyId,
    employeeId,
    applicationId: req.params.id,
  });

  return sendSuccess(res, application);
}

async function leaveHistory(req, res) {
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  const { items, pagination } = await leaveApplicationService.listApplications({
    companyId: req.companyId,
    query: req.query,
    employeeId,
  });

  return sendPaginatedSuccess(res, items, pagination);
}

async function leaveBalance(req, res) {
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  const pagination = parsePagination(req.query);
  const filter = { employeeId };

  if (req.query.period) {
    filter.period = String(req.query.period).trim();
  }

  if (req.query.leaveTypeId) {
    filter.leaveTypeId = req.query.leaveTypeId;
  }

  const query = LeaveBalance.forTenant(req.companyId)
    .find(filter)
    .populate('leaveTypeId', 'code name')
    .sort({ period: -1, updatedAt: -1 });

  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);
  return sendPaginatedSuccess(res, docs, meta);
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

async function updateRepaymentScheduleEmi(req, res) {
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  const emiAmount = Number(req.body?.emiAmount);
  if (!Number.isFinite(emiAmount) || emiAmount < 0) {
    throw new AppError('emiAmount must be zero or greater', 400, 'VALIDATION_ERROR');
  }

  const result = await loanDisbursementService.updateScheduleEmi({
    companyId: req.companyId,
    applicationId: req.params.id,
    employeeId,
    emiNo: req.params.emiNo,
    emiAmount,
  });

  return sendSuccess(res, result);
}

module.exports = {
  leaveTypeOptions,
  previewLeave,
  applyLeave,
  createLeaveDraft,
  submitLeaveDraft,
  leaveHistory,
  leaveBalance,
  applyLoan,
  appliedLoans,
  repaymentSchedule,
  updateRepaymentScheduleEmi,
};