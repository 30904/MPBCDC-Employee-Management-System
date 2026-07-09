const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Region = require('../models/Region');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveType = require('../models/LeaveType');
const Holiday = require('../models/Holiday');
const LeaveBalance = require('../models/LeaveBalance');
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
  const { leaveTypeId, fromDate, toDate, reason, isHalfDay, attachmentPath } = body;

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

  const halfDay = isHalfDay === true || isHalfDay === 'true';
  if (halfDay && from.toDateString() !== to.toDateString()) {
    throw new AppError('Half-day leave must have same fromDate and toDate', 400, 'VALIDATION_ERROR');
  }

  return {
    leaveTypeId,
    fromDate: from,
    toDate: to,
    reason: reason ? String(reason).trim() : '',
    isHalfDay: halfDay,
    attachmentPath: attachmentPath ? String(attachmentPath).trim() : '',
  };
}

async function resolveEmployeeRegionId({ companyId, employeeId }) {
  if (!employeeId) {
    return null;
  }

  const employee = await Employee.findOne({ _id: employeeId, companyId }).select('region');
  if (!employee?.region) {
    return null;
  }

  const regionValue = String(employee.region).trim();
  const region = await Region.forTenant(companyId)
    .findOne({
      $or: [{ code: regionValue.toUpperCase() }, { name: regionValue }],
    })
    .select('_id');

  return region?._id ?? null;
}

async function loadHolidayDates({ companyId, fromDate, toDate, regionId = null }) {
  const orClauses = [{ holidayType: 'NATIONAL' }];

  if (regionId) {
    orClauses.push({ holidayType: 'REGIONAL', regionId });
    orClauses.push({
      holidayType: 'OPTIONAL',
      $or: [{ regionId: null }, { regionId }],
    });
  } else {
    orClauses.push({ holidayType: 'OPTIONAL', regionId: null });
  }

  const holidays = await Holiday.forTenant(companyId)
    .find({
      isActive: { $ne: false },
      date: { $gte: fromDate, $lte: toDate },
      $or: orClauses,
    })
    .select('date');

  return holidays.map((row) => row.date);
}

async function resolveBalanceBefore({ companyId, employeeId, leaveTypeId, period }) {
  if (!employeeId) {
    return 0;
  }

  const currentBalance = await LeaveBalance.forTenant(companyId).findOne({
    employeeId,
    leaveTypeId,
    period,
  });

  if (!currentBalance) {
    return 0;
  }

  return Number(currentBalance.closingBalance || 0);
}

function assertHalfDayAllowed(leaveType, isHalfDay) {
  if (isHalfDay && leaveType.allowsHalfDay === false) {
    throw new AppError('Half-day leave is not allowed for this leave type', 400, 'VALIDATION_ERROR');
  }
}

async function buildLeavePreview({ companyId, payload, employeeId = null, requireSufficientBalance = false }) {
  const parsed = validateCreatePayload(payload);

  const leaveType = await LeaveType.forTenant(companyId).findById(parsed.leaveTypeId);
  if (!leaveType || !leaveType.isActive) {
    throw new AppError('Leave type not found or inactive', 404, 'NOT_FOUND');
  }

  assertHalfDayAllowed(leaveType, parsed.isHalfDay);

  const regionId = await resolveEmployeeRegionId({ companyId, employeeId });
  const holidays = await loadHolidayDates({
    companyId,
    fromDate: parsed.fromDate,
    toDate: parsed.toDate,
    regionId,
  });

  const leaveDays = calculateLeaveDays({
    fromDate: parsed.fromDate,
    toDate: parsed.toDate,
    holidays,
    applySandwichRule: Boolean(leaveType.applySandwichRule),
    regionId,
  });

  let chargeableDays = Number(leaveDays.chargeableDays || 0);
  if (parsed.isHalfDay) {
    if (chargeableDays < 1) {
      throw new AppError('Half-day leave cannot be applied on non-working/non-chargeable date', 400, 'VALIDATION_ERROR');
    }
    chargeableDays = 0.5;
  }

  const period = String(parsed.fromDate.getFullYear());
  const balanceBefore = await resolveBalanceBefore({
    companyId,
    employeeId,
    leaveTypeId: leaveType._id,
    period,
  });

  const balanceAfter = Number((balanceBefore - chargeableDays).toFixed(2));
  const sufficientBalance = balanceAfter >= 0;

  if (requireSufficientBalance && !sufficientBalance) {
    throw new AppError(
      `Insufficient leave balance. Available: ${balanceBefore}, required: ${chargeableDays}`,
      400,
      'INSUFFICIENT_LEAVE_BALANCE'
    );
  }

  return {
    parsed,
    leaveType,
    regionId,
    period,
    ...leaveDays,
    chargeableDays,
    balanceBefore: Number(balanceBefore.toFixed(2)),
    balanceAfter,
    sufficientBalance,
  };
}

