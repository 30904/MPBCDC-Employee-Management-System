const mongoose = require('mongoose');

/**
 * Tenant root model.
 * Each MPBCDC deployment provisions one or more Company documents.
 * All other business collections reference this via companyId.
 */
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      required: [true, 'Company code is required'],
      trim: true,
      uppercase: true,
      maxlength: 20,
      match: [/^[A-Z0-9_-]+$/, 'Company code must be alphanumeric (A-Z, 0-9, _, -)'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    moduleFlags: {
      loanManagement: { type: Boolean, default: true },
      leaveManagement: { type: Boolean, default: true },
      serviceRecords: { type: Boolean, default: true },
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 15,
    },
  },
  {
    timestamps: true,
    collection: 'companies',
  }
);

companySchema.index({ code: 1 }, { unique: true });
companySchema.index({ status: 1, createdAt: -1 });

companySchema.pre('save', function normalizeCode() {
  if (this.code) {
    this.code = this.code.trim().toUpperCase();
  }
});

companySchema.methods.isActive = function isActive() {
  return this.status === 'Active';
};

module.exports = mongoose.model('Company', companySchema);
