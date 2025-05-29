export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isPremium: boolean;
  isAdmin?: boolean;
  preferences: UserPreferences;
  savedContent: string[];
}

export interface UserPreferences {
  interests: string[];
  zodiacSign?: string;
  birthChart?: BirthChart;
  notificationSettings: {
    dailyHoroscope: boolean;
    dailyTarot: boolean;
    newContent: boolean;
    premiumOffers: boolean;
  };
}

export interface BirthChart {
  sun: string;
  moon: string;
  rising: string;
  venus: string;
  mars: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: string;
  category: ContentCategory;
  tags: string[];
  isPremium: boolean;
  readTime: number;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  audioUrl: string;
  duration: number;
  hostName: string;
  publishedAt: string;
  category: ContentCategory;
  tags: string[];
  isPremium: boolean;
}

export interface TarotReading {
  id: string;
  title: string;
  cards: TarotCard[];
  interpretation: string;
  date: string;
  userId?: string;
}

export interface TarotCard {
  id: string;
  name: string;
  image: string;
  meaningUpright: string;
  meaningReversed: string;
  isReversed: boolean;
}

export interface Horoscope {
  sign: string;
  date: string;
  content: string;
  mood: string;
  compatibility: string;
  luckyNumber: number;
  luckyColor: string;
}

export interface Category {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string | null;
  ai_prompt?: string | null;
  ai_model?: string | null;
  created_at: string; // TIMESTAMPTZ
}

export type ContentCategory = 
  | 'astrology' 
  | 'tarot' 
  | 'meditation' 
  | 'spirituality' 
  | 'wellbeing' 
  | 'relationships' 
  | 'mindfulness';

export interface PodcastFeed {
  id: string; // UUID
  name: string;
  slug: string; // SEO-friendly URL slug
  category: string; // Legacy field - user-defined category string
  category_id?: string; // UUID reference to podcast_categories table
  category_name?: string; // Derived from the joined podcast_categories table
  categoryName?: string; // Direct category name for display
  feed_url: string;
  description?: string | null;
  image_url?: string | null;
  author?: string | null;
  last_fetched_at?: string | null; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  podcast_categories?: PodcastCategory | null; // Joined data from podcast_categories table
}

export interface PodcastCategory {
  id: string; // UUID
  name: string;
  slug: string; // SEO-friendly URL slug
  description?: string | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface PodcastEpisode {
  id: string; // UUID
  podcast_id: string; // Foreign Key to PodcastFeed.id
  title: string;
  description?: string | null;
  pub_date?: string | null; // TIMESTAMPTZ
  audio_url: string;
  duration?: string | null; // e.g., "HH:MM:SS" or total seconds as string
  guid: string; // Unique episode identifier from RSS
  image_url?: string | null; // Episode-specific image
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}