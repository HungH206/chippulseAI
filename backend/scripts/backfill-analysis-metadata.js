require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { closeDb, getDb } = require('../services/db.js');

async function backfill() {
  const db = await getDb();

  if (!db) {
    throw new Error('MONGODB_URI is required to backfill analyses.');
  }

  const analyses = db.collection('analyses');
  const cursor = analyses.find({
    $or: [
      { vector_search_used: { $exists: false } },
      { historical_events_retrieved: { $exists: false } },
      { industry_reports_retrieved: { $exists: false } },
      { news_articles_retrieved: { $exists: false } },
      { retrieval_mode: { $exists: false } },
      { agent_version: { $exists: false } },
    ],
  });

  let updated = 0;

  for await (const doc of cursor) {
    const metadata = doc.retrieval_metadata || {};
    await analyses.updateOne(
      { _id: doc._id },
      {
        $set: {
          vector_search_used: Boolean(metadata.vector_search_used),
          historical_events_retrieved: metadata.historical_events_retrieved || 0,
          industry_reports_retrieved: metadata.industry_reports_retrieved || 0,
          news_articles_retrieved: metadata.news_articles_retrieved || 0,
          retrieval_mode: metadata.retrieval_mode || 'legacy',
          agent_version: doc.agent_version || process.env.CHIPPULSE_AGENT_VERSION || 'v1.2',
        },
      }
    );
    updated += 1;
  }

  console.log(`Backfilled ${updated} analyses.`);
}

backfill()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
