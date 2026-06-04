import type { EvaluationResult } from "./types";

export interface PresetComponent {
  id: string;
  name: string;
  category: string;
  subText: string;
  initialScore: number;
}

export interface SuggestedSignal {
  title: string;
  signal: string;
}

export const PRESET_COMPONENTS: PresetComponent[] = [
  {
    id: "nvidia-b200",
    name: "NVIDIA Blackwell Ultra",
    category: "GPU / AI",
    subText: "Next-gen flagship AI accelerator with advanced HBM3E stacks",
    initialScore: 94,
  },
  {
    id: "sk-hynix-hbm3e",
    name: "SK Hynix HBM3E Memory",
    category: "Memory",
    subText: "High-bandwidth memory for GPU compute and AI workloads",
    initialScore: 92,
  },
  {
    id: "broadcom-tomahawk5",
    name: "Broadcom Tomahawk 5",
    category: "Networking",
    subText: "High-performance data center switching silicon",
    initialScore: 78,
  },
  {
    id: "amd-mi325x",
    name: "AMD MI325X Accelerator",
    category: "GPU / AI",
    subText: "AMD's flagship AI training and inference processor",
    initialScore: 88,
  },
  {
    id: "intel-gaudi3",
    name: "Intel Gaudi 3",
    category: "GPU / AI",
    subText: "Intel's deep learning processor for training and inference",
    initialScore: 72,
  },
  {
    id: "qualcomm-snapdragon",
    name: "Qualcomm Snapdragon X Elite",
    category: "Mobile / Edge",
    subText: "Premium mobile processor with integrated AI capabilities",
    initialScore: 65,
  },
];

export const SUGGESTED_SIGNALS: SuggestedSignal[] = [
  {
    title: "Supply Crisis",
    signal:
      "Foundry lead times have extended beyond 18 months due to advanced node saturation at TSMC's 3nm and 5nm nodes.",
  },
  {
    title: "Packaging Bottleneck",
    signal:
      "CoWoS substrate supply constraints causing 6-week delays in high-density packaging for AI chips and GPUs.",
  },
  {
    title: "Geopolitical Shift",
    signal:
      "Recent export controls on advanced semiconductors driving immediate diversification and secondary sourcing patterns.",
  },
  {
    title: "Demand Spike",
    signal:
      "Hyperscaler GPU procurement accelerating faster than expected; enterprise AI deployments ramping ahead of timeline.",
  },
  {
    title: "Yield Issues",
    signal:
      "Manufacturing yields on leading-edge nodes declining; complex multi-chiplet designs increasing scrap rates.",
  },
];

