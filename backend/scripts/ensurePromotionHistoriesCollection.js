require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const PromotionHistory = require('../models/PromotionHistory');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');

/**
 * Checklist task 23 — ensure `promotion_histories` collection exists with schema indexes.
 * Run after setting MONGODB_URI in backend/.env:
 *   npm run db:ensure:promotion-histories
 */
async function ensurePromotionHistoriesCollection() {
  const collectionName = 'promotion_histories';

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

  await PromotionHistory.syncIndexes();

  const indexes = await PromotionHistory.collection.indexes();
  const documentCount = await PromotionHistory.countDocuments();

  console.log('\nMongoDB Collections Checklist — Task 23: promotion_histories');
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

ensurePromotionHistoriesCollection().catch(async (error) => {
  console.error('Failed to ensure promotion_histories collection:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
