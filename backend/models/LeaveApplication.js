const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');
const { LEAVE_SESSIONS } = require('../constants/leaveSessions');

const LeaveApplication = createTenantModel({
  modelName: 'LeaveApplication',
  collection: 'leave_applications',
  fields: {
    applicationNo: { type: String, trim: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' },
    isHalfDay: { type: Boolean, default: false },
    fromSession: {
      type: String,
      enum: Object.values(LEAVE_SESSIONS),
      default: LEAVE_SESSIONS.FIRST_HALF,
    },
    toSession: {
      type: String,
      enum: Object.values(LEAVE_SESSIONS),
      default: LEAVE_SESSIONS.SECOND_HALF,
    },
    chargeableDays: { type: Number, min: 0, default: 0 },
    attachmentPath: { type: String, trim: true, default: '' },
    status: { type: String, trim: true },
    reason: { type: String, trim: true, maxlength: 1000 },
    fromDate: { type: Date },
    toDate: { type: Date },
    totalDays: { type: Number, min: 0, default: 0 },
    workingDays: { type: Number, min: 0, default: 0 },
    sandwichDaysApplied: { type: Number, min: 0, default: 0 },
    balanceBefore: { type: Number, min: 0, default: 0 },
    balanceAfter: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
});

module.exports = LeaveApplication;
