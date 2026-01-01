
import { GoogleGenAI, Type } from "@google/genai";
import { ProductMention, HistoricalProduct, GlobalFoodTrend, GroundingSource, AnalysisLogic, DateRangePreset, Region } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeBrandTrends = async (
  logic: AnalysisLogic = 'breakout',
  dateRange: DateRangePreset = '7d',
  region: Region = 'all'
): Promise<{ 
  products: ProductMention[], 
  historicalTop5: HistoricalProduct[],
  globalTrends: GlobalFoodTrend[],
  groundingSources: GroundingSource[],
  scanConfidence: number
}> => {
  const model = "gemini-3-flash-preview";
  
  const logicPrompts = {
    breakout: "Detect emerging sparks (24-48h). Prioritize freshness over volume.",
    strict: "Requires Cross-Platform Consensus (CPC). Item must exist in multiple independent discussion threads."
  };

  const rangeLabel = dateRange === '7d' ? 'Last 7 Days' : dateRange === '14d' ? 'Last 14 Days' : 'Last 30 Days';
  
  const prompt = `
    Analyze H-E-B Performance for region: ${region}.
    Timeframe: ${rangeLabel}.
    Verification Mode: ${logicPrompts[logic]}

    CRITICAL INSTRUCTION: To prevent hallucination of "fake" products, use 'Social Evidence Consensus'. 
    Only include a product if you can identify MULTIPLE independent mentions (e.g., a Reddit thread + a TikTok search result).
    
    1. Identify 5 Viral Breakouts and 6 Core Staples for H-E-B brands.
    2. Identify 5 non-HEB Local Trends.
    3. Identify 5 Historical Champions.

    For each product:
    - Set 'evidenceCount' to the number of independent social threads/posts found.
    - Set 'evidenceSummary' to a short string like "Verified via r/HEB + TikTok #TXFinds".
    - DO NOT include SKUs or store URLs as they are unreliable.
    - Only return JSON.
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
                  description: { type: Type.STRING },
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
                  sources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        uri: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            historicalTop5: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, totalMentionVolume: { type: Type.NUMBER }, category: { type: Type.STRING }, rankReason: { type: Type.STRING } } } },
            globalTrends: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, momentum: { type: Type.STRING }, trendType: { type: Type.STRING } } } },
            scanConfidence: { type: Type.NUMBER }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return {
      products: parsed.products || [],
      historicalTop5: parsed.historicalTop5 || [],
      globalTrends: parsed.globalTrends || [],
      groundingSources: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []).filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri })),
      scanConfidence: parsed.scanConfidence || 85
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
