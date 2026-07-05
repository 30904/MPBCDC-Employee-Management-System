const createTenantModel = require('./createTenantModel');

const Region = createTenantModel({
  modelName: 'Region',
  collection: 'regions',
  fields: { code: { type: String, trim: true, uppercase: true } },
});

module.exports = Region;
