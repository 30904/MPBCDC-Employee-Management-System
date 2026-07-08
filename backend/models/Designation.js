const createTenantModel = require('./createTenantModel');
const mongoose = require('mongoose');

const STATUS_VALUES = ['Active', 'Inactive'];

const Designation = createTenantModel({
  modelName: 'Designation',
  collection: 'designations',
  fields: {
    code: {
      type: String,
      required: [true, 'Designation code is required'],
      trim: true,
      maxlength: 50,
    },
    name: {
      type: String,
      required: [true, 'Designation name is required'],
      trim: true,
      maxlength: 120,
    },
    gradeId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    payScale: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: 'Active',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'companyId is required'],
      index: true,
    },
  },
});

module.exports = Designation;
module.exports.STATUS_VALUES = STATUS_VALUES;
