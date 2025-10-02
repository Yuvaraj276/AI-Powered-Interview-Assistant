const express = require('express');
const router = express.Router();

// GET /api/settings - Get user settings
router.get('/', async (req, res) => {
  try {
    // Mock settings for now - in a real app, this would come from user database
    const defaultSettings = {
      user: {
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'interviewer',
        timezone: 'America/New_York'
      },
      interview: {
        defaultDuration: 60, // minutes
        recordingEnabled: true,
        autoTranscription: true,
        aiSuggestionsEnabled: true,
        reminderNotifications: true,
        bufferTime: 5 // minutes between interviews
      },
      ai: {
        openaiApiKey: process.env.OPENAI_API_KEY ? '***configured***' : null,
        questionDifficulty: 'medium',
        suggestionFrequency: 'moderate', // low, moderate, high
        autoScoring: true,
        confidenceThreshold: 0.7
      },
      notifications: {
        email: {
          interviewReminders: true,
          candidateUpdates: true,
          systemAlerts: true
        },
        inApp: {
          realTimeUpdates: true,
          aiSuggestions: true,
          systemNotifications: true
        }
      },
      analytics: {
        dataRetention: 365, // days
        shareWithTeam: true,
        exportEnabled: true,
        reportFrequency: 'weekly'
      },
      security: {
        sessionTimeout: 480, // minutes
        requireMFA: false,
        passwordExpiry: 90, // days
        auditLogging: true
      }
    };

    res.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Update user settings
router.put('/', async (req, res) => {
  try {
    const updatedSettings = req.body;

    // Validate required fields
    if (!updatedSettings.user || !updatedSettings.user.email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Validate interview settings
    if (updatedSettings.interview) {
      const { defaultDuration, bufferTime } = updatedSettings.interview;
      if (defaultDuration && (defaultDuration < 15 || defaultDuration > 180)) {
        return res.status(400).json({ error: 'Interview duration must be between 15 and 180 minutes' });
      }
      if (bufferTime && (bufferTime < 0 || bufferTime > 30)) {
        return res.status(400).json({ error: 'Buffer time must be between 0 and 30 minutes' });
      }
    }

    // Validate AI settings
    if (updatedSettings.ai) {
      const { questionDifficulty, suggestionFrequency, confidenceThreshold } = updatedSettings.ai;
      if (questionDifficulty && !['easy', 'medium', 'hard'].includes(questionDifficulty)) {
        return res.status(400).json({ error: 'Invalid question difficulty level' });
      }
      if (suggestionFrequency && !['low', 'moderate', 'high'].includes(suggestionFrequency)) {
        return res.status(400).json({ error: 'Invalid suggestion frequency' });
      }
      if (confidenceThreshold && (confidenceThreshold < 0 || confidenceThreshold > 1)) {
        return res.status(400).json({ error: 'Confidence threshold must be between 0 and 1' });
      }
    }

    // In a real application, you would save to database here
    // For now, we'll just return the updated settings
    const response = {
      message: 'Settings updated successfully',
      settings: updatedSettings,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// PUT /api/settings/ai-api-key - Update OpenAI API key
router.put('/ai-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'Valid API key is required' });
    }

    // In a real application, you would securely store this in the database
    // For now, we'll just validate the format
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      return res.status(400).json({ error: 'Invalid OpenAI API key format' });
    }

    // Update environment variable (this won't persist in a real deployment)
    process.env.OPENAI_API_KEY = apiKey;

    res.json({
      message: 'OpenAI API key updated successfully',
      configured: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// POST /api/settings/test-ai - Test AI configuration
router.post('/test-ai', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        error: 'OpenAI API key not configured',
        configured: false 
      });
    }

    // Test the AI configuration by making a simple request
    try {
      const { Configuration, OpenAIApi } = require('openai');
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Test prompt for configuration validation",
        max_tokens: 10,
        temperature: 0.1,
      });

      res.json({
        status: 'success',
        message: 'AI configuration is working correctly',
        configured: true,
        model: 'text-davinci-003',
        timestamp: new Date().toISOString()
      });
    } catch (aiError) {
      res.status(400).json({
        status: 'error',
        message: 'AI configuration test failed',
        error: aiError.message,
        configured: false
      });
    }
  } catch (error) {
    console.error('Error testing AI configuration:', error);
    res.status(500).json({ error: 'Failed to test AI configuration' });
  }
});

// GET /api/settings/export - Export settings as JSON
router.get('/export', async (req, res) => {
  try {
    // Get current settings (in a real app, fetch from database)
    const settings = {
      user: {
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'interviewer',
        timezone: 'America/New_York'
      },
      interview: {
        defaultDuration: 60,
        recordingEnabled: true,
        autoTranscription: true,
        aiSuggestionsEnabled: true,
        reminderNotifications: true,
        bufferTime: 5
      },
      ai: {
        questionDifficulty: 'medium',
        suggestionFrequency: 'moderate',
        autoScoring: true,
        confidenceThreshold: 0.7
      },
      notifications: {
        email: {
          interviewReminders: true,
          candidateUpdates: true,
          systemAlerts: true
        },
        inApp: {
          realTimeUpdates: true,
          aiSuggestions: true,
          systemNotifications: true
        }
      },
      analytics: {
        dataRetention: 365,
        shareWithTeam: true,
        exportEnabled: true,
        reportFrequency: 'weekly'
      },
      security: {
        sessionTimeout: 480,
        requireMFA: false,
        passwordExpiry: 90,
        auditLogging: true
      }
    };

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=interview-settings.json');
    res.setHeader('Content-Type', 'application/json');
    
    res.json({
      exportDate: new Date().toISOString(),
      version: '1.0',
      settings
    });
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({ error: 'Failed to export settings' });
  }
});

// POST /api/settings/import - Import settings from JSON
router.post('/import', async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Valid settings object is required' });
    }

    // Validate imported settings structure
    const requiredSections = ['user', 'interview', 'ai', 'notifications', 'analytics', 'security'];
    const missingSections = requiredSections.filter(section => !settings[section]);
    
    if (missingSections.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid settings format',
        missingSections 
      });
    }

    // In a real application, you would validate and save to database here
    res.json({
      message: 'Settings imported successfully',
      importDate: new Date().toISOString(),
      sectionsImported: Object.keys(settings).length
    });
  } catch (error) {
    console.error('Error importing settings:', error);
    res.status(500).json({ error: 'Failed to import settings' });
  }
});

// DELETE /api/settings/reset - Reset settings to defaults
router.delete('/reset', async (req, res) => {
  try {
    const { section } = req.query;

    if (section && !['user', 'interview', 'ai', 'notifications', 'analytics', 'security'].includes(section)) {
      return res.status(400).json({ error: 'Invalid settings section' });
    }

    const resetMessage = section 
      ? `${section} settings reset to defaults`
      : 'All settings reset to defaults';

    res.json({
      message: resetMessage,
      section: section || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

module.exports = router;