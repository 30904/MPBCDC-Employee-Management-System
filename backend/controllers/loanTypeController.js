const LoanType = require('../models/LoanType');
const LoanApplication = require('../models/LoanApplication');
const AppError = require('../utils/AppError');
const { LOAN_INTEREST_FORMULA_VALUES } = require('../constants/loanInterestFormulas');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

const WRITABLE_FIELDS = [
  'code',
  'name',
  'isEducationLoan',
  'isComputerLoan',
  'isVehicleLoan',
  'isHomeLoan',
  'isMarriageLoan',
  'maxAmount',
  'maxTenureMonths',
  'interestFormula',
  'interestRate',
  'minServiceYears',
  'salaryMultiplier',
  'isActive',
];

const REQUIRED_ON_CREATE = ['code', 'name', 'maxAmount', 'maxTenureMonths', 'interestRate'];

function tenantLoanTypes(req) {
  return LoanType.forTenant(req.companyId);
}

function pickLoanTypePayload(body, { partial = false } = {}) {
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

  if (
    payload.interestFormula !== undefined &&
    !LOAN_INTEREST_FORMULA_VALUES.includes(payload.interestFormula)
  ) {
    throw new AppError(
      'interestFormula must be SIMPLE_INTEREST or COMPOUND_INTEREST',
      400,
      'VALIDATION_ERROR'
    );
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
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  throw new AppError('Invalid isActive filter. Use true or false', 400, 'VALIDATION_ERROR');
}

async function listLoanTypes(req, res) {
  const pagination = parsePagination(req.query);
  const isActive = parseIsActiveFilter(req.query.isActive);
  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  const query = tenantLoanTypes(req).find(filter).sort({ code: 1 });
  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);

  return sendPaginatedSuccess(res, docs, meta);
}

async function getLoanType(req, res) {
  const loanType = await tenantLoanTypes(req).findById(req.params.id);

  if (!loanType) {
    throw new AppError('Loan type not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, loanType);
}

async function createLoanType(req, res) {
  const payload = pickLoanTypePayload(req.body);
  const loanType = await tenantLoanTypes(req).create(payload);

  return sendSuccess(res, loanType, 201);
}

async function updateLoanType(req, res) {
  const payload = pickLoanTypePayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new AppError('No valid fields to update', 400, 'VALIDATION_ERROR');
  }

  const loanType = await tenantLoanTypes(req).findOneAndUpdate(
    { _id: req.params.id },
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (!loanType) {
    throw new AppError('Loan type not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, loanType);
}

async function deleteLoanType(req, res) {
  const loanType = await tenantLoanTypes(req).findById(req.params.id);

  if (!loanType) {
    throw new AppError('Loan type not found', 404, 'NOT_FOUND');
  }

  const inUse = await LoanApplication.forTenant(req.companyId).exists({
    loanTypeId: loanType._id,
  });

  if (inUse) {
    throw new AppError(
      'Cannot delete loan type that is referenced by loan applications. Deactivate it instead.',
      409,
      'LOAN_TYPE_IN_USE'
    );
  }

  await tenantLoanTypes(req).deleteOne({ _id: loanType._id });

  return sendSuccess(res, { id: loanType._id, deleted: true });
}

/** ESS — employees may only see active loan types when applying. */
async function listActiveLoanTypesForEss(req, res) {
  const loanTypes = await tenantLoanTypes(req)
    .find({ isActive: true })
    .sort({ name: 1 });

  return sendSuccess(res, loanTypes);
}

module.exports = {
  listLoanTypes,
  getLoanType,
  createLoanType,
  updateLoanType,
  deleteLoanType,
  listActiveLoanTypesForEss,
};
