const mongoose = require('mongoose');
const LeaveAccrualRule = require('../models/LeaveAccrualRule');
const LeaveType = require('../models/LeaveType');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');
const { parseIsoDate, startOfUtcDay, toIsoDateString } = require('../utils/dateUtils');
const leaveAccrualService = require('../services/leaveAccrualService');
const { buildAccrualPeriodKey } = leaveAccrualService;

const WRITABLE_FIELDS = [
  'ruleCode',
  'leaveTypeId',
  'name',
  'description',
  'accrualFrequency',
  'accrualDays',
  'scheduledMonths',
  'applyProRata',
  'effectiveDate',
  'status',
];

const REQUIRED_ON_CREATE = [
  'ruleCode',
  'leaveTypeId',
  'accrualFrequency',
  'accrualDays',
  'effectiveDate',
];

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function tenantAccrualRules(req) {
  return LeaveAccrualRule.forTenant(req.companyId);
}

function tenantLeaveTypes(req) {
  return LeaveType.forTenant(req.companyId);
}

function parseScheduledMonths(value) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new AppError('scheduledMonths must be an array of month numbers (1-12)', 400, 'VALIDATION_ERROR');
  }

  const months = [...new Set(value.map((month) => Number(month)).filter((month) => !Number.isNaN(month)))]
    .sort((a, b) => a - b);

  if (months.some((month) => !Number.isInteger(month) || month < 1 || month > 12)) {
    throw new AppError('scheduledMonths must contain values from 1 to 12', 400, 'VALIDATION_ERROR');
  }

  return months;
}

function validateFrequencyRules({ accrualFrequency, scheduledMonths }) {
  const frequency = String(accrualFrequency || '').toUpperCase();

  if (frequency === 'HALF_YEARLY' && scheduledMonths.length === 0) {
    throw new AppError('Half-yearly rules require scheduledMonths (e.g. [1, 7])', 400, 'VALIDATION_ERROR');
  }

  if (frequency === 'YEARLY' && scheduledMonths.length === 0) {
    throw new AppError('Yearly rules require at least one scheduled month', 400, 'VALIDATION_ERROR');
  }
}

function serializeRule(rule) {
  const doc = rule.toObject ? rule.toObject() : rule;

  return {
    ...doc,
    effectiveDate: toIsoDateString(doc.effectiveDate),
    scheduledMonthLabels: (doc.scheduledMonths || []).map((month) => MONTH_LABELS[month - 1]),
    leaveType: doc.leaveTypeId
      ? {
          _id: doc.leaveTypeId._id || doc.leaveTypeId,
          code: doc.leaveTypeId.code || null,
          name: doc.leaveTypeId.name || null,
        }
      : null,
  };
}

function pickRulePayload(body, { partial = false } = {}) {
  const payload = {};

  WRITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  if (payload.ruleCode !== undefined) {
    payload.ruleCode = String(payload.ruleCode).trim().toUpperCase();
  }

  if (payload.name !== undefined) {
    payload.name = String(payload.name).trim();
  }

  if (payload.description !== undefined) {
    payload.description = String(payload.description).trim();
  }

  if (payload.accrualFrequency !== undefined) {
    payload.accrualFrequency = String(payload.accrualFrequency).trim().toUpperCase();
  }

  if (payload.leaveTypeId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(payload.leaveTypeId)) {
      throw new AppError('Invalid leaveTypeId', 400, 'VALIDATION_ERROR');
    }
  }

  if (payload.accrualDays !== undefined) {
    const days = Number(payload.accrualDays);
    if (Number.isNaN(days) || days < 0) {
      throw new AppError('accrualDays must be a non-negative number', 400, 'VALIDATION_ERROR');
    }
    payload.accrualDays = days;
  }

  if (payload.scheduledMonths !== undefined) {
    payload.scheduledMonths = parseScheduledMonths(payload.scheduledMonths);
  }

  if (payload.applyProRata !== undefined) {
    payload.applyProRata = payload.applyProRata === true || payload.applyProRata === 'true';
  }

  if (payload.effectiveDate !== undefined) {
    payload.effectiveDate = startOfUtcDay(parseIsoDate(payload.effectiveDate, 'effectiveDate'));
  }

  if (!partial) {
    const missing = REQUIRED_ON_CREATE.filter((field) => {
      const value = payload[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      throw new AppError(`${missing.join(', ')} required`, 400, 'VALIDATION_ERROR');
    }
  }

  const frequency = payload.accrualFrequency ?? body.accrualFrequency;
  const months = payload.scheduledMonths ?? body.scheduledMonths ?? [];

  if (frequency) {
    validateFrequencyRules({ accrualFrequency: frequency, scheduledMonths: months });
  }

  return payload;
}

async function assertLeaveTypeExists(req, leaveTypeId) {
  const leaveType = await tenantLeaveTypes(req).findById(leaveTypeId).select('_id code name isActive');

  if (!leaveType) {
    throw new AppError('Leave type not found', 404, 'NOT_FOUND');
  }

  return leaveType;
}

async function listLeaveTypeOptions(req, res) {
  const leaveTypes = await tenantLeaveTypes(req)
    .find({ isActive: true })
    .sort({ code: 1 })
    .select('_id code name annualEntitlement')
    .lean();

  return sendSuccess(
    res,
    leaveTypes.map((leaveType) => ({
      _id: leaveType._id,
      code: leaveType.code,
      name: leaveType.name,
      label: `${leaveType.code} — ${leaveType.name}`,
      annualEntitlement: leaveType.annualEntitlement,
    }))
  );
}

async function listAccrualRules(req, res) {
  const pagination = parsePagination(req.query);
  const status = req.query.status ? String(req.query.status).trim() : undefined;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  const query = tenantAccrualRules(req)
    .find(filter)
    .populate('leaveTypeId', 'code name')
    .sort({ effectiveDate: -1, ruleCode: 1 });

  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);

  return sendPaginatedSuccess(res, docs.map(serializeRule), meta);
}

