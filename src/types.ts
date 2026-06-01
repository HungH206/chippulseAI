export interface EvaluationResult {
  component: string;
  demand_score: number;
  trend: "Increasing" | "Declining" | "Stable";
  confidence: "High" | "Medium" | "Low";
  drivers: string[];
  recommendations: string[];
  summary: string;
  citations: Array<{
    title: string;
    url: string;
  }>;
  evaluated_at: string;
}
