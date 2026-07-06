require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LeaveApproval = require('../models/LeaveApproval');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 22 — ensure `leave_approvals` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:leave-approvals
 */
async function ensureLeaveApprovalsCollection() {
  const collectionName = 'leave_approvals';

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

  await LeaveApproval.syncIndexes();

  const indexes = await LeaveApproval.collection.indexes();
  const documentCount = await LeaveApproval.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 22: leave_approvals');
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

ensureLeaveApprovalsCollection().catch(async (error) => {
  console.error('Failed to ensure leave_approvals collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
