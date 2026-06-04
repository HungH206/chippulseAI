export interface MarketSignal {
  title: string;
  signal: string;
  relevance: "High" | "Medium" | "Low";
}

export interface HistoricalMatch {
  title: string;
  year?: number;
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

export interface EvaluationResult {
  component: string;
  demand_score: number;
  trend: "Increasing" | "Declining" | "Stable";
  confidence: "High" | "Medium" | "Low";
  summary: string;
  drivers: string[];
  recommendations: string[];
  market_signals: MarketSignal[];
  historical_matches: HistoricalMatch[];
  citations: Citation[];
  agent_activity: AgentStep[];
  evaluated_at: string;
}