export function getPresetResult(presetId: string): EvaluationResult | null {
  const preset = PRESET_COMPONENTS.find((p) => p.id === presetId);

  if (!preset) {
    return null;
  }

  const resultMap: Record<string, EvaluationResult> = {
    "nvidia-b200": {
      component: "NVIDIA Blackwell Ultra",
      demand_score: 94,
      trend: "Increasing",
      confidence: "High",
      summary: `Demand pressure for NVIDIA Blackwell Ultra is currently ranked at 94/100 indicating an Increasing market stance with High analyst determination. The semiconductor market is experiencing unprecedented allocation tightness for advanced GPU and memory components. NVIDIA's Blackwell Ultra continues commanding premium demand across all geographic regions and customer segments. Manufacturing constraints are primarily driven by CoWoS substrate availability and HBM3E memory supply, not underlying die production capacity.`,
      drivers: [
        "Unprecedented AI datacenter buildouts by major cloud providers (OpenAI, Google, Meta, Amazon)",
        "H200 and B200 demand exceeding supply by 3-4x across all channels and allocations",
        "CoWoS/HBM3E packaging becoming the primary constraint, not raw die production",
        "Sovereign supercomputing initiatives in EU, UK, and Japan creating secondary demand surge",
      ],
      recommendations: [
        "Procurement: Negotiate 24-month forward purchase agreements immediately to secure allocation priority and lock current pricing before tariff adjustments.",
        "Risk Offset: Establish dual-sourcing roadmap with AMD MI325X or Intel Gaudi as fallback to reduce single-vendor dependency risk.",
        "Engineering: Evaluate system-level workload distribution across multiple GPU types to maximize utilization and avoid future stranding.",
        "Financial: Model capex scenarios around 18-month lead times; plan cluster rollouts 2 quarters ahead of operational demand.",
      ],
      market_signals: [
        {
          title: "NVIDIA Q1 2026 Earnings",
          signal: "Record GPU demand from hyperscalers; all Q2-Q3 allocation fully committed",
          relevance: "High",
        },
        {
          title: "CoWoS Capacity Alert",
          signal: "TSMC's CoWoS substrate production at 110% utilization; 16-week lead times confirmed",
          relevance: "High",
        },
        {
          title: "Competitive Pressure",
          signal: "AMD MI325X gaining traction; enterprises evaluating dual-source strategies",
          relevance: "Medium",
        },
      ],
      historical_matches: [
        {
          title: "2024 H100 Supply Constraint",
          year: 2024,
          similarity: 89,
          impact: "Severe",
          description: "Previous generation faced similar CoWoS bottleneck; lasted 18+ months",
        },
        {
          title: "2023 HBM Supply Crisis",
          year: 2023,
          similarity: 92,
          impact: "Critical",
          description: "SK Hynix/Samsung dual-source scenario created allocation scarcity",
        },
      ],
      citations: [
        {
          title: "NVIDIA Q1 2026 Earnings & Guidance",
          source: "NVIDIA Investor Relations",
          url: "https://investor.nvidia.com/",
        },
        {
          title: "Semiconductor Industry Association (SIA) Capacity Report",
          source: "SIA",
          url: "https://www.semiconductors.org/",
        },
        {
          title: "Gartner Advanced Processor Roadmap Analysis",
          source: "Gartner",
          url: "https://www.gartner.com/",
        },
      ],
      agent_activity: [
        { step: "Query Received", status: "completed", timestamp: new Date().toISOString() },
        { step: "Market Signal Analysis", status: "completed", timestamp: new Date().toISOString() },
        { step: "Historical Event Retrieval", status: "completed", timestamp: new Date().toISOString() },
        { step: "Gemini Forecast Generation", status: "completed", timestamp: new Date().toISOString() },
        { step: "Report Completed", status: "completed", timestamp: new Date().toISOString() },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "sk-hynix-hbm3e": {
      component: "SK Hynix HBM3E Memory",
      demand_score: 92,
      trend: "Increasing",
      confidence: "High",
      summary: `High-bandwidth memory (HBM) represents the tightest supply constraint in the entire semiconductor value chain. SK Hynix's HBM3E production is fully allocated through Q4 2026 with significant backlog extending into 2027. The memory ecosystem is characterized by dual-source dominance (SK Hynix and Samsung) with neither supplier able to expand output materially within 18-month horizon.`,
      drivers: [
        "GPU manufacturers requiring 3-4x more HBM capacity per generation due to larger models",
        "SK Hynix and Samsung limited to dual-source scenario; each producing at 100% utilization",
        "Memory density scaling into 12Hb stacks requiring new equipment validation cycles",
        "Competitive intelligence: Both suppliers signaling inability to increase output before 2027",
      ],
      recommendations: [
        "Procurement: Lock in HBM3E allocation with both SK Hynix and Samsung to ensure no single supply point failure",
        "Design Strategy: Model HBM3 (older generation) compatibility as interim fallback",
        "Supply Chain: Establish quarterly business reviews with memory suppliers to monitor yield trends",
        "Cost Management: Budget for 25-30% pricing variance over next 12 months",
      ],
      market_signals: [
        {
          title: "HBM Production Bottleneck",
          signal: "SK Hynix HBM3E output constrained by equipment and packaging capacity",
          relevance: "High",
        },
        {
          title: "Price Escalation",
          signal: "HBM3E pricing increased 18% YoY; further 12-15% hikes expected Q3",
          relevance: "High",
        },
      ],
      historical_matches: [
        {
          title: "2023 HBM Supply Crisis",
          year: 2023,
          similarity: 95,
          impact: "Critical",
          description: "Dual-source memory bottleneck lasted 20+ months",
        },
      ],
      citations: [
        {
          title: "SK Hynix HBM Technology Leadership",
          source: "SK Hynix",
          url: "https://www.skhynix.com/",
        },
        {
          title: "Micron Advanced Memory Analysis",
          source: "Micron",
          url: "https://www.micron.com/",
        },
      ],
      agent_activity: [
        { step: "Query Received", status: "completed" },
        { step: "Market Signal Analysis", status: "completed" },
        { step: "Historical Event Retrieval", status: "completed" },
        { step: "Gemini Forecast Generation", status: "completed" },
        { step: "Report Completed", status: "completed" },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "broadcom-tomahawk5": {
      component: "Broadcom Tomahawk 5",
      demand_score: 78,
      trend: "Stable",
      confidence: "Medium",
      summary: `High-speed data center switching silicon has entered a stabilization phase following the initial AI infrastructure rush. Supply conditions have normalized compared to 2024-2025 shortage cycles. Broadcom's Tomahawk 5 family continues capturing enterprise demand but order patterns suggest moderating procurement cycles post-capex peak.`,
      drivers: [
        "Data center switch deployments moderating after AI infrastructure peak",
        "400G and 800G optical interface standardization creating inventory normalization",
        "Broadcom maintaining competitive pricing leverage but supply stabilizing",
      ],
      recommendations: [
        "Procurement: Current supply-demand balance allows for standard lead-time commitments (6-9 months)",
        "Design: Lock in current BOM specifications; pricing stability expected for 12 months",
        "Inventory: Maintain 2-quarter safety stock for critical switching components",
      ],
      market_signals: [
        {
          title: "Switch Demand Normalization",
          signal: "Data center switch orders declining 8-12% QoQ as AI capex moderates",
          relevance: "Medium",
        },
      ],
      historical_matches: [
        {
          title: "2022 Networking Peak",
          year: 2022,
          similarity: 72,
          impact: "Moderate",
          description: "Similar normalization pattern after infrastructure surge",
        },
      ],
      citations: [
        {
          title: "Broadcom Networking Solutions",
          source: "Broadcom",
          url: "https://www.broadcom.com/",
        },
      ],
      agent_activity: [
        { step: "Query Received", status: "completed" },
        { step: "Market Signal Analysis", status: "completed" },
        { step: "Historical Event Retrieval", status: "completed" },
        { step: "Gemini Forecast Generation", status: "completed" },
        { step: "Report Completed", status: "completed" },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "amd-mi325x": {
      component: "AMD MI325X Accelerator",
      demand_score: 88,
      trend: "Increasing",
      confidence: "Medium",
      summary: `AMD's MI325X is emerging as the primary competitive alternative to NVIDIA in GPU-accelerated AI workloads. Production availability is improving but demand among hyperscalers and enterprise customers is growing faster than AMD's capacity ramping.`,
      drivers: [
        "Competitive alternative to NVIDIA gaining traction in hyperscaler alternatives",
        "MI325X production scaling successfully but demand growing faster than supply",
        "Enterprise software ecosystem maturity improving, enabling broader adoption",
      ],
      recommendations: [
        "Procurement: Establish relationship with AMD and authorized distributors for allocation",
        "Engineering: Invest in software optimization for AMD ROCM framework",
        "Risk Strategy: Treat MI325X as hedge; plan 20-30% of fleet diversity",
      ],
      market_signals: [
        {
          title: "AMD Competitive Gain",
          signal: "5+ hyperscalers now evaluating or deploying MI325X at scale",
          relevance: "High",
        },
      ],
      historical_matches: [
        {
          title: "AMD GPU Market Entry 2022",
          year: 2022,
          similarity: 65,
          impact: "Moderate",
          description: "Previous GPU alternative adoption took 18+ months to reach scale",
        },
      ],
      citations: [
        {
          title: "AMD EPYC & MI Series Accelerators",
          source: "AMD",
          url: "https://www.amd.com/",
        },
      ],
      agent_activity: [
        { step: "Query Received", status: "completed" },
        { step: "Market Signal Analysis", status: "completed" },
        { step: "Historical Event Retrieval", status: "completed" },
        { step: "Gemini Forecast Generation", status: "completed" },
        { step: "Report Completed", status: "completed" },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "intel-gaudi3": {
      component: "Intel Gaudi 3",
      demand_score: 72,
      trend: "Stable",
      confidence: "Medium",
      summary: `Intel's Gaudi 3 accelerator provides viable alternative positioning in the GPU market but with significantly lower demand pressure than NVIDIA or AMD offerings. Supply-demand dynamics remain balanced with adequate production capacity.`,
      drivers: [
        "Intel Gaudi growing market share in custom training workloads",
        "Supply availability adequate but demand remains below nameplate capacity",
        "Competitive positioning improving but market share still limited",
      ],
      recommendations: [
        "Procurement: Gaudi 3 sourced on 9-12 month lead times with flexibility",
        "Engineering: Evaluate Gaudi 3 for specific workload types where optimized",
        "Strategic: Consider as third GPU option for fleet diversification",
      ],
      market_signals: [
        {
          title: "Stable Supply Position",
          signal: "Intel Gaudi production stable; no allocation constraints",
          relevance: "Medium",
        },
      ],
      historical_matches: [],
      citations: [
        {
          title: "Intel Gaudi Accelerator",
          source: "Intel",
          url: "https://www.intel.com/",
        },
      ],
      agent_activity: [
        { step: "Query Received", status: "completed" },
        { step: "Market Signal Analysis", status: "completed" },
        { step: "Gemini Forecast Generation", status: "completed" },
        { step: "Report Completed", status: "completed" },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "qualcomm-snapdragon": {
      component: "Qualcomm Snapdragon X Elite",
      demand_score: 65,
      trend: "Stable",
      confidence: "Medium",
      summary: `Premium mobile processor demand remains healthy but supply-constrained environments have not materialized. Qualcomm maintains competitive share but faces intense competition from Apple's proprietary solutions and MediaTek's value positioning.`,
      drivers: [
        "Premium mobile market growth moderate; competition from Apple and MediaTek strong",
        "AI-enabled features driving incremental demand but no shortage conditions",
        "Supply-demand equilibrium maintained with standard industry lead times",
      ],
      recommendations: [
        "Procurement: Standard 12-14 week lead times; no allocation concerns",
        "Design: Plan product roadmaps independently of supply constraints",
      ],
      market_signals: [
        {
          title: "Normal Supply Conditions",
          signal: "Snapdragon supply operating within normal parameters",
          relevance: "Low",
        },
      ],
      historical_matches: [],
      citations: [
        {
          title: "Qualcomm Snapdragon",
          source: "Qualcomm",
          url: "https://www.qualcomm.com/",
        },
      ],
      agent_activity: [
        { step: "Query Received", status: "completed" },
        { step: "Market Signal Analysis", status: "completed" },
        { step: "Report Completed", status: "completed" },
      ],
      evaluated_at: new Date().toISOString(),
    },
  };

  return resultMap[presetId] || null;
}
