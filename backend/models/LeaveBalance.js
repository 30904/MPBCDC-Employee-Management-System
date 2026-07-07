const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LeaveBalance = createTenantModel({
  modelName: 'LeaveBalance',
  collection: 'leave_balances',
  fields: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' },
    period: { type: String, trim: true },
  },
});

module.exports = LeaveBalance;
