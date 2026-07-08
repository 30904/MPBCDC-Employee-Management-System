const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LeaveApplication = createTenantModel({
  modelName: 'LeaveApplication',
  collection: 'leave_applications',
  fields: {
    applicationNo: { type: String, trim: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' },
    status: { type: String, trim: true },
    reason: { type: String, trim: true, maxlength: 1000 },
    fromDate: { type: Date },
    toDate: { type: Date },
    totalDays: { type: Number, min: 0, default: 0 },
    workingDays: { type: Number, min: 0, default: 0 },
    sandwichDaysApplied: { type: Number, min: 0, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
});

module.exports = LeaveApplication;
