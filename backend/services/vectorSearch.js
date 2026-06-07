const { getDb } = require('./db.js');

const HISTORICAL_EVENTS_VECTOR_INDEX =
  process.env.MONGODB_HISTORICAL_EVENTS_VECTOR_INDEX || 'historical_events_vector';
const INDUSTRY_REPORTS_VECTOR_INDEX =
  process.env.MONGODB_INDUSTRY_REPORTS_VECTOR_INDEX || 'industry_reports_index';
const NEWS_ARTICLES_VECTOR_INDEX =
  process.env.MONGODB_NEWS_ARTICLES_VECTOR_INDEX || 'news_articles_vector';

async function searchHistoricalEvents(queryEmbedding, limit = 3) {
  const db = await getDb();
  if (!db) {
    throw new Error('MONGODB_URI is required for Atlas Vector Search.');
  }

  return db
    .collection('historical_events')
    .aggregate([
      {
        $vectorSearch: {
          index: HISTORICAL_EVENTS_VECTOR_INDEX,
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: Math.max(20, limit * 5),
          limit,
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          summary: 1,
          impact: 1,
          year: 1,
          category: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])
    .toArray();
}

async function searchIndustryReports(queryEmbedding, limit = 3) {
  const db = await getDb();
  if (!db) {
    throw new Error('MONGODB_URI is required for Atlas Vector Search.');
  }

  return db
    .collection('industry_reports')
    .aggregate([
      {
        $vectorSearch: {
          index: INDUSTRY_REPORTS_VECTOR_INDEX,
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: Math.max(20, limit * 5),
          limit,
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          summary: 1,
          source: 1,
          category: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])
    .toArray();
}

async function searchNewsArticles(queryEmbedding, limit = 4) {
  const db = await getDb();
  if (!db) {
    throw new Error('MONGODB_URI is required for Atlas Vector Search.');
  }

  return db
    .collection('news_articles')
    .aggregate([
      {
        $vectorSearch: {
          index: NEWS_ARTICLES_VECTOR_INDEX,
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: Math.max(20, limit * 5),
          limit,
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          summary: 1,
          source: 1,
          url: 1,
          published_at: 1,
          category: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])
    .toArray();
}

module.exports = {
  searchHistoricalEvents,
  searchIndustryReports,
  searchNewsArticles,
};