async function previewLeaveDays({ companyId, payload }) {
  const employeeId = payload?.employeeId || null;
  const preview = await buildLeavePreview({ companyId, payload, employeeId });

  return {
    leaveTypeId: preview.leaveType._id,
    leaveTypeCode: preview.leaveType.code,
    leaveTypeName: preview.leaveType.name,
    applySandwichRule: Boolean(preview.leaveType.applySandwichRule),
    allowsHalfDay: preview.leaveType.allowsHalfDay !== false,
    fromDate: preview.parsed.fromDate,
    toDate: preview.parsed.toDate,
    isHalfDay: preview.parsed.isHalfDay,
    regionId: preview.regionId,
    workingDays: preview.workingDays,
    weekendDays: preview.weekendDays,
    holidayDays: preview.holidayDays,
    sandwichDaysApplied: preview.sandwichDaysApplied,
    totalCalendarDays: preview.totalCalendarDays,
    chargeableDays: preview.chargeableDays,
    balanceBefore: preview.balanceBefore,
    balanceAfter: preview.balanceAfter,
    sufficientBalance: preview.sufficientBalance,
    period: preview.period,
  };
}

function buildApplicationFields({ preview, employeeId, parsed, status, applicationNo = null }) {
  const fields = {
    employeeId,
    leaveTypeId: parsed.leaveTypeId,
    reason: parsed.reason,
    isHalfDay: parsed.isHalfDay,
    attachmentPath: parsed.attachmentPath,
    fromDate: parsed.fromDate,
    toDate: parsed.toDate,
    totalDays: preview.totalCalendarDays,
    workingDays: preview.workingDays,
    sandwichDaysApplied: preview.sandwichDaysApplied,
    balanceBefore: preview.balanceBefore,
    balanceAfter: preview.balanceAfter,
    status,
  };

  if (applicationNo) {
    fields.applicationNo = applicationNo;
  }

  if (status === LEAVE_APPLICATION_STATUS.SUBMITTED) {
    fields.submittedAt = new Date();
  }

  return fields;
}

async function createDraft({ companyId, employeeId, payload }) {
  const preview = await buildLeavePreview({ companyId, payload, employeeId });
  const { autoNumber } = await autoNumberService.getNextAutoNumber(
    companyId,
    AUTO_NUMBER_PREFIXES.LEAVE_APPLICATION
  );

  return tenantApplications(companyId).create(
    buildApplicationFields({
      preview,
      employeeId,
      parsed: preview.parsed,
      status: LEAVE_APPLICATION_STATUS.DRAFT,
      applicationNo: autoNumber,
    })
  );
}

async function submitApplication({ companyId, employeeId, applicationId }) {
  const application = await tenantApplications(companyId).findById(applicationId);

  if (!application) {
    throw new AppError('Leave application not found', 404, 'NOT_FOUND');
  }

  if (String(application.employeeId) !== String(employeeId)) {
    throw new AppError('You can only submit your own applications', 403, 'FORBIDDEN');
  }

  if (application.status !== LEAVE_APPLICATION_STATUS.DRAFT) {
    throw new AppError(
      `Only draft applications can be submitted (current: ${application.status})`,
      400,
      'INVALID_STATUS'
    );
  }

  const preview = await buildLeavePreview({
    companyId,
    payload: {
      leaveTypeId: application.leaveTypeId,
      fromDate: application.fromDate,
      toDate: application.toDate,
      reason: application.reason,
      isHalfDay: application.isHalfDay,
      attachmentPath: application.attachmentPath,
    },
    employeeId,
    requireSufficientBalance: true,
  });

  application.reason = preview.parsed.reason;
  application.isHalfDay = preview.parsed.isHalfDay;
  application.attachmentPath = preview.parsed.attachmentPath;
  application.totalDays = preview.totalCalendarDays;
  application.workingDays = preview.workingDays;
  application.sandwichDaysApplied = preview.sandwichDaysApplied;
  application.balanceBefore = preview.balanceBefore;
  application.balanceAfter = preview.balanceAfter;
  application.status = LEAVE_APPLICATION_STATUS.SUBMITTED;
  application.submittedAt = new Date();

  await application.save();
  return application;
}

async function createAndSubmit({ companyId, employeeId, payload }) {
  const draft = await createDraft({ companyId, employeeId, payload });
  return submitApplication({ companyId, employeeId, applicationId: draft._id });
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
    .populate('leaveTypeId', 'code name applySandwichRule allowsHalfDay')
    .populate('employeeId', 'employeeCode employeeName');

  const { docs, pagination: meta } = await executePaginatedQuery(baseQuery, pagination);

  return { items: docs, pagination: meta };
}

async function getApplicationById({ companyId, applicationId, employeeId = null }) {
  const application = await tenantApplications(companyId)
    .findById(applicationId)
    .populate('leaveTypeId', 'code name applySandwichRule allowsHalfDay')
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
 * Chargeable days used for balance deduction.
 */
function getChargeableDays(application) {
  if (application.isHalfDay) {
    return 0.5;
  }

  const working = Number(application.workingDays) || 0;
  const sandwich = Number(application.sandwichDaysApplied) || 0;
  const chargeable = working + sandwich;
  return chargeable > 0 ? chargeable : Number(application.totalDays) || 0;
}

module.exports = {
  previewLeaveDays,
  createDraft,
  submitApplication,
  createAndSubmit,
  listApplications,
  getApplicationById,
  getChargeableDays,
  resolveEmployeeRegionId,
  loadHolidayDates,
};
