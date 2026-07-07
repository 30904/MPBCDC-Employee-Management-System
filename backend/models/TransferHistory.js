const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const TransferHistory = createTenantModel({
  modelName: 'TransferHistory',
  collection: 'transfer_histories',
  fields: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
});

module.exports = TransferHistory;
