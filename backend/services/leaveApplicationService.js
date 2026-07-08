const mongoose = require('mongoose');
require('../models/Employee');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveType = require('../models/LeaveType');
const Holiday = require('../models/Holiday');
const AppError = require('../utils/AppError');
const { AUTO_NUMBER_PREFIXES } = require('../utils/autoNumberPrefixes');
const autoNumberService = require('./autoNumberService');
const { calculateLeaveDays } = require('./leaveCalculationService');
const { LEAVE_APPLICATION_STATUS } = require('../constants/leaveWorkflowStates');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

function tenantApplications(companyId) {
  return LeaveApplication.forTenant(companyId);
}

function validateCreatePayload(body = {}) {
  const { leaveTypeId, fromDate, toDate, reason } = body;

  if (!leaveTypeId || !mongoose.Types.ObjectId.isValid(leaveTypeId)) {
    throw new AppError('leaveTypeId is required', 400, 'VALIDATION_ERROR');
  }

  if (!fromDate || !toDate) {
    throw new AppError('fromDate and toDate are required', 400, 'VALIDATION_ERROR');
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new AppError('fromDate and toDate must be valid ISO dates', 400, 'VALIDATION_ERROR');
  }

  if (from > to) {
    throw new AppError('fromDate cannot be after toDate', 400, 'VALIDATION_ERROR');
  }

  return {
    leaveTypeId,
    fromDate: from,
    toDate: to,
    reason: reason ? String(reason).trim() : '',
  };
}

async function loadHolidayDates({ companyId, fromDate, toDate }) {
  const holidays = await Holiday.forTenant(companyId)
    .find({
      isActive: { $ne: false },
      date: { $gte: fromDate, $lte: toDate },
    })
    .select('date');

  return holidays.map((row) => row.date);
}

async function previewLeaveDays({ companyId, payload }) {
  const parsed = validateCreatePayload(payload);

  const leaveType = await LeaveType.forTenant(companyId).findById(parsed.leaveTypeId);
  if (!leaveType || !leaveType.isActive) {
    throw new AppError('Leave type not found or inactive', 404, 'NOT_FOUND');
  }

  const holidays = await loadHolidayDates({
    companyId,
    fromDate: parsed.fromDate,
    toDate: parsed.toDate,
  });

  const leaveDays = calculateLeaveDays({
    fromDate: parsed.fromDate,
    toDate: parsed.toDate,
    holidays,
    applySandwichRule: Boolean(leaveType.applySandwichRule),
  });

  return {
    leaveTypeId: leaveType._id,
    leaveTypeCode: leaveType.code,
    leaveTypeName: leaveType.name,
    applySandwichRule: Boolean(leaveType.applySandwichRule),
    fromDate: parsed.fromDate,
    toDate: parsed.toDate,
    ...leaveDays,
  };
}

async function createAndSubmit({ companyId, employeeId, payload }) {
  const preview = await previewLeaveDays({ companyId, payload });
  const parsed = validateCreatePayload(payload);

  const { autoNumber } = await autoNumberService.getNextAutoNumber(
    companyId,
    AUTO_NUMBER_PREFIXES.LEAVE_APPLICATION
  );

  return tenantApplications(companyId).create({
    applicationNo: autoNumber,
    employeeId,
    leaveTypeId: parsed.leaveTypeId,
    reason: parsed.reason,
    fromDate: parsed.fromDate,
    toDate: parsed.toDate,
    totalDays: preview.totalCalendarDays,
    workingDays: preview.workingDays,
    sandwichDaysApplied: preview.sandwichDaysApplied,
    status: LEAVE_APPLICATION_STATUS.SUBMITTED,
    submittedAt: new Date(),
  });
}

function parseStatusFilter(value) {
  if (!value) {
    return undefined;
  }

  const statuses = String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!statuses.length) {
    return undefined;
  }

  const allowed = Object.values(LEAVE_APPLICATION_STATUS);
  const invalid = statuses.filter((status) => !allowed.includes(status));

  if (invalid.length > 0) {
    throw new AppError(`Invalid status filter: ${invalid.join(', ')}`, 400, 'VALIDATION_ERROR');
  }

  return statuses;
}

async function listApplications({ companyId, query = {}, employeeId = null }) {
  const pagination = parsePagination(query);
  const filter = {};

  if (employeeId) {
    filter.employeeId = employeeId;
  }

  if (query.leaveTypeId) {
    filter.leaveTypeId = query.leaveTypeId;
  }

  const statuses = parseStatusFilter(query.status);
  if (statuses) {
    filter.status = { $in: statuses };
  }

  const baseQuery = tenantApplications(companyId)
    .find(filter)
    .sort({ createdAt: -1 })
    .populate('leaveTypeId', 'code name applySandwichRule')
    .populate('employeeId', 'employeeCode employeeName');

  const { docs, pagination: meta } = await executePaginatedQuery(baseQuery, pagination);

  return { items: docs, pagination: meta };
}

async function getApplicationById({ companyId, applicationId, employeeId = null }) {
  const application = await tenantApplications(companyId)
    .findById(applicationId)
    .populate('leaveTypeId', 'code name applySandwichRule')
    .populate('employeeId', 'employeeCode employeeName');

  if (!application) {
    throw new AppError('Leave application not found', 404, 'NOT_FOUND');
  }

  if (employeeId && String(application.employeeId?._id || application.employeeId) !== String(employeeId)) {
    throw new AppError('You can only view your own applications', 403, 'FORBIDDEN');
  }

  return application;
}

/**
 * Chargeable days used for balance deduction:
 * workingDays + sandwichDaysApplied (when rule applied at create time).
 */
function getChargeableDays(application) {
  const working = Number(application.workingDays) || 0;
  const sandwich = Number(application.sandwichDaysApplied) || 0;
  const chargeable = working + sandwich;
  return chargeable > 0 ? chargeable : Number(application.totalDays) || 0;
}

module.exports = {
  previewLeaveDays,
  createAndSubmit,
  listApplications,
  getApplicationById,
  getChargeableDays,
};
