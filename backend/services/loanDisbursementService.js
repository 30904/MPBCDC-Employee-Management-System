const LoanApplication = require('../models/LoanApplication');
require('../models/Employee');
const LoanDisbursement = require('../models/LoanDisbursement');
const LoanEmiSchedule = require('../models/LoanEmiSchedule');
const AppError = require('../utils/AppError');
const { LOAN_APPLICATION_STATUS } = require('../constants/loanWorkflowStates');
const { AUTO_NUMBER_PREFIXES } = require('../utils/autoNumberPrefixes');
const autoNumberService = require('./autoNumberService');
const { buildEmiSchedule, recalculateScheduleFromEmi } = require('./loanScheduleService');
const { LOAN_INTEREST_FORMULAS } = require('../constants/loanInterestFormulas');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

function resolveInterestFormula(application) {
  return (
    application?.eligibilitySnapshot?.derived?.interestFormula ||
    LOAN_INTEREST_FORMULAS.COMPOUND_INTEREST
  );
}

function tenantApplications(companyId) {
  return LoanApplication.forTenant(companyId);
}

function tenantDisbursements(companyId) {
  return LoanDisbursement.forTenant(companyId);
}

function tenantSchedules(companyId) {
  return LoanEmiSchedule.forTenant(companyId);
}

