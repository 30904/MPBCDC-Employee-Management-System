const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LeaveBalance = createTenantModel({
  modelName: 'LeaveBalance',
  collection: 'leave_balances',
  fields: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' },
    period: { type: String, trim: true },
    openingBalance: { type: Number, default: 0, min: 0 },
    accrued: { type: Number, default: 0, min: 0 },
    availed: { type: Number, default: 0, min: 0 },
    lapsed: { type: Number, default: 0, min: 0 },
    encashed: { type: Number, default: 0, min: 0 },
    adjustment: { type: Number, default: 0 },
    closingBalance: { type: Number, default: 0, min: 0 },
    remarks: { type: String, trim: true, maxlength: 500 },
    lastAccruedAt: { type: Date },
  },
});

module.exports = LeaveBalance;
