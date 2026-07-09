const LeaveBalance = require('../models/LeaveBalance');
require('../models/Employee');
require('../models/LeaveType');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');
const leaveBalanceService = require('../services/leaveBalanceService');

function tenantLeaveBalances(req) {
  return LeaveBalance.forTenant(req.companyId);
}

async function listLeaveBalances(req, res) {
  const pagination = parsePagination(req.query);
  const filter = {};

  if (req.query.employeeId) {
    filter.employeeId = req.query.employeeId;
  }

  if (req.query.leaveTypeId) {
    filter.leaveTypeId = req.query.leaveTypeId;
  }

  if (req.query.period) {
    filter.period = String(req.query.period).trim();
  }

  const query = tenantLeaveBalances(req)
    .find(filter)
    .populate('employeeId', 'employeeCode employeeName')
    .populate('leaveTypeId', 'code name')
    .sort({ period: -1, updatedAt: -1 });

  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);
  return sendPaginatedSuccess(res, docs, meta);
}

async function myLeaveBalances(req, res) {
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

  const query = tenantLeaveBalances(req)
    .find(filter)
    .populate('leaveTypeId', 'code name')
    .sort({ period: -1, updatedAt: -1 });

  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);
  return sendPaginatedSuccess(res, docs, meta);
}

async function runYearEndClose(req, res) {
  const sourcePeriodYear = Number(req.body?.sourcePeriodYear);
  const targetPeriodYear = Number(req.body?.targetPeriodYear || sourcePeriodYear + 1);
  const encashableCarryForwardPercent = Number(req.body?.encashableCarryForwardPercent || 0);
  const employeeIds = req.body?.employeeIds || [];

  if (!Number.isInteger(sourcePeriodYear) || sourcePeriodYear < 2000) {
    throw new AppError('sourcePeriodYear must be a valid year', 400, 'VALIDATION_ERROR');
  }

  if (!Number.isInteger(targetPeriodYear) || targetPeriodYear <= sourcePeriodYear) {
    throw new AppError('targetPeriodYear must be greater than sourcePeriodYear', 400, 'VALIDATION_ERROR');
  }

  if (!Number.isFinite(encashableCarryForwardPercent) || encashableCarryForwardPercent < 0) {
    throw new AppError(
      'encashableCarryForwardPercent must be a non-negative number',
      400,
      'VALIDATION_ERROR'
    );
  }

  if (!Array.isArray(employeeIds)) {
    throw new AppError('employeeIds must be an array when provided', 400, 'VALIDATION_ERROR');
  }

  const result = await leaveBalanceService.closeYearEnd({
    companyId: req.companyId,
    sourcePeriodYear,
    targetPeriodYear,
    encashableCarryForwardPercent,
    employeeIds,
  });

  return sendSuccess(res, result);
}

module.exports = {
  listLeaveBalances,
  myLeaveBalances,
  runYearEndClose,
};
