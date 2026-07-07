const mongoose = require('mongoose');
const Employee = require('../models/Employee');

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
    employeeCode: normalizeString(body.employeeCode)?.toUpperCase(),
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

module.exports = {
  normalizeEmployeeBody,
  sanitizeEmployee,
  ensureReportingManager,
};
