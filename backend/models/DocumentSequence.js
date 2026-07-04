const mongoose = require('mongoose');
const { ALLOWED_PREFIXES } = require('../utils/autoNumberPrefixes');

const documentSequenceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    prefix: {
      type: String,
      required: true,
      enum: ALLOWED_PREFIXES,
      uppercase: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    lastSequence: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'document_sequences',
  }
);

documentSequenceSchema.index({ companyId: 1, prefix: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('DocumentSequence', documentSequenceSchema);
