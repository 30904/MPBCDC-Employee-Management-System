const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const HOLIDAY_TYPES = ['NATIONAL', 'REGIONAL', 'OPTIONAL'];

/**
 * Tenant-scoped holiday master (Sheet 04 — Leave Management, Task 2).
 * Unique per company: { companyId, date, regionId } — see tenantIndexDefinitions.
 */
const Holiday = createTenantModel({
  modelName: 'Holiday',
  collection: 'holidays',
  fields: {
    name: {
      type: String,
      required: [true, 'Holiday name is required'],
      trim: true,
      maxlength: 120,
    },
    date: {
      type: Date,
      required: [true, 'Holiday date is required'],
    },
    holidayType: {
      type: String,
      enum: HOLIDAY_TYPES,
      required: [true, 'Holiday type is required'],
      uppercase: true,
      trim: true,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
});

module.exports = Holiday;
module.exports.HOLIDAY_TYPES = HOLIDAY_TYPES;
