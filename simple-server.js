const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Simple server is running'
  });
});

// Mock candidates data - START EMPTY (only real registrations will appear)
let mockCandidates = [];

// GET all candidates
app.get('/api/candidates', (req, res) => {
  console.log('GET /api/candidates requested');
  res.json({
    candidates: mockCandidates,
    pagination: {
      current: 1,
      pages: 1,
      total: mockCandidates.length,
      limit: 10
    }
  });
});

// POST create new candidate (without file upload for now)
app.post('/api/candidates', (req, res) => {
  console.log('POST /api/candidates requested with data:', req.body);
  
  const newCandidate = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: req.body.status || 'applied'
  };
  
  mockCandidates.push(newCandidate);
  res.status(201).json(newCandidate);
});

// POST upload endpoint (mock response)
app.post('/api/upload/resume', (req, res) => {
  console.log('POST /api/upload/resume requested');
  res.json({
    file: {
      filename: 'mock-resume-' + Date.now() + '.pdf',
      originalName: 'resume.pdf',
      mimetype: 'application/pdf',
      size: 12345
    }
  });
});

const PORT = 5001;

const server = app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`📊 Using mock data for demonstration`);
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});