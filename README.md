# AI-Powered Interview Assistant

A comprehensive full-stack application for conducting AI-enhanced technical interviews with real-time transcription, candidate evaluation, and analytics.

## 🚀 Features

### Core Interview Features
- **Real-time Video & Audio Interviews** - Conduct live interviews with video/audio support
- **AI-Powered Question Generation** - Generate relevant interview questions based on position and difficulty
- **Live Transcription** - Real-time speech-to-text transcription during interviews
- **AI Suggestions** - Get intelligent follow-up question suggestions based on conversation flow
- **Candidate Evaluation** - Comprehensive scoring and evaluation system
- **Interview Recording** - Record and store interview sessions for later review

### Candidate Management
- **Candidate Profiles** - Complete candidate information management
- **Resume Upload** - Support for PDF, DOC, and DOCX resume uploads
- **Interview Scheduling** - Schedule and manage interview appointments
- **Status Tracking** - Track candidate progress through interview pipeline
- **Contact Management** - Store and manage candidate contact information

### Analytics & Reporting
- **Interview Analytics** - Comprehensive interview performance metrics
- **Score Distribution** - Visual analysis of candidate scoring patterns
- **Position Statistics** - Track performance by job position
- **Trend Analysis** - Monitor interview trends over time
- **Performance Metrics** - Completion rates, duration analysis, and more
- **Export Capabilities** - Export data for external analysis

### AI Integration
- **OpenAI Integration** - Powered by GPT models for intelligent features
- **Question Analysis** - AI-driven question performance analysis
- **Response Evaluation** - Automated candidate response assessment
- **Feedback Generation** - AI-generated interview feedback and recommendations
- **Sentiment Analysis** - Analyze candidate response sentiment

### Security & Configuration
- **JWT Authentication** - Secure API access with JWT tokens
- **Rate Limiting** - Protect against abuse with configurable rate limits
- **File Upload Security** - Secure file handling with type validation
- **Environment Configuration** - Flexible configuration management
- **Settings Management** - Comprehensive application settings

## 🛠️ Technology Stack

### Frontend
- **React.js 18.2.0** - Modern React with hooks and context
- **React Router 6.26.2** - Client-side routing
- **Tailwind CSS 3.4.15** - Utility-first CSS framework
- **Chart.js 4.4.6** - Data visualization and analytics charts
- **Axios 1.7.9** - HTTP client for API communication
- **Socket.io Client 4.8.1** - Real-time communication

### Backend
- **Node.js & Express.js 4.21.2** - Server framework
- **MongoDB & Mongoose 8.9.1** - Database and ODM
- **Socket.io 4.8.1** - Real-time WebSocket communication
- **OpenAI API** - AI-powered features
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **Multer 1.4.5** - File upload handling
- **Helmet 8.0.0** - Security headers
- **Express Rate Limit 7.5.0** - Rate limiting
- **CORS 2.8.5** - Cross-origin resource sharing

### Development Tools
- **Nodemon 3.1.9** - Development server with auto-restart
- **Concurrently 9.1.0** - Run multiple commands simultaneously
- **Morgan 1.10.0** - HTTP request logging
- **Dotenv 16.4.7** - Environment variable management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MongoDB** (v4.4 or higher) - Local installation or MongoDB Atlas
- **OpenAI API Key** (optional, for AI features)

## 🚦 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd AI-Powered-Interview

# Install dependencies for both frontend and backend
npm run install:all
```

### 2. Environment Configuration

Create environment files for both frontend and backend:

**Backend (.env in /backend directory):**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/interview_assistant

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key-here

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Frontend (.env in /frontend directory):**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Application Configuration
REACT_APP_NAME=AI Interview Assistant
REACT_APP_VERSION=1.0.0
```

### 3. Database Setup

Ensure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

### 4. Start the Application

