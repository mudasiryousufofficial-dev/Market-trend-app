
import { TrendCategory, UserPersona } from './types';

export const CATEGORIES = [
  { id: TrendCategory.ALL, label: 'Everything', icon: 'LayoutDashboard' },
  { id: TrendCategory.SAVED, label: 'Saved Trends', icon: 'Bookmark' },
  { id: TrendCategory.READ_LATER, label: 'Read Later', icon: 'Clock' },
  { id: TrendCategory.BUSINESS, label: 'Grow Your Business', icon: 'Briefcase' },
  { id: TrendCategory.AI_MARKETING, label: 'AI Tools', icon: 'Bot' },
  { id: TrendCategory.SEO, label: 'Google Search', icon: 'Search' },
  { id: TrendCategory.SOCIAL_MEDIA, label: 'Social Media', icon: 'Share2' },
  { id: TrendCategory.CONTENT, label: 'Content Writing', icon: 'FileText' },
  { id: TrendCategory.PPC, label: 'Paid Ads', icon: 'DollarSign' },
];

export const PERSONAS: { id: UserPersona; label: string }[] = [
  { id: 'General', label: 'General Reader' },
  { id: 'Small Business Owner', label: 'Small Business Owner' },
  { id: 'Agency Owner', label: 'Agency Owner' },
  { id: 'Content Creator', label: 'Content Creator' },
  { id: 'Enterprise CMO', label: 'Enterprise CMO' },
];

export const INITIAL_PROMPT = `
You are a helpful marketing guide. 
Identify the top 6 most interesting changes in Digital Marketing happening right now.
Explain them in simple, plain English that anyone can understand. Avoid technical jargon. Keep summaries concise.
`;

export const CATEGORY_PROMPT_TEMPLATE = (category: string) => `
Find the latest trending topics related to "${category}" in Digital Marketing.
Explain them simply for a beginner.
List 6 distinct trends.
`;
