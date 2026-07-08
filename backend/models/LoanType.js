const createTenantModel = require('./createTenantModel');
const { LOAN_INTEREST_FORMULA_VALUES } = require('../constants/loanInterestFormulas');

const loanCategoryFlag = { type: Boolean, default: false };

/**
 * Tenant-scoped loan type master (Sheet 03 — Loan Management).
 * Unique per company: { companyId, code } — see tenantIndexDefinitions.
 */
const LoanType = createTenantModel({
  modelName: 'LoanType',
  collection: 'loan_types',
  fields: {
    code: {
      type: String,
      required: [true, 'Loan type code is required'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Loan type name is required'],
      trim: true,
    },
    isEducationLoan: loanCategoryFlag,
    isComputerLoan: loanCategoryFlag,
    isVehicleLoan: loanCategoryFlag,
    isHomeLoan: loanCategoryFlag,
    isMarriageLoan: loanCategoryFlag,
    maxAmount: {
      type: Number,
      required: [true, 'Maximum loan amount is required'],
      min: [0, 'maxAmount cannot be negative'],
    },
    maxTenureMonths: {
      type: Number,
      required: [true, 'Maximum tenure in months is required'],
      min: [1, 'maxTenureMonths must be at least 1'],
    },
    interestFormula: {
      type: String,
      enum: LOAN_INTEREST_FORMULA_VALUES,
      default: 'COMPOUND_INTEREST',
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'interestRate cannot be negative'],
    },
    minServiceYears: {
      type: Number,
      default: 0,
      min: [0, 'minServiceYears cannot be negative'],
    },
    salaryMultiplier: {
      type: Number,
      default: null,
      min: [0, 'salaryMultiplier cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
});

module.exports = LoanType;
