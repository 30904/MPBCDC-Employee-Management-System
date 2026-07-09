const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const Notification = createTenantModel({
  modelName: 'Notification',
  collection: 'notifications',
  fields: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    entityType: { type: String, trim: true, default: '' },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    readAt: { type: Date, default: null },
  },
});

module.exports = Notification;
