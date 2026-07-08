const createTenantModel = require('./createTenantModel');
const mongoose = require('mongoose');

const STATUS_VALUES = ['Active', 'Inactive'];

const Department = createTenantModel({
  modelName: 'Department',
  collection: 'departments',
  fields: {
    name: {
      type: String,
      required: [true, 'Department name is required'],
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
});

module.exports = Department;
module.exports.STATUS_VALUES = STATUS_VALUES;
