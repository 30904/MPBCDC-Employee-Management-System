const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');
const {
  LOAN_RECOVERY_STATUS,
  PAYROLL_MONTH_PATTERN,
} = require('../constants/loanRecoveryStates');

/**
 * Payroll loan recovery ledger (Sheet 03 — Task 28).
 * One row per loan per payroll month within a tenant.
 */
const LoanRecovery = createTenantModel({
  modelName: 'LoanRecovery',
  collection: 'loan_recoveries',
  fields: {
    loanNo: {
      type: String,
      required: [true, 'loanNo is required'],
      trim: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanApplication',
      default: null,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    emiNo: {
      type: Number,
      min: 1,
      default: null,
    },
    payrollMonth: {
      type: String,
      required: [true, 'payrollMonth is required'],
      trim: true,
      validate: {
        validator(value) {
          return PAYROLL_MONTH_PATTERN.test(String(value || '').trim());
        },
        message: 'payrollMonth must be in YYYY-MM format',
      },
    },
    emiAmount: {
      type: Number,
      required: [true, 'emiAmount is required'],
      min: [0, 'emiAmount cannot be negative'],
    },
    recoveryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      trim: true,
      enum: Object.values(LOAN_RECOVERY_STATUS),
      default: LOAN_RECOVERY_STATUS.PENDING,
    },
    balanceOutstanding: {
      type: Number,
      required: [true, 'balanceOutstanding is required'],
      min: [0, 'balanceOutstanding cannot be negative'],
      default: 0,
    },
  },
});

module.exports = LoanRecovery;
