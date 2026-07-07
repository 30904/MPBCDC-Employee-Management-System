const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const PromotionHistory = createTenantModel({
  modelName: 'PromotionHistory',
  collection: 'promotion_histories',
  fields: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
});

module.exports = PromotionHistory;
