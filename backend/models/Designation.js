const createTenantModel = require('./createTenantModel');

const Designation = createTenantModel({
  modelName: 'Designation',
  collection: 'designations',
  fields: { name: { type: String, trim: true } },
});

module.exports = Designation;
