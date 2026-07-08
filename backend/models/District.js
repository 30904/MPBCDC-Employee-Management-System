const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const District = createTenantModel({
  modelName: 'District',
  collection: 'districts',
  fields: {
    code: {
      type: String,
      required: [true, 'District code is required'],
      trim: true,
      maxlength: 50,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'District name is required'],
      trim: true,
      maxlength: 120,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: [true, 'regionId is required'],
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

module.exports = District;
