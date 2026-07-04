/**
 * File upload convention (MPBCDC implementation guide).
 * multipart/form-data; PDF only; max 5MB.
 */
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB) || 5;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const UPLOAD_FIELD_NAME = 'file';
const ALLOWED_MIME_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['.pdf'];

const UPLOAD_CONVENTION = {
  contentType: 'multipart/form-data',
  fieldName: UPLOAD_FIELD_NAME,
  maxSizeMb: MAX_UPLOAD_MB,
  maxSizeBytes: MAX_UPLOAD_BYTES,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
  allowedExtensions: ALLOWED_EXTENSIONS,
  storage: 'local',
  pathPattern: 'uploads/<companyId>/<filename>',
  endpoint: '/api/uploads',
};

module.exports = {
  MAX_UPLOAD_MB,
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
  UPLOAD_FIELD_NAME,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  UPLOAD_CONVENTION,
};
