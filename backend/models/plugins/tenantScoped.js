const mongoose = require('mongoose');
const { tenantFilter } = require('../../utils/tenantQuery');

/**
 * Mongoose plugin for tenant-scoped models.
 * Adds Model.forTenant(companyId) — all queries automatically include { companyId }.
 *
 * @example
 * const employees = await MpbcdcEmployee.forTenant(req.companyId).find({ status: 'Active' });
 */
function tenantScopedPlugin(schema) {
  schema.statics.forTenant = function forTenant(companyId) {
    const scoped = (extra = {}) => tenantFilter(companyId, extra);
    const Model = this;

    return {
      find(filter = {}, projection, options) {
        return Model.find(scoped(filter), projection, options);
      },

      findOne(filter = {}, projection, options) {
        return Model.findOne(scoped(filter), projection, options);
      },

      findById(id, projection, options) {
        return Model.findOne(scoped({ _id: id }), projection, options);
      },

      countDocuments(filter = {}, options) {
        return Model.countDocuments(scoped(filter), options);
      },

      exists(filter = {}) {
        return Model.exists(scoped(filter));
      },

      create(data) {
        return Model.create({
          ...data,
          companyId: tenantFilter(companyId).companyId,
        });
      },

      updateOne(filter, update, options) {
        return Model.updateOne(scoped(filter), update, options);
      },

      updateMany(filter, update, options) {
        return Model.updateMany(scoped(filter), update, options);
      },

      deleteOne(filter, options) {
        return Model.deleteOne(scoped(filter), options);
      },

      deleteMany(filter, options) {
        return Model.deleteMany(scoped(filter), options);
      },

      findOneAndUpdate(filter, update, options) {
        return Model.findOneAndUpdate(scoped(filter), update, options);
      },

      findOneAndDelete(filter, options) {
        return Model.findOneAndDelete(scoped(filter), options);
      },
    };
  };

  schema.pre(['updateOne', 'findOneAndUpdate', 'updateMany', 'replaceOne'], function blockCompanyIdMutation() {
    const update = this.getUpdate();
    if (!update) return;

    if (update.companyId !== undefined) {
      delete update.companyId;
    }

    if (update.$set?.companyId !== undefined) {
      delete update.$set.companyId;
    }
  });
}

module.exports = tenantScopedPlugin;
