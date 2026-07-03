const createTenantModel = require('./createTenantModel');

const Grade = createTenantModel({
  modelName: 'Grade',
  collection: 'grades',
  fields: { code: { type: String, trim: true, uppercase: true } },
});

module.exports = Grade;
