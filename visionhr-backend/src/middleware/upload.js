import multer from 'multer';
import { sendError } from '../utils/apiResponse.js';
import { HTTP } from '../constants/index.js';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types for document uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Allowed MIME types for avatar uploads
const AVATAR_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * memoryStorage keeps file in RAM as a Buffer — no disk writes.
 * The buffer is then streamed directly to AWS S3 in the service layer.
 */
const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`
      ),
      false
    );
  }
};

// Document upload (PDFs, images, Word docs)
export const uploadDocument = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(ALLOWED_MIME_TYPES),
}).single('document');

// Avatar upload (images only)
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for avatars
  fileFilter: fileFilter(AVATAR_MIME_TYPES),
}).single('avatar');

// Multiple documents at once (max 5)
export const uploadMultipleDocuments = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(ALLOWED_MIME_TYPES),
}).array('documents', 5);

/**
 * Multer error handler wrapper.
 * Converts Multer errors into the standard VisionHR API error format.
 */
export const handleUploadError = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, HTTP.BAD_REQUEST, `File too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      }
      return sendError(res, HTTP.BAD_REQUEST, err.message);
    }
    if (err) {
      return sendError(res, HTTP.BAD_REQUEST, err.message);
    }
    next();
  });
};
