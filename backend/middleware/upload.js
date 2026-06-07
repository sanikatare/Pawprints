const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;
const DOC_TYPES = /jpeg|jpg|png|gif|webp|pdf/;

function createUploader(subdir, allowedTypes) {
  const uploadDir = path.join(__dirname, '..', 'uploads', subdir);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safeName}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).slice(1).toLowerCase();
      if (allowedTypes.test(ext)) return cb(null, true);
      cb(new Error(`File type .${ext} is not allowed`));
    },
  });
}

module.exports = {
  petPhotoUpload: createUploader('', IMAGE_TYPES),
  medicalFileUpload: createUploader('medical', DOC_TYPES),
};
