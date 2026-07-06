/**
 * Auto-number prefixes per MPBCDC implementation guide.
 * Format: {PREFIX}-{YEAR}-{#####}  e.g. LN-2026-00001
 */
const AUTO_NUMBER_PREFIXES = {
  LOAN_APPLICATION: 'LN',
  LOAN_DISBURSEMENT: 'LD',
  LEAVE_APPLICATION: 'LV',
  SERVICE_RECORD: 'SR',
};

const ALLOWED_PREFIXES = Object.values(AUTO_NUMBER_PREFIXES);
const SEQUENCE_PAD_LENGTH = 5;

module.exports = {
  AUTO_NUMBER_PREFIXES,
  ALLOWED_PREFIXES,
  SEQUENCE_PAD_LENGTH,
};
