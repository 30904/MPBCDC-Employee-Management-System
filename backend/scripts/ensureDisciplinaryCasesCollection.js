require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const DisciplinaryCase = require('../models/DisciplinaryCase');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 26 — ensure `disciplinary_cases` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:disciplinary-cases
 */
async function ensureDisciplinaryCasesCollection() {
  const collectionName = 'disciplinary_cases';

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

  await DisciplinaryCase.syncIndexes();

  const indexes = await DisciplinaryCase.collection.indexes();
  const documentCount = await DisciplinaryCase.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 26: disciplinary_cases');
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

ensureDisciplinaryCasesCollection().catch(async (error) => {
  console.error('Failed to ensure disciplinary_cases collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
