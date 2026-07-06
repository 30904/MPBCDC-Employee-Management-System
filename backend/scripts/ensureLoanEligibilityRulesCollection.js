require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LoanEligibilityRule = require('../models/LoanEligibilityRule');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 10 — ensure `loan_eligibility_rules` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:loan-eligibility-rules
 */
async function ensureLoanEligibilityRulesCollection() {
  const collectionName = 'loan_eligibility_rules';

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

  await LoanEligibilityRule.syncIndexes();

  const indexes = await LoanEligibilityRule.collection.indexes();
  const documentCount = await LoanEligibilityRule.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 10: loan_eligibility_rules');
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

ensureLoanEligibilityRulesCollection().catch(async (error) => {
  console.error('Failed to ensure loan_eligibility_rules collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
