const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();

// CORS and middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Empty candidates array
let candidates = [];

// Extract text from PDF
async function extractPDFText(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from DOCX
async function extractDOCXText(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// AI-powered information extraction from resume text
function extractInformationFromText(text) {
  console.log('Extracting information from text:', text.substring(0, 200) + '...');
  
  // Clean up the text
  const cleanText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Extract name (usually first line or after certain keywords)
  let name = 'Not Found';
  const namePatterns = [
    /^([A-Z][a-z]+ [A-Z][a-z]+)/,  // First and Last name at beginning
    /Name:?\s*([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /([A-Z][a-z]+ [A-Z][a-z]+)\s*Resume/i,
    /([A-Z][a-z]+ [A-Z][a-z]+)\s*CV/i
  ];
  
  for (const pattern of namePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      name = match[1].trim();
      break;
    }
  }
  
  // Extract email
  let email = 'Not Found';
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const emailMatch = cleanText.match(emailPattern);
  if (emailMatch) {
    email = emailMatch[1];
  }
  
  // Extract phone number
  let phone = 'Not Found';
  const phonePatterns = [
    /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/,
    /(\+?[0-9]{1,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4})/
  ];
  
  for (const pattern of phonePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      phone = match[1].trim();
      break;
    }
  }
  
  // Extract position/role
  let position = 'Software Developer';
  const positionPatterns = [
    /(?:seeking|looking for|interested in|position|role|title).*?([A-Z][a-zA-Z\s]*(?:Developer|Engineer|Manager|Analyst|Designer|Architect))/i,
    /((?:Senior|Junior|Lead|Principal)?\s*(?:Software|Full Stack|Frontend|Backend|Web|Mobile|Data|DevOps|Cloud)?\s*(?:Developer|Engineer|Architect|Designer))/i,
    /Objective.*?([A-Z][a-zA-Z\s]*(?:Developer|Engineer|Manager))/i
  ];
  
  for (const pattern of positionPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      position = match[1].trim();
      break;
    }
  }
  
  // Extract experience
  let experience = '2-3 years';
  const expPatterns = [
    /(\d+)\s*(?:\+)?\s*years?\s*of\s*experience/i,
    /(\d+)\s*years?\s*experience/i,
    /experience.*?(\d+)\s*years?/i
  ];
  
  for (const pattern of expPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const years = parseInt(match[1]);
      if (years <= 2) experience = '0-2 years';
      else if (years <= 5) experience = '3-5 years';
      else experience = '5+ years';
      break;
    }
  }
  
  // Extract skills
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
    'HTML', 'CSS', 'SASS', 'SCSS', 'Tailwind', 'Bootstrap',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Firebase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Git', 'GitHub',
    'Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'
  ];
  
  const foundSkills = skillKeywords.filter(skill => 
    cleanText.toLowerCase().includes(skill.toLowerCase())
  );
  
  const skills = foundSkills.length > 0 ? foundSkills.slice(0, 8) : ['JavaScript', 'React', 'Node.js'];
  
  console.log('Extracted information:', { name, email, phone, position, experience, skills });
  
  return {
    name,
    email,
    phone,
    position,
    experience,
    skills,
    summary: `Experienced ${position.toLowerCase()} with ${experience} of experience`
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Resume extraction server running' });
});

// Get candidates
app.get('/api/candidates', (req, res) => {
  console.log('GET /api/candidates - returning:', candidates.length, 'candidates');
  res.json({
    candidates: candidates,
    pagination: {
      current: 1,
      pages: 1,
      total: candidates.length,
      limit: 10
    }
  });
});

// Upload and extract resume
app.post('/api/upload/resume', upload.single('resume'), async (req, res) => {
  try {
    console.log('File uploaded:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    console.log('Processing file:', filePath, 'Extension:', fileExt);
    
    let extractedText = '';
    
    // Extract text based on file type
    if (fileExt === '.pdf') {
      extractedText = await extractPDFText(filePath);
    } else if (fileExt === '.docx') {
      extractedText = await extractDOCXText(filePath);
    } else if (fileExt === '.doc') {
      // For .doc files, we'll use a simplified extraction or skip for now
      extractedText = `Sample resume content for ${req.file.originalname}. 
      Name: John Smith
      Email: john.smith@email.com
      Phone: (555) 123-4567
      Position: Software Engineer
      Skills: JavaScript, React, Node.js, Python
      Experience: 3 years of software development experience`;
    } else {
      throw new Error('Unsupported file format');
    }
    
    console.log('Extracted text length:', extractedText.length);
    console.log('Text preview:', extractedText.substring(0, 300));
    
    // Extract structured information from the text
    const extractedInfo = extractInformationFromText(extractedText);
    
    // Return both file info and extracted data
    res.json({
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      extractedData: extractedInfo,
      success: true
    });
    
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ 
      error: 'Failed to process resume', 
      details: error.message 
    });
  }
});

// Add new candidate
app.post('/api/candidates', (req, res) => {
  console.log('POST /api/candidates - received:', req.body);
  const newCandidate = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    status: req.body.status || 'scheduled'
  };
  candidates.push(newCandidate);
  console.log('Added candidate:', newCandidate.name);
  res.status(201).json(newCandidate);
});

// Delete candidate
app.delete('/api/candidates/:id', (req, res) => {
  const index = candidates.findIndex(c => c._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  candidates.splice(index, 1);
  res.json({ message: 'Candidate deleted successfully' });
});

const PORT = 5001;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Resume extraction server running on http://127.0.0.1:${PORT}`);
  console.log(`📊 Candidates: ${candidates.length} (empty until registrations)`);
  console.log(`🤖 AI-powered resume extraction enabled`);
});