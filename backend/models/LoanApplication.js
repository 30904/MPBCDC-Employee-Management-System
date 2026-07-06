const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');
const { LOAN_APPLICATION_STATUS } = require('../constants/loanWorkflowStates');

const attachmentSchema = {
  attachmentPath: { type: String, trim: true },
  originalName: { type: String, trim: true },
  url: { type: String, trim: true },
};

const LoanApplication = createTenantModel({
  modelName: 'LoanApplication',
  collection: 'loan_applications',
  fields: {
    applicationNo: { type: String, trim: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'MpbcdcEmployee' },
    loanTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanType' },
    purpose: { type: String, trim: true, maxlength: 500 },
    requestedAmount: { type: Number, min: 0 },
    requestedTenureMonths: { type: Number, min: 1 },
    interestRate: { type: Number, min: 0 },
    monthlyEmi: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      trim: true,
      enum: Object.values(LOAN_APPLICATION_STATUS),
      default: LOAN_APPLICATION_STATUS.DRAFT,
    },
    eligibilityRuleCode: { type: String, trim: true },
    eligibilitySnapshot: { type: mongoose.Schema.Types.Mixed },
    attachments: [attachmentSchema],
    submittedAt: { type: Date },
    loanNo: { type: String, trim: true },
    disbursedAt: { type: Date },
  },
});

module.exports = LoanApplication;
