const mongoose = require('mongoose');

const STATUS_VALUES = ['Active', 'Inactive'];

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    headEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    effectiveDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: 'Active',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'departments',
  }
);

module.exports = mongoose.model('Department', departmentSchema);
module.exports.STATUS_VALUES = STATUS_VALUES;