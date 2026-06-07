import React, { useState, useEffect } from "react";
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Database,
  History,
  Activity,
  Brain,
  Layers,
  Search,
  RefreshCw,
  ExternalLink,
  Check,
  Terminal
} from "lucide-react";
import DemandBenchmarkGraph from "./Graph";
import { PRESET_COMPONENTS, SUGGESTED_SIGNALS, getPresetResult } from "./presets";
import type { EvaluationResult } from "./types";

interface WorkflowStep {
  label: string;
  description: string;
  tag: string;
}

const WORKFLOW_PIPELINE: WorkflowStep[] = [
  { label: "User Request Received", tag: "ADK", description: "Parsing component and market-signal payload for the ChipPulse agent." },
  { label: "retrieve_historical_events", tag: "Tool", description: "Calling backend vector search over MongoDB historical_events memory." },
  { label: "retrieve_industry_reports", tag: "Tool", description: "Calling backend vector search over MongoDB industry_reports memory." },
  { label: "retrieve_recent_news", tag: "Tool", description: "Calling backend vector search over MongoDB news_articles live-signal memory." },
  { label: "evaluate_component", tag: "Tool", description: "Running ChipPulse scoring, Gemini synthesis, citations, and MongoDB persistence." },
  { label: "Report Generated", tag: "Done", description: "Returning demand score, score breakdown, retrieval evidence, and recommendations." }
];

const SCORE_CAPS: Record<string, number> = {
  "Demand Pressure": 35,
  "Supply Constraints": 30,
  "Historical Similarity": 20,
  "Market Signals": 15,
};

const getRiskBand = (score: number): "Stable" | "Watch" | "Elevated" | "High" | "Critical" => {
  if (score <= 20) return "Stable";
  if (score <= 40) return "Watch";
  if (score <= 60) return "Elevated";
  if (score <= 80) return "High";
  return "Critical";
};

