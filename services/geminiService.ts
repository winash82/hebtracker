
import { GoogleGenAI, Type } from "@google/genai";
import { ProductMention, HistoricalProduct, GlobalFoodTrend } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export type AnalysisLogic = 'simple' | 'momentum';

/**
 * Higher reasoning model 'gemini-3-pro-preview' is used here to ensure
 * better data extraction and consistency from web search grounding results.
 */
export const analyzeBrandTrends = async (logic: AnalysisLogic = 'simple'): Promise<{ 
  products: ProductMention[], 
  historicalTop5: HistoricalProduct[],
  globalTrends: GlobalFoodTrend[],
  sources: any[] 
}> => {
  const model = "gemini-3-pro-preview";
  
  const logicInstruction = logic === 'momentum' 
    ? "MOMENTUM MODE: Prioritize products with the highest growth ratio (Weekly / 120D Avg). Highlight sudden breakouts with high velocity."
    : "SIMPLE VOLUME MODE: Prioritize products with the highest absolute raw mention counts this week. Focus on the largest conversation clusters.";

  const prompt = `
    DATA EXTRACTION PROTOCOL:
    You are an expert market analyst scraping and analyzing H-E-B (H.E. Butt Grocery Company) social media presence.
    
    SEARCH TASKS:
    1. Search Reddit (r/HEB, r/Texas, r/AustinFood, r/SanAntonioFood) for H-E-B product mentions from the LAST 7 DAYS.
    2. Search TikTok (#HEB, #HEBHaul, #HEBFinds) for viral videos and comment volumes from the LAST 7 DAYS.
    3. Estimate 120-day historical baseline averages by analyzing historical post frequency for these SKUs.

    STRICT DATA RULES:
    - 'mentionsThisWeek': Must be a calculated integer based on actual post/comment volume found in search grounding.
    - 'average120Day': Must be a realistic baseline calculated as (Total 120-day mentions / 17.14 weeks).
    - 'trendingScore': STRICTLY (mentionsThisWeek / average120Day).
    - 'sources': For EACH product, you MUST provide at least 2 real, specific URLs (Reddit threads, TikTok videos, or forum posts) where this product was discussed in the last 7 days. These MUST be URLs found in your search grounding.

    ${logicInstruction}

    TASK 1: PRODUCT SEGMENTATION
    - VIRAL ANOMALIES (isLimitedRelease: true): Exactly 5 breakthrough items.
    - CORE PRODUCTS (isLimitedRelease: false): Exactly 6 high-volume staples.

    TASK 2: 120-DAY CHAMPIONS
    - Identify the top 5 SKUs with the highest TOTAL volume over the last 120 days.

    TASK 3: GLOBAL FOOD TRENDS
    - Identify 5 non-HEB specific trends dominating #foodtok and r/food to provide industry context.

    Return the data in the specified JSON format. Cross-verify your numbers and sources against the search results to ensure they are proportional and realistic.
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
                  isLimitedRelease: { type: Type.BOOLEAN },
                  whyTrending: { type: Type.STRING },
                  mentionsThisWeek: { type: Type.NUMBER },
                  average120Day: { type: Type.NUMBER },
                  trendingScore: { type: Type.NUMBER },
                  sentiment: { type: Type.STRING },
                  topPlatform: { type: Type.STRING },
                  lastMentioned: { type: Type.STRING },
                  sources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        uri: { type: Type.STRING }
                      },
                      required: ["title", "uri"]
                    }
                  }
                },
                required: ["id", "name", "category", "description", "isLimitedRelease", "whyTrending", "mentionsThisWeek", "average120Day", "trendingScore", "sentiment", "topPlatform", "sources"]
              }
            },
            historicalTop5: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        totalMentionVolume: { type: Type.NUMBER },
                        category: { type: Type.STRING },
                        rankReason: { type: Type.STRING }
                    },
                    required: ["name", "totalMentionVolume", "category", "rankReason"]
                }
            },
            globalTrends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  description: { type: Type.STRING },
                  volumeLabel: { type: Type.STRING }
                },
                required: ["name", "platform", "description", "volumeLabel"]
              }
            }
          },
          required: ["products", "historicalTop5", "globalTrends"]
        }
      }
    });

    const parsed = JSON.parse(response.text);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { 
      products: parsed.products || [], 
      historicalTop5: parsed.historicalTop5 || [],
      globalTrends: parsed.globalTrends || [],
      sources: groundingChunks 
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
