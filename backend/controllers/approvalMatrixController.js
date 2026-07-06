const ApprovalMatrix = require('../models/ApprovalMatrix');
const AppError = require('../utils/AppError');
const { LOAN_MODULE } = require('../constants/loanWorkflowStates');
const { DEFAULT_LOAN_APPROVAL_LEVELS } = require('../services/loanWorkflowService');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

const WRITABLE_FIELDS = ['code', 'module', 'gradeId', 'level', 'approverRole', 'slaDays', 'isActive'];

const REQUIRED_ON_CREATE = ['code', 'module', 'level', 'approverRole'];

function tenantMatrices(req) {
  return ApprovalMatrix.forTenant(req.companyId);
}

function pickMatrixPayload(body, { partial = false } = {}) {
  const payload = {};

  WRITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  if (payload.code !== undefined) {
    payload.code = String(payload.code).trim().toUpperCase();
  }

  if (payload.module !== undefined) {
    payload.module = String(payload.module).trim().toUpperCase();
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

async function listApprovalMatrices(req, res) {
  const pagination = parsePagination(req.query);
  const filter = {};

  if (req.query.module) {
    filter.module = String(req.query.module).trim().toUpperCase();
  }

  const query = tenantMatrices(req).find(filter).sort({ module: 1, level: 1 });
  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);

  return sendPaginatedSuccess(res, docs, meta);
}

async function getApprovalMatrix(req, res) {
  const matrix = await tenantMatrices(req).findById(req.params.id);

  if (!matrix) {
    throw new AppError('Approval matrix row not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, matrix);
}

async function createApprovalMatrix(req, res) {
  const payload = pickMatrixPayload(req.body);
  const matrix = await tenantMatrices(req).create(payload);

  return sendSuccess(res, matrix, 201);
}

async function updateApprovalMatrix(req, res) {
  const payload = pickMatrixPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new AppError('No valid fields to update', 400, 'VALIDATION_ERROR');
  }

  const matrix = await tenantMatrices(req).findOneAndUpdate(
    { _id: req.params.id },
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (!matrix) {
    throw new AppError('Approval matrix row not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, matrix);
}

async function deleteApprovalMatrix(req, res) {
  const matrix = await tenantMatrices(req).findById(req.params.id);

  if (!matrix) {
    throw new AppError('Approval matrix row not found', 404, 'NOT_FOUND');
  }

  await tenantMatrices(req).deleteOne({ _id: matrix._id });

  return sendSuccess(res, { id: matrix._id, deleted: true });
}

async function initializeLoanApprovalMatrix(req, res) {
  const existing = await tenantMatrices(req).find({ module: LOAN_MODULE });

  if (existing.length > 0) {
    return sendSuccess(res, { initialized: false, rows: existing, message: 'Loan workflow already configured' });
  }

  const rows = [];

  for (const level of DEFAULT_LOAN_APPROVAL_LEVELS) {
    const row = await tenantMatrices(req).create({
      code: 'LOAN_DEFAULT',
      module: LOAN_MODULE,
      level: level.level,
      approverRole: level.approverRole,
      slaDays: level.slaDays,
      isActive: true,
    });
    rows.push(row);
  }

  return sendSuccess(res, { initialized: true, rows }, 201);
}

module.exports = {
  listApprovalMatrices,
  getApprovalMatrix,
  createApprovalMatrix,
  updateApprovalMatrix,
  deleteApprovalMatrix,
  initializeLoanApprovalMatrix,
};
