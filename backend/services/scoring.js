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

function countMatches(text, terms) {
  return terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
}

function removePhrases(text, phrases) {
  return phrases.reduce((cleaned, phrase) => cleaned.replaceAll(phrase, " "), text);
}

function classifySupplyAvailability(component = "", customSignal = "") {
  const componentText = component.toLowerCase();
  const signalText = customSignal.toLowerCase();
  const negatedScarcityTerms = [
    "no shortage",
    "no major allocation",
    "no allocation",
    "no allocation reports",
    "no major allocation reports",
    "no lead time issue",
    "no lead-time issue",
    "no major constraints",
    "no supply issue",
  ];
  const availabilityTerms = [
    "multiple vendors",
    "multi vendor",
    "multi-vendor",
    "second source",
    "dual source",
    "broad distributor inventory",
    "distributor inventory",
    "in stock",
    "readily available",
    "widely available",
    "stable pricing",
    "price stable",
    "mature node",
    "commodity",
    "standard lead time",
    "normal lead time",
    "short lead time",
    ...negatedScarcityTerms,
  ];
  const scarcityTerms = [
    "shortage",
    "allocation",
    "fully allocated",
    "sold out",
    "backlog",
    "extended lead time",
    "lead time expansion",
    "lead-time expansion",
    "price hike",
    "pricing pressure",
    "capacity constrained",
    "capacity constraint",
    "supply issue",
    "single source",
  ];
  const strategicScarcityTerms = [
    "hbm",
    "cowos",
    "blackwell",
    "h100",
    "h200",
    "b200",
    "mi325",
    "advanced packaging",
    "interposer",
    "abf substrate",
  ];

  const availabilityEvidenceCount = countMatches(signalText, availabilityTerms);
  const negatedScarcityCount = countMatches(signalText, negatedScarcityTerms);
  const rawScarcityCount = countMatches(signalText, scarcityTerms);
  const scarcityEvidenceCount = Math.max(0, rawScarcityCount - negatedScarcityCount);
  const strategicScarcity = includesAny(componentText, strategicScarcityTerms);

  let status = "Unknown";
  if (scarcityEvidenceCount > availabilityEvidenceCount) {
    status = "Supply Issue";
  } else if (availabilityEvidenceCount >= 3 && !strategicScarcity) {
    status = "Widely Available";
  } else if (availabilityEvidenceCount > scarcityEvidenceCount) {
    status = "Available";
  }

  return {
    status,
    availability_evidence_count: availabilityEvidenceCount,
    scarcity_evidence_count: scarcityEvidenceCount,
    strategic_scarcity_component: strategicScarcity,
  };
}

function applyAvailabilityAdjustment(score, reasons, availabilityAssessment, caps) {
  if (availabilityAssessment.status === "Widely Available") {
    addUnique(reasons, "User supplied strong availability evidence, so scarcity-driven scoring was capped.");
    return Math.min(score, caps.widelyAvailable);
  }

  if (availabilityAssessment.status === "Available") {
    addUnique(reasons, "User supplied availability evidence that partially offsets scarcity risk.");
    return Math.min(score, caps.available);
  }

  return score;
}

function scoreDemandPressure(component, customSignal, industryReports, availabilityAssessment) {
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

  score = applyAvailabilityAdjustment(score, reasons, availabilityAssessment, {
    available: 18,
    widelyAvailable: 10,
  });

  return {
    category: "Demand Pressure",
    score: clamp(score, 0, SCORE_CAPS.demandPressure),
    explanation: reasons.length > 0 ? reasons.join(" ") : "No strong demand acceleration signals were found.",
  };
}

function scoreSupplyConstraints(component, customSignal, industryReports, availabilityAssessment) {
  const rawText = `${component} ${customSignal} ${industryReports.map((report) => `${report.title} ${report.summary}`).join(" ")}`.toLowerCase();
  const text = removePhrases(rawText, [
    "no shortage",
    "no major allocation",
    "no allocation",
    "no allocation reports",
    "no major allocation reports",
    "no lead time issue",
    "no lead-time issue",
    "no major constraints",
    "no supply issue",
    "mature node",
    "normal lead time",
    "standard lead time",
    "short lead time",
  ]);
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

  score = applyAvailabilityAdjustment(score, reasons, availabilityAssessment, {
    available: 14,
    widelyAvailable: 6,
  });

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

function scoreMarketSignals(customSignal, newsArticles = [], availabilityAssessment) {
  const rawText = `${customSignal} ${newsArticles.map((article) => `${article.title} ${article.summary}`).join(" ")}`.toLowerCase();
  const text = removePhrases(rawText, [
    "stable pricing",
    "price stable",
    "no shortage",
    "no major allocation",
    "no allocation",
    "no allocation reports",
    "no major allocation reports",
    "no lead time issue",
    "no lead-time issue",
    "no major constraints",
    "no supply issue",
  ]);
  let score = 0;
  const reasons = [];

  if (includesAny(text, ["price increase", "pricing pressure", "price hike", "hike", "premium"])) {
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

  if (availabilityAssessment.status === "Widely Available") {
    score = Math.min(score, 2);
    addUnique(reasons, "User signal indicates broad availability, stable pricing, or normal lead times.");
  } else if (availabilityAssessment.status === "Available") {
    score = Math.min(score, 5);
    addUnique(reasons, "User signal includes availability evidence that reduces market-signal risk.");
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
  const availabilityAssessment = classifySupplyAvailability(component, customSignal);
  const scoreBreakdown = [
    scoreDemandPressure(component, customSignal, industryReports, availabilityAssessment),
    scoreSupplyConstraints(component, customSignal, industryReports, availabilityAssessment),
    scoreHistoricalSimilarity(historicalMatches),
    scoreMarketSignals(customSignal, newsArticles, availabilityAssessment),
  ];
  const rawScore = scoreBreakdown.reduce((total, item) => total + item.score, 0);
  const scoreCap = availabilityAssessment.status === "Widely Available" ? 35 : 100;
  const score = clamp(rawScore, 0, scoreCap);

  return {
    score,
    risk_band: getRiskBand(score),
    score_breakdown: scoreBreakdown,
    supply_availability: availabilityAssessment,
  };
}

module.exports = {
  SCORE_CAPS,
  calculateDemandScore,
  classifySupplyAvailability,
  getRiskBand,
};
