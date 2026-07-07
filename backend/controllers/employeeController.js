const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const {
  normalizeEmployeeBody,
  sanitizeEmployee,
  ensureReportingManager,
} = require('../utils/employeeHelpers');
const { provisionEmployeeWithAccount } = require('../services/employeeProvisioningService');

async function listEmployees(req, res) {
  const employees = await Employee.find({ companyId: req.companyId })
    .sort({ createdAt: -1 })
    .populate('reportingManager', 'employeeCode employeeName');

  return sendSuccess(res, employees.map(sanitizeEmployee));
}

async function getEmployee(req, res) {
  const employee = await Employee.findOne({ _id: req.params.id, companyId: req.companyId })
    .populate('reportingManager', 'employeeCode employeeName');

  if (!employee) {
    return sendError(res, 'Employee not found', 404);
  }

  return sendSuccess(res, sanitizeEmployee(employee));
}

async function createEmployee(req, res) {
  const payload = normalizeEmployeeBody(req.body);

  if (!payload.employeeCode || !payload.employeeName || !payload.reportingManager) {
    return sendError(res, 'Employee code, name, and reporting manager are required', 400);
  }

  const existingEmployee = await Employee.findOne({
    companyId: req.companyId,
    employeeCode: payload.employeeCode,
  });

  if (existingEmployee) {
    return sendError(res, 'Employee code already exists for this company', 409);
  }

  const managerCheck = await ensureReportingManager(req.companyId, payload.reportingManager);
  if (managerCheck.error) {
    return sendError(res, managerCheck.error, 400);
  }

  const employee = await Employee.create({
    ...payload,
    companyId: req.companyId,
  });

  const savedEmployee = await Employee.findById(employee._id).populate(
    'reportingManager',
    'employeeCode employeeName'
  );

  return sendSuccess(res, sanitizeEmployee(savedEmployee), 201);
}

async function updateEmployee(req, res) {
  const employee = await Employee.findOne({ _id: req.params.id, companyId: req.companyId });

  if (!employee) {
    return sendError(res, 'Employee not found', 404);
  }

  const payload = normalizeEmployeeBody(req.body);

  if (payload.employeeCode) {
    const duplicateEmployee = await Employee.findOne({
      companyId: req.companyId,
      employeeCode: payload.employeeCode,
      _id: { $ne: employee._id },
    });

    if (duplicateEmployee) {
      return sendError(res, 'Employee code already exists for this company', 409);
    }
    employee.employeeCode = payload.employeeCode;
  }

  if (payload.reportingManager) {
    const managerCheck = await ensureReportingManager(
      req.companyId,
      payload.reportingManager,
      employee._id
    );

    if (managerCheck.error) {
      return sendError(res, managerCheck.error, 400);
    }

    employee.reportingManager = payload.reportingManager;
  }

  const fieldMap = [
    'employeeName',
    'gender',
    'dateOfBirth',
    'joiningDate',
    'retirementDate',
    'mobileNumber',
    'email',
    'aadhaarNumber',
    'panNumber',
    'department',
    'designation',
    'grade',
    'region',
    'district',
    'employmentType',
    'status',
    'grossSalary',
  ];

  fieldMap.forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== '') {
      employee[field] = payload[field];
    }
  });

  await employee.save();

  const updatedEmployee = await Employee.findById(employee._id).populate(
    'reportingManager',
    'employeeCode employeeName'
  );

  return sendSuccess(res, sanitizeEmployee(updatedEmployee));
}

async function deleteEmployee(req, res) {
  const employee = await Employee.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });

  if (!employee) {
    return sendError(res, 'Employee not found', 404);
  }

  return sendSuccess(res, { deleted: true });
}

async function createEmployeeWithAccount(req, res) {
  const { password, ...employeePayload } = req.body;

  try {
    const result = await provisionEmployeeWithAccount({
      companyId: req.companyId,
      employeePayload,
      password,
    });

    return sendSuccess(res, result, 201);
  } catch (error) {
    return sendError(res, error.message, error.status || 400, error.code);
  }
}

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  createEmployeeWithAccount,
  updateEmployee,
  deleteEmployee,
  sanitizeEmployee,
};