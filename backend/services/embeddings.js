const { GoogleGenAI } = require("@google/genai");
const { getGeminiApiKey } = require("./config.js");

const ai = new GoogleGenAI({
  apiKey: getGeminiApiKey(),
});

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 768);

function extractEmbeddingValues(response) {
  if (response?.embeddings?.[0]?.values) {
    return response.embeddings[0].values;
  }

  if (response?.embedding?.values) {
    return response.embedding.values;
  }

  if (Array.isArray(response?.embeddings?.[0])) {
    return response.embeddings[0];
  }

  throw new Error("Gemini embedding response did not include embedding values.");
}

async function getEmbedding(text) {
  if (!getGeminiApiKey()) {
    throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required to generate embeddings.");
  }

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "SEMANTIC_SIMILARITY",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  return extractEmbeddingValues(response);
}

function historicalEventEmbeddingText(event) {
  return [
    event.title,
    event.summary,
    event.category,
    event.impact,
    event.year,
  ]
    .filter(Boolean)
    .join(" ");
}

function industryReportEmbeddingText(report) {
  return [
    report.title,
    report.summary,
    report.source,
    report.category,
  ]
    .filter(Boolean)
    .join(" ");
}

module.exports = {
  getEmbedding,
  historicalEventEmbeddingText,
  industryReportEmbeddingText,
};
