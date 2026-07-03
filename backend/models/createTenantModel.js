const mongoose = require('mongoose');
const { companyIdField } = require('./shared/tenantFields');
const { applyTenantIndexes } = require('./shared/applyTenantIndexes');
const tenantScopedPlugin = require('./plugins/tenantScoped');

/**
 * Factory for tenant-scoped model shells.
 * Full field schemas are added in feature tasks; indexes are defined up front.
 */
function createTenantModel({ modelName, collection, fields = {} }) {
  const schema = new mongoose.Schema(
    {
      companyId: companyIdField(),
      ...fields,
    },
    {
      timestamps: true,
      collection,
    }
  );

  applyTenantIndexes(schema, collection);
  schema.plugin(tenantScopedPlugin);

  return mongoose.model(modelName, schema);
}

module.exports = createTenantModel;
