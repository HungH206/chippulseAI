# Environment Setup

Do not use `echo ... > .env` unless you intend to replace the entire file.
That command overwrites every existing key.

## Backend

The Node backend reads `backend/.env`.

Required keys:

```bash
GEMINI_API_KEY=...
MONGODB_URI=...
MONGODB_DB=chippulse
PORT=3000
```

Optional Vector Search keys:

```bash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_EMBEDDING_DIMENSIONS=768
MONGODB_HISTORICAL_EVENTS_VECTOR_INDEX=historical_events_vector
MONGODB_INDUSTRY_REPORTS_VECTOR_INDEX=industry_reports_index
```

Restore the file from the example, then edit values locally:

```bash
cd backend
cp .env.example .env
nano .env
npm run check-env
```

## ADK Agent

The ADK agent reads `backend/my_agent/.env`.

For local API-key mode:

```bash
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=...
```

Restore the agent env file from its example:

```bash
cd backend
cp my_agent/.env.example my_agent/.env
nano my_agent/.env
adk run my_agent
```

If `GOOGLE_GENAI_USE_VERTEXAI=TRUE`, ADK will try Google Cloud Application
Default Credentials instead of API-key mode.

## Safe Shell Patterns

Append one line without deleting the file:

```bash
printf '\nKEY=value\n' >> .env
```

Check which keys are present without printing secret values:

```bash
awk -F= 'NF && $1 !~ /^#/ {print $1"=<redacted>"}' .env
```

Avoid these in screenshots, logs, and chat:

```bash
cat .env
echo "$GEMINI_API_KEY"
printenv
```

If a real key was exposed publicly, rotate or delete it in the provider console.
