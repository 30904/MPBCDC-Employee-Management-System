const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveAccrualRule = require('../models/LeaveAccrualRule');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

const WRITABLE_FIELDS = [
  'code',
  'name',
  'description',
  'annualEntitlement',
  'allowsHalfDay',
  'isEncashable',
  'allowsCarryForward',
  'maxCarryForwardDays',
  'applySandwichRule',
  'isActive',
];
const REQUIRED_ON_CREATE = ['code', 'name', 'annualEntitlement'];

function tenantLeaveTypes(req) {
  return LeaveType.forTenant(req.companyId);
}

function parseBoolean(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  throw new AppError(`Invalid ${fieldName}. Use true or false`, 400, 'VALIDATION_ERROR');
}

function pickLeaveTypePayload(body, { partial = false } = {}) {
  const payload = {};

  WRITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  if (payload.code !== undefined) {
    payload.code = String(payload.code).trim().toUpperCase();
  }

  if (payload.name !== undefined) {
    payload.name = String(payload.name).trim();
  }

  if (payload.description !== undefined) {
    payload.description = String(payload.description).trim();
  }

  ['allowsHalfDay', 'isEncashable', 'allowsCarryForward', 'applySandwichRule', 'isActive'].forEach(
    (field) => {
      if (payload[field] !== undefined) {
        payload[field] = parseBoolean(payload[field], field);
      }
    }
  );

  if (payload.annualEntitlement !== undefined) {
    const entitlement = Number(payload.annualEntitlement);
    if (Number.isNaN(entitlement) || entitlement < 0) {
      throw new AppError('annualEntitlement must be a non-negative number', 400, 'VALIDATION_ERROR');
    }
    payload.annualEntitlement = entitlement;
  }

  if (payload.maxCarryForwardDays !== undefined) {
    const carryDays = Number(payload.maxCarryForwardDays);
    if (Number.isNaN(carryDays) || carryDays < 0) {
      throw new AppError('maxCarryForwardDays must be a non-negative number', 400, 'VALIDATION_ERROR');
    }
    payload.maxCarryForwardDays = carryDays;
  }

  if (payload.allowsCarryForward === false) {
    payload.maxCarryForwardDays = 0;
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

  return payload;
}

function parseIsActiveFilter(value) {
  return parseBoolean(value, 'isActive');
}

async function listLeaveTypes(req, res) {
  const pagination = parsePagination(req.query);
  const isActive = parseIsActiveFilter(req.query.isActive);
  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  const query = tenantLeaveTypes(req).find(filter).sort({ code: 1 });
  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);

  return sendPaginatedSuccess(res, docs, meta);
}

async function getLeaveType(req, res) {
  const leaveType = await tenantLeaveTypes(req).findById(req.params.id);

  if (!leaveType) {
    throw new AppError('Leave type not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, leaveType);
}

async function createLeaveType(req, res) {
  const payload = pickLeaveTypePayload(req.body);
  const leaveType = await tenantLeaveTypes(req).create(payload);

  return sendSuccess(res, leaveType, 201);
}

async function updateLeaveType(req, res) {
  const payload = pickLeaveTypePayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new AppError('No valid fields to update', 400, 'VALIDATION_ERROR');
  }

  const leaveType = await tenantLeaveTypes(req).findOneAndUpdate(
    { _id: req.params.id },
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (!leaveType) {
    throw new AppError('Leave type not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, leaveType);
}

async function deleteLeaveType(req, res) {
  const leaveType = await tenantLeaveTypes(req).findById(req.params.id);

  if (!leaveType) {
    throw new AppError('Leave type not found', 404, 'NOT_FOUND');
  }

  const [inLeaveBalances, inAccrualRules] = await Promise.all([
    LeaveBalance.forTenant(req.companyId).exists({ leaveTypeId: leaveType._id }),
    LeaveAccrualRule.forTenant(req.companyId).exists({ leaveTypeId: leaveType._id }),
  ]);

  if (inLeaveBalances || inAccrualRules) {
    throw new AppError(
      'Cannot delete leave type that is referenced by leave balances/accrual rules. Deactivate it instead.',
      409,
      'LEAVE_TYPE_IN_USE'
    );
  }

  await tenantLeaveTypes(req).deleteOne({ _id: leaveType._id });

  return sendSuccess(res, { id: leaveType._id, deleted: true });
}

module.exports = {
  listLeaveTypes,
  getLeaveType,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
};
