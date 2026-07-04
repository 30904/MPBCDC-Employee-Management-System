const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sendError } = require('../utils/apiResponse');
const {
  MAX_UPLOAD_MB,
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
  UPLOAD_FIELD_NAME,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} = require('../config/upload');

const uploadDir = path.resolve(process.cwd(), UPLOAD_DIR);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function resolveDestination(req) {
  if (req.companyId) {
    return path.join(uploadDir, String(req.companyId));
  }
  return path.join(uploadDir, 'platform');
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const destination = resolveDestination(req);
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `${unique}${ext}`);
  },
});

function pdfOnly(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const isPdf =
    ALLOWED_MIME_TYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext);

  if (!isPdf) {
    const error = new Error('Only PDF files are allowed');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error);
  }

  return cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: pdfOnly,
});

const uploadSinglePdf = upload.single(UPLOAD_FIELD_NAME);

function handleUploadError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(
        res,
        `File too large. Maximum size is ${MAX_UPLOAD_MB}MB`,
        400,
        'FILE_TOO_LARGE'
      );
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return sendError(
        res,
        `Unexpected file field. Use field name "${UPLOAD_FIELD_NAME}"`,
        400,
        'INVALID_UPLOAD_FIELD'
      );
    }
    return sendError(res, err.message, 400, 'UPLOAD_ERROR');
  }

  if (err) {
    return sendError(res, err.message, 400, err.code || 'UPLOAD_ERROR');
  }

  return next();
}

module.exports = {
  upload,
  uploadSinglePdf,
  handleUploadError,
  uploadDir,
  resolveDestination,
};
