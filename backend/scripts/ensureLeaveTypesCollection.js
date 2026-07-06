require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LeaveType = require('../models/LeaveType');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 17 — ensure `leave_types` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:leave-types
 */
async function ensureLeaveTypesCollection() {
  const collectionName = 'leave_types';

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

  await LeaveType.syncIndexes();

  const indexes = await LeaveType.collection.indexes();
  const documentCount = await LeaveType.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 17: leave_types');
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

ensureLeaveTypesCollection().catch(async (error) => {
  console.error('Failed to ensure leave_types collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
