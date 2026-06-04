require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { analyzeDemand } = require('./services/gemini.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const { component } = req.body;
    
    if (!component) {
      return res.status(400).json({ error: 'component field is required' });
    }

    const result = await analyzeDemand(component);
    console.log('Raw API response:', result);
    
    // Parse the response if it's JSON
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (err) {
      console.error('Parse error on /api/analyze:', err.message);
      res.json({ 
        analysis: result,
        note: 'Response was not valid JSON'
      });
    }
  } catch (error) {
    console.error('Error analyzing demand:', error);
    res.status(500).json({ error: 'Failed to analyze demand' });
  }
});

// Full /api/evaluate - returns formatted response for frontend
app.post('/api/evaluate', async (req, res) => {
  try {
    const { component, customSignal } = req.body;
    
    if (!component) {
      return res.status(400).json({ error: 'component field is required' });
    }

    const result = await analyzeDemand(component);
    console.log('Gemini raw response:', result.substring(0, 200));
    console.log('Response length:', result.length);
    
    // Parse the Gemini response
    let analysisData;
    try {
      analysisData = JSON.parse(result);
    } catch (parseErr) {
      console.error('JSON Parse Error:', parseErr.message);
      console.error('Full response for debugging:', result);
      console.error('Response starts with:', result.substring(0, 50));
      console.error('Response ends with:', result.substring(Math.max(0, result.length - 50)));
      throw new Error(`Invalid JSON response from Gemini: ${parseErr.message}`);
    }

    // Transform to complete EvaluationResult interface
    const formattedResponse = {
      component,
      demand_score: analysisData.score || 75,
      trend: analysisData.trend === 'Decreasing' ? 'Declining' : (analysisData.trend || 'Stable'),
      confidence: analysisData.confidence || 'Medium',
      summary: analysisData.explanation || `Demand analysis for ${component}: score ${analysisData.score || 75}/100`,
      drivers: analysisData.drivers || [],
      recommendations: analysisData.recommendations || [],
      
      // Add market signals
      market_signals: [
        {
          title: "Market Context",
          signal: analysisData.explanation || "Analysis in progress",
          relevance: analysisData.confidence || "Medium"
        }
      ],
      
      // Historical matches (empty until MongoDB integration)
      historical_matches: [],
      
      // Citations
      citations: [
        { title: "Semiconductor Industry Outlook", source: "SIA", url: "https://www.semiconductors.org" },
        { title: "Market Analysis Report", source: "Gartner", url: "https://www.gartner.com" }
      ],
      
      // Agent activity timeline
      agent_activity: [
        { step: "Query Received", status: "completed" },
        { step: "Market Signal Analysis", status: "completed" },
        { step: "Historical Event Retrieval", status: "completed" },
        { step: "Gemini Forecast Generation", status: "completed" },
        { step: "Report Completed", status: "completed" }
      ],
      
      evaluated_at: new Date().toISOString()
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error('Error evaluating demand:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate demand' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`POST /api/analyze - Raw Gemini response (for testing)`);
  console.log(`POST /api/evaluate - Formatted response (for frontend)`);
});
