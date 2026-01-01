
import { GoogleGenAI, Type } from "@google/genai";
import { ProductMention, HistoricalProduct, GlobalFoodTrend, GroundingSource, AnalysisLogic, DateRangePreset, Region } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Helper to clean and parse JSON strings that might contain markdown or extra text.
 */
const cleanAndParseJSON = (text: string) => {
  let jsonStr = text.trim();
  // Remove markdown code blocks if present
  if (jsonStr.includes('```')) {
    const matches = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
    if (matches && matches[1]) {
      jsonStr = matches[1].trim();
    } else {
      // Fallback: strip the first and last backticks manually if regex fails
      jsonStr = jsonStr.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
    }
  }
  return JSON.parse(jsonStr);
};

export const analyzeBrandTrends = async (
  logic: AnalysisLogic = 'breakout',
  dateRange: DateRangePreset = '7d',
  region: Region = 'all'
): Promise<{ 
  products: ProductMention[], 
  competitorProducts: ProductMention[],
  historicalTop5: HistoricalProduct[],
  globalTrends: GlobalFoodTrend[],
  groundingSources: GroundingSource[],
  scanConfidence: number
}> => {
  const model = "gemini-3-flash-preview";
  
  const logicPrompts = {
    breakout: "Detect emerging sparks (24-48h). Prioritize freshness.",
    strict: "Requires Cross-Platform Consensus (CPC) from independent discussion threads."
  };

  const rangeLabel = dateRange === '7d' ? 'Last 7 Days' : dateRange === '14d' ? 'Last 14 Days' : 'Last 30 Days';
  
  const prompt = `
    Analyze Retail Intelligence for region: ${region} within timeframe: ${rangeLabel}.
    Verification Mode: ${logicPrompts[logic]}

    MANDATORY TASKS:
    1. H-E-B: Find 5 Viral Breakouts and 6 Core Staples. Use Social Evidence Consensus.
    2. COMPETITORS: Find the top 4 private-label trending items EACH for:
       - Costco (Kirkland Signature)
       - Trader Joe's (TJ's Brand)
       - Walmart (Great Value)
    3. TRENDS: Find 5 non-HEB Local Trends and 5 Historical champions.

    CRITICAL: 
    - Use 'Social Evidence Consensus' to prevent hallucinations.
    - Provide 'evidenceCount' (number of nodes found) and 'evidenceSummary' (e.g., "Verified via r/HEB + TikTok").
    - Return ONLY valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  flavorVariant: { type: Type.STRING },
                  evidenceCount: { type: Type.NUMBER },
                  evidenceSummary: { type: Type.STRING },
                  isLimitedRelease: { type: Type.BOOLEAN },
                  whyTrending: { type: Type.STRING },
                  mentionsThisWeek: { type: Type.NUMBER },
                  trendingScore: { type: Type.NUMBER },
                  sentiment: { type: Type.STRING },
                  topPlatform: { type: Type.STRING },
                  confidenceScore: { type: Type.NUMBER },
                  sources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, uri: { type: Type.STRING } } } }
                },
                required: ["id", "name", "category", "evidenceCount", "trendingScore"]
              }
            },
            competitorProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  retailer: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  flavorVariant: { type: Type.STRING },
                  evidenceCount: { type: Type.NUMBER },
                  evidenceSummary: { type: Type.STRING },
                  isLimitedRelease: { type: Type.BOOLEAN },
                  whyTrending: { type: Type.STRING },
                  mentionsThisWeek: { type: Type.NUMBER },
                  trendingScore: { type: Type.NUMBER },
                  sentiment: { type: Type.STRING },
                  topPlatform: { type: Type.STRING },
                  confidenceScore: { type: Type.NUMBER },
                  sources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, uri: { type: Type.STRING } } } }
                },
                required: ["id", "retailer", "name", "evidenceCount"]
              }
            },
            historicalTop5: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, totalMentionVolume: { type: Type.NUMBER }, category: { type: Type.STRING }, rankReason: { type: Type.STRING } } } },
            globalTrends: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, momentum: { type: Type.STRING }, trendType: { type: Type.STRING } } } },
            scanConfidence: { type: Type.NUMBER }
          },
          required: ["products", "competitorProducts", "historicalTop5", "globalTrends"]
        }
      }
    });

    const parsed = cleanAndParseJSON(response.text);
    
    // Safety mapping for grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources: GroundingSource[] = groundingChunks
      .filter((c: any) => c.web && c.web.uri)
      .map((c: any) => ({
        title: c.web.title || "External Source",
        uri: c.web.uri
      }));

    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      competitorProducts: Array.isArray(parsed.competitorProducts) ? parsed.competitorProducts : [],
      historicalTop5: Array.isArray(parsed.historicalTop5) ? parsed.historicalTop5 : [],
      globalTrends: Array.isArray(parsed.globalTrends) ? parsed.globalTrends : [],
      groundingSources,
      scanConfidence: parsed.scanConfidence || 85
    };
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    // Return empty results on error rather than crashing
    return {
      products: [],
      competitorProducts: [],
      historicalTop5: [],
      globalTrends: [],
      groundingSources: [],
      scanConfidence: 0
    };
  }
};
