const createTenantModel = require('./createTenantModel');

const LoanEmiSchedule = createTenantModel({
  modelName: 'LoanEmiSchedule',
  collection: 'loan_emi_schedules',
  fields: {
    loanNo: { type: String, trim: true },
    emiNo: { type: Number },
    dueDate: { type: Date },
  },
});

module.exports = LoanEmiSchedule;
