require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Employee = require('../models/Employee');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Ensure `mpbcdc_employees` collection exists with Employee schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:employees
 */
async function ensureEmployeesCollection() {
  const collectionName = 'mpbcdc_employees';

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

  await Employee.syncIndexes();

  const indexes = await Employee.collection.indexes();
  const documentCount = await Employee.countDocuments();

  console.log('\nMongoDB Collections Checklist — employees (mpbcdc_employees)');
  console.log(`Database: ${db.databaseName}`);
  console.log(`Collection: ${collectionName}`);
  console.log(`Model: Employee`);
  console.log(`Documents: ${documentCount}`);
  console.log('Indexes:');
  indexes.forEach((index) => {
    console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

ensureEmployeesCollection().catch(async (error) => {
  console.error('Failed to ensure mpbcdc_employees collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
