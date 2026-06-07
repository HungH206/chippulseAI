require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { MongoClient } = require('mongodb');

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing.');
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const dbName = process.env.MONGODB_DB || 'chippulse';
    await client.db(dbName).command({ ping: 1 });
    console.log(`OK MongoDB authentication and ping succeeded for database ${dbName}.`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`MongoDB check failed: ${error.message}`);
  process.exitCode = 1;
});
