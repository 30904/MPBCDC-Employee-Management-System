const autoNumberService = require('./autoNumberService');
const loanEligibilityService = require('./loanEligibilityService');
const loanScheduleService = require('./loanScheduleService');
const leaveCalculationService = require('./leaveCalculationService');
const leaveAccrualService = require('./leaveAccrualService');

const loanWorkflowService = require('./loanWorkflowService');
const leaveWorkflowService = require('./leaveWorkflowService');

module.exports = {
  autoNumberService,
  loanEligibilityService,
  loanScheduleService,
  loanWorkflowService,
  leaveWorkflowService,
  leaveCalculationService,
  leaveAccrualService,
};
