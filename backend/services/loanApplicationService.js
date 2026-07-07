const mongoose = require('mongoose');
require('../models/Employee');
const LoanApplication = require('../models/LoanApplication');
const LoanType = require('../models/LoanType');
const AppError = require('../utils/AppError');
const { LOAN_APPLICATION_STATUS } = require('../constants/loanWorkflowStates');
const { AUTO_NUMBER_PREFIXES } = require('../utils/autoNumberPrefixes');
const autoNumberService = require('./autoNumberService');
const {
  previewEligibility,
  calculateMonthlyEmi,
  round2,
} = require('./loanEligibilityService');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

function tenantApplications(companyId) {
  return LoanApplication.forTenant(companyId);
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .filter((attachment) => attachment?.attachmentPath)
    .map((attachment) => ({
      attachmentPath: String(attachment.attachmentPath).trim(),
      originalName: attachment.originalName ? String(attachment.originalName).trim() : '',
      url: attachment.url ? String(attachment.url).trim() : '',
    }));
}

function validateCreatePayload(body) {
  const { loanTypeId, requestedAmount, requestedTenureMonths, purpose } = body;

  if (!loanTypeId || !mongoose.Types.ObjectId.isValid(loanTypeId)) {
    throw new AppError('loanTypeId is required', 400, 'VALIDATION_ERROR');
  }

  const amount = Number(requestedAmount);
  const tenure = Number(requestedTenureMonths);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('requestedAmount must be a positive number', 400, 'VALIDATION_ERROR');
  }

  if (!Number.isFinite(tenure) || tenure <= 0 || !Number.isInteger(tenure)) {
    throw new AppError(
      'requestedTenureMonths must be a positive integer',
      400,
      'VALIDATION_ERROR'
    );
  }

  return {
    loanTypeId,
    requestedAmount: amount,
    requestedTenureMonths: tenure,
    purpose: purpose ? String(purpose).trim() : '',
  };
}

function buildEligibilitySnapshot(eligibility) {
  return {
    eligible: eligibility.eligible,
    reasons: eligibility.reasons ?? [],
    derived: eligibility.derived ?? {},
  };
}

async function createDraft({ companyId, employeeId, payload }) {
  const parsed = validateCreatePayload(payload);

  const loanType = await LoanType.forTenant(companyId).findById(parsed.loanTypeId);
  if (!loanType || !loanType.isActive) {
    throw new AppError('Loan type not found or inactive', 404, 'NOT_FOUND');
  }

  const eligibility = await previewEligibility({
    companyId,
    employeeId,
    loanTypeId: parsed.loanTypeId,
    requestedAmount: parsed.requestedAmount,
    requestedTenure: parsed.requestedTenureMonths,
  });

  const { autoNumber } = await autoNumberService.getNextAutoNumber(
    companyId,
    AUTO_NUMBER_PREFIXES.LOAN_APPLICATION
  );

  const interestRate = Number(loanType.interestRate) || 0;
  const monthlyEmi = round2(
    calculateMonthlyEmi(parsed.requestedAmount, interestRate, parsed.requestedTenureMonths)
  );

  return tenantApplications(companyId).create({
    applicationNo: autoNumber,
    employeeId,
    loanTypeId: parsed.loanTypeId,
    purpose: parsed.purpose,
    requestedAmount: parsed.requestedAmount,
    requestedTenureMonths: parsed.requestedTenureMonths,
    interestRate,
    monthlyEmi,
    status: LOAN_APPLICATION_STATUS.DRAFT,
    eligibilityRuleCode: eligibility.ruleCode || null,
    eligibilitySnapshot: buildEligibilitySnapshot(eligibility),
    attachments: normalizeAttachments(payload.attachments),
  });
}

async function submitApplication({ companyId, employeeId, applicationId }) {
  const application = await tenantApplications(companyId).findById(applicationId);

  if (!application) {
    throw new AppError('Loan application not found', 404, 'NOT_FOUND');
  }

  if (String(application.employeeId) !== String(employeeId)) {
    throw new AppError('You can only submit your own applications', 403, 'FORBIDDEN');
  }

  if (application.status !== LOAN_APPLICATION_STATUS.DRAFT) {
    throw new AppError(
      `Only draft applications can be submitted (current: ${application.status})`,
      400,
      'INVALID_STATUS'
    );
  }

  const eligibility = await previewEligibility({
    companyId,
    employeeId,
    loanTypeId: application.loanTypeId,
    requestedAmount: application.requestedAmount,
    requestedTenure: application.requestedTenureMonths,
  });

  if (!eligibility.eligible) {
    throw new AppError(
      `Application is not eligible: ${(eligibility.reasons || []).join('; ')}`,
      400,
      'NOT_ELIGIBLE'
    );
  }

  application.status = LOAN_APPLICATION_STATUS.SUBMITTED;
  application.submittedAt = new Date();
  application.eligibilityRuleCode = eligibility.ruleCode || application.eligibilityRuleCode;
  application.eligibilitySnapshot = buildEligibilitySnapshot(eligibility);
  application.monthlyEmi = round2(
    calculateMonthlyEmi(
      application.requestedAmount,
      application.interestRate,
      application.requestedTenureMonths
    )
  );

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

  const allowed = Object.values(LOAN_APPLICATION_STATUS);
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

  const statuses = parseStatusFilter(query.status);
  if (statuses) {
    filter.status = { $in: statuses };
  }

  const baseQuery = tenantApplications(companyId)
    .find(filter)
    .sort({ createdAt: -1 })
    .populate('loanTypeId', 'code name interestRate maxAmount maxTenureMonths')
    .populate('employeeId', 'employeeCode grossSalary');

  const { docs, pagination: meta } = await executePaginatedQuery(baseQuery, pagination);

  return { items: docs, pagination: meta };
}

async function getApplicationById({ companyId, applicationId, employeeId = null }) {
  const application = await tenantApplications(companyId)
    .findById(applicationId)
    .populate('loanTypeId', 'code name interestRate maxAmount maxTenureMonths')
    .populate('employeeId', 'employeeCode grossSalary joiningDate retirementDate');

  if (!application) {
    throw new AppError('Loan application not found', 404, 'NOT_FOUND');
  }

  if (employeeId && String(application.employeeId?._id || application.employeeId) !== String(employeeId)) {
    throw new AppError('You can only view your own applications', 403, 'FORBIDDEN');
  }

  return application;
}

module.exports = {
  createDraft,
  submitApplication,
  createAndSubmit,
  listApplications,
  getApplicationById,
};
