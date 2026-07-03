const Company = require('./Company');
const User = require('./User');
const tenantScopedModels = require('./tenantScopedModels');
const tenantScopedPlugin = require('./plugins/tenantScoped');
const { PLATFORM_COLLECTIONS, TENANT_SCOPED_COLLECTIONS } = require('../constants/tenantCollections');
const { TENANT_COMPOUND_INDEXES } = require('./shared/tenantIndexDefinitions');
const { applyTenantIndexes } = require('./shared/applyTenantIndexes');
const createTenantModel = require('./createTenantModel');

module.exports = {
  Company,
  User,
  ...tenantScopedModels,
  tenantScopedPlugin,
  createTenantModel,
  applyTenantIndexes,
  PLATFORM_COLLECTIONS,
  TENANT_SCOPED_COLLECTIONS,
  TENANT_COMPOUND_INDEXES,
};
