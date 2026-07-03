const createTenantModel = require('./createTenantModel');

const MpbcdcEmployee = createTenantModel({
  modelName: 'MpbcdcEmployee',
  collection: 'mpbcdc_employees',
  fields: { employeeCode: { type: String, trim: true } },
});

module.exports = MpbcdcEmployee;
