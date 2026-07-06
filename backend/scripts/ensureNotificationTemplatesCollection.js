require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const NotificationTemplate = require('../models/NotificationTemplate');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 29 — ensure `notification_templates` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:notification-templates
 */
async function ensureNotificationTemplatesCollection() {
  const collectionName = 'notification_templates';

  if (!TENANT_SCOPED_COLLECTIONS.includes(collectionName)) {
    throw new Error(`${collectionName} is not registered as a tenant-scoped collection`);
  }

  await connectDB();

  const db = mongoose.connection.db;
  const existing = await db.listCollections({ name: collectionName }).toArray();
  const created = existing.length === 0;

  if (created) {
    await db.createCollection(collectionName);
    console.log(`Created collection: ${collectionName}`);
  } else {
    console.log(`Collection already exists: ${collectionName}`);
  }

  await NotificationTemplate.syncIndexes();

  const indexes = await NotificationTemplate.collection.indexes();
  const documentCount = await NotificationTemplate.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 29: notification_templates');
  console.log(`Database: ${db.databaseName}`);
  console.log(`Collection: ${collectionName}`);
  console.log(`Documents: ${documentCount}`);
  console.log('Indexes:');
  indexes.forEach((index) => {
    console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

ensureNotificationTemplatesCollection().catch(async (error) => {
  console.error('Failed to ensure notification_templates collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
