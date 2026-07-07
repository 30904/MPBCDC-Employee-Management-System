const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { USER_PROVISION_SOURCES } = require('../constants/userProvisionSources');
const { ROLES } = require('../utils/roles');
const {
  normalizeEmployeeBody,
  sanitizeEmployee,
  ensureReportingManager,
} = require('../utils/employeeHelpers');

async function provisionEmployeeWithAccount({ companyId, employeePayload, password }) {
  const payload = normalizeEmployeeBody(employeePayload);
  const employeeCode = String(payload.employeeCode || '').trim().toUpperCase();

  if (!employeeCode) {
    throw createValidationError('Employee code is required');
  }

  if (!password || String(password).length < 8) {
    throw createValidationError('Password must be at least 8 characters');
  }

  const requiredFields = [
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
    'grossSalary',
  ];

  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      throw createValidationError(`${field} is required`);
    }
  }

  const existingEmployee = await Employee.findOne({ companyId, employeeCode });
  if (existingEmployee) {
    throw createValidationError('Employee code already exists for this company', 409, 'DUPLICATE_EMPLOYEE_CODE');
  }

  const existingUser = await User.forTenant(companyId).findOne({ loginId: employeeCode });
  if (existingUser) {
    throw createValidationError('Login ID already exists for this company', 409, 'DUPLICATE_LOGIN_ID');
  }

  const employeeCount = await Employee.countDocuments({ companyId });
  const isBootstrapEmployee = employeeCount === 0 && !payload.reportingManager;

  if (!isBootstrapEmployee) {
    if (!payload.reportingManager) {
      throw createValidationError('Reporting manager is required');
    }

    const managerCheck = await ensureReportingManager(companyId, payload.reportingManager);
    if (managerCheck.error) {
      throw createValidationError(managerCheck.error);
    }
  } else if (payload.reportingManager) {
    const managerCheck = await ensureReportingManager(companyId, payload.reportingManager);
    if (managerCheck.error) {
      throw createValidationError(managerCheck.error);
    }
  }

  const passwordHash = await User.hashPassword(password);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const employee = await Employee.create(
      [
        {
          ...payload,
          employeeCode,
          companyId,
          reportingManager: isBootstrapEmployee
            ? new mongoose.Types.ObjectId()
            : payload.reportingManager,
        },
      ],
      { session }
    ).then((docs) => docs[0]);

    if (isBootstrapEmployee) {
      employee.reportingManager = employee._id;
      await employee.save({ session });
    }

    const userDocs = await User.create(
      [
        {
          companyId,
          loginId: employeeCode,
          passwordHash,
          roles: [ROLES.EMPLOYEE],
          employeeId: employee._id,
          provisionSource: USER_PROVISION_SOURCES.CLIENT_ADMIN,
          status: 'Active',
        },
      ],
      { session }
    );
    const user = userDocs[0];

    await session.commitTransaction();

    const savedEmployee = await Employee.findById(employee._id).populate(
      'reportingManager',
      'employeeCode employeeName'
    );

    return {
      employee: sanitizeEmployee(savedEmployee),
      user: {
        id: user._id,
        loginId: user.loginId,
        roles: user.roles,
        employeeId: user.employeeId,
        provisionSource: user.provisionSource,
        status: user.status,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

function createValidationError(message, status = 400, code = 'VALIDATION_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

module.exports = {
  provisionEmployeeWithAccount,
};