async function getAccrualRule(req, res) {
  const rule = await tenantAccrualRules(req)
    .findById(req.params.id)
    .populate('leaveTypeId', 'code name');

  if (!rule) {
    throw new AppError('Accrual rule not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, serializeRule(rule));
}

async function createAccrualRule(req, res) {
  const payload = pickRulePayload(req.body);
  await assertLeaveTypeExists(req, payload.leaveTypeId);

  const rule = await tenantAccrualRules(req).create(payload);
  await rule.populate('leaveTypeId', 'code name');

  return sendSuccess(res, serializeRule(rule), 201);
}

async function updateAccrualRule(req, res) {
  const existing = await tenantAccrualRules(req).findById(req.params.id);

  if (!existing) {
    throw new AppError('Accrual rule not found', 404, 'NOT_FOUND');
  }

  const payload = pickRulePayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new AppError('No valid fields to update', 400, 'VALIDATION_ERROR');
  }

  if (payload.leaveTypeId) {
    await assertLeaveTypeExists(req, payload.leaveTypeId);
  }

  const nextFrequency = payload.accrualFrequency ?? existing.accrualFrequency;
  const nextMonths = payload.scheduledMonths ?? existing.scheduledMonths ?? [];
  validateFrequencyRules({ accrualFrequency: nextFrequency, scheduledMonths: nextMonths });

  const rule = await tenantAccrualRules(req)
    .findOneAndUpdate({ _id: req.params.id }, { $set: payload }, { new: true, runValidators: true })
    .populate('leaveTypeId', 'code name');

  return sendSuccess(res, serializeRule(rule));
}

async function deleteAccrualRule(req, res) {
  const rule = await tenantAccrualRules(req).findById(req.params.id);

  if (!rule) {
    throw new AppError('Accrual rule not found', 404, 'NOT_FOUND');
  }

  await tenantAccrualRules(req).deleteOne({ _id: rule._id });

  return sendSuccess(res, { id: rule._id, deleted: true });
}

async function runAccrual(req, res) {
  const asOfRaw = req.body?.asOfDate || req.query?.asOfDate;
  const asOfDate = asOfRaw ? new Date(asOfRaw) : new Date();

  if (Number.isNaN(asOfDate.getTime())) {
    throw new AppError('asOfDate must be a valid ISO date', 400, 'VALIDATION_ERROR');
  }

  let period = req.body?.period || req.query?.period;
  if (period) {
    period = String(period).trim().toUpperCase();
  } else {
    period = buildAccrualPeriodKey(asOfDate.getUTCFullYear(), asOfDate.getUTCMonth() + 1);
  }

  let employeeIds = req.body?.employeeIds;
  if (employeeIds !== undefined) {
    if (!Array.isArray(employeeIds)) {
      throw new AppError('employeeIds must be an array', 400, 'VALIDATION_ERROR');
    }

    const invalid = employeeIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalid.length > 0) {
      throw new AppError('employeeIds contains invalid ObjectId values', 400, 'VALIDATION_ERROR');
    }
  } else {
    employeeIds = [];
  }

  const result = await leaveAccrualService.accrueForPeriod({
    companyId: req.companyId,
    period,
    employeeIds,
    asOfDate,
  });

  return sendSuccess(res, result);
}

module.exports = {
  listLeaveTypeOptions,
  listAccrualRules,
  getAccrualRule,
  createAccrualRule,
  updateAccrualRule,
  deleteAccrualRule,
  runAccrual,
};
