const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LeaveAccrualRule = createTenantModel({
  modelName: 'LeaveAccrualRule',
  collection: 'leave_accrual_rules',
  fields: {
    ruleCode: { type: String, trim: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' },
  },
});

module.exports = LeaveAccrualRule;
