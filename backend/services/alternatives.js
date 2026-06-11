const catalog = require('../data/components_catalog.json');
const { searchComponentsCatalog } = require('./vectorSearch.js');

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function inferCategory(component = '') {
  const text = component.toLowerCase();

  if (includesAny(text, ['mac mini', 'm4', 'm3', 'm2', 'apple silicon', 'mini pc', 'nuc', 'beelink', 'minisforum', 'thinkcentre', 'optiplex micro'])) {
    return 'mini_pc';
  }

  if (includesAny(text, ['ddr', 'dram', 'memory', 'ram', 'hbm', 'sodimm', 'udimm'])) {
    return 'memory';
  }

  if (includesAny(text, ['gpu', 'rtx', 'radeon', 'blackwell', 'h100', 'h200', 'b200', 'mi325', 'accelerator', 'gaudi'])) {
    return 'gpu';
  }

  if (includesAny(text, ['cpu', 'core i', 'ryzen', 'xeon', 'epyc', 'processor', 'snapdragon'])) {
    return 'cpu';
  }

  if (includesAny(text, ['ssd', 'nvme', 'nand', 'storage'])) {
    return 'storage';
  }

  return 'general';
}

function tokenScore(component, candidate) {
  const inputTokens = new Set(component.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const candidateTokens = candidate.component.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return candidateTokens.reduce((score, token) => score + (inputTokens.has(token) ? 1 : 0), 0);
}

function findAlternatives(component, riskScore, limit = 3) {
  const category = inferCategory(component);
  const maxRisk = Number.isFinite(riskScore) ? riskScore : 100;
  const candidates = catalog
    .filter((item) => item.category === category && item.risk_score < maxRisk)
    .sort((a, b) => {
      const riskDelta = a.risk_score - b.risk_score;
      const similarityDelta = tokenScore(component, b) - tokenScore(component, a);
      return similarityDelta || riskDelta;
    });

  const fallbackCandidates = catalog
    .filter((item) => item.category === category)
    .sort((a, b) => a.risk_score - b.risk_score);

  return (candidates.length > 0 ? candidates : fallbackCandidates).slice(0, limit).map((item) => ({
    component: item.component,
    category: item.category,
    risk: item.risk_score,
    reason: item.reason,
  }));
}

function mapCatalogItem(item) {
  return {
    component: item.component,
    category: item.category,
    risk: item.risk_score,
    reason: item.reason,
    similarity: typeof item.score === 'number' ? Math.round(item.score * 100) : undefined,
  };
}

async function findAlternativesWithVectorSearch(component, riskScore, queryEmbedding, limit = 3) {
  const category = inferCategory(component);

  if (!queryEmbedding) {
    return {
      alternatives: findAlternatives(component, riskScore, limit),
      vector_search_used: false,
      retrieval_mode: 'local catalog fallback',
    };
  }

  try {
    const matches = await searchComponentsCatalog(queryEmbedding, {
      category,
      maxRisk: riskScore,
      limit,
    });

    if (matches.length > 0) {
      return {
        alternatives: matches.map(mapCatalogItem),
        vector_search_used: true,
        retrieval_mode: 'Atlas Vector Search',
      };
    }
  } catch (error) {
    console.warn('Components catalog vector search unavailable, falling back to local catalog:', error.message);
  }

  return {
    alternatives: findAlternatives(component, riskScore, limit),
    vector_search_used: false,
    retrieval_mode: 'local catalog fallback',
  };
}

module.exports = {
  findAlternatives,
  findAlternativesWithVectorSearch,
  inferCategory,
};
