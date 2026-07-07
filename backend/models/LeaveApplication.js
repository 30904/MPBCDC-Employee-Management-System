const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const LeaveApplication = createTenantModel({
  modelName: 'LeaveApplication',
  collection: 'leave_applications',
  fields: {
    applicationNo: { type: String, trim: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, trim: true },
    fromDate: { type: Date },
    toDate: { type: Date },
  },
});

module.exports = LeaveApplication;
