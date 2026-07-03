const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ALL_ROLES, ROLES } = require('../utils/roles');
const { companyIdField } = require('./shared/tenantFields');
const { applyTenantIndexes } = require('./shared/applyTenantIndexes');
const tenantScopedPlugin = require('./plugins/tenantScoped');

const userSchema = new mongoose.Schema(
  {
    loginId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MpbcdcEmployee',
      default: null,
    },
    roles: {
      type: [String],
      enum: ALL_ROLES,
      required: true,
      validate: {
        validator: (roles) => Array.isArray(roles) && roles.length > 0,
        message: 'At least one role is required',
      },
    },
    companyId: companyIdField(false),
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

applyTenantIndexes(userSchema, 'users');
userSchema.plugin(tenantScopedPlugin);

userSchema.pre('validate', function enforceTenantRules() {
  const isSuperAdmin = this.roles?.includes(ROLES.SUPER_ADMIN);

  if (isSuperAdmin && this.companyId) {
    this.invalidate('companyId', 'SUPER_ADMIN users must not belong to a company');
  }

  if (!isSuperAdmin && !this.companyId) {
    this.invalidate('companyId', 'Tenant users must have a companyId');
  }
});

userSchema.methods.comparePassword = async function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

module.exports = mongoose.model('User', userSchema);
