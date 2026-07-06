require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const SalaryRevision = require('../models/SalaryRevision');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 24 — ensure `salary_revisions` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:salary-revisions
 */
async function ensureSalaryRevisionsCollection() {
  const collectionName = 'salary_revisions';

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

  await SalaryRevision.syncIndexes();

  const indexes = await SalaryRevision.collection.indexes();
  const documentCount = await SalaryRevision.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 24: salary_revisions');
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

ensureSalaryRevisionsCollection().catch(async (error) => {
  console.error('Failed to ensure salary_revisions collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
