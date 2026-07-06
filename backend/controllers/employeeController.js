const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { sendError, sendSuccess } = require('../utils/apiResponse');

function maskAadhaar(aadhaarNumber) {
  const value = String(aadhaarNumber || '');
  if (value.length !== 12) {
    return value;
  }

  return `${value.slice(0, 4)} ${value.slice(4, 8)} ${value.slice(8)}`;
}

function normalizeString(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return String(value).trim();
}

function normalizeEmployeeBody(body) {
  return {
    employeeCode: normalizeString(body.employeeCode),
    employeeName: normalizeString(body.employeeName),
    gender: normalizeString(body.gender),
    dateOfBirth: body.dateOfBirth,
    joiningDate: body.joiningDate,
    retirementDate: body.retirementDate,
    mobileNumber: normalizeString(body.mobileNumber),
    email: normalizeString(body.email)?.toLowerCase(),
    aadhaarNumber: normalizeString(body.aadhaarNumber)?.replace(/\s+/g, ''),
    panNumber: normalizeString(body.panNumber)?.toUpperCase(),
    department: normalizeString(body.department),
    designation: normalizeString(body.designation),
    grade: normalizeString(body.grade),
    region: normalizeString(body.region),
    district: normalizeString(body.district),
    reportingManager: normalizeString(body.reportingManager),
    employmentType: normalizeString(body.employmentType),
    status: normalizeString(body.status) || 'Active',
    grossSalary: body.grossSalary,
  };
}

function sanitizeEmployee(employee) {
  const populatedReportingManager = employee.reportingManager && employee.reportingManager._id
    ? {
        id: employee.reportingManager._id,
        employeeCode: employee.reportingManager.employeeCode,
        employeeName: employee.reportingManager.employeeName,
      }
    : employee.reportingManager || null;

  return {
    id: employee._id,
    companyId: employee.companyId,
    employeeCode: employee.employeeCode,
    employeeName: employee.employeeName,
    gender: employee.gender,
    dateOfBirth: employee.dateOfBirth,
    joiningDate: employee.joiningDate,
    retirementDate: employee.retirementDate,
    mobileNumber: employee.mobileNumber,
    email: employee.email,
    aadhaarNumberMasked: maskAadhaar(employee.aadhaarNumber),
    panNumber: employee.panNumber,
    department: employee.department,
    designation: employee.designation,
    grade: employee.grade,
    region: employee.region,
    district: employee.district,
    reportingManager: populatedReportingManager,
    employmentType: employee.employmentType,
    status: employee.status,
    grossSalary: employee.grossSalary,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}

async function ensureReportingManager(companyId, reportingManagerId, currentEmployeeId = null) {
  if (!mongoose.Types.ObjectId.isValid(reportingManagerId)) {
    return { error: 'Reporting manager is required' };
  }

  if (currentEmployeeId && String(reportingManagerId) === String(currentEmployeeId)) {
    return { error: 'Reporting manager cannot be the same employee' };
  }

  const manager = await Employee.findOne({ _id: reportingManagerId, companyId });
  if (!manager) {
    return { error: 'Reporting manager must belong to the same company' };
  }

  return { manager };
}

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

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  sanitizeEmployee,
};