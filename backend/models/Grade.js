const createTenantModel = require('./createTenantModel');
const mongoose = require('mongoose');

const STATUS_VALUES = ['Active', 'Inactive'];

const Grade = createTenantModel({
  modelName: 'Grade',
  collection: 'grades',
  fields: {
    code: {
      type: String,
      required: [true, 'Grade code is required'],
      trim: true,
      maxlength: 50,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Grade name is required'],
      trim: true,
      maxlength: 120,
    },
    approvalMatrixApplicable: {
      type: Boolean,
      default: false,
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

module.exports = Grade;
module.exports.STATUS_VALUES = STATUS_VALUES;