function resolveFirstEmiDate(disbursedAt, requestedDate) {
  if (requestedDate) {
    const parsed = new Date(requestedDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const firstEmiDate = new Date(disbursedAt);
  firstEmiDate.setMonth(firstEmiDate.getMonth() + 1);
  firstEmiDate.setDate(1);
  return firstEmiDate;
}

async function listPendingDisbursements({ companyId }) {
  const applications = await tenantApplications(companyId)
    .find({ status: LOAN_APPLICATION_STATUS.FINANCE_APPROVED })
    .sort({ updatedAt: -1 })
    .populate('loanTypeId', 'code name interestRate')
    .populate('employeeId', 'employeeCode');

  return applications;
}

async function listDisbursements({ companyId, query = {} }) {
  const pagination = parsePagination(query);

  const baseQuery = tenantDisbursements(companyId)
    .find({})
    .sort({ disbursedAt: -1 })
    .populate('applicationId', 'applicationNo status')
    .populate('employeeId', 'employeeCode')
    .populate('loanTypeId', 'code name');

  const { docs, pagination: meta } = await executePaginatedQuery(baseQuery, pagination);

  return { items: docs, pagination: meta };
}

async function getScheduleForApplication({ companyId, applicationId, employeeId = null }) {
  const application = await tenantApplications(companyId).findById(applicationId);

  if (!application) {
    throw new AppError('Loan application not found', 404, 'NOT_FOUND');
  }

  if (employeeId && String(application.employeeId) !== String(employeeId)) {
    throw new AppError('You can only view your own loan schedule', 403, 'FORBIDDEN');
  }

  const disbursement = await tenantDisbursements(companyId).findOne({ applicationId });
  const schedule = disbursement
    ? await tenantSchedules(companyId).find({ applicationId }).sort({ emiNo: 1 })
    : [];

  return {
    application,
    disbursement,
    schedule,
  };
}

async function disburseApplication({
  companyId,
  applicationId,
  disbursedByUserId,
  disbursedAt = new Date(),
  firstEmiDate,
}) {
  const application = await tenantApplications(companyId).findById(applicationId);

  if (!application) {
    throw new AppError('Loan application not found', 404, 'NOT_FOUND');
  }

  if (application.status !== LOAN_APPLICATION_STATUS.FINANCE_APPROVED) {
    throw new AppError(
      `Only finance-approved applications can be disbursed (current: ${application.status})`,
      400,
      'INVALID_STATUS'
    );
  }

  const existing = await tenantDisbursements(companyId).exists({ applicationId });
  if (existing) {
    throw new AppError('This application has already been disbursed', 409, 'ALREADY_DISBURSED');
  }

  const disbursedOn = new Date(disbursedAt);
  if (Number.isNaN(disbursedOn.getTime())) {
    throw new AppError('disbursedAt must be a valid date', 400, 'VALIDATION_ERROR');
  }

  const resolvedFirstEmiDate = resolveFirstEmiDate(
    disbursedOn,
    firstEmiDate || application.emiStartDate
  );
  const loanNo = application.applicationNo;
  const tenureMonths = application.requestedTenureMonths;
  const principal = application.requestedAmount;
  const interestRate = application.interestRate ?? 0;
  const interestFormula = resolveInterestFormula(application);

  const scheduleRows = buildEmiSchedule({
    loanNo,
    principal,
    annualRate: interestRate,
    tenureMonths,
    startDate: resolvedFirstEmiDate,
    interestFormula,
  });

  const { autoNumber: disbursementNo } = await autoNumberService.getNextAutoNumber(
    companyId,
    AUTO_NUMBER_PREFIXES.LOAN_DISBURSEMENT
  );

  const monthlyEmi = scheduleRows[0]?.emiAmount ?? application.monthlyEmi ?? 0;

  const disbursement = await tenantDisbursements(companyId).create({
    disbursementNo,
    applicationId: application._id,
    loanNo,
    employeeId: application.employeeId,
    loanTypeId: application.loanTypeId,
    disbursedAmount: principal,
    interestRate,
    interestFormula,
    tenureMonths,
    monthlyEmi,
    disbursedAt: disbursedOn,
    firstEmiDate: resolvedFirstEmiDate,
    disbursedByUserId,
    status: 'Active',
  });

  await Promise.all(
    scheduleRows.map((row) =>
      tenantSchedules(companyId).create({
        applicationId: application._id,
        loanNo,
        emiNo: row.emiNo,
        dueDate: row.dueDate,
        emiAmount: row.emiAmount,
        principalComponent: row.principalComponent,
        interestComponent: row.interestComponent,
        outstandingBalance: row.outstandingBalance,
        status: 'Pending',
      })
    )
  );

  application.status = LOAN_APPLICATION_STATUS.DISBURSED;
  application.loanNo = loanNo;
  application.disbursedAt = disbursedOn;
  application.monthlyEmi = monthlyEmi;
  await application.save();

  const schedule = await tenantSchedules(companyId)
    .find({ applicationId: application._id })
    .sort({ emiNo: 1 });

  return { application, disbursement, schedule };
}

async function updateScheduleEmi({
  companyId,
  applicationId,
  employeeId,
  emiNo,
  emiAmount,
}) {
  const application = await tenantApplications(companyId).findById(applicationId);

  if (!application) {
    throw new AppError('Loan application not found', 404, 'NOT_FOUND');
  }

  if (employeeId && String(application.employeeId) !== String(employeeId)) {
    throw new AppError('You can only update your own loan schedule', 403, 'FORBIDDEN');
  }

  const disbursement = await tenantDisbursements(companyId).findOne({ applicationId });
  if (!disbursement) {
    throw new AppError('Loan has not been disbursed yet', 400, 'NOT_DISBURSED');
  }

  const parsedEmiNo = Number(emiNo);
  if (!Number.isInteger(parsedEmiNo) || parsedEmiNo < 1) {
    throw new AppError('emiNo must be a positive integer', 400, 'VALIDATION_ERROR');
  }

  const existingRows = await tenantSchedules(companyId)
    .find({ applicationId })
    .sort({ emiNo: 1 })
    .lean();

  if (!existingRows.length) {
    throw new AppError('EMI schedule not found', 404, 'NOT_FOUND');
  }

  let recalculatedRows;

  try {
    recalculatedRows = recalculateScheduleFromEmi({
      existingRows,
      editedEmiNo: parsedEmiNo,
      newEmiAmount: emiAmount,
      principal: disbursement.disbursedAmount,
      annualRate: disbursement.interestRate,
      tenureMonths: disbursement.tenureMonths,
      startDate: disbursement.firstEmiDate,
      interestFormula: disbursement.interestFormula || resolveInterestFormula(application),
      loanNo: disbursement.loanNo,
    });
  } catch (err) {
    throw new AppError(err.message, 400, 'VALIDATION_ERROR');
  }

  const rowsToUpdate = recalculatedRows.filter((row) => row.emiNo >= parsedEmiNo);

  await Promise.all(
    rowsToUpdate.map((row) => {
      const existing = existingRows.find((item) => item.emiNo === row.emiNo);

      return tenantSchedules(companyId).findOneAndUpdate(
        { _id: existing._id },
        {
          $set: {
            emiAmount: row.emiAmount,
            principalComponent: row.principalComponent,
            interestComponent: row.interestComponent,
            outstandingBalance: row.outstandingBalance,
            isManuallyAdjusted: Boolean(row.isManuallyAdjusted),
          },
        },
        { new: true }
      );
    })
  );

  const schedule = await tenantSchedules(companyId)
    .find({ applicationId })
    .sort({ emiNo: 1 });

  if (schedule[0]) {
    disbursement.monthlyEmi = schedule[0].emiAmount;
    await disbursement.save();
    application.monthlyEmi = schedule[0].emiAmount;
    await application.save();
  }

  return {
    application,
    disbursement,
    schedule,
  };
}

module.exports = {
  listPendingDisbursements,
  listDisbursements,
  getScheduleForApplication,
  disburseApplication,
  updateScheduleEmi,
};
