const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    isGlobal: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'roles',
  }
);

roleSchema.index({ code: 1, companyId: 1 }, { unique: true });
roleSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Role', roleSchema);
