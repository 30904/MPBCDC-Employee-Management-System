const LoanEligibilityRule = require('../models/LoanEligibilityRule');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

const WRITABLE_FIELDS = [
  'ruleCode',
  'minServiceMonths',
  'salaryMultiplier',
  'maxEmiPercentOfGross',
  'retirementBufferMonths',
  'effectiveDate',
  'status',
];

const REQUIRED_ON_CREATE = ['effectiveDate'];

function tenantRules(req) {
  return LoanEligibilityRule.forTenant(req.companyId);
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

  if (payload.effectiveDate !== undefined) {
    payload.effectiveDate = new Date(payload.effectiveDate);
    if (Number.isNaN(payload.effectiveDate.getTime())) {
      throw new AppError('effectiveDate must be a valid date', 400, 'VALIDATION_ERROR');
    }
  }

  if (!partial) {
    const missing = REQUIRED_ON_CREATE.filter((field) => payload[field] === undefined);
    if (missing.length > 0) {
      throw new AppError(`${missing.join(', ')} required`, 400, 'VALIDATION_ERROR');
    }
  }

  return payload;
}

async function listEligibilityRules(req, res) {
  const pagination = parsePagination(req.query);
  const query = tenantRules(req).find().sort({ effectiveDate: -1 });
  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);

  return sendPaginatedSuccess(res, docs, meta);
}

async function getEligibilityRule(req, res) {
  const rule = await tenantRules(req).findById(req.params.id);

  if (!rule) {
    throw new AppError('Eligibility rule not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, rule);
}

async function createEligibilityRule(req, res) {
  const payload = pickRulePayload(req.body);
  const rule = await tenantRules(req).create(payload);

  return sendSuccess(res, rule, 201);
}

async function updateEligibilityRule(req, res) {
  const payload = pickRulePayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new AppError('No valid fields to update', 400, 'VALIDATION_ERROR');
  }

  const rule = await tenantRules(req).findOneAndUpdate(
    { _id: req.params.id },
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (!rule) {
    throw new AppError('Eligibility rule not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, rule);
}

async function deleteEligibilityRule(req, res) {
  const rule = await tenantRules(req).findById(req.params.id);

  if (!rule) {
    throw new AppError('Eligibility rule not found', 404, 'NOT_FOUND');
  }

  await tenantRules(req).deleteOne({ _id: rule._id });

  return sendSuccess(res, { id: rule._id, deleted: true });
}

module.exports = {
  listEligibilityRules,
  getEligibilityRule,
  createEligibilityRule,
  updateEligibilityRule,
  deleteEligibilityRule,
};
