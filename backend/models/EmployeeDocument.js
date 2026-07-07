const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const EmployeeDocument = createTenantModel({
  modelName: 'EmployeeDocument',
  collection: 'employee_documents',
  fields: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    category: { type: String, trim: true },
  },
});

module.exports = EmployeeDocument;
