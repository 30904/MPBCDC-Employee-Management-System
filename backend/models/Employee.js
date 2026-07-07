const mongoose = require('mongoose');

const GENDER_VALUES = ['Male', 'Female', 'Other'];
const STATUS_VALUES = ['Active', 'Inactive'];
const EMPLOYMENT_TYPES = ['Permanent', 'Contract', 'Temporary', 'Probation', 'Consultant'];

const employeeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    employeeCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    gender: {
      type: String,
      required: true,
      enum: GENDER_VALUES,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    retirementDate: {
      type: Date,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => /^\d{1,15}$/.test(value),
        message: 'Mobile number must contain up to 15 digits',
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Invalid email address',
      },
    },
    aadhaarNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => /^\d{12}$/.test(value),
        message: 'Aadhaar number must contain exactly 12 digits',
      },
    },
    panNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      validate: {
        validator: (value) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value),
        message: 'PAN must match the format AAAAA9999A',
      },
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    employmentType: {
      type: String,
      required: true,
      enum: EMPLOYMENT_TYPES,
    },
    status: {
      type: String,
      required: true,
      enum: STATUS_VALUES,
      default: 'Active',
    },
    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'mpbcdc_employees',
  }
);

employeeSchema.index({ companyId: 1, employeeCode: 1 }, { unique: true });

module.exports = mongoose.model('Employee', employeeSchema);
module.exports.GENDER_VALUES = GENDER_VALUES;
module.exports.STATUS_VALUES = STATUS_VALUES;
module.exports.EMPLOYMENT_TYPES = EMPLOYMENT_TYPES;