const Grade = require('../models/Grade');
const { sendError, sendSuccess } = require('../utils/apiResponse');

function normalizeString(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return String(value).trim();
}

function parseBoolean(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', '1'].includes(normalized)) {
    return true;
  }

  if (['false', 'no', '0'].includes(normalized)) {
    return false;
  }

  return undefined;
}

function normalizeGradeBody(body) {
  return {
    code: normalizeString(body.code),
    name: normalizeString(body.name),
    approvalMatrixApplicable: parseBoolean(body.approvalMatrixApplicable),
    status: normalizeString(body.status) || 'Active',
  };
}

function sanitizeGrade(grade) {
  return {
    id: grade._id,
    companyId: grade.companyId,
    code: grade.code,
    name: grade.name,
    approvalMatrixApplicable: grade.approvalMatrixApplicable,
    status: grade.status,
    createdAt: grade.createdAt,
    updatedAt: grade.updatedAt,
  };
}

async function listGrades(req, res) {
  const grades = await Grade.find({ companyId: req.companyId }).sort({ createdAt: -1 });

  return sendSuccess(res, grades.map(sanitizeGrade));
}

async function createGrade(req, res) {
  const payload = normalizeGradeBody(req.body);

  if (!payload.code || !payload.name || payload.approvalMatrixApplicable === undefined) {
    return sendError(res, 'Grade code, name, and approval matrix applicability are required', 400);
  }

  const grade = await Grade.create({
    ...payload,
    companyId: req.companyId,
  });

  return sendSuccess(res, sanitizeGrade(grade), 201);
}

async function updateGrade(req, res) {
  const grade = await Grade.findOne({ _id: req.params.id, companyId: req.companyId });

  if (!grade) {
    return sendError(res, 'Grade not found', 404);
  }

  const payload = normalizeGradeBody(req.body);

  if (payload.code) {
    grade.code = payload.code;
  }

  if (payload.name) {
    grade.name = payload.name;
  }

  if (payload.approvalMatrixApplicable !== undefined) {
    grade.approvalMatrixApplicable = payload.approvalMatrixApplicable;
  }

  if (payload.status) {
    grade.status = payload.status;
  }

  await grade.save();

  return sendSuccess(res, sanitizeGrade(grade));
}

module.exports = {
  listGrades,
  createGrade,
  updateGrade,
  sanitizeGrade,
};
