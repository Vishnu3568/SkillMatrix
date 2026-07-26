const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { ValidationError, NotFoundError } = require('../errors');

// Upload directory path
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types & file size limits
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_RESOURCE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
  'text/plain',
  'image/jpeg',
  'image/png',
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_RESOURCE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Format bytes into human readable size string.
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Abstracted Local Storage Provider (Adapter pattern for future Cloudinary / S3 replacement)
 */
class LocalStorageProvider {
  async saveFile(file, category = 'resource') {
    if (!file) {
      throw new ValidationError('No file provided for upload');
    }

    const { originalname, mimetype, buffer, size } = file;

    if (category === 'image') {
      if (!ALLOWED_IMAGE_TYPES.includes(mimetype.toLowerCase())) {
        throw new ValidationError(`Invalid image MIME type: ${mimetype}. Allowed: JPG, PNG, WEBP, GIF`);
      }
      if (size > MAX_IMAGE_SIZE) {
        throw new ValidationError(`Image size exceeds limit of 5 MB (File size: ${formatBytes(size)})`);
      }
    } else {
      if (!ALLOWED_RESOURCE_TYPES.includes(mimetype.toLowerCase())) {
        throw new ValidationError(`Invalid resource MIME type: ${mimetype}. Allowed: PDF, ZIP, TXT, Images`);
      }
      if (size > MAX_RESOURCE_SIZE) {
        throw new ValidationError(`Resource size exceeds limit of 50 MB (File size: ${formatBytes(size)})`);
      }
    }

    // Sanitize extension and generate safe unique filename
    const fileExt = path.extname(originalname).toLowerCase() || (category === 'image' ? '.png' : '.bin');
    const safeBaseName = path.basename(originalname, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${Date.now()}-${safeBaseName}-${crypto.randomBytes(4).toString('hex')}${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    // Save buffer to disk
    await fs.promises.writeFile(filePath, buffer);

    return {
      filename: uniqueFilename,
      originalname,
      mimetype,
      size,
      formattedSize: formatBytes(size),
      url: `/uploads/${uniqueFilename}`,
    };
  }

  async deleteFile(filename) {
    if (!filename) return false;
    // Prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    throw new NotFoundError('File not found on storage server');
  }

  getFileUrl(filename) {
    const sanitized = path.basename(filename);
    return `/uploads/${sanitized}`;
  }
}

const storageProvider = new LocalStorageProvider();

// Multer memory storage configuration for streaming to storage provider
const multerMemoryStorage = multer.memoryStorage();

const uploadImage = multer({
  storage: multerMemoryStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new ValidationError('Only image files (JPG, PNG, WEBP, GIF) are allowed'));
    }
  },
});

const uploadResource = multer({
  storage: multerMemoryStorage,
  limits: { fileSize: MAX_RESOURCE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_RESOURCE_TYPES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new ValidationError('Only document & archive files (PDF, ZIP, TXT, Images) are allowed'));
    }
  },
});

module.exports = {
  storageProvider,
  uploadImage,
  uploadResource,
  formatBytes,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_RESOURCE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_RESOURCE_SIZE,
};
