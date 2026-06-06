export interface MarketSignal {
  title: string;
  signal: string;
  relevance: "High" | "Medium" | "Low";
}

export interface HistoricalMatch {
  title: string;
  year?: number;
  score?: number;
  similarity: number;
  impact: "Critical" | "Severe" | "Moderate" | "Low";
  description: string;
}

export interface Citation {
  title: string;
  source: string;
  url?: string;
}

export interface AgentStep {
  step: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  timestamp?: string;
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  explanation: string;
}

export interface RetrievalMetadata {
  historical_events_retrieved: number;
  industry_reports_retrieved: number;
  vector_search_used: boolean;
  retrieval_mode?: string;
  historical_events_index?: string | null;
  industry_reports_index?: string | null;
}

export interface EvaluationResult {
  component: string;
  demand_score: number;
  risk_band?: "Stable" | "Watch" | "Elevated" | "High" | "Critical";
  score_breakdown?: ScoreBreakdown[];
  trend: "Increasing" | "Declining" | "Stable";
  confidence: "High" | "Medium" | "Low";
  summary: string;
  drivers: string[];
  recommendations: string[];
  market_signals: MarketSignal[];
  historical_matches: HistoricalMatch[];
  retrieval_metadata?: RetrievalMetadata;
  citations: Citation[];
  agent_activity: AgentStep[];
  evaluated_at: string;
}
