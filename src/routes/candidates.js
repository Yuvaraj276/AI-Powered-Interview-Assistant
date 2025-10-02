const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Mock data for development when MongoDB is not available - EMPTY by default
const mockCandidates = [];

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Try to import models, but handle gracefully if MongoDB is not connected
let Candidate, Interview;
try {
  Candidate = require('../models/Candidate');
  Interview = require('../models/Interview');
} catch (error) {
  console.warn('MongoDB models not available, using mock data');
}

// GET /api/candidates - Get all candidates with pagination and filtering
router.get('/', async (req, res) => {
  try {
    if (!isMongoConnected() || !Candidate) {
      // Return mock data when MongoDB is not available
      const {
        page = 1,
        limit = 10,
        search,
        position,
        status
      } = req.query;

      let filteredCandidates = [...mockCandidates];

      // Apply filters
      if (search) {
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.name.toLowerCase().includes(search.toLowerCase()) ||
          candidate.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (position) {
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.position.toLowerCase().includes(position.toLowerCase())
        );
      }

      if (status) {
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.status === status
        );
      }

      // Apply pagination
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

      return res.json({
        candidates: paginatedCandidates,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filteredCandidates.length / parseInt(limit)),
          total: filteredCandidates.length,
          limit: parseInt(limit)
        }
      });
    }

    const {
      page = 1,
      limit = 10,
      search,
      position,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (position) {
      filter.position = position;
    }
    
    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const candidates = await Candidate.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('interviews', 'scheduledAt status overallScore');

    const total = await Candidate.countDocuments(filter);

    res.json({
      candidates,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// GET /api/candidates/:id - Get candidate by ID
router.get('/:id', async (req, res) => {
  try {
    if (!isMongoConnected() || !Candidate) {
      // Return mock data when MongoDB is not available
      const candidate = mockCandidates.find(c => c._id === req.params.id);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      return res.json(candidate);
    }

    const candidate = await Candidate.findById(req.params.id)
      .populate('interviews');
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// POST /api/candidates - Create new candidate
router.post('/', async (req, res) => {
  try {
    const candidateData = req.body;
    
    if (!isMongoConnected() || !Candidate) {
      // Handle mock data creation when MongoDB is not available
      const existingCandidate = mockCandidates.find(c => c.email === candidateData.email);
      if (existingCandidate) {
        return res.status(400).json({ error: 'Candidate with this email already exists' });
      }

      const newCandidate = {
        _id: Date.now().toString(),
        ...candidateData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCandidates.push(newCandidate);
      return res.status(201).json(newCandidate);
    }
    
    // Check if candidate with email already exists
    const existingCandidate = await Candidate.findOne({ email: candidateData.email });
    if (existingCandidate) {
      return res.status(400).json({ error: 'Candidate with this email already exists' });
    }
    
    const candidate = new Candidate(candidateData);
    await candidate.save();
    
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// PUT /api/candidates/:id - Update candidate
router.put('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Also delete associated interviews
    await Interview.deleteMany({ candidate: req.params.id });
    
    await Candidate.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// GET /api/candidates/stats/overview - Get candidate statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const statusStats = await Candidate.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const positionStats = await Candidate.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      total: totalCandidates,
      byStatus: statusStats,
      byPosition: positionStats
    });
  } catch (error) {
    console.error('Error fetching candidate stats:', error);
    res.status(500).json({ error: 'Failed to fetch candidate statistics' });
  }
});

module.exports = router;