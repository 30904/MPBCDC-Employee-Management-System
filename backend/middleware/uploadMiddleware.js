const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sendError } = require('../utils/apiResponse');

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
const maxBytes = (Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024;

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
  const isPdf =
    file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isPdf) {
    return cb(new Error('Only PDF files are allowed'));
  }

  return cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: maxBytes },
  fileFilter: pdfOnly,
});

const uploadSinglePdf = upload.single('file');

function handleUploadError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, `File too large. Maximum size is ${process.env.MAX_UPLOAD_MB || 5}MB`, 400);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return sendError(res, 'Unexpected file field. Use field name "file"', 400);
    }
    return sendError(res, err.message, 400);
  }

  if (err) {
    return sendError(res, err.message, 400);
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
