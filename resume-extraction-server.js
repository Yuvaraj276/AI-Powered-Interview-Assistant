const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

let pdfParse, mammoth;
try {
  pdfParse = require('pdf-parse');
  mammoth = require('mammoth');
  console.log('PDF and Word processing libraries loaded successfully');
} catch (error) {
  console.error('Error loading pdf-parse or mammoth:', error.message);
  process.exit(1);
}

const app = express();
const PORT = 5001;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Extract text from PDF
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

// Extract text from DOC/DOCX
async function extractTextFromWord(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    throw error;
  }
}

// AI-powered extraction using regex patterns
function extractResumeData(text) {
  const extractedData = {
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: ''
  };

  // Extract name (usually at the beginning)
  const namePattern = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;
  const nameMatch = text.match(namePattern);
  if (nameMatch) {
    extractedData.name = nameMatch[1];
  }

  // Extract email
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailPattern);
  if (emailMatch) {
    extractedData.email = emailMatch[0];
  }

  // Extract phone number
  const phonePattern = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const phoneMatch = text.match(phonePattern);
  if (phoneMatch) {
    extractedData.phone = phoneMatch[0];
  }

  // Extract experience (look for years of experience)
  const expPattern = /(\d+)\s*\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i;
  const expMatch = text.match(expPattern);
  if (expMatch) {
    extractedData.experience = `${expMatch[1]} years`;
  }

  // Extract skills (look for skills section)
  const skillsPattern = /(?:skills|technologies|technical skills|programming languages)[:\s]*([^.]*)/i;
  const skillsMatch = text.match(skillsPattern);
  if (skillsMatch) {
    extractedData.skills = skillsMatch[1].trim().substring(0, 200); // Limit to 200 chars
  }

  return extractedData;
}

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Resume extraction server is running', port: PORT });
});

// Resume extraction endpoint
app.post('/extract-resume', upload.single('resume'), async (req, res) => {
  try {
    console.log('Received resume extraction request');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    let extractedText = '';
    
    // Extract text based on file type
    if (req.file.mimetype === 'application/pdf') {
      console.log('Processing PDF file...');
      extractedText = await extractTextFromPDF(req.file.buffer);
    } else if (req.file.mimetype === 'application/msword' || 
               req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('Processing Word document...');
      extractedText = await extractTextFromWord(req.file.buffer);
    } else {
      console.log('Unsupported file type:', req.file.mimetype);
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    console.log('Extracted text length:', extractedText.length);

    // Extract structured data from text
    const extractedData = extractResumeData(extractedText);
    
    console.log('Extracted data:', extractedData);

    res.json({
      success: true,
      data: extractedData,
      rawText: extractedText.substring(0, 500) // Send first 500 chars for debugging
    });

  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ 
      error: 'Failed to process resume',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Resume extraction server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});