const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'situational', 'general'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  expectedAnswer: String,
  keywords: [String],
  timeAsked: {
    type: Date,
    default: Date.now
  },
  aiGenerated: {
    type: Boolean,
    default: false
  }
});

const evaluationSchema = new mongoose.Schema({
  criteria: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  notes: String,
  aiAnalysis: {
    confidence: Number,
    reasoning: String,
    suggestions: [String]
  }
});

const interviewSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  position: {
    type: String,
    required: true
  },
  interviewer: {
    name: String,
    email: String
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  startedAt: Date,
  endedAt: Date,
  duration: {
    type: Number, // in minutes
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['phone', 'video', 'in-person'],
    default: 'video'
  },
  questions: [questionSchema],
  transcript: {
    type: String,
    default: ''
  },
  audioRecording: {
    filename: String,
    url: String,
    duration: Number
  },
  videoRecording: {
    filename: String,
    url: String,
    duration: Number
  },
  evaluations: [evaluationSchema],
  overallScore: {
    type: Number,
    min: 0,
    max: 10
  },
  aiInsights: {
    communicationScore: Number,
    technicalScore: Number,
    confidenceLevel: Number,
    sentimentAnalysis: {
      positive: Number,
      neutral: Number,
      negative: Number
    },
    keyTopics: [String],
    recommendations: [String]
  },
  feedback: {
    strengths: [String],
    improvements: [String],
    recommendation: {
      type: String,
      enum: ['strong-hire', 'hire', 'no-hire', 'strong-no-hire'],
    },
    notes: String
  },
  settings: {
    aiEnabled: {
      type: Boolean,
      default: true
    },
    recordAudio: {
      type: Boolean,
      default: true
    },
    recordVideo: {
      type: Boolean,
      default: true
    },
    autoTranscribe: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

interviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate overall score from evaluations
  if (this.evaluations && this.evaluations.length > 0) {
    const totalScore = this.evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    this.overallScore = totalScore / this.evaluations.length;
  }
  
  next();
});

interviewSchema.index({ candidate: 1 });
interviewSchema.index({ scheduledAt: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ position: 1 });
interviewSchema.index({ createdAt: -1 });

// Virtual for calculated duration
interviewSchema.virtual('actualDuration').get(function() {
  if (this.startedAt && this.endedAt) {
    return Math.round((this.endedAt - this.startedAt) / (1000 * 60)); // in minutes
  }
  return null;
});

module.exports = mongoose.model('Interview', interviewSchema);