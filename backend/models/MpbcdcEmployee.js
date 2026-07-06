const createTenantModel = require('./createTenantModel');

const MpbcdcEmployee = createTenantModel({
  modelName: 'MpbcdcEmployee',
  collection: 'mpbcdc_employees',
  fields: {
    employeeCode: { type: String, trim: true, uppercase: true },
    grossSalary: { type: Number, min: 0, default: null },
    dateOfJoining: { type: Date, default: null },
    retirementDate: { type: Date, default: null },
  },
});

module.exports = MpbcdcEmployee;
