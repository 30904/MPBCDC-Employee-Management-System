const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const District = createTenantModel({
  modelName: 'District',
  collection: 'districts',
  fields: {
    code: { type: String, trim: true, uppercase: true },
    regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
  },
});

module.exports = District;
