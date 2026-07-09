const createTenantModel = require('./createTenantModel');
const mongoose = require('mongoose');

const Region = createTenantModel({
  modelName: 'Region',
  collection: 'regions',
  fields: {
    code: {
      type: String,
      required: [true, 'Region code is required'],
      trim: true,
      maxlength: 50,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Region name is required'],
      trim: true,
      maxlength: 120,
    },
    managerEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'companyId is required'],
      index: true,
    },
  },
});

module.exports = Region;
