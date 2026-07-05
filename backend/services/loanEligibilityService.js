const LoanEligibilityRule = require('../models/LoanEligibilityRule');
const MpbcdcEmployee = require('../models/MpbcdcEmployee');

/**
 * Evaluate loan eligibility for an employee against tenant rules.
 * Full rule engine is implemented in the Loan module phase.
 */
async function evaluateEligibility({ companyId, employeeId, loanTypeId, requestedAmount }) {
  const employee = await MpbcdcEmployee.forTenant(companyId).findById(employeeId);
  if (!employee) {
    return { eligible: false, reasons: ['Employee not found'] };
  }

  const rules = await LoanEligibilityRule.forTenant(companyId).find({ loanTypeId });
  if (rules.length === 0) {
    return { eligible: false, reasons: ['No eligibility rules configured'] };
  }

  return {
    eligible: true,
    reasons: [],
    requestedAmount,
    ruleCount: rules.length,
  };
}

module.exports = {
  evaluateEligibility,
};
