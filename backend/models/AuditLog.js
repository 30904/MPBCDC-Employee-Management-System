const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const AuditLog = createTenantModel({
  modelName: 'AuditLog',
  collection: 'audit_logs',
  fields: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    entity: { type: String, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    timestamp: { type: Date, default: Date.now },
  },
});

module.exports = AuditLog;
