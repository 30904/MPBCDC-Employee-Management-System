/**
 * Loan eligibility engine (Sheet 03).
 * Pure calculation — no database access in calculateEligibility.
 */

const LoanEligibilityRule = require('../models/LoanEligibilityRule');
const LoanType = require('../models/LoanType');
const LoanApplication = require('../models/LoanApplication');
const Employee = require('../models/Employee');
const { LOAN_INTEREST_FORMULAS } = require('../constants/loanInterestFormulas');

const ACTIVE_LOAN_STATUSES = ['Disbursed', 'Active'];

function round2(value) {
  return Number(Number(value).toFixed(2));
}

function monthsBetween(start, end) {
  const from = new Date(start);
  const to = new Date(end);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 0;
  }

  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

function computeEmiEndDate(emiStartDate, tenureMonths) {
  const start = new Date(emiStartDate);
  const tenure = Number(tenureMonths);

  if (Number.isNaN(start.getTime()) || !tenure || tenure <= 0) {
    return null;
  }

  const end = new Date(start);
  end.setMonth(end.getMonth() + tenure - 1);
  return end;
}

/**
 * EMI by interest formula.
 * SIMPLE_INTEREST: flat total interest, equal EMI.
 * COMPOUND_INTEREST: standard reducing-balance EMI.
 */
function calculateMonthlyEmi(
  principal,
  annualInterestRate,
  tenureMonths,
  formula = LOAN_INTEREST_FORMULAS.COMPOUND_INTEREST
) {
  const amount = Number(principal);
  const tenure = Number(tenureMonths);
  const annualRate = Number(annualInterestRate) || 0;

  if (!amount || amount <= 0 || !tenure || tenure <= 0) {
    return 0;
  }

  if (formula === LOAN_INTEREST_FORMULAS.SIMPLE_INTEREST) {
    const totalInterest = (amount * annualRate * tenure) / (12 * 100);
    return (amount + totalInterest) / tenure;
  }

  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return amount / tenure;
  }

  const factor = (1 + monthlyRate) ** tenure;
  return (amount * monthlyRate * factor) / (factor - 1);
}

/**
 * @param {object} employee — expects grossSalary, joiningDate, retirementDate
 * @param {object} loanType — expects maxAmount, maxTenureMonths, interestRate, minServiceYears, salaryMultiplier
 * @param {number} requestedAmount
 * @param {number} requestedTenure — months
 * @param {object} [options]
 * @param {object} [options.rule] — eligibility rule
 * @param {number} [options.existingActiveLoanEmiTotal]
 * @param {Date} [options.asOfDate]
 * @param {Date|string} [options.emiStartDate]
 */
