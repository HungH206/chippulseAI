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
      summary: `### Executive Intelligence Summary

Demand pressure for **NVIDIA Blackwell Ultra** is currently ranked at **94/100** indicating an **Increasing** market stance with **High** analyst determination.

The semiconductor market is experiencing unprecedented allocation tightness for advanced GPU and memory components. NVIDIA's Blackwell Ultra continues commanding premium demand across all geographic regions and customer segments. Manufacturing constraints are primarily driven by CoWoS substrate availability and HBM3E memory supply, not underlying die production capacity.

Enterprise procurement leaders should prepare for sustained 12-18 month lead times and elevated pricing power from primary suppliers. Immediate action is required to secure long-term capacity agreements before Q3 pricing resets. Secondary-source evaluation (AMD, Intel) is strongly recommended to hedge against single-vendor supply shocks.`,
      citations: [
        {
          title: "NVIDIA Q1 2026 Earnings & Guidance",
          url: "https://investor.nvidia.com/",
        },
        {
          title: "Semiconductor Industry Association (SIA) Capacity Report",
          url: "https://www.semiconductors.org/",
        },
        {
          title: "Gartner Advanced Processor Roadmap Analysis",
          url: "https://www.gartner.com/",
        },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "sk-hynix-hbm3e": {
      component: "SK Hynix HBM3E Memory",
      demand_score: 92,
      trend: "Increasing",
      confidence: "High",
      drivers: [
        "GPU manufacturers requiring 3-4x more HBM capacity per generation due to larger models and batch sizes",
        "SK Hynix and Samsung limited to dual-source scenario; each producing near 100% utilization rates",
        "Memory density scaling into 12Hb stacks requiring new equipment validation cycles at foundries",
        "Competitive intelligence: Both suppliers signaling inability to increase output before 2027 capacity expansions",
      ],
      recommendations: [
        "Procurement: Lock in HBM3E allocation with both SK Hynix and Micron (via Samsung partnership) to ensure no single supply point failure.",
        "Design Strategy: Model HBM3 (older generation) compatibility as interim fallback to reduce binding dependency on latest HBM3E supply.",
        "Supply Chain: Establish quarterly business reviews with memory suppliers to monitor yield trends and capacity planning changes.",
        "Cost Management: Evaluate total cost of ownership including memory premiums; budget for 25-30% pricing variance over next 12 months.",
      ],
      summary: `### Executive Intelligence Summary

Demand pressure for **SK Hynix HBM3E Memory** is currently ranked at **92/100** indicating an **Increasing** market stance with **High** analyst determination.

High-bandwidth memory (HBM) represents the tightest supply constraint in the entire semiconductor value chain. SK Hynix's HBM3E production is fully allocated through Q4 2026 with significant backlog extending into 2027. The memory ecosystem is characterized by dual-source dominance (SK Hynix and Samsung) with neither supplier able to expand output materially within 18-month horizon.

Procurement teams must secure multi-year HBM agreements immediately and evaluate design flexibility to accommodate dual-generation memory stacks. Lead times for HBM3E components are currently 16-20 months with upside risk if demand accelerates further.`,
      citations: [
        {
          title: "SK Hynix HBM Technology Leadership & Capacity Roadmap",
          url: "https://www.skhynix.com/",
        },
        {
          title: "Micron Advanced Memory Systems Analysis",
          url: "https://www.micron.com/",
        },
        {
          title: "SemiEngineering HBM Supply Chain Deep Dive",
          url: "https://www.semiengineering.com/",
        },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "broadcom-tomahawk5": {
      component: "Broadcom Tomahawk 5",
      demand_score: 78,
      trend: "Stable",
      confidence: "Medium",
      drivers: [
        "Data center switch deployments moderating after AI infrastructure peak buildout cycle",
        "400G and 800G optical interface standardization creating inventory normalization",
        "Broadcom maintaining competitive pricing leverage but supply stabilizing post-shortage",
      ],
      recommendations: [
        "Procurement: Current supply-demand balance allows for standard lead-time commitments (6-9 months).",
        "Design: Lock in current BOM specifications; pricing stability expected for next 12 months.",
        "Inventory: Maintain 2-quarter safety stock for critical switching components.",
      ],
      summary: `### Executive Intelligence Summary

Demand pressure for **Broadcom Tomahawk 5** is currently ranked at **78/100** indicating a **Stable** market stance with **Medium** analyst determination.

High-speed data center switching silicon has entered a stabilization phase following the initial AI infrastructure rush. Supply conditions have normalized compared to 2024-2025 shortage cycles. Broadcom's Tomahawk 5 family continues capturing enterprise demand but order patterns suggest moderating procurement cycles post-capex peak.`,
      citations: [
        {
          title: "Broadcom Networking Solutions Portfolio",
          url: "https://www.broadcom.com/",
        },
        {
          title: "Data Center Infrastructure Spending Forecast",
          url: "https://www.gartner.com/",
        },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "amd-mi325x": {
      component: "AMD MI325X Accelerator",
      demand_score: 88,
      trend: "Increasing",
      confidence: "Medium",
      drivers: [
        "Competitive alternative to NVIDIA gaining traction in hyperscaler alternative architectures",
        "MI325X production scaling successfully but demand growing faster than supply ramping",
        "Enterprise softwar ecosystem maturity improving, enabling broader adoption beyond NVIDIA incumbents",
      ],
      recommendations: [
        "Procurement: Establish relationship with AMD and authorized distributors to secure MI325X allocation.",
        "Engineering: Invest in software optimization for AMD ROCM framework to enable production readiness.",
        "Risk Strategy: Treat MI325X as hedge against single-GPU-vendor dependency; plan 20-30% of fleet diversity.",
      ],
      summary: `### Executive Intelligence Summary

Demand pressure for **AMD MI325X Accelerator** is currently ranked at **88/100** indicating an **Increasing** market stance with **Medium** analyst determination.

AMD's MI325X is emerging as the primary competitive alternative to NVIDIA in GPU-accelerated AI workloads. Production availability is improving but demand among hyperscalers and enterprise customers is growing faster than AMD's capacity ramping. The MI325X offers attractive total cost of ownership and supply diversification benefits for risk-conscious buyers.`,
      citations: [
        {
          title: "AMD EPYC & MI Series Accelerators Strategy",
          url: "https://www.amd.com/",
        },
        {
          title: "Competitive GPU Analysis & Market Share Trends",
          url: "https://www.gartner.com/",
        },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "intel-gaudi3": {
      component: "Intel Gaudi 3",
      demand_score: 72,
      trend: "Stable",
      confidence: "Medium",
      drivers: [
        "Intel Gaudi growing market share in custom training workloads at hyperscalers",
        "Supply availability adequate but demand remains below nameplate capacity",
        "Competitive positioning improving but market share still limited vs. NVIDIA and AMD",
      ],
      recommendations: [
        "Procurement: Gaudi 3 can be sourced on 9-12 month lead times with reasonable allocation flexibility.",
        "Engineering: Evaluate Gaudi 3 for specific workload types (inference, training) where performance-per-watt is optimized.",
        "Strategic: Consider Gaudi 3 as third GPU option for fleet diversification and negotiation leverage.",
      ],
      summary: `### Executive Intelligence Summary

Demand pressure for **Intel Gaudi 3** is currently ranked at **72/100** indicating a **Stable** market stance with **Medium** analyst determination.

Intel's Gaudi 3 accelerator provides viable alternative positioning in the GPU market but with significantly lower demand pressure than NVIDIA or AMD offerings. Supply-demand dynamics remain balanced with adequate production capacity. Procurement can access Gaudi 3 on more favorable lead times and pricing compared to tier-1 competitors.`,
      citations: [
        {
          title: "Intel Gaudi Accelerator Product Family",
          url: "https://www.intel.com/",
        },
        {
          title: "AI Accelerator Competitive Landscape Report",
          url: "https://www.gartner.com/",
        },
      ],
      evaluated_at: new Date().toISOString(),
    },
    "qualcomm-snapdragon": {
      component: "Qualcomm Snapdragon X Elite",
      demand_score: 65,
      trend: "Stable",
      confidence: "Medium",
      drivers: [
        "Premium mobile market growth moderate; competition from Apple and MediaTek strong",
        "AI-enabled features driving some incremental demand but not shortage conditions",
        "Supply-demand equilibrium maintained with standard industry lead times",
      ],
      recommendations: [
        "Procurement: Standard 12-14 week lead times; no allocation concerns for mainstream volumes.",
        "Design: Plan product roadmaps independently of supply constraints for this component family.",
      ],
      summary: `### Executive Intelligence Summary

Demand pressure for **Qualcomm Snapdragon X Elite** is currently ranked at **65/100** indicating a **Stable** market stance with **Medium** analyst determination.

Premium mobile processor demand remains healthy but supply-constrained environments have not materialized. Qualcomm maintains competitive share but faces intense competition from Apple's proprietary solutions and MediaTek's value positioning. Supply dynamics are normal with predictable lead times and allocation patterns.`,
      citations: [
        {
          title: "Qualcomm Snapdragon Mobile Processors",
          url: "https://www.qualcomm.com/",
        },
        {
          title: "Mobile Semiconductor Market Analysis",
          url: "https://www.gartner.com/",
        },
      ],
      evaluated_at: new Date().toISOString(),
    },
  };

  return resultMap[presetId] || null;
}
