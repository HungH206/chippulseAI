export interface MarketSignal {
  title: string;
  signal: string;
  relevance: "High" | "Medium" | "Low";
  source?: string;
  url?: string;
  published_at?: string;
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
  source?: string;
  type?: "historical_event" | "industry_report" | "news_article";
  url?: string;
  published_at?: string;
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
  news_articles_retrieved?: number;
  vector_search_used: boolean;
  historical_events_vector_search_used?: boolean;
  industry_reports_vector_search_used?: boolean;
  news_articles_vector_search_used?: boolean;
  components_catalog_vector_search_used?: boolean;
  retrieval_mode?: string;
  historical_events_retrieval_mode?: string;
  industry_reports_retrieval_mode?: string;
  news_articles_retrieval_mode?: string;
  components_catalog_retrieval_mode?: string;
  historical_events_index?: string | null;
  industry_reports_index?: string | null;
  news_articles_index?: string | null;
  components_catalog_index?: string | null;
}

export interface SupplyAvailability {
  status: "Unknown" | "Available" | "Widely Available" | "Supply Issue";
  availability_evidence_count: number;
  scarcity_evidence_count: number;
  strategic_scarcity_component: boolean;
}

export interface AlternativeComponent {
  component: string;
  category: string;
  risk: number;
  reason: string;
  similarity?: number;
}

export interface EvaluationResult {
  component: string;
  demand_score: number;
  risk_band?: "Stable" | "Watch" | "Elevated" | "High" | "Critical";
  alternatives?: AlternativeComponent[];
  score_breakdown?: ScoreBreakdown[];
  supply_availability?: SupplyAvailability;
  trend: "Increasing" | "Declining" | "Stable";
  confidence: "High" | "Medium" | "Low";
  summary: string;
  drivers: string[];
  recommendations: string[];
  market_signals: MarketSignal[];
  historical_matches: HistoricalMatch[];
  retrieval_metadata?: RetrievalMetadata;
  vector_search_used?: boolean;
  historical_events_retrieved?: number;
  industry_reports_retrieved?: number;
  news_articles_retrieved?: number;
  components_catalog_vector_search_used?: boolean;
  retrieval_mode?: string;
  agent_version?: string;
  citations: Citation[];
  agent_activity: AgentStep[];
  evaluated_at: string;
}
