const Company = require('../models/Company');
const User = require('../models/User');
const { sendError, sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const { sanitizeUser } = require('./authController');

async function listCompanies(req, res) {
  const pagination = parsePagination(req.query);
  const query = Company.find().sort({ createdAt: -1 });
  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);

  return sendPaginatedSuccess(res, docs, meta);
}

async function getCompany(req, res) {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return sendError(res, 'Company not found', 404);
  }

  return sendSuccess(res, company);
}

async function createCompany(req, res) {
  const { name, code, contactEmail, contactPhone, moduleFlags } = req.body;

  if (!name || !code) {
    return sendError(res, 'Company name and code are required', 400);
  }

  const existing = await Company.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    return sendError(res, 'Company code already exists', 409);
  }

  const company = await Company.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    contactEmail,
    contactPhone,
    moduleFlags,
  });

  return sendSuccess(res, company, 201);
}

async function updateCompany(req, res) {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return sendError(res, 'Company not found', 404);
  }

  const { name, status, contactEmail, contactPhone, moduleFlags } = req.body;

  if (name !== undefined) company.name = name.trim();
  if (status !== undefined) company.status = status;
  if (contactEmail !== undefined) company.contactEmail = contactEmail;
  if (contactPhone !== undefined) company.contactPhone = contactPhone;
  if (moduleFlags !== undefined) company.moduleFlags = { ...company.moduleFlags, ...moduleFlags };

  await company.save();

  return sendSuccess(res, company);
}

async function listCompanyUsers(req, res) {
  const pagination = parsePagination(req.query);
  const query = User.find({ companyId: req.params.id }).sort({ createdAt: -1 });
  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);

  return sendPaginatedSuccess(res, docs.map(sanitizeUser), meta);
}

async function createCompanyUser(req, res) {
  const { loginId, password, roles } = req.body;
  const companyId = req.params.id;

  const company = await Company.findById(companyId);
  if (!company) {
    return sendError(res, 'Company not found', 404);
  }

  if (!loginId || !password || !Array.isArray(roles) || roles.length === 0) {
    return sendError(res, 'loginId, password, and roles are required', 400);
  }

  const invalidRole = roles.find((role) => role === ROLES.SUPER_ADMIN);
  if (invalidRole) {
    return sendError(res, 'Cannot assign SUPER_ADMIN to tenant user', 400);
  }

  const existing = await User.findOne({ loginId: loginId.trim(), companyId });
  if (existing) {
    return sendError(res, 'Login ID already exists for this company', 409);
  }

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    loginId: loginId.trim(),
    passwordHash,
    roles,
    companyId,
    status: 'Active',
  });

  return sendSuccess(res, sanitizeUser(user), 201);
}

module.exports = {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  listCompanyUsers,
  createCompanyUser,
};
