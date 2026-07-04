const autoNumberService = require('../services/autoNumberService');
const { sendSuccess } = require('../utils/apiResponse');
const { AUTO_NUMBER_PREFIXES } = require('../utils/autoNumberPrefixes');

async function previewAutoNumber(req, res) {
  const { prefix } = req.params;
  const result = await autoNumberService.peekNextAutoNumber(req.companyId, prefix);

  return sendSuccess(res, result);
}

async function getAutoNumberFormats(_req, res) {
  const year = new Date().getFullYear();

  return sendSuccess(res, {
    format: '{PREFIX}-{YEAR}-{#####}',
    examples: {
      loanApplication: autoNumberService.formatAutoNumber(AUTO_NUMBER_PREFIXES.LOAN_APPLICATION, year, 1),
      leaveApplication: autoNumberService.formatAutoNumber(AUTO_NUMBER_PREFIXES.LEAVE_APPLICATION, year, 1),
      serviceRecord: autoNumberService.formatAutoNumber(AUTO_NUMBER_PREFIXES.SERVICE_RECORD, year, 1),
    },
    prefixes: AUTO_NUMBER_PREFIXES,
    scope: 'Per companyId sequence; resets sequence counter each calendar year',
  });
}

module.exports = {
  previewAutoNumber,
  getAutoNumberFormats,
};