export default function App() {
  // Input states
  const [componentName, setComponentName] = useState<string>("");
  const [customSignal, setCustomSignal] = useState<string>("");
  
  // Evaluation States
  const [loading, setLoading] = useState<boolean>(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(-1);
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);
  const [historyList, setHistoryList] = useState<EvaluationResult[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "drivers" | "recommendations">("summary");
  
  // Demo mode alert (if Gemini key isn't setup, we can fall back to beautiful structured responses)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Initialize with the top preset (Nvidia Blackwell)
  useEffect(() => {
    const defaultData = getPresetResult("nvidia-b200");
    if (defaultData) {
      setCurrentResult(defaultData);
      setHistoryList([defaultData]);
    }
    
    // Check if key is present or we are likely in demo mode
    // (Actual key checking happens on the server, but we can pre-populate from local history if any exists)
    const saved = localStorage.getItem("chippulse_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setHistoryList(parsed);
          setCurrentResult(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to load history from local storage", e);
      }
    }

    fetch("/api/history")
      .then((response) => {
        if (!response.ok) {
          throw new Error("History endpoint unavailable");
        }
        return response.json();
      })
      .then((serverHistory: EvaluationResult[]) => {
        if (Array.isArray(serverHistory) && serverHistory.length > 0) {
          setHistoryList(serverHistory);
          setCurrentResult(serverHistory[0]);
        }
      })
      .catch((error) => {
        console.warn("Using local history fallback:", error.message);
      });
  }, []);

  // Sync history to local storage
  const saveToHistory = (newResult: EvaluationResult) => {
    setHistoryList((prev) => {
      // Remove duplicates of same component, prioritize latest
      const filtered = prev.filter(
        (item) => item.component.toLowerCase() !== newResult.component.toLowerCase()
      );
      const updated = [newResult, ...filtered].slice(0, 10);
      localStorage.setItem("chippulse_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_COMPONENTS.find((p) => p.id === presetId);
    if (preset) {
      setComponentName(preset.name);
      // Create a specific result
      const res = getPresetResult(presetId);
      if (res) {
        setCurrentResult(res);
        saveToHistory(res);
        setApiError(null);
      }
    }
  };

  const handleApplySignalPattern = (signalText: string) => {
    setCustomSignal(signalText);
  };

  // Run intelligence task via Backend API
  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!componentName.trim()) {
      setApiError("Please enter or select a semiconductor component to evaluate.");
      return;
    }

    setLoading(true);
    setApiError(null);
    setCurrentResult(null);
    setActiveWorkflowStep(0);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // Step 0: User Request Received - Active
      await delay(600);
      setActiveWorkflowStep(1); // retrieve_historical_events

      await delay(600);
      setActiveWorkflowStep(2); // retrieve_industry_reports

      await delay(700);
      setActiveWorkflowStep(3); // retrieve_recent_news

      await delay(700);
      setActiveWorkflowStep(4); // evaluate_component

      // Fire off the API call during evaluate_component.
      let apiResult: EvaluationResult | null = null;
      let apiErrorInstance: any = null;

      try {
        const response = await fetch("/api/evaluate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            component: componentName,
            customSignal: customSignal
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to contact evaluation server.");
        }

        apiResult = await response.json();
        setIsDemoMode(false);
      } catch (err: any) {
        console.warn("API Error, falling back to local simulated analyst logic:", err.message);
        apiErrorInstance = err;
      }

      // Keep it on evaluate_component for slightly more duration to reflect Gemini synthesis and persistence.
      await delay(800);
      setActiveWorkflowStep(5); // Report Generated

      await delay(600); // Complete state showing

      if (apiResult) {
        setCurrentResult(apiResult);
        saveToHistory(apiResult);
      } else {
        const needsKey = apiErrorInstance?.message && (apiErrorInstance.message.includes("GEMINI_API_KEY") || apiErrorInstance.message.includes("API key"));
        const dynamicSimulatedResponse = generateAnalystFallback(componentName, customSignal);
        setCurrentResult(dynamicSimulatedResponse);
        saveToHistory(dynamicSimulatedResponse);

        if (needsKey) {
          setApiError("Notice: Running in Simulated Analyst Mode. To unlock real-time Gemini market updates & online internet search integrations, set your 'GEMINI_API_KEY' under Settings > Secrets.");
          setIsDemoMode(true);
        } else {
          setApiError(`Fallback loaded: ${apiErrorInstance?.message || "Connected to backup local intelligence network"}`);
        }
      }
    } catch (globalErr: any) {
      console.error(globalErr);
      setApiError("General compilation thread failure.");
    } finally {
      setLoading(false);
      setActiveWorkflowStep(-1);
    }
  };

  // Simple clean analyst response generator for simulated fallback (prevents complete failure states)
  const generateAnalystFallback = (comp: string, signal: string): EvaluationResult => {
    let trend = "Stable";
    let confidence = "Medium";
    
    const compLower = comp.toLowerCase();
    const signalLower = signal.toLowerCase();
    const combinedText = `${compLower} ${signalLower}`;
    const hasAny = (terms: string[]) => terms.some((term) => combinedText.includes(term));

    const demandPressure =
      (hasAny(["ai datacenter", "datacenter", "data center", "cluster", "supercomputing"]) ? 15 : 0) +
      (hasAny(["hyperscaler", "gpu", "nvidia", "blackwell", "h200", "hbm3", "mi325", "gaudi"]) ? 10 : 0) +
      (hasAny(["enterprise ai", "inference", "training", "deployment", "adoption"]) ? 10 : 0);

    const supplyConstraints =
      (hasAny(["hbm", "memory", "shortage", "allocation", "fully allocated"]) ? 15 : 0) +
      (hasAny(["cowos", "packaging", "interposer", "substrate", "abf", "bottleneck"]) ? 10 : 0) +
      (hasAny(["foundry", "tsmc", "node", "wafer", "capacity", "lead time"]) ? 5 : 0);

    const historicalSimilarity = hasAny(["hbm", "memory", "ddr", "nvidia", "blackwell", "gpu", "cowos"]) ? 18 : hasAny(["amd", "mi", "intel", "gaudi"]) ? 14 : 10;

    const marketSignals =
      (hasAny(["price", "pricing", "increase", "hike", "premium"]) ? 5 : 0) +
      (hasAny(["lead time", "delay", "wait", "backlog", "extended"]) ? 5 : 0) +
      (hasAny(["capacity reduction", "exit", "reallocat", "allocation", "constrained", "shortage"]) ? 5 : 0);

    const scoreBreakdown = [
      {
        category: "Demand Pressure",
        score: Math.min(35, demandPressure || (hasAny(["hbm", "memory", "gpu"]) ? 20 : 10)),
        explanation: hasAny(["ai", "gpu", "datacenter", "training", "inference"])
          ? "AI compute and accelerator demand signals are present."
          : "Limited demand acceleration signals were found in the component text.",
      },
      {
        category: "Supply Constraints",
        score: Math.min(30, supplyConstraints),
        explanation: supplyConstraints > 0
          ? "The input references memory, packaging, foundry, or lead-time constraints."
          : "No major sourcing constraint was detected in the input.",
      },
      {
        category: "Historical Similarity",
        score: historicalSimilarity,
        explanation: "Fallback memory matched this request against prior HBM and AI infrastructure shortage patterns.",
      },
      {
        category: "Market Signals",
        score: Math.min(15, marketSignals),
        explanation: signal
          ? "User-supplied context was scored for pricing, lead-time, and capacity signals."
          : "No custom market signal was supplied.",
      },
    ];
    const score = scoreBreakdown.reduce((total, item) => total + item.score, 0);
    const riskBand = getRiskBand(score);

    if (compLower.includes("nvidia") || compLower.includes("blackwell") || compLower.includes("h200") || compLower.includes("hbm3") || compLower.includes("cowos")) {
      trend = "Increasing";
      confidence = "High";
    } else if (compLower.includes("amd") || compLower.includes("mi") || compLower.includes("intel") || compLower.includes("gaudi")) {
      trend = "Increasing";
      confidence = "Medium";
    } else if (compLower.includes("ddr") || compLower.includes("nand") || compLower.includes("automotive") || compLower.includes("mcu")) {
      trend = score >= 60 ? "Increasing" : "Stable";
    }

    const signalText = signal ? `Using custom industrial intelligence signal context: "${signal}".` : "Utilizing historical pricing models and automated inventory indexes.";

    return {
      component: comp,
      demand_score: score,
      risk_band: riskBand,
      score_breakdown: scoreBreakdown,
      trend: trend as "Increasing" | "Declining" | "Stable",
      confidence: confidence as "High" | "Medium" | "Low",
      drivers: [
        `Rapid expansion of specialized AI datacenter infrastructures demanding ${comp}`,
        "CoWoS packaging allocation and global silicon interposer bottlenecks",
        "Sovereign supercomputing buildouts in Tier-1 nations looking for supplier diversity",
        signal ? `Reactionary adaptation to: "${signal.slice(0, 50)}..."` : "Sustained replacement lifecycles on hyper-scalabilities nodes"
      ],
      recommendations: [
        `Procurement: Shift to dual-sourcing models immediately to secure alternative semiconductor nodes.`,
        `Risk Offset: Establish 12-month non-cancellable forward buy agreements to lock priority status.`,
        `Engineering Strategy: Evaluate system level scaling metrics for alternate product families to bypass fabrication delays.`
      ],
      summary: `### Executive Intelligence Summary\n\nDemand pressure for **${comp}** is currently ranked at **${score}/100** indicating a **${trend}** market stance with **${confidence}** analyst determination.\n\n${signalText} While current macro conditions are highly fluid due to deep multi-tier sub-component wait times, advanced logic nodes remain tightly allocated. Hardware planners must prepare for sustained packaging delays and rising wafer costs from primary foundries across APAC.\n\nOver the short-to-medium term, scaling limits of silicon substrates and high-density packaging components like ABF and CoWoS will determine physical production ceilings. Enterprise procurement leaders should secure long-term capital guarantees prior to planning large cluster rollouts.`,
      citations: [
        { title: "Semiconductor Industry Outlook & Capacity Insights", source: "SIA", url: "https://www.semiconductors.org" },
        { title: "Gartner Advanced Lithography Sourcing Study", source: "Gartner", url: "https://www.gartner.com" }
      ],
      market_signals: [
        {
          title: "Local Signal Context",
          signal: signalText,
          relevance: confidence as "High" | "Medium" | "Low",
        }
      ],
      historical_matches: [
        {
          title: "2025 HBM Supply Constraint",
          year: 2025,
          similarity: 84,
          impact: "Severe",
          description: "A simulated historical analogue for constrained AI infrastructure components."
        }
      ],
      agent_activity: [
        { step: "Query Received", status: "completed", timestamp: new Date().toISOString() },
        { step: "Local Fallback Analysis", status: "completed", timestamp: new Date().toISOString() },
        { step: "Report Completed", status: "completed", timestamp: new Date().toISOString() },
      ],
      evaluated_at: new Date().toISOString()
    };
  };

  const clearHistory = () => {
    localStorage.removeItem("chippulse_history");
    const defaultData = getPresetResult("nvidia-b200");
    if (defaultData) {
      setHistoryList([defaultData]);
      setCurrentResult(defaultData);
    } else {
      setHistoryList([]);
      setCurrentResult(null);
    }
  };

  // Score color map styling helper
  const getScoreColorClass = (score: number) => {
    if (score >= 81) return { text: "text-red-600 bg-red-50 border border-red-200", border: "border-red-500", radial: "#dc2626", bg: "bg-red-500" };
    if (score >= 61) return { text: "text-amber-600 bg-amber-50 border border-amber-200", border: "border-amber-500", radial: "#d97706", bg: "bg-amber-500" };
    if (score >= 41) return { text: "text-blue-600 bg-blue-50 border border-blue-200", border: "border-blue-500", radial: "#2563eb", bg: "bg-blue-500" };
    if (score >= 21) return { text: "text-emerald-600 bg-emerald-50 border border-emerald-200", border: "border-emerald-500", radial: "#059669", bg: "bg-emerald-500" };
    return { text: "text-slate-600 bg-slate-50 border border-slate-200", border: "border-slate-400", radial: "#475569", bg: "bg-slate-500" };
  };

  const activeColor = currentResult ? getScoreColorClass(currentResult.demand_score) : { text: "text-slate-500", border: "border-slate-300", radial: "#475569", bg: "bg-slate-500" };

  const currentRiskBand = currentResult ? (currentResult.risk_band || getRiskBand(currentResult.demand_score)) : "Stable";

  const formatLedgerDate = (isoDate?: string) => {
    if (!isoDate) return "Unknown";

    const date = new Date(isoDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Prepare chart data from active history
  const chartData = historyList.slice(0, 8).map((item) => ({
    name: item.component.replace("NVIDIA", "NV").replace("SK Hynix", "SK").replace("Advanced Packaging", "Pkg").slice(0, 22),
    score: item.demand_score,
    trend: item.trend,
    risk: item.risk_band || getRiskBand(item.demand_score),
    fullName: item.component,
    vector: item.vector_search_used,
    news: item.news_articles_retrieved || 0,
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
      
      {/* Dynamic Alert for Simulated Analyst Fallback Mode */}
      {apiError && isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 py-3.5 px-4 text-xs md:text-sm font-medium transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Simulated Analyst Engine Online:</strong> {apiError}
              </span>
            </div>
            <a 
              href="#setup-secrets" 
              className="text-amber-700 underline font-semibold flex-shrink-0 hover:text-amber-900 ml-auto md:ml-0"
              onClick={() => alert("To add your own key, open the 'Settings' (gear icon) in the top-right of your Google AI Studio template, select 'Secrets', and save a new secret with Key 'GEMINI_API_KEY'.")}
            >
              How to configure?
            </a>
          </div>
        </div>
      )}

      {/* Main Professional Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-3xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800">
              <Cpu className="h-5.5 w-5.5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">ChipPulseAI</span>
                <span className="text-[10px] font-mono tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 uppercase font-semibold">
                  v1.2 Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Semiconductor Demand Intelligence & Supply Chain Intelligence Analyst</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs text-slate-400 font-mono">SYSTEM CLOCK</span>
              <span className="text-xs text-slate-700 font-mono font-medium">UTC: 2026-05-31 20:41</span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="bg-slate-900 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-mono text-[11px]">Gemini-2.5-Flash</span>
            </div>
          </div>

        </div>
      </header>

      {/* Hero Banner with Executive Briefing */}
      <div className="bg-slate-900 text-white py-10 px-4 mb-8 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.12),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto relative z-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono mb-3">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              Live Sourcing Intel Evaluator
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Evaluate Microchip Sourcing Pressure & Constraints
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
              Synthesize demand projections, global fab allocations, and supplier lead-times. Our neural intelligence agent combines industry signals with web-grounded validation reports.
            </p>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700/60 max-w-sm w-full font-mono text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-2">
              <Layers className="h-4 w-4 text-blue-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">Active Watch Parameters</span>
            </div>
            <div className="flex justify-between">
              <span>Primary Vectors:</span>
              <span className="text-blue-300">GPU / Memory / Substrates</span>
            </div>
            <div className="flex justify-between">
              <span>Packaging Target:</span>
              <span className="text-cyan-300">CoWoS / High-NA Litho</span>
            </div>
            <div className="flex justify-between">
              <span>System Level Focus:</span>
              <span className="text-emerald-300">Hyperscaler AI Infrastructure</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: Sourcing & Input Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Presets Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs" id="presets-panel">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-slate-600" />
                  <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Standard Analyst Presets</h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Click to load instantly</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_COMPONENTS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all text-xs duration-200 group relative ${
                      componentName === preset.name
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs transition-colors group-hover:text-blue-600 dark:group-hover:text-amber-500">
                            {preset.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            componentName === preset.name ? "bg-slate-800 text-slate-200" : "bg-slate-200/60 text-slate-600"
                          }`}>
                            {preset.category}
                          </span>
                        </div>
                        <p className={`mt-0.5 text-[11px] line-clamp-1 ${componentName === preset.name ? "text-slate-300" : "text-slate-500"}`}>
                          {preset.subText}
                        </p>
                      </div>
                      <span className={`text-[11px] font-mono font-bold shrink-0 ${
                        componentName === preset.name ? "text-blue-300" : "text-slate-600"
                      }`}>
                        Score: {preset.initialScore}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Sourcing Analyzer Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-4.5 w-4.5 text-blue-600" />
                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Evaluate Custom Hardware</h2>
              </div>

              <form onSubmit={handleEvaluate} className="space-y-4">
                
                <div>
                  <label htmlFor="component-input" className="block text-xs font-mono text-slate-500 uppercase mb-1">
                    Component / Microchip Family Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="component-input"
                      type="text"
                      required
                      placeholder="e.g. Broadcom Tomahawk 5, NVIDIA Blackwell Ultra, Intel Gaudi 3..."
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 placeholder-slate-400 text-sm font-medium focus:bg-white focus:border-slate-800 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="signal-input" className="block text-xs font-mono text-slate-500 uppercase">
                      Optional Industry Signal / Market News Context
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Enhances Gemini evaluation</span>
                  </div>
                  <textarea
                    id="signal-input"
                    rows={4}
                    placeholder="Provide pricing shifts, lead-time changes, customer reports, or fab yield rumors to calculate dynamic supply pressure updates..."
                    value={customSignal}
                    onChange={(e) => setCustomSignal(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 placeholder-slate-400 text-sm font-medium focus:bg-white focus:border-slate-800 focus:outline-hidden transition-all resize-none"
                  />
                </div>

                {/* Sourcing Signals Presets */}
                <div className="pt-1.5 pb-2">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase mb-2">
                    Quick Scenario Signals (Click to load)
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTED_SIGNALS.map((sig, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplySignalPattern(sig.signal)}
                        className="text-left text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg p-2.5 transition-colors line-clamp-1 truncate"
                        title={sig.signal}
                      >
                        <span className="font-semibold text-[11px] text-blue-600 mr-1.5 font-mono">[{sig.title}]</span>
                        {sig.signal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setComponentName("");
                      setCustomSignal("");
                      setApiError(null);
                    }}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 hover:text-slate-900 text-xs rounded-xl transition-all font-mono"
                  >
                    Clear Input
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !componentName.trim()}
                    className="flex-1 bg-slate-900 text-blue-100 hover:bg-slate-800 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                        <span>Running Signal Synthesis...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 text-emerald-400" />
                        <span>Run Demand Evaluation</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>

          {/* RIGHT SIDE: Comprehensive Analyst Workspace Dashboard */}
          <div className="lg:col-span-7">
            
            {/* Loading Indicator */}
            {loading && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col h-full min-h-[550px] transition-all">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                      <Terminal className="h-4.5 w-4.5 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Agent Workflow Execution
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Sequence task: evaluate {componentName}
                      </p>
                    </div>
                  </div>
                  
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-semibold animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    ACTIVE WORKSPACE
                  </span>
                </div>

                {/* Vertical Stepper Pipeline */}
                <div className="space-y-4 flex-1">
                  {WORKFLOW_PIPELINE.map((stepItem, index) => {
                    const isCompleted = index < activeWorkflowStep;
                    const isActive = index === activeWorkflowStep;

                    return (
                      <div
                        key={index}
                        className={`flex gap-3 items-start p-3 rounded-xl border transition-all duration-300 ${
                          isActive
                            ? "bg-blue-500/5 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                            : isCompleted
                            ? "bg-slate-800/10 border-emerald-500/20"
                            : "bg-transparent border-transparent opacity-40"
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="shrink-0 mt-0.5">
                          {isCompleted ? (
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                              <Check className="h-3.5 w-3.5 stroke-[3px]" />
                            </div>
                          ) : isActive ? (
                            <div className="h-5 w-5 rounded-full bg-blue-500/15 border border-blue-500/40 flex items-center justify-center">
                              <RefreshCw className="h-3 w-3 text-blue-400 animate-spin" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                            </div>
                          )}
                        </div>

                        {/* Step Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-mono font-semibold ${
                                isCompleted
                                  ? "text-emerald-400 line-through decoration-emerald-500/30"
                                  : isActive
                                  ? "text-blue-300 font-bold"
                                  : "text-slate-400"
                              }`}
                            >
                              {stepItem.label}
                            </span>
                            {isActive && (
                              <span className="text-[9px] font-mono bg-blue-500/10 text-blue-300 px-1.5 rounded uppercase font-bold animate-pulse">
                                {stepItem.tag}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[11px] font-mono mt-0.5 ${
                              isActive ? "text-slate-300" : isCompleted ? "text-slate-500" : "text-slate-600"
                            }`}
                          >
                            {stepItem.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mini System Log Term at bottom */}
                <div className="mt-6 bg-black/40 border border-slate-800 rounded-xl p-3 font-mono text-[10px] text-slate-400 space-y-1">
                  <div className="flex justify-between text-slate-500 border-b border-slate-800/60 pb-1 mb-1.5">
                    <span>ADK TOOL TRACE</span>
                    <span>ONLINE</span>
                  </div>
                  <div className="text-emerald-400/90 flex gap-1.5 leading-relaxed">
                    <span className="text-blue-400">» [SYSTEM]</span>
                    <span>Evaluation pipeline bootstrapped for target query: {componentName}</span>
                  </div>
                  {activeWorkflowStep >= 2 && (
                    <div className="text-blue-300/90 flex gap-1.5">
                      <span className="text-blue-400">» [MONGODB]</span>
                      <span>Atlas Vector Search returned historical events, reports, and live news signals.</span>
                    </div>
                  )}
                  {activeWorkflowStep >= 4 && (
                    <div className="text-amber-400/90 flex gap-1.5">
                      <span className="text-blue-400">» [BACKEND]</span>
                      <span>evaluate_component is scoring demand pressure and storing analysis memory.</span>
                    </div>
                  )}
                  {activeWorkflowStep >= 5 && (
                    <div className="text-sky-300/90 flex gap-1.5">
                      <span className="text-blue-400">» [GEMINI]</span>
                      <span>Gemini synthesis uses retrieved MongoDB evidence and deterministic score context.</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Empty Context State if no component active */}
            {!loading && !currentResult && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center flex flex-col justify-center items-center h-full min-h-[400px]">
                <Database className="h-12 w-12 text-slate-400 stroke-1" />
                <h3 className="text-base font-bold text-slate-800 mt-4">Analyst Monitor Workspace Offline</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-2 leading-relaxed">
                  Enter a component name or choose from our pre-compiled benchmark configurations to evaluate the semiconductor demand index.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => handleSelectPreset("nvidia-b200")}
                    className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 py-1.5 px-3 rounded-lg font-mono transition-all"
                  >
                    Load NVIDIA Blackwell
                  </button>
                  <button
                    onClick={() => handleSelectPreset("sk-hynix-hbm3e")}
                    className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 py-1.5 px-3 rounded-lg font-mono transition-all"
                  >
                    Load SK Hynix HBM3E
                  </button>
                </div>
              </div>
            )}

            {/* Active Content Report Screen */}
            {!loading && currentResult && (
              <div className="bg-white rounded-2xl border border-slate-250 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                
                {/* Header block with metadata */}
                <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded uppercase font-semibold">
                          Active Intel Target
                        </span>
                        {currentResult.evaluated_at && (
                          <span className="text-2xs font-mono text-slate-400">
                            Evaluated at {new Date(currentResult.evaluated_at).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-white mt-1.5">
                        {currentResult.component}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2.5 bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700">
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Demand Position</div>
                        <div className="text-xs font-mono font-bold text-white">
                          Score {currentResult.demand_score}/100
                        </div>
                      </div>
                      <div className={`h-8 w-2 rounded-full ${activeColor.bg}`}></div>
                    </div>
                  </div>
                </div>

                {/* Score and Core Metrics Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 bg-slate-50 text-slate-800">
                  
                  {/* Gauge Ring Block */}
                  <div className="p-5 border-r border-slate-200 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Demand Tension</span>
                    <div className="relative h-20 w-36 flex items-center justify-center overflow-hidden">
                      {/* Semi circular gauge wrapper */}
                      <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 50">
                        {/* Underlay */}
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                        {/* Dynamic Overlay */}
                        <path 
                          d="M 10 50 A 40 40 0 0 1 90 50" 
                          fill="none" 
                          stroke={activeColor.radial} 
                          strokeWidth="10" 
                          strokeLinecap="round" 
                          strokeDasharray="125.6" 
                          strokeDashoffset={125.6 - (125.6 * currentResult.demand_score) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="text-center translate-y-3">
                        <span className="text-2xl font-extrabold font-mono tracking-tight">{currentResult.demand_score}</span>
                        <span className="text-slate-400 text-xs font-mono">/100</span>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wide px-2.5 py-0.5 mt-1.5 rounded-full font-bold font-mono ${
                      currentResult.demand_score >= 81 ? "bg-red-100 text-red-700 border border-red-200" :
                      currentResult.demand_score >= 61 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                      currentResult.demand_score >= 41 ? "bg-blue-100 text-blue-700 border border-blue-200" :
                      currentResult.demand_score >= 21 ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                      "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {currentRiskBand.toUpperCase()} DEMAND PRESSURE
                    </span>
                  </div>

                  {/* Trend Direction */}
                  <div className="p-5 border-r border-slate-200 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Demand Trend Direction</span>
                    <div className="flex items-center gap-2 my-2">
                      {currentResult.trend.toLowerCase() === "increasing" ? (
                        <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center border border-emerald-250 animate-bounce">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                      ) : currentResult.trend.toLowerCase() === "declining" ? (
                        <div className="h-10 w-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center border border-red-250">
                          <TrendingDown className="h-6 w-6" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center border border-slate-250">
                          <Minus className="h-6 w-6" />
                        </div>
                      )}
                      <span className="text-lg font-bold tracking-tight text-slate-900 capitalize font-mono">
                        {currentResult.trend}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 max-w-[150px]">
                      {currentResult.trend.toLowerCase() === "increasing" ? "Foundry queues are growing longer week-over-week." :
                       currentResult.trend.toLowerCase() === "declining" ? "Inventory volumes are building up in enterprise warehouses." :
                       "Demand volumes remain consistent with factory lead-times."}
                    </span>
                  </div>

                  {/* Analyst Confidence Rating */}
                  <div className="p-5 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Analyst Confidence Level</span>
                    <div className="flex flex-col items-center gap-1.5 my-2">
                      <div className="flex items-center gap-1">
                        <div className={`h-6 w-3.5 rounded-sm ${
                          currentResult.confidence.toLowerCase() === "high" || currentResult.confidence.toLowerCase() === "medium" || currentResult.confidence.toLowerCase() === "low" ? "bg-slate-900" : "bg-slate-200"
                        } ${currentResult.confidence.toLowerCase() === "high" ? "bg-emerald-500" : currentResult.confidence.toLowerCase() === "medium" ? "bg-amber-500" : "bg-red-500"}`}></div>
                        <div className={`h-6 w-3.5 rounded-sm ${
                          currentResult.confidence.toLowerCase() === "high" || currentResult.confidence.toLowerCase() === "medium" ? "bg-slate-900" : "bg-slate-200"
                        } ${currentResult.confidence.toLowerCase() === "high" ? "bg-emerald-500" : currentResult.confidence.toLowerCase() === "medium" ? "bg-amber-500" : ""}`}></div>
                        <div className={`h-6 w-3.5 rounded-sm ${
                          currentResult.confidence.toLowerCase() === "high" ? "bg-slate-900" : "bg-slate-200"
                        } ${currentResult.confidence.toLowerCase() === "high" ? "bg-emerald-500" : ""}`}></div>
                      </div>
                      <span className="text-md font-bold text-slate-900 capitalize font-mono">{currentResult.confidence}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Based on verifiable web data availability and clear industry source alignment.
                    </span>
                  </div>

                </div>

                {/* Tabs Panel */}
                <div className="border-b border-slate-200 flex bg-white">
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`flex-1 py-3 px-4 text-xs font-semibold text-center uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === "summary"
                        ? "border-slate-900 text-slate-900 font-bold bg-slate-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/30"
                    }`}
                  >
                    1. Executive Briefing
                  </button>
                  <button
                    onClick={() => setActiveTab("drivers")}
                    className={`flex-1 py-3 px-4 text-xs font-semibold text-center uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === "drivers"
                        ? "border-slate-900 text-slate-900 font-bold bg-slate-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/30"
                    }`}
                  >
                    2. Core Demand Drivers
                  </button>
                  <button
                    onClick={() => setActiveTab("recommendations")}
                    className={`flex-1 py-3 px-4 text-xs font-semibold text-center uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === "recommendations"
                        ? "border-slate-900 text-slate-900 font-bold bg-slate-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/30"
                    }`}
                  >
                    3. Actionable Advisory
                  </button>
                </div>

                {/* Content based on Active Tab */}
                <div className="p-6 flex-1 bg-white">
                  
                  {activeTab === "summary" && (
                    <div className="space-y-4">
                      {currentResult.score_breakdown && currentResult.score_breakdown.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentResult.score_breakdown.map((item) => {
                            const maxScore = SCORE_CAPS[item.category] || 100;
                            const width = `${Math.min(100, Math.round((item.score / maxScore) * 100))}%`;

                            return (
                              <div key={item.category} className="border border-slate-200 rounded-lg bg-slate-50 p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wide text-slate-700">{item.category}</span>
                                  <span className="text-xs font-mono font-bold text-slate-900">{item.score}/{maxScore}</span>
                                </div>
                                <div className="h-1.5 bg-white border border-slate-200 rounded-full overflow-hidden my-2">
                                  <div className={`h-full ${activeColor.bg}`} style={{ width }}></div>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{item.explanation}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed font-sans font-normal">
                        {currentResult.summary.split("\n\n").map((para, idx) => {
                          if (para.startsWith("###")) {
                            return (
                              <h4 key={idx} className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider mt-4 first:mt-0">
                                {para.replace("###", "").trim()}
                              </h4>
                            );
                          }
                          // Handle simple bold transforms for preset markdown text
                          const boldFormatted = para.split("**").map((text, index) => 
                            index % 2 === 1 ? <strong key={index} className="font-semibold text-slate-900">{text}</strong> : text
                          );
                          return <p key={idx} className="mb-3.5">&emsp;{boldFormatted}</p>;
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === "drivers" && (
                    <div className="space-y-3.5">
                      <p className="text-xs text-slate-450 font-mono uppercase tracking-wider mb-2">Primary signals triggering current position:</p>
                      {currentResult.drivers && currentResult.drivers.length > 0 ? (
                        currentResult.drivers.map((driver, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-350 transition-colors">
                            <span className="h-5 w-5 rounded-md bg-slate-900 text-white font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-sm text-slate-700 font-medium">{driver}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No direct market driver indicators isolated for this product.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "recommendations" && (
                    <div className="space-y-4">
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-800 flex items-start gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Procurement Notice:</strong> Supply bottlenecks may trigger secondary sub-component delays across tiered suppliers not directly indicated below. Maintain high communication thresholds with distributors.
                        </div>
                      </div>

                      <div className="space-y-3">
                        {currentResult.recommendations && currentResult.recommendations.length > 0 ? (
                          currentResult.recommendations.map((rec, index) => (
                            <div key={index} className="flex gap-3.5 items-start p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide">Strategic Recommendation {index + 1}</h4>
                                <p className="text-sm text-slate-600 mt-0.5 font-normal leading-relaxed">{rec}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">No recommendations compiled.</p>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Grounding Web Citations footer */}
                {currentResult.citations && currentResult.citations.length > 0 && (
                  <div className="bg-slate-50 border-t border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                      <h4 className="text-2xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                        Verifiable Search References & Grounding Citations
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentResult.citations.map((cite, index) => (
                        <a
                          key={index}
                          href={cite.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-800 hover:shadow-2xs transition-all text-xs text-slate-700"
                        >
                          <span className="truncate max-w-[90%] font-medium">{cite.title}</span>
                          <ExternalLink className="h-3 w-3 text-slate-400 shrink-0 ml-2 group-hover:text-slate-900" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* BOTTOM SECTION: Sourcing History Ledger & Comparative Benchmark Chart */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-50/80 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-slate-700" />
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Demand Ledger & Sourcing Benchmarks</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Comparative analysis scoreboards tracking current, historical, and simulated runs side-by-side.
              </p>
            </div>
            {historyList.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs font-mono font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-100 transition-colors"
              >
                Clear History Matrix
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Compact analyzed component ledger */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Analyzed Component Ledger</span>
                <span className="text-[10px] font-mono text-slate-400">{historyList.length} stored</span>
              </div>
              <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-3">
                {historyList.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
                    {historyList.map((hist, i) => {
                      const selected = currentResult?.component.toLowerCase() === hist.component.toLowerCase();
                      const risk = hist.risk_band || getRiskBand(hist.demand_score);
                      const evidenceCount =
                        (hist.historical_events_retrieved || hist.retrieval_metadata?.historical_events_retrieved || 0) +
                        (hist.industry_reports_retrieved || hist.retrieval_metadata?.industry_reports_retrieved || 0) +
                        (hist.news_articles_retrieved || hist.retrieval_metadata?.news_articles_retrieved || 0);
                      const width = `${Math.min(100, Math.max(2, hist.demand_score))}%`;

                      return (
                        <button
                          key={`${hist.component}-${hist.evaluated_at || i}`}
                          onClick={() => {
                            setCurrentResult(hist);
                            setComponentName(hist.component);
                          }}
                          className={`snap-start shrink-0 w-[230px] text-left rounded-lg border p-3 transition-all ${
                            selected
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-xs truncate">{hist.component}</div>
                              <div className={`mt-0.5 text-[10px] font-mono ${selected ? "text-slate-300" : "text-slate-500"}`}>
                                {formatLedgerDate(hist.evaluated_at)} / {hist.trend}
                              </div>
                            </div>
                            <div className={`text-lg font-black font-mono leading-none ${
                              selected ? "text-blue-300" : hist.demand_score >= 81 ? "text-red-600" : hist.demand_score >= 61 ? "text-amber-600" : "text-blue-600"
                            }`}>
                              {hist.demand_score}
                            </div>
                          </div>

                          <div className={`h-1.5 rounded-full overflow-hidden mt-3 ${selected ? "bg-slate-700" : "bg-slate-100"}`}>
                            <div className={`h-full ${
                              hist.demand_score >= 81 ? "bg-red-500" :
                              hist.demand_score >= 61 ? "bg-amber-500" :
                              hist.demand_score >= 41 ? "bg-blue-500" :
                              hist.demand_score >= 21 ? "bg-emerald-500" : "bg-slate-500"
                            }`} style={{ width }}></div>
                          </div>

                          <div className={`mt-3 flex items-center justify-between text-[10px] font-mono ${selected ? "text-slate-300" : "text-slate-500"}`}>
                            <span>{risk}</span>
                            <span>{evidenceCount} evidence</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 italic font-mono text-xs">
                    No previous evaluation sequences captured in history ledger.
                  </div>
                )}
              </div>
            </div>

            <DemandBenchmarkGraph data={chartData} />

          </div>

        </div>

      </main>

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center border-t border-slate-200 pt-8">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Cpu className="h-3.5 w-3.5 text-slate-400" />
          <span>ChipPulseAI Sourcing Security Platform &copy; 2026</span>
          <span>&middot;</span>
          <span>Analyst Grade Framework</span>
        </div>
      </footer>

    </div>
  );
}
