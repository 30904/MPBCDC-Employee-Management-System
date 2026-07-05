const createTenantModel = require('./createTenantModel');

const LeaveType = createTenantModel({
  modelName: 'LeaveType',
  collection: 'leave_types',
  fields: { code: { type: String, trim: true, uppercase: true } },
});

module.exports = LeaveType;
