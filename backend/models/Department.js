const createTenantModel = require('./createTenantModel');

const Department = createTenantModel({
  modelName: 'Department',
  collection: 'departments',
  fields: { name: { type: String, trim: true } },
});

module.exports = Department;
