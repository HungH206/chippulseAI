require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const required = ['MONGODB_URI', 'MONGODB_DB'];
const apiKeyAliases = ['GEMINI_API_KEY', 'GOOGLE_API_KEY'];
const optional = [
  'PORT',
  'GEMINI_EMBEDDING_MODEL',
  'GEMINI_EMBEDDING_DIMENSIONS',
  'MONGODB_HISTORICAL_EVENTS_VECTOR_INDEX',
  'MONGODB_INDUSTRY_REPORTS_VECTOR_INDEX',
  'MONGODB_NEWS_ARTICLES_VECTOR_INDEX',
];

function isSet(key) {
  return Boolean(process.env[key] && process.env[key].trim());
}

const apiKeyPresent = apiKeyAliases.some(isSet);
console.log(`${apiKeyPresent ? 'OK' : 'MISSING'} required GEMINI_API_KEY or GOOGLE_API_KEY`);

for (const key of required) {
  console.log(`${isSet(key) ? 'OK' : 'MISSING'} required ${key}`);
}

for (const key of optional) {
  console.log(`${isSet(key) ? 'OK' : 'default'} optional ${key}`);
}

const missing = required.filter((key) => !isSet(key));
if (!apiKeyPresent) {
  missing.unshift('GEMINI_API_KEY or GOOGLE_API_KEY');
}
if (missing.length > 0) {
  console.error(`Missing required env keys: ${missing.join(', ')}`);
  process.exitCode = 1;
}
