require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { closeDb, getDb } = require('../services/db.js');
const {
  getEmbedding,
  componentCatalogEmbeddingText,
  historicalEventEmbeddingText,
  industryReportEmbeddingText,
  newsArticleEmbeddingText,
} = require('../services/embeddings.js');
const historicalEvents = require('../data/historical_events.json');
const industryReports = require('../data/industry_reports.json');
const newsArticles = require('../data/news_articles.json');
const componentsCatalog = require('../data/components_catalog.json');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getEmbeddingWithRetry(text, label, maxAttempts = 4) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await getEmbedding(text);
    } catch (error) {
      const retryable = error.status === 429 || error.status >= 500 || error.message === 'fetch failed';
      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * 2 ** (attempt - 1);
      console.warn(`Embedding ${label} failed with ${error.status || error.message}. Retrying in ${delay}ms (${attempt}/${maxAttempts}).`);
      await sleep(delay);
    }
  }

  throw new Error(`Failed to generate embedding for ${label}.`);
}

async function withHistoricalEmbedding(event, seededAt) {
  const embedding = await getEmbeddingWithRetry(
    historicalEventEmbeddingText(event),
    event.event_id
  );
  return { ...event, embedding, created_at: seededAt };
}

async function withIndustryReportEmbedding(report, seededAt) {
  const embedding = await getEmbeddingWithRetry(
    industryReportEmbeddingText(report),
    report.report_id
  );
  return { ...report, embedding, created_at: seededAt };
}

async function withNewsArticleEmbedding(article, seededAt) {
  const embedding = await getEmbeddingWithRetry(
    newsArticleEmbeddingText(article),
    article.article_id
  );
  return { ...article, embedding, created_at: seededAt };
}

async function withComponentCatalogEmbedding(component, seededAt) {
  const embedding = await getEmbeddingWithRetry(
    componentCatalogEmbeddingText(component),
    component.component
  );
  return { ...component, embedding, created_at: seededAt };
}

async function mapSequential(items, mapper) {
  const results = [];

  for (const item of items) {
    results.push(await mapper(item));
  }

  return results;
}

async function seed() {
  const db = await getDb();

  if (!db) {
    throw new Error('MONGODB_URI is required to seed Atlas.');
  }

  const seededAt = new Date();

  const historicalEventsWithEmbeddings = await mapSequential(
    historicalEvents,
    (event) => withHistoricalEmbedding(event, seededAt)
  );
  const industryReportsWithEmbeddings = await mapSequential(
    industryReports,
    (report) => withIndustryReportEmbedding(report, seededAt)
  );
  const newsArticlesWithEmbeddings = await mapSequential(
    newsArticles,
    (article) => withNewsArticleEmbedding(article, seededAt)
  );
  const componentsCatalogWithEmbeddings = await mapSequential(
    componentsCatalog,
    (component) => withComponentCatalogEmbedding(component, seededAt)
  );

  await db.collection('historical_events').deleteMany({});
  await db.collection('industry_reports').deleteMany({});
  await db.collection('news_articles').deleteMany({});
  await db.collection('components_catalog').deleteMany({});

  await db.collection('historical_events').insertMany(historicalEventsWithEmbeddings);
  await db.collection('industry_reports').insertMany(industryReportsWithEmbeddings);
  await db.collection('news_articles').insertMany(newsArticlesWithEmbeddings);
  await db.collection('components_catalog').insertMany(componentsCatalogWithEmbeddings);

  await db.collection('analyses').createIndex({ evaluated_at: -1 });
  await db.collection('historical_events').createIndex({ event_id: 1 }, { unique: true });
  await db.collection('historical_events').createIndex({ category: 1 });
  await db.collection('industry_reports').createIndex({ report_id: 1 }, { unique: true });
  await db.collection('industry_reports').createIndex({ title: 1 });
  await db.collection('industry_reports').createIndex({ category: 1 });
  await db.collection('news_articles').createIndex({ article_id: 1 }, { unique: true });
  await db.collection('news_articles').createIndex({ published_at: -1 });
  await db.collection('news_articles').createIndex({ category: 1 });
  await db.collection('components_catalog').createIndex({ component: 1 }, { unique: true });
  await db.collection('components_catalog').createIndex({ category: 1 });
  await db.collection('components_catalog').createIndex({ risk_score: 1 });

  console.log(`Seeded ${historicalEvents.length} historical events.`);
  console.log(`Seeded ${industryReports.length} industry reports.`);
  console.log(`Seeded ${newsArticles.length} news articles.`);
  console.log(`Seeded ${componentsCatalog.length} catalog components.`);
  console.log(`Embedding dimensions: ${historicalEventsWithEmbeddings[0].embedding.length}`);
  console.log('Create Atlas Vector Search indexes on embedding with cosine similarity: historical_events_vector, industry_reports_index, news_articles_vector, and components_catalog_vector.');
  console.log('Database ready: chippulse');
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
