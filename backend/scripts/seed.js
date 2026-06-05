require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { closeDb, getDb } = require('../services/db.js');
const historicalEvents = require('../data/historical_events.json');
const industryReports = require('../data/industry_reports.json');

async function seed() {
  const db = await getDb();

  if (!db) {
    throw new Error('MONGODB_URI is required to seed Atlas.');
  }

  const seededAt = new Date();

  await db.collection('historical_events').deleteMany({});
  await db.collection('industry_reports').deleteMany({});

  await db.collection('historical_events').insertMany(
    historicalEvents.map((event) => ({ ...event, created_at: seededAt }))
  );
  await db.collection('industry_reports').insertMany(
    industryReports.map((report) => ({ ...report, created_at: seededAt }))
  );

  await db.collection('analyses').createIndex({ evaluated_at: -1 });
  await db.collection('historical_events').createIndex({ event_id: 1 }, { unique: true });
  await db.collection('historical_events').createIndex({ category: 1 });
  await db.collection('industry_reports').createIndex({ report_id: 1 }, { unique: true });
  await db.collection('industry_reports').createIndex({ title: 1 });
  await db.collection('industry_reports').createIndex({ category: 1 });

  console.log(`Seeded ${historicalEvents.length} historical events.`);
  console.log(`Seeded ${industryReports.length} industry reports.`);
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
