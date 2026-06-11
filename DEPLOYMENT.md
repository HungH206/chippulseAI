# ChipPulse Deployment

Recommended hackathon deployment:

- Frontend: Cloudflare Pages
- Backend: Google Cloud Run
- Database: MongoDB Atlas
- AI: Gemini / Vertex AI
- Agent: ADK / Agent Builder for the demo narrative

## Backend: Google Cloud Run

Deploy the Express API from `backend/`.

```bash
cd backend
gcloud run deploy chip-pulse-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_DB=chippulse,CHIPPULSE_AGENT_VERSION=v1.2
```

Set secrets or environment variables for:

```text
GEMINI_API_KEY
MONGODB_URI
MONGODB_DB
GEMINI_EMBEDDING_MODEL
GEMINI_EMBEDDING_DIMENSIONS
MONGODB_HISTORICAL_EVENTS_VECTOR_INDEX
MONGODB_INDUSTRY_REPORTS_VECTOR_INDEX
MONGODB_NEWS_ARTICLES_VECTOR_INDEX
MONGODB_COMPONENTS_CATALOG_VECTOR_INDEX
```

Cloud Run provides `PORT` automatically. The API binds to `0.0.0.0` for container traffic.

After deploy, copy the service URL, for example:

```text
https://chip-pulse-api-xxxxx-uc.a.run.app
```

## Frontend: Cloudflare Pages

Create a Cloudflare Pages project connected to this GitHub repo.

Build settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

Environment variable:

```text
VITE_API_BASE_URL=https://chip-pulse-api-xxxxx-uc.a.run.app
```

For local development, copy `.env.example` to `.env` and keep:

```text
VITE_API_BASE_URL=http://localhost:3000
```

The app also works locally without this variable because Vite proxies `/api` to `localhost:3000`.

## Demo Architecture

```text
Cloudflare Pages
      |
ChipPulse Dashboard
      |
Google Cloud Run
      |
Express API
      |
Gemini + Embeddings
      |
MongoDB Atlas Vector Search
      |
Historical Events + Industry Reports + News Intelligence
```

Keep MongoDB MCP local or deploy it separately after the demo. It should not block the main dashboard and API deployment.

## Components Catalog Vector Search

Before demoing alternatives from Atlas, create a Vector Search index on the
MongoDB Atlas `components_catalog` collection.

Index name:

```text
components_catalog_vector
```

Index definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "category"
    },
    {
      "type": "filter",
      "path": "risk_score"
    }
  ]
}
```

Then seed Atlas:

```bash
cd backend
npm run seed
```

The seed command rebuilds demo collections, including `components_catalog`.
Wait until the Atlas index status is READY before expecting the app badge to
show `Atlas Vector Search`; until then the backend falls back to the local
catalog.

## Redeploy Checklist

1. Create/update the Atlas Vector Search index above.
2. Run `cd backend && npm run seed`.
3. Redeploy Cloud Run:

```bash
cd backend
gcloud run deploy chip-pulse-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_DB=chippulse,CHIPPULSE_AGENT_VERSION=v1.3,MONGODB_COMPONENTS_CATALOG_VECTOR_INDEX=components_catalog_vector
```

4. Confirm Cloud Run has these secrets/env vars:

```text
GEMINI_API_KEY
MONGODB_URI
MONGODB_DB
GEMINI_EMBEDDING_MODEL
GEMINI_EMBEDDING_DIMENSIONS
MONGODB_HISTORICAL_EVENTS_VECTOR_INDEX
MONGODB_INDUSTRY_REPORTS_VECTOR_INDEX
MONGODB_NEWS_ARTICLES_VECTOR_INDEX
MONGODB_COMPONENTS_CATALOG_VECTOR_INDEX
```

5. Test Cloud Run:

```bash
curl -X POST https://YOUR-CLOUD-RUN-URL/api/catalog-search \
  -H "Content-Type: application/json" \
  -d '{"component":"Samsung 990 Pro 1TB NVMe SSD","riskScore":85}'
```

6. Redeploy frontend with:

```text
VITE_API_BASE_URL=https://YOUR-CLOUD-RUN-URL
```

7. If using ADK locally, set `CHIPPULSE_BACKEND_URL` in
`backend/my_agent/.env` to the Cloud Run URL.
