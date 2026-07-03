const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
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
    },
    contactPhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'companies',
  }
);

companySchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);
