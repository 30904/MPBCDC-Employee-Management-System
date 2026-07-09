const createTenantModel = require('./createTenantModel');

/**
 * Tenant-scoped leave type master (Sheet 04 — Leave Management, Task 1).
 * Unique per company: { companyId, code } — see tenantIndexDefinitions.
 */
const LeaveType = createTenantModel({
  modelName: 'LeaveType',
  collection: 'leave_types',
  fields: {
    code: {
      type: String,
      required: [true, 'Leave type code is required'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Leave type name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    annualEntitlement: {
      type: Number,
      required: [true, 'Annual entitlement is required'],
      min: [0, 'annualEntitlement cannot be negative'],
    },
    allowsHalfDay: {
      type: Boolean,
      default: true,
    },
    isEncashable: {
      type: Boolean,
      default: false,
    },
    allowsCarryForward: {
      type: Boolean,
      default: false,
    },
    maxCarryForwardDays: {
      type: Number,
      default: 0,
      min: [0, 'maxCarryForwardDays cannot be negative'],
    },
    applySandwichRule: {
      type: Boolean,
      default: false,
    },
    maxAccumulation: {
      type: Number,
      default: 300,
      min: [0, 'maxAccumulation cannot be negative'],
    },
    hrApprovalRequired: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
});

module.exports = LeaveType;
