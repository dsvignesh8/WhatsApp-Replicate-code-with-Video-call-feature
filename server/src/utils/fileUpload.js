const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ErrorResponse = require('./errorResponse');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'whatsapp-clone',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'pdf', 'doc', 'docx'],
    resource_type: 'auto'
  }
});

// File size limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB limit
};

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    // Videos
    'video/mp4',
    'video/quicktime',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Invalid file type', 400), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: limits,
  fileFilter: fileFilter
});

// Upload middleware for different types
exports.uploadMedia = upload.single('media');
exports.uploadAvatar = upload.single('avatar');
exports.uploadGroupAvatar = upload.single('groupAvatar');

// Upload multiple files
exports.uploadMultiple = upload.array('files', 10); // Max 10 files

// Delete file from Cloudinary
exports.deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw new ErrorResponse('Error deleting file', 500);
  }
};

// Get file type category
exports.getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
};

// Format file size
exports.formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate file size
exports.validateFileSize = (fileSize, maxSize = limits.fileSize) => {
  return fileSize <= maxSize;
};

// Generate thumbnail for video
exports.generateVideoThumbnail = async (publicId) => {
  try {
    const result = await cloudinary.video.thumbnail(publicId, {
      width: 200,
      height: 200,
      crop: 'fill'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error generating video thumbnail:', error);
    return null;
  }
};
