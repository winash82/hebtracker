
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
    breakout: "PRIORITY: High-velocity items (24-48h). Detect emerging sparks. Higher sensitivity to low-volume signals.",
    strict: "PRIORITY: Verified volume (>10 mentions). Must appear on multiple platforms. Extremely high noise filtering."
  };

  const rangeLabel = dateRange === '7d' ? 'Last 7 Days' : dateRange === '14d' ? 'Last 14 Days' : 'Last 30 Days';
  
  const regionNames: Record<Region, string> = {
    all: "Statewide (Texas)",
    austin: "Austin, TX",
    dallas: "Dallas, TX",
    houston: "Houston, TX",
    san_antonio: "San Antonio, TX"
  };

  const regionSubreddits: Record<Region, string> = {
    all: "r/Texas, r/Austin, r/Houston, r/Dallas, r/SanAntonio",
    austin: "r/Austin",
    dallas: "r/Dallas",
    houston: "r/Houston",
    san_antonio: "r/SanAntonio"
  };

  const prompt = `
    Analyze H-E-B performance vs. broader Texas Food Intelligence.
    GEOGRAPHIC FOCUS: ${regionNames[region]}.
    TIME WINDOW: ${rangeLabel}.
    Profile: ${logicPrompts[logic]}
    
    PRIMARY SOURCES TO SCAN: 
    - Reddit: ${regionSubreddits[region]}, r/HEB, r/BBQ, r/Smoking
    - TikTok: #TexasFood, #TexasRecipes, #${region.replace('_', '')}Food, #TXBBQ
    - News: Texas Monthly Food, Eater ${region === 'all' ? 'Texas' : region.charAt(0).toUpperCase() + region.slice(1)}
    
    TASKS:
    1. H-E-B INTERNAL (Localized to ${regionNames[region]}): Identify 5 Viral Breakouts and 6 Core Staples currently being discussed within the context of this region. Include source URLs.
    2. LOCAL FOOD PULSE (NON-H-E-B):
       - Find 5 trending food items/concepts that ARE NOT H-E-B products but are specifically hot in ${regionNames[region]}.
       - Focus on: Specific Recipes, Local Ingredients, or Competitor Brands (e.g., Central Market, local bakeries).
       - Classify trendType as 'Brand', 'Recipe', 'Ingredient', or 'Culture'.
       - Assess 'momentum' as 'Rising', 'Peak', or 'Fading'.
       - Include direct source URLs for evidence.
    3. HISTORICAL: 5 Long-term H-E-B champions (120d). Include source URLs for verification.
    
    Return JSON only.
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
                  confidenceScore: { type: Type.NUMBER },
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
                }
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
                        rankReason: { type: Type.STRING },
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
            globalTrends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  description: { type: Type.STRING },
                  volumeLabel: { type: Type.STRING },
                  trendType: { type: Type.STRING },
                  momentum: { type: Type.STRING },
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
            scanConfidence: { type: Type.NUMBER }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text);
    const rawGrounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const groundingSources: GroundingSource[] = rawGrounding
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Source',
        uri: chunk.web.uri
      }));

    return { 
      products: parsed.products || [], 
      historicalTop5: parsed.historicalTop5 || [],
      globalTrends: parsed.globalTrends || [],
      groundingSources,
      scanConfidence: parsed.scanConfidence || 85
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
