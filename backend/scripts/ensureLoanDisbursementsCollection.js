require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LoanDisbursement = require('../models/LoanDisbursement');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 13 — ensure `loan_disbursements` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:loan-disbursements
 */
async function ensureLoanDisbursementsCollection() {
  const collectionName = 'loan_disbursements';

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

  await LoanDisbursement.syncIndexes();

  const indexes = await LoanDisbursement.collection.indexes();
  const documentCount = await LoanDisbursement.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 13: loan_disbursements');
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

ensureLoanDisbursementsCollection().catch(async (error) => {
  console.error('Failed to ensure loan_disbursements collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
