
export interface TrendItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  impactScore: number; // 0-100
  sentiment: 'Positive' | 'Neutral' | 'Mixed';
  advice: string; // New field for actionable tips
  sources: Source[];
}

export interface Source {
  title: string;
  uri: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export enum TrendCategory {
  ALL = 'All',
  SAVED = 'Saved Trends',
  READ_LATER = 'Read Later',
  BUSINESS = 'Business Growth',
  SEO = 'SEO',
  SOCIAL_MEDIA = 'Social Media',
  AI_MARKETING = 'AI Marketing',
  CONTENT = 'Content Strategy',
  PPC = 'PPC & Ads'
}

export type SocialPlatform = 'LinkedIn' | 'Twitter' | 'Newsletter' | 'TikTok';

export type UserPersona = 'General' | 'Small Business Owner' | 'Agency Owner' | 'Content Creator' | 'Enterprise CMO';