function calculateEligibility(
  employee,
  loanType,
  requestedAmount,
  requestedTenure,
  options = {}
) {
  const {
    rule = {},
    existingActiveLoanEmiTotal = 0,
    asOfDate = new Date(),
    emiStartDate = null,
  } = options;

  const reasons = [];
  const grossSalary = Number(employee?.grossSalary);
  const amount = Number(requestedAmount);
  const tenure = Number(requestedTenure);
  const maxEmiPercent = rule.maxEmiPercentOfGross ?? 60;
  const retirementBufferMonths = rule.retirementBufferMonths ?? 3;
  const minServiceMonths = rule.minServiceMonths ?? 0;
  const existingEmi = Number(existingActiveLoanEmiTotal) || 0;
  const interestFormula = rule.interestFormula || LOAN_INTEREST_FORMULAS.COMPOUND_INTEREST;
  const minTenureMonths = Number(rule.minTenureMonths) > 0 ? Number(rule.minTenureMonths) : 1;
  const ruleMaxTenure =
    rule.maxTenureMonths != null && rule.maxTenureMonths !== ''
      ? Number(rule.maxTenureMonths)
      : null;

  const derived = {
    grossSalary: grossSalary || null,
    requestedAmount: amount,
    requestedTenure: tenure,
    maxEmiPercentOfGross: maxEmiPercent,
    retirementBufferMonths,
    existingActiveLoanEmiTotal: round2(existingEmi),
    interestFormula,
    minTenureMonths,
  };

  if (!loanType) {
    return { eligible: false, reasons: ['Loan type is required'], derived };
  }

  if (!amount || amount <= 0) {
    reasons.push('Requested loan amount must be greater than zero');
  }

  if (!tenure || tenure <= 0) {
    reasons.push('Requested tenure must be at least 1 month');
  }

  if (!grossSalary || grossSalary <= 0) {
    reasons.push('Employee gross salary is required for eligibility');
  }

  const serviceMonths = employee?.joiningDate
    ? monthsBetween(employee.joiningDate, asOfDate)
    : 0;
  derived.serviceMonths = serviceMonths;

  if (minServiceMonths > 0 && serviceMonths < minServiceMonths) {
    reasons.push(`Minimum service of ${minServiceMonths} months is required`);
  }

  const minServiceYears = Number(loanType.minServiceYears) || 0;
  if (minServiceYears > 0 && serviceMonths < minServiceYears * 12) {
    reasons.push(`Minimum service of ${minServiceYears} years is required for this loan type`);
  }

  let maxEligibleAmount = Number(loanType.maxAmount);
  let minEligibleAmount = 0;

  const minAmountPercent = rule.minAmountPercentOfSalary;
  const maxAmountPercent = rule.maxAmountPercentOfSalary;

  if (minAmountPercent != null && minAmountPercent > 0 && grossSalary > 0) {
    minEligibleAmount = grossSalary * (minAmountPercent / 100);
    derived.minAmountPercentOfSalary = minAmountPercent;
  }

  if (maxAmountPercent != null && maxAmountPercent > 0 && grossSalary > 0) {
    maxEligibleAmount = Math.min(maxEligibleAmount, grossSalary * (maxAmountPercent / 100));
    derived.maxAmountPercentOfSalary = maxAmountPercent;
  }

  const salaryMultiplier = rule.salaryMultiplier ?? loanType.salaryMultiplier ?? null;

  if (salaryMultiplier != null && salaryMultiplier > 0 && grossSalary > 0) {
    maxEligibleAmount = Math.min(maxEligibleAmount, grossSalary * salaryMultiplier);
  }

  derived.minEligibleAmount = round2(minEligibleAmount);
  derived.maxEligibleAmount = round2(maxEligibleAmount);
  derived.salaryMultiplier = salaryMultiplier;

  if (amount < minEligibleAmount - 0.01) {
    reasons.push(
      `Requested amount is below minimum eligible amount (${derived.minEligibleAmount})${
        minAmountPercent ? ` — ${minAmountPercent}% of salary` : ''
      }`
    );
  }

  if (amount > maxEligibleAmount) {
    reasons.push(`Requested amount exceeds maximum eligible amount (${derived.maxEligibleAmount})`);
  }

  const typeMaxTenure = Number(loanType.maxTenureMonths);
  const maxTenure =
    ruleMaxTenure != null && ruleMaxTenure > 0
      ? Math.min(ruleMaxTenure, typeMaxTenure)
      : typeMaxTenure;

  derived.maxTenureMonths = maxTenure;

  if (tenure < minTenureMonths) {
    reasons.push(`Requested tenure must be at least ${minTenureMonths} months`);
  }

  if (tenure > maxTenure) {
    reasons.push(`Requested tenure exceeds maximum of ${maxTenure} months`);
  }

  const interestRate = Number(loanType.interestRate) || 0;
  const proposedEmi = calculateMonthlyEmi(amount, interestRate, tenure, interestFormula);
  derived.proposedEmi = round2(proposedEmi);
  derived.interestRate = interestRate;

  const totalEmi = proposedEmi + existingEmi;
  derived.totalEmiAfterApplication = round2(totalEmi);

  if (grossSalary > 0) {
    const maxAllowedEmi = grossSalary * (maxEmiPercent / 100);
    derived.maxAllowedEmi = round2(maxAllowedEmi);

    if (totalEmi > maxAllowedEmi + 0.01) {
      reasons.push(
        `Total EMI (${derived.totalEmiAfterApplication}) exceeds ${maxEmiPercent}% of gross salary (${derived.maxAllowedEmi})`
      );
    }

    const minRetain = grossSalary * 0.4;
    const retainAfterEmi = grossSalary - totalEmi;
    derived.minRetainRequired = round2(minRetain);
    derived.retainAfterEmi = round2(retainAfterEmi);
    derived.retainPercentOfGross = round2((retainAfterEmi / grossSalary) * 100);

    if (retainAfterEmi < minRetain - 0.01) {
      reasons.push('At least 40% of gross salary must remain after all loan EMIs');
    }
  }

  if (emiStartDate) {
    const parsedStart = new Date(emiStartDate);
    if (Number.isNaN(parsedStart.getTime())) {
      reasons.push('EMI start date must be a valid date');
    } else if (tenure > 0) {
      const lastEmiDate = computeEmiEndDate(parsedStart, tenure);
      derived.emiStartDate = parsedStart.toISOString();
      derived.emiEndDate = lastEmiDate?.toISOString() ?? null;

      if (employee?.retirementDate && lastEmiDate) {
        const monthsBeforeRetirement = monthsBetween(lastEmiDate, employee.retirementDate);
        derived.loanClosureDate = lastEmiDate.toISOString();
        derived.monthsBeforeRetirementAtClosure = monthsBeforeRetirement;

        if (monthsBeforeRetirement < retirementBufferMonths) {
          reasons.push(
            `Loan must close at least ${retirementBufferMonths} months before retirement date`
          );
        }
      } else if (!employee?.retirementDate) {
        reasons.push('Employee retirement date is required for loan eligibility');
      }
    }
  } else if (!employee?.retirementDate) {
    reasons.push('Employee retirement date is required for loan eligibility');
  } else if (tenure > 0) {
    const lastEmiDate = new Date(asOfDate);
    lastEmiDate.setMonth(lastEmiDate.getMonth() + tenure - 1);

    const monthsBeforeRetirement = monthsBetween(lastEmiDate, employee.retirementDate);
    derived.loanClosureDate = lastEmiDate.toISOString();
    derived.monthsBeforeRetirementAtClosure = monthsBeforeRetirement;

    if (monthsBeforeRetirement < retirementBufferMonths) {
      reasons.push(
        `Loan must close at least ${retirementBufferMonths} months before retirement date`
      );
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    derived,
  };
}

async function loadActiveEligibilityRule(companyId, asOfDate = new Date()) {
  const rules = await LoanEligibilityRule.forTenant(companyId).find({
    status: 'Active',
    effectiveDate: { $lte: asOfDate },
  });

  if (!rules.length) {
    return null;
  }

  return rules.sort(
    (left, right) => new Date(right.effectiveDate) - new Date(left.effectiveDate)
  )[0];
}

async function sumExistingActiveLoanEmi(companyId, employeeId) {
  const applications = await LoanApplication.forTenant(companyId).find({
    employeeId,
    status: { $in: ACTIVE_LOAN_STATUSES },
  });

  return applications.reduce(
    (total, application) => total + (Number(application.monthlyEmi) || 0),
    0
  );
}

async function previewEligibility({
  companyId,
  employeeId,
  loanTypeId,
  requestedAmount,
  requestedTenure,
  emiStartDate = null,
  asOfDate = new Date(),
}) {
  const employee = await Employee.findOne({ _id: employeeId, companyId });
  if (!employee) {
    return { eligible: false, reasons: ['Employee not found'], derived: {} };
  }

  const loanType = await LoanType.forTenant(companyId).findById(loanTypeId);
  if (!loanType || !loanType.isActive) {
    return { eligible: false, reasons: ['Loan type not found or inactive'], derived: {} };
  }

  const rule = await loadActiveEligibilityRule(companyId, asOfDate);
  if (!rule) {
    return {
      eligible: false,
      reasons: ['No active eligibility rule configured for this company'],
      derived: {},
    };
  }

  const existingActiveLoanEmiTotal = await sumExistingActiveLoanEmi(companyId, employeeId);

  const result = calculateEligibility(
    employee,
    loanType,
    requestedAmount,
    requestedTenure,
    {
      rule,
      existingActiveLoanEmiTotal,
      asOfDate,
      emiStartDate,
    }
  );

  return {
    ...result,
    ruleCode: rule.ruleCode,
    loanType: {
      id: loanType._id,
      code: loanType.code,
      name: loanType.name,
      interestRate: loanType.interestRate,
      maxAmount: loanType.maxAmount,
      maxTenureMonths: loanType.maxTenureMonths,
    },
  };
}

module.exports = {
  ACTIVE_LOAN_STATUSES,
  calculateMonthlyEmi,
  calculateEligibility,
  computeEmiEndDate,
  monthsBetween,
  round2,
  loadActiveEligibilityRule,
  sumExistingActiveLoanEmi,
  previewEligibility,
};
