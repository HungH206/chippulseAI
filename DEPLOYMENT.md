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
