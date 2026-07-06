const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LoanApplication = createTenantModel({
  modelName: 'LoanApplication',
  collection: 'loan_applications',
  fields: {
    applicationNo: { type: String, trim: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'MpbcdcEmployee' },
    loanTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanType' },
    monthlyEmi: { type: Number, min: 0, default: 0 },
    status: { type: String, trim: true },
  },
});

module.exports = LoanApplication;
