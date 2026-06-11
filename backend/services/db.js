const { MongoClient } = require('mongodb');
const { getEmbedding } = require('./embeddings.js');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'chippulse';

let client;
let db;

async function getDb() {
  if (!uri) {
    return null;
  }

  if (db) {
    return db;
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

async function saveAnalysis(analysis) {
  const database = await getDb();
  if (!database) {
    return null;
  }

  const document = {
    ...analysis,
    created_at: new Date(),
  };

  const result = await database.collection('analyses').insertOne(document);
  return { ...document, _id: result.insertedId };
}

async function getRecentAnalyses(limit = 10) {
  const database = await getDb();
  if (!database) {
    return [];
  }

  return database
    .collection('analyses')
    .find(
      {},
      {
        projection: {
          _id: 0,
          component: 1,
          demand_score: 1,
          alternatives: 1,
          trend: 1,
          confidence: 1,
          summary: 1,
          drivers: 1,
          recommendations: 1,
          risk_band: 1,
          score_breakdown: 1,
          supply_availability: 1,
          market_signals: 1,
          historical_matches: 1,
          retrieval_metadata: 1,
          vector_search_used: 1,
          historical_events_retrieved: 1,
          industry_reports_retrieved: 1,
          news_articles_retrieved: 1,
          components_catalog_vector_search_used: 1,
          retrieval_mode: 1,
          agent_version: 1,
          citations: 1,
          agent_activity: 1,
          evaluated_at: 1,
        },
      }
    )
    .sort({ evaluated_at: -1, created_at: -1 })
    .limit(limit)
    .toArray();
}

function buildComponentContextQuery(component) {
  const componentText = component.toLowerCase();
  const categories = [];

  if (componentText.includes('hbm') || componentText.includes('memory') || componentText.includes('ddr')) {
    categories.push('memory');
  }

  if (componentText.includes('nvidia') || componentText.includes('amd') || componentText.includes('gpu') || componentText.includes('blackwell') || componentText.includes('gaudi')) {
    categories.push('gpu');
  }

  if (componentText.includes('cowos') || componentText.includes('packaging')) {
    categories.push('packaging');
  }

  if (componentText.includes('substrate') || componentText.includes('abf')) {
    categories.push('substrate');
  }

  if (componentText.includes('automotive') || componentText.includes('mcu')) {
    categories.push('automotive');
  }

  if (componentText.includes('foundry') || componentText.includes('tsmc') || componentText.includes('node')) {
    categories.push('foundry');
  }

  return categories.length > 0 ? { category: { $in: categories } } : {};
}

async function getHistoricalEventsForComponent(component, limit = 5) {
  const database = await getDb();
  if (!database) {
    return [];
  }

  const query = buildComponentContextQuery(component);
  const events = await database
    .collection('historical_events')
    .find(query, { projection: { _id: 0, created_at: 0 } })
    .sort({ year: -1, created_at: -1 })
    .limit(limit)
    .toArray();

  if (events.length > 0 || Object.keys(query).length === 0) {
    return events;
  }

  return database
    .collection('historical_events')
    .find({}, { projection: { _id: 0, created_at: 0 } })
    .sort({ year: -1, created_at: -1 })
    .limit(limit)
    .toArray();
}

async function searchHistoricalEvents(queryEmbedding, limit = 3) {
  const database = await getDb();
  if (!database) {
    return [];
  }

  return database
    .collection('historical_events')
    .aggregate([
      {
        $vectorSearch: {
          index: 'historical_events_vector',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: Math.max(20, limit * 5),
          limit,
        },
      },
      {
        $project: {
          _id: 0,
          embedding: 0,
          created_at: 0,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])
    .toArray();
}

async function getVectorHistoricalEvents(component, customSignal = '', limit = 3) {
  const queryEmbedding = await getEmbedding(`${component} ${customSignal}`.trim());
  return searchHistoricalEvents(queryEmbedding, limit);
}

async function getIndustryReports(limit = 3) {
  const database = await getDb();
  if (!database) {
    return [];
  }

  return database
    .collection('industry_reports')
    .find({}, { projection: { _id: 0, created_at: 0 } })
    .sort({ created_at: -1, title: 1 })
    .limit(limit)
    .toArray();
}

// Retrieve industry reports relevant to the component using the same
// category matching used for historical events. Falls back to recent
// reports when no category matches so the agent always has citations.
async function getRelevantIndustryReports(component, limit = 3) {
  const database = await getDb();
  if (!database) {
    return [];
  }

  const query = buildComponentContextQuery(component);
  const reports = await database
    .collection('industry_reports')
    .find(query, { projection: { _id: 0, created_at: 0 } })
    .sort({ created_at: -1, title: 1 })
    .limit(limit)
    .toArray();

  if (reports.length > 0 || Object.keys(query).length === 0) {
    return reports;
  }

  return database
    .collection('industry_reports')
    .find({}, { projection: { _id: 0, created_at: 0 } })
    .sort({ created_at: -1, title: 1 })
    .limit(limit)
    .toArray();
}

async function getRecentNewsArticles(limit = 4) {
  const database = await getDb();
  if (!database) {
    return [];
  }

  return database
    .collection('news_articles')
    .find({}, { projection: { _id: 0, embedding: 0, created_at: 0 } })
    .sort({ published_at: -1, created_at: -1 })
    .limit(limit)
    .toArray();
}

async function searchIndustryReports(queryEmbedding, limit = 3) {
  const database = await getDb();
  if (!database) {
    return [];
  }

  return database
    .collection('industry_reports')
    .aggregate([
      {
        $vectorSearch: {
          index: 'industry_reports_vector',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: Math.max(20, limit * 5),
          limit,
        },
      },
      {
        $project: {
          _id: 0,
          embedding: 0,
          created_at: 0,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])
    .toArray();
}

async function getVectorIndustryReports(component, customSignal = '', limit = 3) {
  const queryEmbedding = await getEmbedding(`${component} ${customSignal}`.trim());
  return searchIndustryReports(queryEmbedding, limit);
}

function mapEventsToHistoricalMatches(events, component) {
  return events.map((event, index) => ({
    title: event.title,
    year: event.year,
    score: typeof event.score === 'number' ? event.score : undefined,
    similarity: typeof event.score === 'number'
      ? Math.round(event.score * 100)
      : Math.max(68, 91 - index * 7),
    impact: event.impact || 'Moderate',
    description: event.summary || `Historical market event relevant to ${component}.`,
  }));
}

async function getHistoricalMatches(component, limit = 3) {
  const events = await getHistoricalEventsForComponent(component, limit);
  return mapEventsToHistoricalMatches(events, component);
}

async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  closeDb,
  getDb,
  getHistoricalEventsForComponent,
  getHistoricalMatches,
  getIndustryReports,
  getRelevantIndustryReports,
  getRecentNewsArticles,
  getRecentAnalyses,
  getVectorHistoricalEvents,
  getVectorIndustryReports,
  mapEventsToHistoricalMatches,
  saveAnalysis,
  searchHistoricalEvents,
  searchIndustryReports,
};
