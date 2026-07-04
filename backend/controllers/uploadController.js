const path = require('path');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const {
  UPLOAD_DIR,
  UPLOAD_FIELD_NAME,
  UPLOAD_CONVENTION,
} = require('../config/upload');

function getUploadFormats(_req, res) {
  return sendSuccess(res, UPLOAD_CONVENTION);
}

function uploadPdf(req, res) {
  if (!req.file) {
    return sendError(
      res,
      `PDF file is required (field name: ${UPLOAD_FIELD_NAME})`,
      400,
      'FILE_REQUIRED'
    );
  }

  const relativePath = path
    .relative(path.resolve(process.cwd(), UPLOAD_DIR), req.file.path)
    .split(path.sep)
    .join('/');

  return sendSuccess(
    res,
    {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      attachmentPath: relativePath,
      url: `/uploads/${relativePath}`,
    },
    201
  );
}

module.exports = {
  getUploadFormats,
  uploadPdf,
};
