const { TENANT_SCOPED_COLLECTIONS } = require('../../constants/tenantCollections');
const { TENANT_COMPOUND_INDEXES } = require('./tenantIndexDefinitions');
const { addTenantCompoundIndex } = require('./tenantFields');

/**
 * Apply the base tenant index plus registered compound indexes for a collection.
 * @param {import('mongoose').Schema} schema
 * @param {string} collectionName
 */
function applyTenantIndexes(schema, collectionName) {
  if (!TENANT_SCOPED_COLLECTIONS.includes(collectionName)) {
    throw new Error(`Unknown tenant collection: ${collectionName}`);
  }

  schema.index({ companyId: 1 });

  const definitions = TENANT_COMPOUND_INDEXES[collectionName] || [];

  definitions.forEach(({ fields, options = {} }) => {
    addTenantCompoundIndex(schema, fields, options);
  });
}

/**
 * Verify every tenant collection has index definitions registered.
 */
function validateTenantIndexRegistry() {
  const missing = TENANT_SCOPED_COLLECTIONS.filter(
    (collection) => !TENANT_COMPOUND_INDEXES[collection]
  );

  if (missing.length > 0) {
    throw new Error(`Missing tenant index definitions for: ${missing.join(', ')}`);
  }
}

validateTenantIndexRegistry();

module.exports = {
  applyTenantIndexes,
  validateTenantIndexRegistry,
};
