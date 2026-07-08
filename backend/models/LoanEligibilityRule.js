const createTenantModel = require('./createTenantModel');
const { LOAN_INTEREST_FORMULA_VALUES } = require('../constants/loanInterestFormulas');

const RULE_STATUSES = ['Active', 'Inactive'];

/**
 * Tenant-scoped loan eligibility rules (Sheet 03 — Loan Management).
 * Unique per company: { companyId, ruleCode } — see tenantIndexDefinitions.
 */
const LoanEligibilityRule = createTenantModel({
  modelName: 'LoanEligibilityRule',
  collection: 'loan_eligibility_rules',
  fields: {
    ruleCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'DEFAULT',
    },
    minServiceMonths: {
      type: Number,
      default: 0,
      min: [0, 'minServiceMonths cannot be negative'],
    },
    salaryMultiplier: {
      type: Number,
      default: null,
      min: [0, 'salaryMultiplier cannot be negative'],
    },
    minAmountPercentOfSalary: {
      type: Number,
      default: null,
      min: [0, 'minAmountPercentOfSalary cannot be negative'],
      max: [100, 'minAmountPercentOfSalary cannot exceed 100'],
    },
    maxAmountPercentOfSalary: {
      type: Number,
      default: null,
      min: [0, 'maxAmountPercentOfSalary cannot be negative'],
      max: [100, 'maxAmountPercentOfSalary cannot exceed 100'],
    },
    minTenureMonths: {
      type: Number,
      default: 1,
      min: [1, 'minTenureMonths must be at least 1'],
    },
    maxTenureMonths: {
      type: Number,
      default: null,
      min: [1, 'maxTenureMonths must be at least 1'],
    },
    interestFormula: {
      type: String,
      enum: LOAN_INTEREST_FORMULA_VALUES,
      default: 'COMPOUND_INTEREST',
    },
    maxEmiPercentOfGross: {
      type: Number,
      default: 60,
      min: [0, 'maxEmiPercentOfGross cannot be negative'],
      max: [100, 'maxEmiPercentOfGross cannot exceed 100'],
    },
    retirementBufferMonths: {
      type: Number,
      default: 3,
      min: [0, 'retirementBufferMonths cannot be negative'],
    },
    effectiveDate: {
      type: Date,
      required: [true, 'effectiveDate is required'],
    },
    status: {
      type: String,
      enum: RULE_STATUSES,
      default: 'Active',
    },
  },
});

module.exports = LoanEligibilityRule;
module.exports.RULE_STATUSES = RULE_STATUSES;
