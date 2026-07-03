const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const ApprovalMatrix = createTenantModel({
  modelName: 'ApprovalMatrix',
  collection: 'approval_matrices',
  fields: {
    code: { type: String, trim: true },
    module: { type: String, trim: true },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' },
    level: { type: Number },
  },
});

module.exports = ApprovalMatrix;
