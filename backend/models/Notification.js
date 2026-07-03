const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const Notification = createTenantModel({
  modelName: 'Notification',
  collection: 'notifications',
  fields: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: null },
  },
});

module.exports = Notification;
