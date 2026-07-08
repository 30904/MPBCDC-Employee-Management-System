const mongoose = require('mongoose');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { sendError, sendSuccess } = require('../utils/apiResponse');

function normalizeString(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return String(value).trim();
}

function normalizeDepartmentBody(body) {
  return {
    name: normalizeString(body.name),
    headEmployeeId: normalizeString(body.headEmployeeId),
    effectiveDate: body.effectiveDate,
    status: normalizeString(body.status) || 'Active',
  };
}

function sanitizeDepartment(department) {
  const populatedHead = department.headEmployeeId && department.headEmployeeId._id
    ? {
        id: department.headEmployeeId._id,
        employeeCode: department.headEmployeeId.employeeCode,
        employeeName: department.headEmployeeId.employeeName,
      }
    : department.headEmployeeId || null;

  return {
    id: department._id,
    companyId: department.companyId,
    name: department.name,
    headEmployeeId: populatedHead,
    effectiveDate: department.effectiveDate,
    status: department.status,
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
  };
}

async function ensureHeadEmployee(companyId, headEmployeeId) {
  if (!headEmployeeId) {
    return { employee: null };
  }

  if (!mongoose.Types.ObjectId.isValid(headEmployeeId)) {
    return { error: 'Head employee must belong to the same company' };
  }

  const employee = await Employee.findOne({ _id: headEmployeeId, companyId });
  if (!employee) {
    return { error: 'Head employee must belong to the same company' };
  }

  return { employee };
}

async function listDepartments(req, res) {
  const departments = await Department.find({ companyId: req.companyId })
    .sort({ createdAt: -1 })
    .populate('headEmployeeId', 'employeeCode employeeName');

  return sendSuccess(res, departments.map(sanitizeDepartment));
}

async function createDepartment(req, res) {
  const payload = normalizeDepartmentBody(req.body);

  if (!payload.name || !payload.effectiveDate) {
    return sendError(res, 'Department name and effective date are required', 400);
  }

  const headCheck = await ensureHeadEmployee(req.companyId, payload.headEmployeeId);
  if (headCheck.error) {
    return sendError(res, headCheck.error, 400);
  }

  const department = await Department.create({
    ...payload,
    companyId: req.companyId,
  });

  const savedDepartment = await Department.findById(department._id)
    .populate('headEmployeeId', 'employeeCode employeeName');

  return sendSuccess(res, sanitizeDepartment(savedDepartment), 201);
}

async function updateDepartment(req, res) {
  const department = await Department.findOne({ _id: req.params.id, companyId: req.companyId });

  if (!department) {
    return sendError(res, 'Department not found', 404);
  }

  const payload = normalizeDepartmentBody(req.body);

  if (payload.name) {
    department.name = payload.name;
  }

  if (payload.effectiveDate) {
    department.effectiveDate = payload.effectiveDate;
  }

  if (payload.status) {
    department.status = payload.status;
  }

  if (payload.headEmployeeId !== undefined) {
    const headCheck = await ensureHeadEmployee(req.companyId, payload.headEmployeeId);
    if (headCheck.error) {
      return sendError(res, headCheck.error, 400);
    }

    department.headEmployeeId = payload.headEmployeeId || null;
  }

  await department.save();

  const updatedDepartment = await Department.findById(department._id)
    .populate('headEmployeeId', 'employeeCode employeeName');

  return sendSuccess(res, sanitizeDepartment(updatedDepartment));
}

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  sanitizeDepartment,
};