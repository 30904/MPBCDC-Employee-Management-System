const LeaveBalance = require('../models/LeaveBalance');
require('../models/Employee');
require('../models/LeaveType');
const { sendPaginatedSuccess } = require('../utils/apiResponse');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

function tenantLeaveBalances(req) {
  return LeaveBalance.forTenant(req.companyId);
}

async function listLeaveBalances(req, res) {
  const pagination = parsePagination(req.query);
  const filter = {};

  if (req.query.employeeId) {
    filter.employeeId = req.query.employeeId;
  }

  if (req.query.leaveTypeId) {
    filter.leaveTypeId = req.query.leaveTypeId;
  }

  if (req.query.period) {
    filter.period = String(req.query.period).trim();
  }

  const query = tenantLeaveBalances(req)
    .find(filter)
    .populate('employeeId', 'employeeCode employeeName')
    .populate('leaveTypeId', 'code name')
    .sort({ period: -1, updatedAt: -1 });

  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);
  return sendPaginatedSuccess(res, docs, meta);
}

module.exports = {
  listLeaveBalances,
};
