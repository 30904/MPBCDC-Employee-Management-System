const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');
const { LOAN_INTEREST_FORMULA_VALUES } = require('../constants/loanInterestFormulas');

const LoanDisbursement = createTenantModel({
  modelName: 'LoanDisbursement',
  collection: 'loan_disbursements',
  fields: {
    disbursementNo: { type: String, trim: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication' },
    loanNo: { type: String, trim: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    loanTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanType' },
    disbursedAmount: { type: Number, min: 0 },
    interestRate: { type: Number, min: 0 },
    interestFormula: {
      type: String,
      enum: LOAN_INTEREST_FORMULA_VALUES,
      default: 'COMPOUND_INTEREST',
    },
    tenureMonths: { type: Number, min: 1 },
    monthlyEmi: { type: Number, min: 0 },
    disbursedAt: { type: Date },
    firstEmiDate: { type: Date },
    disbursedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      trim: true,
      enum: ['Active', 'Closed'],
      default: 'Active',
    },
  },
});

module.exports = LoanDisbursement;
