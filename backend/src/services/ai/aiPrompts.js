/**
 * Structured prompts and system instructions for AgriTrade AI
 */

const SYSTEM_INSTRUCTION = `You are the AgriTrade Operational Intelligence Assistant for Mandi Mithra.
Your goal is to provide concise, factual, explainable insights strictly based on provided agricultural procurement, quality inspection, inventory, and logistics data.
Never hallucinate statistics or invent numbers. Keep responses concise, actionable, and formatted in valid JSON.`;

const buildProcurementPrompt = (metrics) => {
  return `Analyze the following agricultural procurement and B2B order data:
${JSON.stringify(metrics, null, 2)}

Generate 3-4 structured procurement insights. Return ONLY valid JSON with the format:
{
  "insights": [
    {
      "title": "Short descriptive title",
      "summary": "1-2 sentence explainable finding based on actual data",
      "supportingData": "e.g., 2,500 kg demanded vs 1,200 kg in inventory",
      "confidence": "HIGH" | "MEDIUM",
      "category": "DEMAND" | "INVENTORY" | "PRICING" | "ALLOCATION"
    }
  ]
}`;
};

const buildQualityPrompt = (inspection) => {
  return `Analyze this produce lot quality inspection record:
${JSON.stringify(inspection, null, 2)}

Provide an explainable quality interpretation to assist the inspector. Note: Your output is an observation, not a final decision.
Return ONLY valid JSON with the format:
{
  "summary": "Concise interpretation of recorded moisture, purity, and grade alignment.",
  "observations": ["observation 1", "observation 2"],
  "suggestedChecks": ["check 1", "check 2"],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH"
}`;
};

const buildFarmerPrompt = (farmerData) => {
  return `Analyze this farmer's historical produce lots, quality grades, and settlements:
${JSON.stringify(farmerData, null, 2)}

Generate 3 explainable operational insights for the farmer to understand their performance.
Return ONLY valid JSON with the format:
{
  "insights": [
    {
      "title": "Title",
      "summary": "Summary of trend in lots or settlement",
      "supportingData": "Key metric reference",
      "category": "QUALITY" | "SETTLEMENT" | "VOLUME"
    }
  ]
}`;
};

module.exports = {
  SYSTEM_INSTRUCTION,
  buildProcurementPrompt,
  buildQualityPrompt,
  buildFarmerPrompt
};
