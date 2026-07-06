const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ALL_ROLES } = require('../utils/roles');

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
      ref: 'Employee',
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
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
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

userSchema.index({ loginId: 1, companyId: 1 }, { unique: true });

userSchema.methods.comparePassword = async function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

module.exports = mongoose.model('User', userSchema);
