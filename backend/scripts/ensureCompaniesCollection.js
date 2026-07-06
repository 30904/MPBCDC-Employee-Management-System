require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Company = require('../models/Company');
const { PLATFORM_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 1 — ensure `companies` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:companies
 */
async function ensureCompaniesCollection() {
  const collectionName = 'companies';

  if (!PLATFORM_COLLECTIONS.includes(collectionName)) {
    throw new Error(`${collectionName} is not registered as a platform collection`);
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

  await Company.syncIndexes();

  const indexes = await Company.collection.indexes();
  const documentCount = await Company.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 1: companies');
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

ensureCompaniesCollection().catch(async (error) => {
  console.error('Failed to ensure companies collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
