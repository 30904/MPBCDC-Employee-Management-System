const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/LeaveType');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

function parseReportYear(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 2000) {
    return new Date().getFullYear();
  }

  return parsed;
}

async function getLeaveSummaryReport(req, res) {
  const year = parseReportYear(req.query.year);
  const summary = await buildLeaveSummaryReport(req.companyId, year);

  return sendSuccess(res, summary);
}

async function buildLeaveSummaryReport(companyId, year) {
  const period = String(year);
  const fromDate = new Date(Date.UTC(year, 0, 1));
  const toDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  const ApplicationModel = LeaveApplication.forTenant(companyId);
  const BalanceModel = LeaveBalance.forTenant(companyId);

  const [statusRows, leaveTypeRows, balanceRows] = await Promise.all([
    ApplicationModel.aggregate([
      { $match: { submittedAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    ApplicationModel.aggregate([
      { $match: { submittedAt: { $gte: fromDate, $lte: toDate }, status: 'Approved' } },
      {
        $group: {
          _id: '$leaveTypeId',
          applications: { $sum: 1 },
          chargeableDays: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ['$chargeableDays', 0] }, 0] },
                '$chargeableDays',
                { $add: [{ $ifNull: ['$workingDays', 0] }, { $ifNull: ['$sandwichDaysApplied', 0] }] },
              ],
            },
          },
        },
      },
      { $sort: { applications: -1 } },
    ]),
    BalanceModel.aggregate([
      { $match: { period } },
      {
        $group: {
          _id: null,
          openingBalance: { $sum: '$openingBalance' },
          accrued: { $sum: '$accrued' },
          availed: { $sum: '$availed' },
          lapsed: { $sum: '$lapsed' },
          encashed: { $sum: '$encashed' },
          adjustment: { $sum: '$adjustment' },
          closingBalance: { $sum: '$closingBalance' },
          balanceRows: { $sum: 1 },
        },
      },
    ]),
  ]);

  const leaveTypeIds = leaveTypeRows.map((row) => row._id).filter(Boolean);
  const leaveTypes = await LeaveType.forTenant(companyId)
    .find({ _id: { $in: leaveTypeIds } })
    .select('_id code name')
    .lean();
  const leaveTypeMap = new Map(leaveTypes.map((row) => [String(row._id), row]));

  const applications = statusRows.reduce(
    (acc, row) => {
      const key = row._id || 'Unknown';
      acc.total += row.count;
      acc.byStatus[key] = row.count;
      return acc;
    },
    { total: 0, byStatus: {} }
  );

  const leaveTypeUtilization = leaveTypeRows.map((row) => {
    const leaveType = leaveTypeMap.get(String(row._id));
    return {
      leaveTypeId: row._id,
      leaveTypeCode: leaveType?.code || null,
      leaveTypeName: leaveType?.name || null,
      applications: row.applications,
      chargeableDays: Number((row.chargeableDays || 0).toFixed(2)),
    };
  });

  const ledger = balanceRows[0] || {
    openingBalance: 0,
    accrued: 0,
    availed: 0,
    lapsed: 0,
    encashed: 0,
    adjustment: 0,
    closingBalance: 0,
    balanceRows: 0,
  };

  return {
    year,
    applications,
    leaveTypeUtilization,
    ledger: {
      openingBalance: Number((ledger.openingBalance || 0).toFixed(2)),
      accrued: Number((ledger.accrued || 0).toFixed(2)),
      availed: Number((ledger.availed || 0).toFixed(2)),
      lapsed: Number((ledger.lapsed || 0).toFixed(2)),
      encashed: Number((ledger.encashed || 0).toFixed(2)),
      adjustment: Number((ledger.adjustment || 0).toFixed(2)),
      closingBalance: Number((ledger.closingBalance || 0).toFixed(2)),
      balanceRows: ledger.balanceRows || 0,
    },
  };
}

