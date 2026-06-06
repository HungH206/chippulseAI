require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const required = ['GEMINI_API_KEY', 'MONGODB_URI', 'MONGODB_DB'];
const optional = [
  'PORT',
  'GEMINI_EMBEDDING_MODEL',
  'GEMINI_EMBEDDING_DIMENSIONS',
  'MONGODB_HISTORICAL_EVENTS_VECTOR_INDEX',
  'MONGODB_INDUSTRY_REPORTS_VECTOR_INDEX',
];

function isSet(key) {
  return Boolean(process.env[key] && process.env[key].trim());
}

for (const key of required) {
  console.log(`${isSet(key) ? 'OK' : 'MISSING'} required ${key}`);
}

for (const key of optional) {
  console.log(`${isSet(key) ? 'OK' : 'default'} optional ${key}`);
}

const missing = required.filter((key) => !isSet(key));
if (missing.length > 0) {
  console.error(`Missing required env keys: ${missing.join(', ')}`);
  process.exitCode = 1;
}
