require('dotenv').config();

const connectDB = require('../config/db');
const { TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');
const models = require('../models');

const COLLECTION_MODEL_MAP = {
  mpbcdc_employees: 'Employee',
};

/**
 * Sync MongoDB indexes for all tenant-scoped collections.
 * Run after deploy or when index definitions change:
 *   node scripts/syncTenantIndexes.js
 */
async function syncTenantIndexes() {
  await connectDB();

  const results = [];

  for (const collection of TENANT_SCOPED_COLLECTIONS) {
    const mappedModelName = COLLECTION_MODEL_MAP[collection];
    const modelEntry =
      (mappedModelName && models[mappedModelName]) ||
      Object.values(models).find(
        (model) => model?.modelName && model.collection?.name === collection
      );

    if (!modelEntry) {
      results.push({ collection, status: 'skipped', reason: 'model not registered' });
      continue;
    }

    await modelEntry.syncIndexes();
    results.push({
      collection,
      status: 'synced',
      model: modelEntry.modelName,
      indexes: modelEntry.schema.indexes().map(([spec, options]) => ({
        key: spec,
        unique: Boolean(options?.unique),
      })),
    });
  }

  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

syncTenantIndexes().catch((error) => {
  console.error('Index sync failed:', error.message);
  process.exit(1);
});
