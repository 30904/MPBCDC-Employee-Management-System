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
    /** Last accrual run key applied (e.g. 2026-H1) — used for idempotent posting */
    lastAccrualPeriodKey: { type: String, trim: true, default: null },
    /** Year-end close key once processed (e.g. 2026->2027) — idempotent carry-forward */
    yearEndProcessedKey: { type: String, trim: true, default: null },
    yearEndProcessedAt: { type: Date },
  },
});

module.exports = LeaveBalance;
