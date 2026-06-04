const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function analyzeDemand(component) {
  const prompt = `You are ChipPulse AI, an expert in semiconductor and chip demand analysis.

Analyze demand pressure for: "${component}"

Return ONLY a valid JSON object (no markdown, no backticks, no extra text):
{
  "score": <number from 0-100>,
  "trend": "Increasing"|"Stable"|"Decreasing",
  "confidence": "High"|"Medium"|"Low",
  "explanation": "<brief 2-3 sentence analysis>",
  "drivers": ["driver1", "driver2", "driver3"],
  "recommendations": ["rec1", "rec2"]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let text = response.text.trim();
  
  // Strategy 1: Try to extract from markdown code blocks
  const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch) {
    text = mdMatch[1].trim();
  }
  
  // Strategy 2: If text contains JSON but has extra text, extract the JSON object
  if (!text.startsWith('{')) {
    // Find the first { and extract to the last }
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }
  }
  
  return text.trim();
}

module.exports = { analyzeDemand };