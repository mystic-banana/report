// Ad Banner System Types

export interface AdBanner {
  id: string;
  title: string;
  ad_type: "image" | "svg" | "html" | "text";
  content: string; // Image URL, SVG code, HTML content, or text content
  cta_text?: string;
  target_url?: string;
  zones: string[];
  start_date?: string;
  end_date?: string;
  priority: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AdZone {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  max_width?: number;
  max_height?: number;
  is_active: boolean;
  created_at: string;
}

export interface AdAnalytics {
  id: string;
  ad_banner_id: string;
  event_type: "view" | "click";
  user_id?: string;
  zone?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

export interface AdBannerFormData {
  title: string;
  ad_type: "image" | "svg" | "html" | "text";
  content: string;
  cta_text?: string;
  target_url?: string;
  zones: string[];
  start_date?: string;
  end_date?: string;
  priority: number;
  is_active: boolean;
}

export interface AdDisplayProps {
  zone: string;
  className?: string;
  maxAds?: number;
  enableTracking?: boolean;
  enableRotation?: boolean;
  rotationInterval?: number;
}

export interface AdTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  preview_url?: string;
  category: "astrology" | "premium" | "feature" | "general";
  recommended_zones: string[];
}

export interface AdStats {
  total_ads: number;
  active_ads: number;
  total_views: number;
  total_clicks: number;
  ctr: number; // Click-through rate
  top_performing_ads: Array<{
    id: string;
    title: string;
    views: number;
    clicks: number;
    ctr: number;
  }>;
  zone_performance: Array<{
    zone: string;
    views: number;
    clicks: number;
    ctr: number;
  }>;
}
