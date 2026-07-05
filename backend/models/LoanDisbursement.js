const createTenantModel = require('./createTenantModel');

const LoanDisbursement = createTenantModel({
  modelName: 'LoanDisbursement',
  collection: 'loan_disbursements',
  fields: { disbursementNo: { type: String, trim: true } },
});

module.exports = LoanDisbursement;
