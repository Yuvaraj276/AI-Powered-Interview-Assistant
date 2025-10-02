const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');

// GET /api/analytics/overview - Get overview analytics
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.scheduledAt = {};
      if (startDate) dateFilter.scheduledAt.$gte = new Date(startDate);
      if (endDate) dateFilter.scheduledAt.$lte = new Date(endDate);
    }

    // Total interviews
    const totalInterviews = await Interview.countDocuments(dateFilter);
    
    // Active interviews
    const activeInterviews = await Interview.countDocuments({
      ...dateFilter,
      status: 'in-progress'
    });
    
    // Total candidates
    const totalCandidates = await Candidate.countDocuments();
    
    // Average score
    const avgScoreResult = await Interview.aggregate([
      { $match: { ...dateFilter, overallScore: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$overallScore' } } }
    ]);
    const avgScore = avgScoreResult[0]?.avgScore || 0;

    res.json({
      totalInterviews,
      activeInterviews,
      totalCandidates,
      avgScore: Math.round(avgScore * 10) / 10
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({ error: 'Failed to fetch overview analytics' });
  }
});

// GET /api/analytics/trends - Get interview trends
router.get('/trends', async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let groupBy, dateFormat;
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$scheduledAt' } };
        break;
      case '3months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$scheduledAt' } };
        break;
      case '6months':
      default:
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: '%Y-%m', date: '$scheduledAt' } };
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: '%Y-%m', date: '$scheduledAt' } };
        break;
    }

    const trends = await Interview.aggregate([
      {
        $match: {
          scheduledAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// GET /api/analytics/scores - Get score distribution
router.get('/scores', async (req, res) => {
  try {
    const scoreDistribution = await Interview.aggregate([
      {
        $match: { overallScore: { $exists: true } }
      },
      {
        $bucket: {
          groupBy: '$overallScore',
          boundaries: [0, 2, 4, 6, 8, 10],
          default: 'other',
          output: {
            count: { $sum: 1 },
            avgScore: { $avg: '$overallScore' }
          }
        }
      }
    ]);

    res.json(scoreDistribution);
  } catch (error) {
    console.error('Error fetching score distribution:', error);
    res.status(500).json({ error: 'Failed to fetch score distribution' });
  }
});

// GET /api/analytics/positions - Get position statistics
router.get('/positions', async (req, res) => {
  try {
    const positionStats = await Interview.aggregate([
      {
        $group: {
          _id: '$position',
          totalInterviews: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalInterviews: -1 } }
    ]);

    res.json(positionStats);
  } catch (error) {
    console.error('Error fetching position stats:', error);
    res.status(500).json({ error: 'Failed to fetch position statistics' });
  }
});

// GET /api/analytics/performance - Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    // Completion rate
    const totalScheduled = await Interview.countDocuments({ status: { $ne: 'cancelled' } });
    const totalCompleted = await Interview.countDocuments({ status: 'completed' });
    const completionRate = totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0;

    // Average duration
    const avgDurationResult = await Interview.aggregate([
      { $match: { startedAt: { $exists: true }, endedAt: { $exists: true } } },
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$endedAt', '$startedAt'] },
              1000 * 60 // Convert to minutes
            ]
          }
        }
      },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);
    const avgDuration = avgDurationResult[0]?.avgDuration || 0;

    // No-show rate
    const totalNoShows = await Interview.countDocuments({ status: 'no-show' });
    const noShowRate = totalScheduled > 0 ? (totalNoShows / totalScheduled) * 100 : 0;

    res.json({
      completionRate: Math.round(completionRate * 10) / 10,
      avgDuration: Math.round(avgDuration),
      noShowRate: Math.round(noShowRate * 10) / 10
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// GET /api/analytics/questions - Get question performance
router.get('/questions', async (req, res) => {
  try {
    const questionStats = await Interview.aggregate([
      { $unwind: '$questions' },
      {
        $group: {
          _id: '$questions.question',
          timesAsked: { $sum: 1 },
          avgScore: { $avg: '$overallScore' }, // This is simplified - in real app you'd track per-question scores
          type: { $first: '$questions.type' },
          difficulty: { $first: '$questions.difficulty' }
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 }
    ]);

    res.json(questionStats);
  } catch (error) {
    console.error('Error fetching question stats:', error);
    res.status(500).json({ error: 'Failed to fetch question statistics' });
  }
});

// GET /api/analytics/recent-activity - Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentInterviews = await Interview.find()
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .populate('candidate', 'name position')
      .select('candidate status scheduledAt updatedAt overallScore');

    const recentCandidates = await Candidate.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('name position createdAt status');

    // Combine and sort by timestamp
    const activities = [
      ...recentInterviews.map(interview => ({
        type: 'interview',
        action: `Interview ${interview.status}`,
        candidate: interview.candidate?.name,
        position: interview.candidate?.position,
        timestamp: interview.updatedAt,
        score: interview.overallScore
      })),
      ...recentCandidates.map(candidate => ({
        type: 'candidate',
        action: 'New candidate added',
        candidate: candidate.name,
        position: candidate.position,
        timestamp: candidate.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

module.exports = router;