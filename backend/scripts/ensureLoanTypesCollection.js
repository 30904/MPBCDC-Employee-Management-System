require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LoanType = require('../models/LoanType');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 9 — ensure `loan_types` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:loan-types
 */
async function ensureLoanTypesCollection() {
  const collectionName = 'loan_types';

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

  await LoanType.syncIndexes();

  const indexes = await LoanType.collection.indexes();
  const documentCount = await LoanType.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 9: loan_types');
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

ensureLoanTypesCollection().catch(async (error) => {
  console.error('Failed to ensure loan_types collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
