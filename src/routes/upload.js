const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middleware/upload');

// POST /api/upload/resume - Upload candidate resume
router.post('/resume', upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      uploadDate: new Date().toISOString(),
      type: 'resume'
    };

    res.json({
      message: 'Resume uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// POST /api/upload/recording - Upload interview recording
router.post('/recording', upload.single('recording'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No recording uploaded' });
    }

    const { interviewId } = req.body;

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      uploadDate: new Date().toISOString(),
      type: 'recording',
      interviewId: interviewId || null
    };

    res.json({
      message: 'Recording uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({ error: 'Failed to upload recording' });
  }
});

// POST /api/upload/profile - Upload profile image
router.post('/profile', upload.single('profile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      uploadDate: new Date().toISOString(),
      type: 'profile'
    };

    res.json({
      message: 'Profile image uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      uploadDate: new Date().toISOString(),
      fieldname: file.fieldname
    }));

    res.json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// GET /api/upload/file/:filename - Serve uploaded file
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'misc' } = req.query;
    
    const path = require('path');
    const fs = require('fs');
    
    const filePath = path.join(__dirname, '../../uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.webm': 'audio/webm'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    
    // For images and audio, allow inline display
    if (ext.match(/\.(jpg|jpeg|png|gif|mp3|wav|m4a|webm)$/)) {
      res.setHeader('Content-Disposition', 'inline');
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// DELETE /api/upload/file/:filename - Delete uploaded file
router.delete('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'misc' } = req.query;
    
    const path = require('path');
    const fs = require('fs');
    
    const filePath = path.join(__dirname, '../../uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    
    res.json({
      message: 'File deleted successfully',
      filename,
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Error handling middleware for uploads
router.use(handleUploadError);

module.exports = router;