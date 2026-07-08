const Designation = require('../models/Designation');
const { sendError, sendSuccess } = require('../utils/apiResponse');

function normalizeString(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return String(value).trim();
}

function normalizeDesignationBody(body) {
  return {
    code: normalizeString(body.code),
    name: normalizeString(body.name),
    gradeId: normalizeString(body.gradeId),
    payScale: normalizeString(body.payScale),
    status: normalizeString(body.status) || 'Active',
  };
}

function sanitizeDesignation(designation) {
  return {
    id: designation._id,
    companyId: designation.companyId,
    code: designation.code,
    name: designation.name,
    gradeId: designation.gradeId,
    payScale: designation.payScale,
    status: designation.status,
    createdAt: designation.createdAt,
    updatedAt: designation.updatedAt,
  };
}

async function listDesignations(req, res) {
  const designations = await Designation.find({ companyId: req.companyId }).sort({ createdAt: -1 });

  return sendSuccess(res, designations.map(sanitizeDesignation));
}

async function createDesignation(req, res) {
  const payload = normalizeDesignationBody(req.body);

  if (!payload.code || !payload.name || !payload.gradeId || !payload.payScale) {
    return sendError(res, 'Designation code, name, grade, and pay scale are required', 400);
  }

  const designation = await Designation.create({
    ...payload,
    companyId: req.companyId,
  });

  return sendSuccess(res, sanitizeDesignation(designation), 201);
}

async function updateDesignation(req, res) {
  const designation = await Designation.findOne({ _id: req.params.id, companyId: req.companyId });

  if (!designation) {
    return sendError(res, 'Designation not found', 404);
  }

  const payload = normalizeDesignationBody(req.body);

  if (payload.code) {
    designation.code = payload.code;
  }

  if (payload.name) {
    designation.name = payload.name;
  }

  if (payload.gradeId) {
    designation.gradeId = payload.gradeId;
  }

  if (payload.payScale !== undefined) {
    designation.payScale = payload.payScale;
  }

  if (payload.status) {
    designation.status = payload.status;
  }

  await designation.save();

  return sendSuccess(res, sanitizeDesignation(designation));
}

module.exports = {
  listDesignations,
  createDesignation,
  updateDesignation,
  sanitizeDesignation,
};
