import type { ComponentType } from "react";

export interface BenchmarkGraphItem {
  name: string;
  score: number;
  trend: string;
  risk: string;
  fullName: string;
  vector?: boolean;
  news: number;
}

declare const DemandBenchmarkGraph: ComponentType<{
  data: BenchmarkGraphItem[];
}>;

export default DemandBenchmarkGraph;
