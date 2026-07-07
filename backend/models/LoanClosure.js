const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');
const { LOAN_CLOSURE_TYPE } = require('../constants/loanClosureStates');

/**
 * Loan closure record (Sheet 03 — Task 31).
 * One closure per active loan within a tenant.
 */
const LoanClosure = createTenantModel({
  modelName: 'LoanClosure',
  collection: 'loan_closures',
  fields: {
    closureNo: {
      type: String,
      required: [true, 'closureNo is required'],
      trim: true,
    },
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
    closureDate: {
      type: Date,
      required: [true, 'closureDate is required'],
    },
    outstandingAmount: {
      type: Number,
      required: [true, 'outstandingAmount is required'],
      min: [0, 'outstandingAmount cannot be negative'],
      default: 0,
    },
    closureType: {
      type: String,
      trim: true,
      enum: Object.values(LOAN_CLOSURE_TYPE),
      required: [true, 'closureType is required'],
    },
    certificateNo: {
      type: String,
      trim: true,
      default: null,
    },
  },
});

module.exports = LoanClosure;
