const mongoose = require('mongoose');

const STATUS_VALUES = ['Active', 'Inactive'];

const gradeSchema = new mongoose.Schema(
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
    approvalMatrixApplicable: {
      type: Boolean,
      default: false,
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
    collection: 'grades',
  }
);

module.exports = mongoose.model('Grade', gradeSchema);
module.exports.STATUS_VALUES = STATUS_VALUES;
