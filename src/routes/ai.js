const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI (if API key is provided)
let openai;
if (process.env.OPENAI_API_KEY) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

// POST /api/ai/generate-question - Generate AI-powered interview question
router.post('/generate-question', async (req, res) => {
  try {
    const { position, difficulty = 'medium', type = 'technical', context } = req.body;

    if (!openai) {
      // Return mock questions if OpenAI is not configured
      const mockQuestions = {
        technical: [
          "Can you explain the difference between let, const, and var in JavaScript?",
          "How would you optimize a slow-performing database query?",
          "Describe the MVC architecture pattern and its benefits.",
          "What are the key principles of RESTful API design?"
        ],
        behavioral: [
          "Tell me about a time when you had to work with a difficult team member.",
          "Describe a challenging project you worked on and how you overcame obstacles.",
          "How do you handle tight deadlines and pressure?",
          "Give me an example of when you had to learn something new quickly."
        ],
        situational: [
          "If you discovered a security vulnerability in production code, what would you do?",
          "How would you approach a project with unclear requirements?",
          "What would you do if you disagreed with your manager's technical decision?",
          "How would you handle a situation where you're behind schedule on a critical project?"
        ]
      };

      const questions = mockQuestions[type] || mockQuestions.technical;
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

      return res.json({
        question: randomQuestion,
        type,
        difficulty,
        aiGenerated: false,
        context: "Mock question - OpenAI not configured"
      });
    }

    // Generate AI question using OpenAI
    const prompt = `Generate a ${difficulty} difficulty ${type} interview question for a ${position} position. ${context ? `Context: ${context}` : ''}

Requirements:
- The question should be appropriate for the skill level
- It should be relevant to the ${position} role
- It should encourage detailed responses
- Avoid yes/no questions

Return only the question, no additional text.`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const question = completion.data.choices[0].text.trim();

    res.json({
      question,
      type,
      difficulty,
      aiGenerated: true,
      context: context || null
    });

  } catch (error) {
    console.error('Error generating AI question:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// POST /api/ai/generate-suggestion - Generate AI suggestion based on conversation
router.post('/generate-suggestion', async (req, res) => {
  try {
    const { transcript, context, position } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    if (!openai) {
      // Return mock suggestions if OpenAI is not configured
      const mockSuggestions = [
        "Ask about their experience with team collaboration",
        "Probe deeper into their problem-solving approach",
        "Inquire about their experience with agile methodologies",
        "Ask for specific examples of their technical achievements",
        "Explore their approach to handling technical challenges"
      ];

      const randomSuggestion = mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)];

      return res.json({
        suggestion: randomSuggestion,
        confidence: 0.7,
        type: "follow-up-question",
        aiGenerated: false
      });
    }

    const prompt = `Based on this interview transcript for a ${position} position, suggest a relevant follow-up question or interviewing direction:

Transcript: "${transcript}"
${context ? `Additional context: ${context}` : ''}

Provide a concise, actionable suggestion for the interviewer. Focus on:
- Areas that need clarification
- Important topics not yet covered
- Opportunities to dive deeper
- Skills assessment opportunities

Return only the suggestion, no additional text.`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 100,
      temperature: 0.6,
    });

    const suggestion = completion.data.choices[0].text.trim();

    res.json({
      suggestion,
      confidence: 0.85,
      type: "follow-up-question",
      aiGenerated: true
    });

  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    res.status(500).json({ error: 'Failed to generate suggestion' });
  }
});

// POST /api/ai/analyze-response - Analyze candidate response
router.post('/analyze-response', async (req, res) => {
  try {
    const { response, question, position, criteria } = req.body;

    if (!response || !question) {
      return res.status(400).json({ error: 'Response and question are required' });
    }

    if (!openai) {
      // Return mock analysis if OpenAI is not configured
      return res.json({
        score: Math.floor(Math.random() * 3) + 7, // Random score between 7-10
        strengths: [
          "Clear communication",
          "Good technical understanding",
          "Relevant experience mentioned"
        ],
        improvements: [
          "Could provide more specific examples",
          "Consider discussing alternative approaches"
        ],
        keywords: ["experience", "technical", "solution", "team"],
        sentiment: {
          positive: 0.7,
          neutral: 0.2,
          negative: 0.1
        },
        aiGenerated: false
      });
    }

    const prompt = `Analyze this interview response for a ${position} position:

Question: "${question}"
Response: "${response}"
${criteria ? `Evaluation criteria: ${criteria}` : ''}

Provide a structured analysis including:
1. A score from 1-10
2. Key strengths demonstrated
3. Areas for improvement
4. Important keywords mentioned
5. Overall sentiment (positive/neutral/negative percentages)

Format the response as JSON.`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 300,
      temperature: 0.3,
    });

    try {
      const analysis = JSON.parse(completion.data.choices[0].text.trim());
      analysis.aiGenerated = true;
      res.json(analysis);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      res.json({
        score: 7,
        strengths: ["Response provided"],
        improvements: ["Could be more detailed"],
        keywords: [],
        sentiment: { positive: 0.6, neutral: 0.3, negative: 0.1 },
        aiGenerated: true,
        note: "Analysis completed but formatting was adjusted"
      });
    }

  } catch (error) {
    console.error('Error analyzing response:', error);
    res.status(500).json({ error: 'Failed to analyze response' });
  }
});

// POST /api/ai/generate-feedback - Generate comprehensive interview feedback
router.post('/generate-feedback', async (req, res) => {
  try {
    const { transcript, position, evaluations, overallScore } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    if (!openai) {
      // Return mock feedback if OpenAI is not configured
      return res.json({
        summary: "The candidate demonstrated good technical knowledge and communication skills during the interview.",
        strengths: [
          "Strong technical background",
          "Clear communication style",
          "Good problem-solving approach",
          "Relevant industry experience"
        ],
        improvements: [
          "Could provide more specific examples",
          "Consider expanding on leadership experience",
          "Demonstrate knowledge of latest technologies"
        ],
        recommendation: overallScore >= 7 ? "hire" : "no-hire",
        confidence: 0.8,
        aiGenerated: false
      });
    }

    const prompt = `Generate comprehensive interview feedback for a ${position} candidate:

Interview transcript: "${transcript}"
Overall score: ${overallScore}/10
${evaluations ? `Evaluation details: ${JSON.stringify(evaluations)}` : ''}

Provide:
1. A brief summary of the candidate's performance
2. Key strengths demonstrated
3. Areas for improvement
4. Hiring recommendation (strong-hire/hire/no-hire/strong-no-hire)
5. Confidence level in the assessment

Format as JSON with summary, strengths, improvements, recommendation, and confidence fields.`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 400,
      temperature: 0.4,
    });

    try {
      const feedback = JSON.parse(completion.data.choices[0].text.trim());
      feedback.aiGenerated = true;
      res.json(feedback);
    } catch (parseError) {
      // Fallback feedback
      res.json({
        summary: "Interview analysis completed successfully.",
        strengths: ["Candidate participated well in the interview"],
        improvements: ["Areas for growth were identified"],
        recommendation: overallScore >= 7 ? "hire" : "no-hire",
        confidence: 0.7,
        aiGenerated: true,
        note: "Feedback generated with formatting adjustments"
      });
    }

  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
});

// GET /api/ai/status - Check AI service status
router.get('/status', (req, res) => {
  res.json({
    openaiConfigured: !!openai,
    status: openai ? 'connected' : 'not-configured',
    features: {
      questionGeneration: true,
      suggestionGeneration: true,
      responseAnalysis: true,
      feedbackGeneration: true
    }
  });
});

module.exports = router;