const mongoose = require('mongoose');
const Holiday = require('../models/Holiday');
const Region = require('../models/Region');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');
const { parseIsoDate, toIsoDateString, toDisplayDate, startOfUtcDay } = require('../utils/dateUtils');

const WRITABLE_FIELDS = ['name', 'date', 'holidayType', 'regionId', 'description', 'isActive'];
const REQUIRED_ON_CREATE = ['name', 'date', 'holidayType'];

function tenantHolidays(req) {
  return Holiday.forTenant(req.companyId);
}

function tenantRegions(req) {
  return Region.forTenant(req.companyId);
}

function parseBoolean(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  throw new AppError(`Invalid ${fieldName}. Use true or false`, 400, 'VALIDATION_ERROR');
}

function normalizeRegionId(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '' || value === 'null') {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError('Invalid regionId', 400, 'VALIDATION_ERROR');
  }

  return value;
}

function validateHolidayTypeRules({ holidayType, regionId }) {
  const normalizedType = String(holidayType || '').toUpperCase();

  if (normalizedType === 'NATIONAL' && regionId) {
    throw new AppError('National holidays must not be linked to a region', 400, 'VALIDATION_ERROR');
  }

  if (normalizedType === 'REGIONAL' && !regionId) {
    throw new AppError('Regional holidays require a region', 400, 'VALIDATION_ERROR');
  }
}

async function assertRegionExists(req, regionId) {
  if (!regionId) {
    return;
  }

  const region = await tenantRegions(req).findById(regionId).select('_id code');
  if (!region) {
    throw new AppError('Region not found', 404, 'NOT_FOUND');
  }
}

function serializeHoliday(holiday) {
  const doc = holiday.toObject ? holiday.toObject() : holiday;

  return {
    ...doc,
    date: toIsoDateString(doc.date),
    displayDate: toDisplayDate(doc.date),
    region: doc.regionId
      ? {
          _id: doc.regionId._id || doc.regionId,
          code: doc.regionId.code || null,
        }
      : null,
  };
}

function pickHolidayPayload(body, { partial = false } = {}) {
  const payload = {};

  WRITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  if (payload.name !== undefined) {
    payload.name = String(payload.name).trim();
  }

  if (payload.description !== undefined) {
    payload.description = String(payload.description).trim();
  }

  if (payload.holidayType !== undefined) {
    payload.holidayType = String(payload.holidayType).trim().toUpperCase();
  }

  if (payload.date !== undefined) {
    payload.date = startOfUtcDay(parseIsoDate(payload.date, 'date'));
  }

  if (payload.regionId !== undefined) {
    payload.regionId = normalizeRegionId(payload.regionId);
  }

  if (payload.isActive !== undefined) {
    payload.isActive = parseBoolean(payload.isActive, 'isActive');
  }

  if (!partial) {
    const missing = REQUIRED_ON_CREATE.filter((field) => {
      const value = payload[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      throw new AppError(`${missing.join(', ')} required`, 400, 'VALIDATION_ERROR');
    }
  }

  if (payload.holidayType !== undefined || payload.regionId !== undefined) {
    validateHolidayTypeRules({
      holidayType: payload.holidayType ?? body.holidayType,
      regionId: payload.regionId ?? body.regionId ?? null,
    });
  }

  return payload;
}

function parseYearFilter(value) {
  if (value === undefined || value === null || value === '') {
    return new Date().getUTCFullYear();
  }

  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new AppError('Invalid year filter', 400, 'VALIDATION_ERROR');
  }

  return year;
}

function buildYearRange(year) {
  return {
    $gte: new Date(Date.UTC(year, 0, 1)),
    $lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
  };
}

async function listRegionOptions(req, res) {
  const regions = await tenantRegions(req).find({}).sort({ code: 1 }).select('_id code').lean();

  return sendSuccess(
    res,
    regions.map((region) => ({
      _id: region._id,
      code: region.code,
      label: region.code,
    }))
  );
}

async function listHolidays(req, res) {
  const pagination = parsePagination(req.query);
  const year = parseYearFilter(req.query.year);
  const isActive = parseBoolean(req.query.isActive, 'isActive');
  const holidayType = req.query.holidayType
    ? String(req.query.holidayType).trim().toUpperCase()
    : undefined;
  const regionId = req.query.regionId ? normalizeRegionId(req.query.regionId) : undefined;

  const filter = {
    date: buildYearRange(year),
  };

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  if (holidayType) {
    filter.holidayType = holidayType;
  }

  if (regionId !== undefined) {
    filter.regionId = regionId;
  }

  const query = tenantHolidays(req)
    .find(filter)
    .populate('regionId', 'code')
    .sort({ date: 1, holidayType: 1, name: 1 });

  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);

  return sendPaginatedSuccess(res, docs.map(serializeHoliday), meta);
}

async function getHoliday(req, res) {
  const holiday = await tenantHolidays(req).findById(req.params.id).populate('regionId', 'code');

  if (!holiday) {
    throw new AppError('Holiday not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, serializeHoliday(holiday));
}

async function createHoliday(req, res) {
  const payload = pickHolidayPayload(req.body);
  await assertRegionExists(req, payload.regionId);

  const holiday = await tenantHolidays(req).create(payload);
  await holiday.populate('regionId', 'code');

  return sendSuccess(res, serializeHoliday(holiday), 201);
}

async function updateHoliday(req, res) {
  const existing = await tenantHolidays(req).findById(req.params.id);

  if (!existing) {
    throw new AppError('Holiday not found', 404, 'NOT_FOUND');
  }

  const payload = pickHolidayPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new AppError('No valid fields to update', 400, 'VALIDATION_ERROR');
  }

  const nextType = payload.holidayType ?? existing.holidayType;
  const nextRegionId =
    payload.regionId !== undefined ? payload.regionId : existing.regionId ? String(existing.regionId) : null;

  validateHolidayTypeRules({ holidayType: nextType, regionId: nextRegionId });
  await assertRegionExists(req, payload.regionId);

  const holiday = await tenantHolidays(req)
    .findOneAndUpdate({ _id: req.params.id }, { $set: payload }, { new: true, runValidators: true })
    .populate('regionId', 'code');

  return sendSuccess(res, serializeHoliday(holiday));
}

async function deleteHoliday(req, res) {
  const holiday = await tenantHolidays(req).findById(req.params.id);

  if (!holiday) {
    throw new AppError('Holiday not found', 404, 'NOT_FOUND');
  }

  await tenantHolidays(req).deleteOne({ _id: holiday._id });

  return sendSuccess(res, { id: holiday._id, deleted: true });
}

module.exports = {
  listRegionOptions,
  listHolidays,
  getHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};
