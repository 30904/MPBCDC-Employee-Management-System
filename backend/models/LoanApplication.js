const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LoanApplication = createTenantModel({
  modelName: 'LoanApplication',
  collection: 'loan_applications',
  fields: {
    applicationNo: { type: String, trim: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'MpbcdcEmployee' },
    status: { type: String, trim: true },
  },
});

module.exports = LoanApplication;
