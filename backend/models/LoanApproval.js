const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LoanApproval = createTenantModel({
  modelName: 'LoanApproval',
  collection: 'loan_approvals',
  fields: {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication' },
    approverRole: { type: String, trim: true },
    approvedAt: { type: Date },
  },
});

module.exports = LoanApproval;
