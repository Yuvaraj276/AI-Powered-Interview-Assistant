const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');

// GET /api/interviews - Get all interviews with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      position,
      dateFrom,
      dateTo,
      sortBy = 'scheduledAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (position) {
      filter.position = position;
    }
    
    if (dateFrom || dateTo) {
      filter.scheduledAt = {};
      if (dateFrom) {
        filter.scheduledAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.scheduledAt.$lte = new Date(dateTo);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const interviews = await Interview.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('candidate', 'name email position');

    const total = await Interview.countDocuments(filter);

    res.json({
      interviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// GET /api/interviews/:id - Get interview by ID
router.get('/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate', 'name email position phone experience skills');
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
});

// POST /api/interviews - Create new interview
router.post('/', async (req, res) => {
  try {
    const interviewData = req.body;
    
    // Verify candidate exists
    const candidate = await Candidate.findById(interviewData.candidate);
    if (!candidate) {
      return res.status(400).json({ error: 'Candidate not found' });
    }
    
    const interview = new Interview(interviewData);
    await interview.save();
    
    // Add interview to candidate's interviews array
    candidate.interviews.push(interview._id);
    await candidate.save();
    
    const populatedInterview = await Interview.findById(interview._id)
      .populate('candidate', 'name email position');
    
    res.status(201).json(populatedInterview);
  } catch (error) {
    console.error('Error creating interview:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

// PUT /api/interviews/:id - Update interview
router.put('/:id', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('candidate', 'name email position');
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    res.json(interview);
  } catch (error) {
    console.error('Error updating interview:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update interview' });
  }
});

// DELETE /api/interviews/:id - Delete interview
router.delete('/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    // Remove interview from candidate's interviews array
    await Candidate.findByIdAndUpdate(
      interview.candidate,
      { $pull: { interviews: req.params.id } }
    );
    
    await Interview.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
});

// POST /api/interviews/:id/start - Start interview
router.post('/:id/start', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    if (interview.status !== 'scheduled') {
      return res.status(400).json({ error: 'Interview cannot be started' });
    }
    
    interview.status = 'in-progress';
    interview.startedAt = new Date();
    
    await interview.save();
    
    res.json(interview);
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// POST /api/interviews/:id/end - End interview
router.post('/:id/end', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    if (interview.status !== 'in-progress') {
      return res.status(400).json({ error: 'Interview is not in progress' });
    }
    
    interview.status = 'completed';
    interview.endedAt = new Date();
    
    await interview.save();
    
    // Update candidate status
    await Candidate.findByIdAndUpdate(
      interview.candidate,
      { status: 'interviewed' }
    );
    
    res.json(interview);
  } catch (error) {
    console.error('Error ending interview:', error);
    res.status(500).json({ error: 'Failed to end interview' });
  }
});

// PUT /api/interviews/:id/transcript - Update interview transcript
router.put('/:id/transcript', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { transcript },
      { new: true }
    );
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    res.json({ message: 'Transcript updated successfully' });
  } catch (error) {
    console.error('Error updating transcript:', error);
    res.status(500).json({ error: 'Failed to update transcript' });
  }
});

// POST /api/interviews/:id/questions - Add question to interview
router.post('/:id/questions', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    interview.questions.push(req.body);
    await interview.save();
    
    res.status(201).json(interview.questions[interview.questions.length - 1]);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// POST /api/interviews/:id/evaluations - Add evaluation to interview
router.post('/:id/evaluations', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    interview.evaluations.push(req.body);
    await interview.save();
    
    res.status(201).json(interview.evaluations[interview.evaluations.length - 1]);
  } catch (error) {
    console.error('Error adding evaluation:', error);
    res.status(500).json({ error: 'Failed to add evaluation' });
  }
});

module.exports = router;