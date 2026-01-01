
export interface ProductMention {
  id: string;
  name: string;
  category: string;
  description: string;
  flavorVariant?: string;
  isLimitedRelease: boolean;
  mentionsThisWeek: number;
  average120Day: number;
  trendingScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  topPlatform: 'Reddit' | 'TikTok' | 'Forums';
  lastMentioned: string;
  sources: Array<{ title: string; uri: string }>;
  whyTrending: string;
  confidenceScore: number;
  evidenceCount: number;
  evidenceSummary: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface HistoricalProduct {
  name: string;
  totalMentionVolume: number;
  category: string;
  rankReason: string;
  sources: Array<{ title: string; uri: string }>;
}

export interface GlobalFoodTrend {
  name: string;
  platform: 'Reddit' | 'TikTok' | 'Search';
  description: string;
  volumeLabel: string;
  trendType: 'Brand' | 'Recipe' | 'Ingredient' | 'Culture';
  momentum: 'Rising' | 'Peak' | 'Fading';
  sources: Array<{ title: string; uri: string }>;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  SCRAPING = 'SCRAPING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type AnalysisLogic = 'breakout' | 'strict';

export type DateRangePreset = '7d' | '14d' | '30d';

export type Region = 'all' | 'austin' | 'dallas' | 'houston' | 'san_antonio';
