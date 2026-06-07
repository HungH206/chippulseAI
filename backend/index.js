require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getEmbedding } = require('./services/embeddings.js');
const { analyzeDemand } = require('./services/gemini.js');
const {
  getHistoricalEventsForComponent,
  getRelevantIndustryReports,
  getRecentAnalyses,
  mapEventsToHistoricalMatches,
  saveAnalysis,
} = require('./services/db.js');
const { calculateDemandScore } = require('./services/scoring.js');
const {
  searchHistoricalEvents,
  searchIndustryReports,
} = require('./services/vectorSearch.js');

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

    let retrievalMode = 'Atlas Vector Search';
    let vectorSearchUsed = true;
    let historicalEvents;
    let industryReports;

    try {
      const queryEmbedding = await getEmbedding(`${component} ${customSignal || ''}`.trim());
      [historicalEvents, industryReports] = await Promise.all([
        searchHistoricalEvents(queryEmbedding, 3),
        searchIndustryReports(queryEmbedding, 3),
      ]);
    } catch (retrievalError) {
      retrievalMode = 'category fallback';
      vectorSearchUsed = false;
      console.warn('Vector retrieval unavailable, falling back to category matching:', retrievalError.message);
      [historicalEvents, industryReports] = await Promise.all([
        getHistoricalEventsForComponent(component),
        getRelevantIndustryReports(component),
      ]);
    }

    const historicalMatches = mapEventsToHistoricalMatches(historicalEvents.slice(0, 3), component);
    const retrievalMetadata = {
      historical_events_retrieved: historicalEvents.length,
      industry_reports_retrieved: industryReports.length,
      vector_search_used: vectorSearchUsed,
      retrieval_mode: retrievalMode,
      historical_events_index: vectorSearchUsed ? process.env.MONGODB_HISTORICAL_EVENTS_VECTOR_INDEX || 'historical_events_vector' : null,
      industry_reports_index: vectorSearchUsed ? process.env.MONGODB_INDUSTRY_REPORTS_VECTOR_INDEX || 'industry_reports_index' : null,
    };
    const scoreContext = calculateDemandScore({
      component,
      customSignal,
      historicalMatches,
      industryReports,
    });
    const result = await analyzeDemand(component, customSignal, {
      historicalEvents,
      industryReports,
      scoreContext,
    });
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

    const formattedResponse = {
      component,
      demand_score: scoreContext.score,
      risk_band: scoreContext.risk_band,
      score_breakdown: scoreContext.score_breakdown,
      trend: analysisData.trend === 'Decreasing' ? 'Declining' : (analysisData.trend || 'Stable'),
      confidence: analysisData.confidence || 'Medium',
      summary: analysisData.explanation || `Demand analysis for ${component}: score ${scoreContext.score}/100`,
      drivers: analysisData.drivers || [],
      recommendations: analysisData.recommendations || [],
      
      // Add market signals
      market_signals: [
        {
          title: "Market Context",
          signal: analysisData.explanation || "Analysis in progress",
          relevance: analysisData.confidence || "Medium"
        },
        ...industryReports.slice(0, 2).map((report) => ({
          title: report.title,
          signal: report.summary,
          relevance: "Medium"
        }))
      ],
      
      historical_matches: historicalMatches,
      retrieval_metadata: retrievalMetadata,

      // Citations sourced from MongoDB industry_reports
      citations: industryReports.map((report) => ({
        title: report.title,
        source: report.source,
      })),

      // Agent activity timeline reflecting the real retrieval pipeline
      agent_activity: [
        {
          step: `Retrieved ${historicalEvents.length} historical ${historicalEvents.length === 1 ? 'event' : 'events'} from MongoDB memory via ${retrievalMode}`,
          status: "completed",
        },
        {
          step: `Retrieved ${industryReports.length} industry ${industryReports.length === 1 ? 'report' : 'reports'} via ${retrievalMode}`,
          status: "completed",
        },
        { step: "Calculated deterministic demand score", status: "completed" },
        { step: "Generated Gemini demand explanation", status: "completed" },
        { step: "Stored analysis in MongoDB", status: "completed" },
      ],

      evaluated_at: new Date().toISOString()
    };

    await saveAnalysis(formattedResponse);

    res.json(formattedResponse);
  } catch (error) {
    console.error('Error evaluating demand:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate demand' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const history = await getRecentAnalyses(12);
    res.json(history);
  } catch (error) {
    console.error('Error loading history:', error);
    res.status(500).json({ error: error.message || 'Failed to load history' });
  }
});

app.post('/api/retrieve-events', async (req, res) => {
  try {
    const { component, customSignal } = req.body;

    if (!component) {
      return res.status(400).json({ error: 'component field is required' });
    }

    const embedding = await getEmbedding(`${component} ${customSignal || ''}`.trim());
    const historical_events = await searchHistoricalEvents(embedding, 3);

    res.json({
      component,
      retrieval_metadata: {
        historical_events_retrieved: historical_events.length,
        vector_search_used: true,
        retrieval_mode: 'Atlas Vector Search',
        historical_events_index: process.env.MONGODB_HISTORICAL_EVENTS_VECTOR_INDEX || 'historical_events_vector',
      },
      historical_events,
    });
  } catch (error) {
    console.error('Historical event retrieval failed:', error);
    res.status(500).json({
      error: error.message || 'Historical event retrieval failed',
      hint: 'Confirm the historical_events_vector Atlas Vector Search index exists and is READY.',
    });
  }
});

app.post('/api/retrieve-reports', async (req, res) => {
  try {
    const { component, customSignal } = req.body;

    if (!component) {
      return res.status(400).json({ error: 'component field is required' });
    }

    const embedding = await getEmbedding(`${component} ${customSignal || ''}`.trim());
    const industry_reports = await searchIndustryReports(embedding, 3);

    res.json({
      component,
      retrieval_metadata: {
        industry_reports_retrieved: industry_reports.length,
        vector_search_used: true,
        retrieval_mode: 'Atlas Vector Search',
        industry_reports_index: process.env.MONGODB_INDUSTRY_REPORTS_VECTOR_INDEX || 'industry_reports_index',
      },
      industry_reports,
    });
  } catch (error) {
    console.error('Industry report retrieval failed:', error);
    res.status(500).json({
      error: error.message || 'Industry report retrieval failed',
      hint: 'Confirm the industry reports Atlas Vector Search index exists and is READY.',
    });
  }
});

app.get('/api/test-vector', async (req, res) => {
  try {
    const query = req.query.q || 'Apple M4 Mac Mini demand';
    const embedding = await getEmbedding(query);
    const [historical_events, industry_reports] = await Promise.all([
      searchHistoricalEvents(embedding, 3),
      searchIndustryReports(embedding, 3),
    ]);

    res.json({
      query,
      embedding_dimensions: embedding.length,
      historical_events,
      industry_reports,
    });
  } catch (error) {
    console.error('Vector search test failed:', error);
    res.status(500).json({
      error: error.message || 'Vector search test failed',
      hint: 'Confirm both Atlas Vector Search indexes exist and are READY: historical_events_vector and industry_reports_vector.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`POST /api/analyze - Raw Gemini response (for testing)`);
  console.log(`POST /api/evaluate - Formatted response (for frontend)`);
  console.log(`GET /api/history - Recent persisted analyses`);
  console.log(`POST /api/retrieve-events - Retrieve vector historical events`);
  console.log(`POST /api/retrieve-reports - Retrieve vector industry reports`);
  console.log(`GET /api/test-vector - Test MongoDB Atlas Vector Search`);
});
