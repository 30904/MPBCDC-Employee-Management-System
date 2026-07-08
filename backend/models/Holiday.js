const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const Holiday = createTenantModel({
  modelName: 'Holiday',
  collection: 'holidays',
  fields: {
    date: { type: Date },
    regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
  },
});

module.exports = Holiday;
