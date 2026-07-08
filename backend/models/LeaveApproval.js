const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LeaveApproval = createTenantModel({
  modelName: 'LeaveApproval',
  collection: 'leave_approvals',
  fields: {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveApplication' },
    approvedAt: { type: Date },
  },
});

module.exports = LeaveApproval;
