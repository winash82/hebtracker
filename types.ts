
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
}

export interface HistoricalProduct {
  name: string;
  totalMentionVolume: number;
  category: string;
  rankReason: string;
}

export interface GlobalFoodTrend {
  name: string;
  platform: 'Reddit' | 'TikTok';
  description: string;
  volumeLabel: string;
}

export interface BrandStats {
  totalMentions: number;
  avgSentiment: number;
  topTrendingProduct: string;
  platformDistribution: { name: string; value: number }[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  SCRAPING = 'SCRAPING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
