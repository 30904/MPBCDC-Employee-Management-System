const createTenantModel = require('./createTenantModel');

const NotificationTemplate = createTenantModel({
  modelName: 'NotificationTemplate',
  collection: 'notification_templates',
  fields: { templateCode: { type: String, trim: true } },
});

module.exports = NotificationTemplate;
