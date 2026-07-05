const mongoose = require('mongoose');

/**
 * Required on every tenant-scoped business collection (employees, departments, loans, etc.).
 * The root `companies` collection does NOT use this field — it is the tenant itself.
 */
const companyIdFieldDefinition = {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Company',
  required: [true, 'companyId is required for tenant-scoped records'],
};

/**
 * Optional companyId — used only on `users` where SUPER_ADMIN has no tenant.
 */
const companyIdFieldOptionalDefinition = {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Company',
  default: null,
};

function companyIdField(required = true) {
  return required ? { ...companyIdFieldDefinition } : { ...companyIdFieldOptionalDefinition };
}

/**
 * Apply a compound unique index scoped per tenant.
 * @example addTenantCompoundIndex(schema, { employeeCode: 1 })
 */
function addTenantCompoundIndex(schema, fields, options = {}) {
  schema.index({ companyId: 1, ...fields }, options);
}

module.exports = {
  companyIdField,
  companyIdFieldDefinition,
  companyIdFieldOptionalDefinition,
  addTenantCompoundIndex,
};
