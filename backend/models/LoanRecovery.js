const createTenantModel = require('./createTenantModel');

const LoanRecovery = createTenantModel({
  modelName: 'LoanRecovery',
  collection: 'loan_recoveries',
  fields: {
    loanNo: { type: String, trim: true },
    payrollMonth: { type: String, trim: true },
  },
});

module.exports = LoanRecovery;
