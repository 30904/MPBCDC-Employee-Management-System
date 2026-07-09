const mongoose = require('mongoose');
const Region = require('../models/Region');
const Employee = require('../models/Employee');
const { sendError, sendSuccess } = require('../utils/apiResponse');

function normalizeString(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return String(value).trim();
}

function normalizeRegionBody(body) {
  return {
    code: normalizeString(body.code),
    name: normalizeString(body.name),
    managerEmployeeId: normalizeString(body.managerEmployeeId),
  };
}

function sanitizeRegion(region) {
  const populatedManager = region.managerEmployeeId && region.managerEmployeeId._id
    ? {
        id: region.managerEmployeeId._id,
        employeeCode: region.managerEmployeeId.employeeCode,
        employeeName: region.managerEmployeeId.employeeName,
      }
    : region.managerEmployeeId || null;

  return {
    id: region._id,
    companyId: region.companyId,
    code: region.code,
    name: region.name,
    managerEmployeeId: populatedManager,
    createdAt: region.createdAt,
    updatedAt: region.updatedAt,
  };
}

async function ensureManagerEmployee(companyId, managerEmployeeId) {
  if (!managerEmployeeId || !mongoose.Types.ObjectId.isValid(managerEmployeeId)) {
    return { error: 'Regional manager must belong to the same company' };
  }

  const employee = await Employee.findOne({ _id: managerEmployeeId, companyId });
  if (!employee) {
    return { error: 'Regional manager must belong to the same company' };
  }

  return { employee };
}

async function listRegions(req, res) {
  const regions = await Region.find({ companyId: req.companyId })
    .sort({ createdAt: -1 })
    .populate('managerEmployeeId', 'employeeCode employeeName');

  return sendSuccess(res, regions.map(sanitizeRegion));
}

async function createRegion(req, res) {
  const payload = normalizeRegionBody(req.body);

  if (!payload.code || !payload.name) {
    return sendError(res, 'Region code and name are required', 400);
  }

  if (payload.managerEmployeeId) {
    const managerCheck = await ensureManagerEmployee(req.companyId, payload.managerEmployeeId);
    if (managerCheck.error) {
      return sendError(res, managerCheck.error, 400);
    }
  }

  const region = await Region.create({
    ...payload,
    companyId: req.companyId,
  });

  const savedRegion = await Region.findById(region._id).populate(
    'managerEmployeeId',
    'employeeCode employeeName'
  );

  return sendSuccess(res, sanitizeRegion(savedRegion), 201);
}

async function updateRegion(req, res) {
  const region = await Region.findOne({ _id: req.params.id, companyId: req.companyId });

  if (!region) {
    return sendError(res, 'Region not found', 404);
  }

  const payload = normalizeRegionBody(req.body);

  if (payload.code) {
    region.code = payload.code;
  }

  if (payload.name) {
    region.name = payload.name;
  }

  if (payload.managerEmployeeId !== undefined) {
    if (payload.managerEmployeeId) {
      const managerCheck = await ensureManagerEmployee(req.companyId, payload.managerEmployeeId);
      if (managerCheck.error) {
        return sendError(res, managerCheck.error, 400);
      }

      region.managerEmployeeId = payload.managerEmployeeId;
    } else {
      region.managerEmployeeId = null;
    }
  }

  await region.save();

  const updatedRegion = await Region.findById(region._id).populate(
    'managerEmployeeId',
    'employeeCode employeeName'
  );

  return sendSuccess(res, sanitizeRegion(updatedRegion));
}

module.exports = {
  listRegions,
  createRegion,
  updateRegion,
  sanitizeRegion,
};
