const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  resume: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  },
  status: {
    type: String,
    enum: ['applied', 'screening', 'scheduled', 'interviewed', 'completed', 'rejected', 'hired'],
    default: 'applied'
  },
  notes: {
    type: String,
    trim: true
  },
  interviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  }],
  averageScore: {
    type: Number,
    min: 0,
    max: 10
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

candidateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

candidateSchema.index({ email: 1 });
candidateSchema.index({ position: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Candidate', candidateSchema);