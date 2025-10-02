const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'misc';
    
    // Organize files by type
    if (file.fieldname === 'resume') {
      subfolder = 'resumes';
    } else if (file.fieldname === 'recording') {
      subfolder = 'recordings';
    } else if (file.fieldname === 'profile') {
      subfolder = 'profiles';
    }

    const uploadPath = path.join(uploadDir, subfolder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types by field
  const allowedTypes = {
    resume: ['.pdf', '.doc', '.docx'],
    recording: ['.mp3', '.wav', '.m4a', '.webm'],
    profile: ['.jpg', '.jpeg', '.png', '.gif']
  };

  const ext = path.extname(file.originalname).toLowerCase();
  const fieldAllowedTypes = allowedTypes[file.fieldname] || ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

  if (fieldAllowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${fieldAllowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Middleware for handling upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 5 files per request.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(500).json({ error: 'File upload failed.' });
};

// Helper function to delete file
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

// Helper function to get file info
const getFileInfo = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stats = fs.statSync(filePath);
  return {
    size: stats.size,
    modified: stats.mtime,
    created: stats.birthtime
  };
};

module.exports = {
  upload,
  handleUploadError,
  deleteFile,
  getFileInfo,
  uploadDir
};