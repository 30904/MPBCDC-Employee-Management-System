const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LoanEmiSchedule = createTenantModel({
  modelName: 'LoanEmiSchedule',
  collection: 'loan_emi_schedules',
  fields: {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication' },
    loanNo: { type: String, trim: true },
    emiNo: { type: Number, min: 1 },
    dueDate: { type: Date },
    emiAmount: { type: Number, min: 0 },
    principalComponent: { type: Number },
    interestComponent: { type: Number, min: 0 },
    outstandingBalance: { type: Number, min: 0 },
    isManuallyAdjusted: { type: Boolean, default: false },
    status: {
      type: String,
      trim: true,
      enum: ['Pending', 'Paid', 'Skipped'],
      default: 'Pending',
    },
  },
});

module.exports = LoanEmiSchedule;
