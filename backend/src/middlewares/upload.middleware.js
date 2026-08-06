import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// Configure Multer to use in-memory storage (Buffer)
const storage = multer.memoryStorage();

// File filter for general image uploads (max 5MB)
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type '${file.mimetype}'. Only JPEG, PNG, and WebP images are allowed.`
      ),
      false
    );
  }
};

// Flexible media filter accepting images and videos
const mediaFileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  if (file.fieldname === 'video') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          `Invalid video format '${file.mimetype}'. Only MP4 and WebM videos are allowed.`
        ),
        false
      );
    }
  } else {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          `Invalid image format '${file.mimetype}'. Only JPEG, PNG, and WebP images are allowed.`
        ),
        false
      );
    }
  }
};

// Multer upload instances
export const uploadSingleImage = (fieldName = 'image') => {
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFileFilter,
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'Image file size exceeds the maximum allowed limit of 5MB.'));
        }
        return next(new ApiError(400, `File upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

// Product media upload instance (images max 8, video max 1)
export const uploadProductMedia = () => {
  const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Max file size cap (50MB for video)
    fileFilter: mediaFileFilter,
  }).fields([
    { name: 'images', maxCount: 8 },
    { name: 'video', maxCount: 1 },
  ]);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'Uploaded file exceeds maximum size limit (5MB for images, 50MB for video).'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new ApiError(400, `Too many files uploaded for field '${err.field}'. Max 8 images and 1 video allowed.`));
        }
        return next(new ApiError(400, `File upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      // Check specific image file size (5MB each)
      if (req.files && req.files.images) {
        for (const imgFile of req.files.images) {
          if (imgFile.size > 5 * 1024 * 1024) {
            return next(new ApiError(400, `Image file '${imgFile.originalname}' exceeds 5MB limit.`));
          }
        }
      }

      next();
    });
  };
};