function escapeCsvValue(value) {
  const raw = value === null || value === undefined ? '' : String(value);
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

function toCsvLine(values) {
  return values.map((value) => escapeCsvValue(value)).join(',');
}

function buildLeaveSummaryCsv(summary) {
  const lines = [];
  lines.push(toCsvLine(['Report', 'Leave Summary']));
  lines.push(toCsvLine(['Year', summary.year]));
  lines.push('');

  lines.push(toCsvLine(['Applications']));
  lines.push(toCsvLine(['Total', summary.applications.total || 0]));
  lines.push(toCsvLine(['Status', 'Count']));
  Object.entries(summary.applications.byStatus || {}).forEach(([status, count]) => {
    lines.push(toCsvLine([status, count]));
  });
  lines.push('');

  lines.push(toCsvLine(['Ledger Snapshot']));
  lines.push(
    toCsvLine([
      'Opening',
      'Accrued',
      'Availed',
      'Lapsed',
      'Encashed',
      'Adjustment',
      'Closing',
      'Balance Rows',
    ])
  );
  lines.push(
    toCsvLine([
      summary.ledger.openingBalance,
      summary.ledger.accrued,
      summary.ledger.availed,
      summary.ledger.lapsed,
      summary.ledger.encashed,
      summary.ledger.adjustment,
      summary.ledger.closingBalance,
      summary.ledger.balanceRows,
    ])
  );
  lines.push('');

  lines.push(toCsvLine(['Leave Type Utilization']));
  lines.push(toCsvLine(['Leave Type Code', 'Leave Type Name', 'Approved Applications', 'Chargeable Days']));
  (summary.leaveTypeUtilization || []).forEach((row) => {
    lines.push(
      toCsvLine([row.leaveTypeCode || '', row.leaveTypeName || '', row.applications || 0, row.chargeableDays || 0])
    );
  });

  return lines.join('\n');
}

async function downloadLeaveSummaryCsv(req, res) {
  const year = parseReportYear(req.query.year);
  const summary = await buildLeaveSummaryReport(req.companyId, year);
  const csv = buildLeaveSummaryCsv(summary);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="leave-summary-${year}.csv"`);
  return res.status(200).send(csv);
}

async function getLeaveDetailsReport(req, res) {
  const year = parseReportYear(req.query.year);
  const fromDate = new Date(Date.UTC(year, 0, 1));
  const toDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  const pagination = parsePagination(req.query);
  const status = req.query.status ? String(req.query.status).trim() : undefined;
  const leaveTypeId = req.query.leaveTypeId ? String(req.query.leaveTypeId).trim() : undefined;
  const filter = { submittedAt: { $gte: fromDate, $lte: toDate } };

  if (status) {
    filter.status = status;
  }

  if (leaveTypeId) {
    filter.leaveTypeId = leaveTypeId;
  }

  const query = LeaveApplication.forTenant(req.companyId)
    .find(filter)
    .populate('employeeId', 'employeeCode employeeName')
    .populate('leaveTypeId', 'code name')
    .sort({ submittedAt: -1, createdAt: -1 });

  const { docs, pagination: meta } = await executePaginatedQuery(query, pagination);
  const items = docs.map((doc) => ({
    _id: doc._id,
    applicationNo: doc.applicationNo,
    status: doc.status,
    reason: doc.reason || '',
    fromDate: doc.fromDate,
    toDate: doc.toDate,
    submittedAt: doc.submittedAt || doc.createdAt,
    workingDays: doc.workingDays || 0,
    sandwichDaysApplied: doc.sandwichDaysApplied || 0,
    chargeableDays: Number(
      (doc.chargeableDays > 0
        ? doc.chargeableDays
        : Number(doc.workingDays || 0) + Number(doc.sandwichDaysApplied || 0)
      ).toFixed(2)
    ),
    employee: doc.employeeId
      ? {
          id: doc.employeeId._id || doc.employeeId,
          employeeCode: doc.employeeId.employeeCode || null,
          employeeName: doc.employeeId.employeeName || null,
        }
      : null,
    leaveType: doc.leaveTypeId
      ? {
          id: doc.leaveTypeId._id || doc.leaveTypeId,
          code: doc.leaveTypeId.code || null,
          name: doc.leaveTypeId.name || null,
        }
      : null,
  }));

  return sendPaginatedSuccess(res, items, meta);
}

module.exports = {
  getLeaveSummaryReport,
  downloadLeaveSummaryCsv,
  getLeaveDetailsReport,
};
