const SCORE_CAPS = {
  demandPressure: 35,
  supplyConstraints: 30,
  historicalSimilarity: 20,
  marketSignals: 15,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function addUnique(reasons, reason) {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

function scoreDemandPressure(component, customSignal, industryReports) {
  const text = `${component} ${customSignal} ${industryReports.map((report) => `${report.title} ${report.summary}`).join(" ")}`.toLowerCase();
  let score = 0;
  const reasons = [];

  if (includesAny(text, ["ai datacenter", "data center", "datacenter", "cluster", "supercomputing", "sovereign"])) {
    score += 15;
    addUnique(reasons, "AI datacenter expansion is increasing demand.");
  }

  if (includesAny(text, ["hyperscaler", "gpu buying", "gpu procurement", "nvidia", "blackwell", "h100", "h200", "b200", "mi325", "gaudi"])) {
    score += 10;
    addUnique(reasons, "Hyperscaler and accelerator procurement pressure is present.");
  }

  if (includesAny(text, ["enterprise ai", "production ai", "inference", "training", "deployment", "adoption"])) {
    score += 10;
    addUnique(reasons, "Enterprise AI adoption is contributing to demand.");
  }

  if (includesAny(text, ["hbm", "ddr5", "memory", "gpu"]) && score < 20) {
    score += 8;
    addUnique(reasons, "The component is exposed to AI compute demand.");
  }

  return {
    category: "Demand Pressure",
    score: clamp(score, 0, SCORE_CAPS.demandPressure),
    explanation: reasons.length > 0 ? reasons.join(" ") : "No strong demand acceleration signals were found.",
  };
}

function scoreSupplyConstraints(component, customSignal, industryReports) {
  const text = `${component} ${customSignal} ${industryReports.map((report) => `${report.title} ${report.summary}`).join(" ")}`.toLowerCase();
  let score = 0;
  const reasons = [];

  if (includesAny(text, ["hbm shortage", "hbm", "memory shortage", "allocation", "fully allocated", "shortage"])) {
    score += 15;
    addUnique(reasons, "HBM or memory allocation constraints are present.");
  }

  if (includesAny(text, ["cowos", "packaging", "interposer", "substrate", "abf", "bottleneck"])) {
    score += 10;
    addUnique(reasons, "Advanced packaging or substrate bottlenecks limit supply.");
  }

  if (includesAny(text, ["foundry", "tsmc", "samsung foundry", "node", "wafer", "capacity", "lead time"])) {
    score += 5;
    addUnique(reasons, "Foundry allocation or wafer capacity is constrained.");
  }

  return {
    category: "Supply Constraints",
    score: clamp(score, 0, SCORE_CAPS.supplyConstraints),
    explanation: reasons.length > 0 ? reasons.join(" ") : "No major sourcing constraint was detected.",
  };
}

function scoreHistoricalSimilarity(historicalMatches) {
  if (!historicalMatches || historicalMatches.length === 0) {
    return {
      category: "Historical Similarity",
      score: 0,
      explanation: "No MongoDB historical match was available for this component.",
    };
  }

  const similarityValues = historicalMatches.map((match) => {
    if (typeof match.score === "number") {
      return match.score;
    }

    return (match.similarity || 0) / 100;
  });
  const avgSimilarity = similarityValues.reduce((sum, value) => sum + value, 0) / similarityValues.length;
  const score = clamp(Math.round(avgSimilarity * SCORE_CAPS.historicalSimilarity), 0, SCORE_CAPS.historicalSimilarity);
  const topMatches = historicalMatches
    .slice(0, 2)
    .map((match) => `${match.title} (${match.similarity}%)`)
    .join("; ");

  return {
    category: "Historical Similarity",
    score,
    explanation: `MongoDB memory matched prior events: ${topMatches}. Average similarity drove ${score}/${SCORE_CAPS.historicalSimilarity} points.`,
  };
}

function scoreMarketSignals(customSignal, newsArticles = []) {
  const text = `${customSignal} ${newsArticles.map((article) => `${article.title} ${article.summary}`).join(" ")}`.toLowerCase();
  let score = 0;
  const reasons = [];

  if (includesAny(text, ["price", "pricing", "increase", "hike", "premium"])) {
    score += 5;
    addUnique(reasons, "User signal mentions pricing pressure.");
  }

  if (includesAny(text, ["lead time", "delay", "wait", "backlog", "extended"])) {
    score += 5;
    addUnique(reasons, "User signal mentions lead-time expansion.");
  }

  if (includesAny(text, ["capacity reduction", "cut", "exit", "reallocat", "allocation", "constrained", "shortage"])) {
    score += 5;
    addUnique(reasons, "User signal mentions capacity or allocation risk.");
  }

  return {
    category: "Market Signals",
    score: clamp(score, 0, SCORE_CAPS.marketSignals),
      explanation: reasons.length > 0 ? reasons.join(" ") : "No pricing, lead-time, capacity, or news signal was detected.",
  };
}

function getRiskBand(score) {
  if (score <= 20) return "Stable";
  if (score <= 40) return "Watch";
  if (score <= 60) return "Elevated";
  if (score <= 80) return "High";
  return "Critical";
}

function calculateDemandScore({ component, customSignal = "", historicalMatches = [], industryReports = [], newsArticles = [] }) {
  const scoreBreakdown = [
    scoreDemandPressure(component, customSignal, industryReports),
    scoreSupplyConstraints(component, customSignal, industryReports),
    scoreHistoricalSimilarity(historicalMatches),
    scoreMarketSignals(customSignal, newsArticles),
  ];
  const score = clamp(scoreBreakdown.reduce((total, item) => total + item.score, 0), 0, 100);

  return {
    score,
    risk_band: getRiskBand(score),
    score_breakdown: scoreBreakdown,
  };
}

module.exports = {
  SCORE_CAPS,
  calculateDemandScore,
  getRiskBand,
};
