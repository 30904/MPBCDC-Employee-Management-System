const DocumentSequence = require('../models/DocumentSequence');
const AppError = require('../utils/AppError');
const {
  ALLOWED_PREFIXES,
  SEQUENCE_PAD_LENGTH,
} = require('../utils/autoNumberPrefixes');

function normalizePrefix(prefix) {
  return String(prefix || '')
    .trim()
    .toUpperCase();
}

function validatePrefix(prefix) {
  const normalized = normalizePrefix(prefix);

  if (!ALLOWED_PREFIXES.includes(normalized)) {
    throw new AppError(
      `Invalid auto-number prefix. Allowed: ${ALLOWED_PREFIXES.join(', ')}`,
      400,
      'INVALID_AUTO_NUMBER_PREFIX'
    );
  }

  return normalized;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

/**
 * Format sequence as LN-2026-00001
 */
function formatAutoNumber(prefix, year, sequence, padLength = SEQUENCE_PAD_LENGTH) {
  const normalizedPrefix = validatePrefix(prefix);
  const padded = String(sequence).padStart(padLength, '0');

  return `${normalizedPrefix}-${year}-${padded}`;
}

/**
 * Atomically reserve the next auto-number for a tenant.
 * Per company + prefix + year sequence.
 */
async function getNextAutoNumber(companyId, prefix, options = {}) {
  if (!companyId) {
    throw new AppError('companyId is required to generate auto-number', 400, 'MISSING_COMPANY_ID');
  }

  const normalizedPrefix = validatePrefix(prefix);
  const year = options.year ?? getCurrentYear();
  const session = options.session ?? null;

  const query = DocumentSequence.findOneAndUpdate(
    { companyId, prefix: normalizedPrefix, year },
    { $inc: { lastSequence: 1 } },
    {
      returnDocument: 'after',
      upsert: true,
      setDefaultsOnInsert: true,
      ...(session ? { session } : {}),
    }
  );

  const sequenceDoc = await query;
  const autoNumber = formatAutoNumber(normalizedPrefix, year, sequenceDoc.lastSequence);

  return {
    autoNumber,
    prefix: normalizedPrefix,
    year,
    sequence: sequenceDoc.lastSequence,
    companyId,
  };
}

/**
 * Preview the next number without reserving it.
 */
async function peekNextAutoNumber(companyId, prefix, options = {}) {
  if (!companyId) {
    throw new AppError('companyId is required to preview auto-number', 400, 'MISSING_COMPANY_ID');
  }

  const normalizedPrefix = validatePrefix(prefix);
  const year = options.year ?? getCurrentYear();

  const sequenceDoc = await DocumentSequence.findOne({
    companyId,
    prefix: normalizedPrefix,
    year,
  });

  const nextSequence = (sequenceDoc?.lastSequence || 0) + 1;

  return {
    preview: formatAutoNumber(normalizedPrefix, year, nextSequence),
    prefix: normalizedPrefix,
    year,
    nextSequence,
    companyId,
  };
}

module.exports = {
  formatAutoNumber,
  getNextAutoNumber,
  peekNextAutoNumber,
  validatePrefix,
};
