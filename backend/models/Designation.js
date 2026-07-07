const mongoose = require('mongoose');

const STATUS_VALUES = ['Active', 'Inactive'];

const designationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    gradeId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    payScale: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: 'Active',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'designations',
  }
);

module.exports = mongoose.model('Designation', designationSchema);
module.exports.STATUS_VALUES = STATUS_VALUES;
