require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Designation = require('../models/Designation');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 5 — ensure `designations` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:designations
 */
async function ensureDesignationsCollection() {
  const collectionName = 'designations';

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

  await Designation.syncIndexes();

  const indexes = await Designation.collection.indexes();
  const documentCount = await Designation.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 5: designations');
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

ensureDesignationsCollection().catch(async (error) => {
  console.error('Failed to ensure designations collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
