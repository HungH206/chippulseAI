# ChipPulse AI

> AI-Powered Semiconductor Demand Intelligence & Supply Chain Risk Analysis

ChipPulse AI is an agentic semiconductor intelligence platform that helps engineers, procurement teams, system builders, and technology organizations understand demand pressure, supply-chain risk, and sourcing challenges across CPUs, GPUs, memory, AI accelerators, packaging technologies, and semiconductor infrastructure.

Built for the Google Cloud Rapid Agent Hackathon using Gemini, Google Agent Development Kit (ADK), MongoDB Atlas Vector Search, and the MongoDB MCP Server.

---

## Problem

The semiconductor industry is increasingly shaped by AI-driven demand, advanced packaging constraints, memory allocation bottlenecks, geopolitical events, and manufacturing capacity limitations.

Traditional search tools and product databases can tell users what a component is, but they rarely explain:

* Why demand is increasing
* What supply-chain risks exist
* Which historical events resemble the current situation
* Which industry signals support a forecast
* What procurement actions should be taken

ChipPulse AI addresses this gap by combining historical memory, vector search, market intelligence, and Gemini reasoning into a single agentic workflow.

---

## Features

### Semiconductor Demand Intelligence

Analyze:

* CPUs
* GPUs
* AI Accelerators
* Memory Modules
* HBM
* CoWoS Packaging
* Networking Components
* Custom Hardware Components

Outputs include:

* Demand Score (0–100)
* Risk Band Classification
* Supply Availability Assessment
* Market Signals
* Historical Event Matching
* Procurement Recommendations
* Confidence Rating

---

### Component Alternative Hub

When a component carries elevated demand or supply risk, ChipPulse recommends lower-risk substitutes so teams can act, not just observe.

The Alternative Hub:

* Infers the component category (CPU, GPU, memory, storage, mini PC)
* Retrieves candidates from a curated components catalog
* Ranks alternatives by lower risk score and semantic similarity to the original component
* Surfaces a plain-language reason for each suggestion

Retrieval is powered by MongoDB Atlas Vector Search over the components catalog, with an automatic fallback to local catalog scoring when vector search is unavailable. The agent exposes this through a dedicated `retrieve_component_alternatives` tool backed by the `/api/catalog-search` endpoint.

---

### Agentic Workflow

ChipPulse operates as a multi-tool AI agent.

Workflow:

1. User submits a component
2. Gemini generates semantic embeddings
3. MongoDB Atlas Vector Search retrieves:

   * Historical Events
   * Industry Reports
   * News Articles
4. Risk Scoring Engine calculates demand pressure
5. Component Alternative Hub recommends lower-risk substitutes
6. Gemini generates reasoning and recommendations
7. Results are stored in MongoDB memory
8. Agent activity and citations are returned

---

### Explainable Risk Scoring

Each evaluation includes a detailed score breakdown:

* Demand Pressure
* Supply Constraints
* Historical Similarity
* Market Signals

Example:

Risk Score: 83

Demand Pressure ........ 25/35
Supply Constraints ..... 30/30
Historical Similarity .. 18/20
Market Signals ......... 10/15

Risk Band: Critical

---

### MongoDB Atlas Vector Search

ChipPulse uses MongoDB Atlas Vector Search to retrieve semantically relevant information from:

* Historical semiconductor disruptions
* Industry intelligence reports
* Market news articles

Collections:

* historical_events
* industry_reports
* news_articles
* components_catalog
* analyses

Vector indexes:

* historical_events_vector
* industry_reports_vector
* news_articles_vector
* components_catalog_vector

---

### MongoDB MCP Integration

ChipPulse integrates the MongoDB MCP Server to provide agent memory capabilities.

MCP tools enable:

* Collection inspection
* Database exploration
* Aggregation queries
* Analysis history retrieval
* Memory analytics

This allows the agent to reason over previously stored analyses and maintain persistent intelligence.

---

## Technology Stack

### AI & Agent Framework

* Google Gemini 2.5 Flash
* Google Gemini Embeddings
* Google Agent Development Kit (ADK)
* Google Cloud Agent Builder

### Database & Retrieval

* MongoDB Atlas
* MongoDB Atlas Vector Search
* MongoDB MCP Server

### Backend

* Node.js
* Express.js
* Google Cloud Run

### Frontend

* React
* TypeScript
* Vite
* Cloudflare Pages

---

## Architecture

User
↓
ChipPulse Dashboard
↓
Cloudflare Pages

↓

Express API
(Google Cloud Run)

↓

Gemini Reasoning
+
Gemini Embeddings

↓

MongoDB Atlas Vector Search

↓

Historical Events
Industry Reports
News Articles

↓

Risk Scoring Engine

↓

MongoDB Memory

↓

Analysis History & Citations

---

## Example Analysis

Input:

DDR5 RAM

Signal:

"DDR5 suppliers exiting consumer business to focus on AI demand"

Output:

* Demand Score: 78
* Risk Band: High
* Trend: Increasing
* Historical Matches:

  * 2025 HBM Supply Constraint
  * 2021 DDR5 Launch Allocation
* Recommendations:

  * Secure long-term supply agreements
  * Monitor AI datacenter buildouts
  * Diversify sourcing channels

---

## Local Setup

### Prerequisites

* Node.js 20+
* MongoDB Atlas Cluster
* Gemini API Key

### Clone Repository

```bash
git clone <repo-url>
cd chippulse-ai
```

### Backend Setup

```bash
cd backend
npm install
```

Create:

```env
GEMINI_API_KEY=YOUR_KEY
MONGODB_URI=YOUR_MONGODB_URI
MONGODB_DB=chippulse
PORT=3000
```

Seed database:

```bash
npm run seed
```

Run backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

### Frontend

Hosted on Cloudflare Pages.

### Backend

Hosted on Google Cloud Run.

### Database

MongoDB Atlas.

---

## What We Learned

Building ChipPulse taught us that AI systems become significantly more trustworthy when they combine:

* Semantic retrieval
* Persistent memory
* Historical grounding
* Explainable scoring
* Human-readable citations

Rather than relying on a language model alone, we found that combining Gemini reasoning with MongoDB Atlas Vector Search creates a much more transparent and useful decision-support system.

---

## Future Work

* Real-time semiconductor intelligence feeds
* Supplier concentration analysis
* Multi-component system risk forecasting
* Procurement planning dashboards
* Advanced MCP memory analytics
* Predictive shortage forecasting
* Enterprise supply-chain integrations

---

## License

This project is licensed under the [MIT License](LICENSE).
