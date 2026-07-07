const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const SalaryRevision = createTenantModel({
  modelName: 'SalaryRevision',
  collection: 'salary_revisions',
  fields: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    effectiveDate: { type: Date },
  },
});

module.exports = SalaryRevision;
