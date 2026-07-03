const createTenantModel = require('./createTenantModel');

const LoanClosure = createTenantModel({
  modelName: 'LoanClosure',
  collection: 'loan_closures',
  fields: { closureNo: { type: String, trim: true } },
});

module.exports = LoanClosure;
