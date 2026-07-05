const createTenantModel = require('./createTenantModel');

const LoanEligibilityRule = createTenantModel({
  modelName: 'LoanEligibilityRule',
  collection: 'loan_eligibility_rules',
  fields: { ruleCode: { type: String, trim: true, default: 'DEFAULT' } },
});

module.exports = LoanEligibilityRule;
