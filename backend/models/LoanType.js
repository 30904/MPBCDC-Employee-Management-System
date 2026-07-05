const createTenantModel = require('./createTenantModel');

const LoanType = createTenantModel({
  modelName: 'LoanType',
  collection: 'loan_types',
  fields: { code: { type: String, trim: true, uppercase: true } },
});

module.exports = LoanType;
