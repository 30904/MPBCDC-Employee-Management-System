const mongoose = require('mongoose');
const District = require('../models/District');
const Region = require('../models/Region');
const { sendError, sendSuccess } = require('../utils/apiResponse');

function normalizeString(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return String(value).trim();
}

function normalizeDistrictBody(body) {
  return {
    code: normalizeString(body.code),
    name: normalizeString(body.name),
    regionId: normalizeString(body.regionId),
  };
}

function sanitizeDistrict(district) {
  const populatedRegion = district.regionId && district.regionId._id
    ? {
        id: district.regionId._id,
        code: district.regionId.code,
        name: district.regionId.name,
      }
    : district.regionId || null;

  return {
    id: district._id,
    companyId: district.companyId,
    code: district.code,
    name: district.name,
    regionId: populatedRegion,
    createdAt: district.createdAt,
    updatedAt: district.updatedAt,
  };
}

async function ensureRegion(companyId, regionId) {
  if (!regionId || !mongoose.Types.ObjectId.isValid(regionId)) {
    return { error: 'Region must belong to the same company' };
  }

  const region = await Region.findOne({ _id: regionId, companyId });
  if (!region) {
    return { error: 'Region must belong to the same company' };
  }

  return { region };
}

async function listDistricts(req, res) {
  const districts = await District.find({ companyId: req.companyId })
    .sort({ createdAt: -1 })
    .populate('regionId', 'code name');

  return sendSuccess(res, districts.map(sanitizeDistrict));
}

async function createDistrict(req, res) {
  const payload = normalizeDistrictBody(req.body);

  if (!payload.code || !payload.name || !payload.regionId) {
    return sendError(res, 'District code, name, and region are required', 400);
  }

  const regionCheck = await ensureRegion(req.companyId, payload.regionId);
  if (regionCheck.error) {
    return sendError(res, regionCheck.error, 400);
  }

  const district = await District.create({
    ...payload,
    companyId: req.companyId,
  });

  const savedDistrict = await District.findById(district._id).populate('regionId', 'code name');

  return sendSuccess(res, sanitizeDistrict(savedDistrict), 201);
}

async function updateDistrict(req, res) {
  const district = await District.findOne({ _id: req.params.id, companyId: req.companyId });

  if (!district) {
    return sendError(res, 'District not found', 404);
  }

  const payload = normalizeDistrictBody(req.body);

  if (payload.code) {
    district.code = payload.code;
  }

  if (payload.name) {
    district.name = payload.name;
  }

  if (payload.regionId !== undefined) {
    const regionCheck = await ensureRegion(req.companyId, payload.regionId);
    if (regionCheck.error) {
      return sendError(res, regionCheck.error, 400);
    }

    district.regionId = payload.regionId;
  }

  await district.save();

  const updatedDistrict = await District.findById(district._id).populate('regionId', 'code name');

  return sendSuccess(res, sanitizeDistrict(updatedDistrict));
}

module.exports = {
  listDistricts,
  createDistrict,
  updateDistrict,
  sanitizeDistrict,
};
