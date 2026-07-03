const path = require('path');
const { sendError, sendSuccess } = require('../utils/apiResponse');

function uploadPdf(req, res) {
  if (!req.file) {
    return sendError(res, 'PDF file is required (field name: file)', 400);
  }

  const relativePath = path
    .relative(path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'), req.file.path)
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
  uploadPdf,
};
