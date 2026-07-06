require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LeaveApplication = require('../models/LeaveApplication');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 21 — ensure `leave_applications` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:leave-applications
 */
async function ensureLeaveApplicationsCollection() {
  const collectionName = 'leave_applications';

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

  await LeaveApplication.syncIndexes();

  const indexes = await LeaveApplication.collection.indexes();
  const documentCount = await LeaveApplication.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 21: leave_applications');
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

ensureLeaveApplicationsCollection().catch(async (error) => {
  console.error('Failed to ensure leave_applications collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
