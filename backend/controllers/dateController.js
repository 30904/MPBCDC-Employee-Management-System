const { sendSuccess } = require('../utils/apiResponse');
const {
  DATE_CONVENTION,
  toIsoDateString,
  toIsoDateTimeString,
  toDisplayDate,
  parseIsoDate,
} = require('../utils/dateUtils');

function getDateFormats(_req, res) {
  const sample = parseIsoDate('2026-07-04');

  return sendSuccess(res, {
    ...DATE_CONVENTION,
    samples: {
      apiDate: toIsoDateString(sample),
      apiDateTime: toIsoDateTimeString(sample),
      uiDisplay: toDisplayDate(sample),
    },
  });
}

module.exports = {
  getDateFormats,
};
