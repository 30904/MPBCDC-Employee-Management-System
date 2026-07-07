const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const ACCRUAL_FREQUENCIES = ['MONTHLY', 'HALF_YEARLY', 'YEARLY'];
const RULE_STATUSES = ['Active', 'Inactive'];

/**
 * Tenant-scoped leave accrual rules (Sheet 04 — Leave Management, Task 3).
 * Unique per company: { companyId, ruleCode, leaveTypeId } — see tenantIndexDefinitions.
 */
const LeaveAccrualRule = createTenantModel({
  modelName: 'LeaveAccrualRule',
  collection: 'leave_accrual_rules',
  fields: {
    ruleCode: {
      type: String,
      required: [true, 'Rule code is required'],
      trim: true,
      uppercase: true,
    },
    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: [true, 'Leave type is required'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    accrualFrequency: {
      type: String,
      enum: ACCRUAL_FREQUENCIES,
      required: [true, 'Accrual frequency is required'],
      uppercase: true,
      trim: true,
    },
    accrualDays: {
      type: Number,
      required: [true, 'Accrual days is required'],
      min: [0, 'accrualDays cannot be negative'],
    },
    scheduledMonths: {
      type: [Number],
      default: [],
      validate: {
        validator(months) {
          return months.every((month) => Number.isInteger(month) && month >= 1 && month <= 12);
        },
        message: 'scheduledMonths must contain values from 1 to 12',
      },
    },
    applyProRata: {
      type: Boolean,
      default: true,
    },
    effectiveDate: {
      type: Date,
      required: [true, 'effectiveDate is required'],
    },
    status: {
      type: String,
      enum: RULE_STATUSES,
      default: 'Active',
    },
  },
});

module.exports = LeaveAccrualRule;
module.exports.ACCRUAL_FREQUENCIES = ACCRUAL_FREQUENCIES;
module.exports.RULE_STATUSES = RULE_STATUSES;