```bash
# Start both frontend and backend simultaneously
npm run dev

# Or start individually:
# Frontend (runs on http://localhost:3000)
npm run start:frontend

# Backend (runs on http://localhost:5000)
npm run start:backend
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 📁 Project Structure

```
AI-Powered-Interview/
├── frontend/                  # React.js frontend application
│   ├── public/               # Public assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── App.js           # Main application component
│   │   └── index.js         # Application entry point
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind CSS configuration
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── models/          # MongoDB data models
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Custom middleware functions
│   │   └── utils/           # Utility functions
│   ├── uploads/             # File upload storage
│   ├── server.js            # Server entry point
│   └── package.json         # Backend dependencies
├── .vscode/
│   └── tasks.json           # VS Code task configuration
├── .github/
│   └── copilot-instructions.md  # Copilot configuration
├── README.md                # Project documentation
└── package.json             # Root package configuration
```

## 🔧 Available Scripts

### Root Level Scripts
```bash
npm run install:all          # Install dependencies for both frontend and backend
npm run dev                  # Start both frontend and backend in development mode
npm run start:frontend       # Start only the frontend
npm run start:backend        # Start only the backend
npm run build:frontend       # Build frontend for production
npm run test                 # Run tests for both applications
```

### Frontend Scripts
```bash
npm start                    # Start development server
npm run build                # Build for production
npm test                     # Run tests
npm run eject                # Eject from Create React App
```

### Backend Scripts
```bash
npm start                    # Start production server
npm run dev                  # Start development server with nodemon
npm test                     # Run tests
```

## 🔌 API Endpoints

### Candidates
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/:id` - Get candidate by ID
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Interviews
- `GET /api/interviews` - Get all interviews
- `POST /api/interviews` - Create new interview
- `GET /api/interviews/:id` - Get interview by ID
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Delete interview

### AI Services
- `POST /api/ai/generate-question` - Generate AI interview question
- `POST /api/ai/generate-suggestion` - Generate AI suggestion
- `POST /api/ai/analyze-response` - Analyze candidate response
- `POST /api/ai/generate-feedback` - Generate interview feedback
- `GET /api/ai/status` - Check AI service status

### Analytics
- `GET /api/analytics/overview` - Get overview statistics
- `GET /api/analytics/trends` - Get interview trends
- `GET /api/analytics/scores` - Get score distribution
- `GET /api/analytics/positions` - Get position statistics
- `GET /api/analytics/performance` - Get performance metrics

### File Upload
- `POST /api/upload/resume` - Upload candidate resume
- `POST /api/upload/recording` - Upload interview recording
- `POST /api/upload/profile` - Upload profile image
- `GET /api/upload/file/:filename` - Serve uploaded file

### Settings
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update settings
- `PUT /api/settings/ai-api-key` - Update OpenAI API key
- `POST /api/settings/test-ai` - Test AI configuration

## 🌐 Real-time Features

The application uses Socket.io for real-time communication:

### WebSocket Events
- `join-interview` - Join an interview room
- `transcript-update` - Real-time transcript updates
- `request-ai-suggestion` - Request AI suggestions
- `ai-suggestion` - Receive AI suggestions
- `transcript-updated` - Broadcast transcript updates

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing configuration
- **Rate Limiting** - Configurable request rate limiting
- **JWT Authentication** - Secure API access
- **File Upload Validation** - File type and size validation
- **Input Sanitization** - Protection against injection attacks

## 🚀 Deployment

### Production Build

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set production environment variables

3. Start the production server:
```bash
cd backend
npm start
```

### Environment Variables for Production

Ensure the following environment variables are set:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=strong-production-secret
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=https://your-domain.com
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in environment variables
   - Verify network connectivity

2. **OpenAI API Errors**
   - Verify API key is correct
   - Check API quota and billing
   - Ensure API key has proper permissions

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure supported file types

4. **CORS Errors**
   - Verify FRONTEND_URL in backend environment
   - Check CORS configuration
   - Ensure proper origin headers

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=interview-assistant:*
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- React team for the frontend framework
- Express.js team for the backend framework
- MongoDB team for the database
- All other open-source contributors