import { supabase } from "../lib/supabaseClient";
import type {
  AdBanner,
  AdZone,
  AdBannerFormData,
  AdStats,
} from "../types/adTypes";

export class AdBannerService {
  private static instance: AdBannerService;
  private adCache = new Map<string, AdBanner[]>();
  private zoneCache = new Map<string, AdZone[]>();

  private constructor() {}

  public static getInstance(): AdBannerService {
    if (!AdBannerService.instance) {
      AdBannerService.instance = new AdBannerService();
    }
    return AdBannerService.instance;
  }

  /**
   * Get all ad banners with optional filtering
   */
  public async getAdBanners(filters?: {
    zone?: string;
    active?: boolean;
    limit?: number;
  }): Promise<AdBanner[]> {
    try {
      let query = supabase
        .from("ad_banners")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.active !== undefined) {
        query = query.eq("is_active", filters.active);
      }

      if (filters?.zone) {
        query = query.contains("zones", [filters.zone]);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching ad banners:", error);
      return [];
    }
  }

  /**
   * Get active ads for a specific zone
   */
  public async getActiveAdsForZone(
    zone: string,
    limit: number = 5,
  ): Promise<AdBanner[]> {
    const cacheKey = `${zone}-${limit}`;

    // Check cache first (cache for 5 minutes)
    if (this.adCache.has(cacheKey)) {
      const cached = this.adCache.get(cacheKey)!;
      return cached;
    }

    try {
      const { data, error } = await supabase
        .rpc("get_active_ads_for_zone", { zone_name: zone })
        .limit(limit);

      if (error) throw error;

      const ads = data || [];

      // Cache the results
      this.adCache.set(cacheKey, ads);
      setTimeout(() => this.adCache.delete(cacheKey), 5 * 60 * 1000); // 5 minutes

      return ads;
    } catch (error) {
      console.error("Error fetching active ads for zone:", error);
      return [];
    }
  }

  /**
   * Create a new ad banner
   */
  public async createAdBanner(
    adData: AdBannerFormData,
  ): Promise<AdBanner | null> {
    try {
      const { data, error } = await supabase
        .from("ad_banners")
        .insert({
          title: adData.title,
          ad_type: adData.ad_type,
          content: adData.content,
          cta_text: adData.cta_text,
          target_url: adData.target_url,
          zones: adData.zones,
          start_date: adData.start_date,
          end_date: adData.end_date,
          priority: adData.priority,
          is_active: adData.is_active,
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.adCache.clear();

      return data;
    } catch (error) {
      console.error("Error creating ad banner:", error);
      return null;
    }
  }

  /**
   * Update an existing ad banner
   */
  public async updateAdBanner(
    id: string,
    updates: Partial<AdBannerFormData>,
  ): Promise<AdBanner | null> {
    try {
      const { data, error } = await supabase
        .from("ad_banners")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.adCache.clear();

      return data;
    } catch (error) {
      console.error("Error updating ad banner:", error);
      return null;
    }
  }

  /**
   * Delete an ad banner
   */
  public async deleteAdBanner(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("ad_banners").delete().eq("id", id);

      if (error) throw error;

      // Clear cache
      this.adCache.clear();

      return true;
    } catch (error) {
      console.error("Error deleting ad banner:", error);
      return false;
    }
  }

  /**
   * Get all ad zones
   */
  public async getAdZones(): Promise<AdZone[]> {
    // Check cache first
    if (this.zoneCache.has("all")) {
      return this.zoneCache.get("all")!;
    }

    try {
      const { data, error } = await supabase
        .from("ad_zones")
        .select("*")
        .eq("is_active", true)
        .order("display_name");

      if (error) throw error;

      const zones = data || [];

      // Cache the results
      this.zoneCache.set("all", zones);
      setTimeout(() => this.zoneCache.delete("all"), 10 * 60 * 1000); // 10 minutes

      return zones;
    } catch (error) {
      console.error("Error fetching ad zones:", error);
      return this.getDefaultZones();
    }
  }

  /**
   * Track ad event (view or click)
   */
  public async trackAdEvent(
    adId: string,
    eventType: "view" | "click",
    zone?: string,
    userId?: string,
  ): Promise<void> {
    try {
      await supabase.rpc("track_ad_event", {
        p_ad_banner_id: adId,
        p_event_type: eventType,
        p_user_id: userId,
        p_zone: zone,
        p_user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error("Error tracking ad event:", error);
    }
  }

  /**
   * Get ad statistics
   */
  public async getAdStats(dateRange?: {
    start: string;
    end: string;
  }): Promise<AdStats> {
    try {
      // Get basic stats
      const { data: bannerStats } = await supabase
        .from("ad_banners")
        .select("id, is_active");

      const totalAds = bannerStats?.length || 0;
      const activeAds = bannerStats?.filter((ad) => ad.is_active).length || 0;

      // Get analytics data
      let analyticsQuery = supabase
        .from("ad_analytics")
        .select("ad_banner_id, event_type, zone, ad_banners!inner(title)");

      if (dateRange) {
        analyticsQuery = analyticsQuery
          .gte("created_at", dateRange.start)
          .lte("created_at", dateRange.end);
      }

      const { data: analytics } = await analyticsQuery;

      const totalViews =
        analytics?.filter((a) => a.event_type === "view").length || 0;
      const totalClicks =
        analytics?.filter((a) => a.event_type === "click").length || 0;
      const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

      // Calculate top performing ads
      const adPerformance = new Map<
        string,
        { title: string; views: number; clicks: number }
      >();

      analytics?.forEach((event) => {
        const adId = event.ad_banner_id;
        const title = (event as any).ad_banners?.title || "Unknown";

        if (!adPerformance.has(adId)) {
          adPerformance.set(adId, { title, views: 0, clicks: 0 });
        }

        const stats = adPerformance.get(adId)!;
        if (event.event_type === "view") stats.views++;
        if (event.event_type === "click") stats.clicks++;
      });

      const topPerformingAds = Array.from(adPerformance.entries())
        .map(([id, stats]) => ({
          id,
          title: stats.title,
          views: stats.views,
          clicks: stats.clicks,
          ctr: stats.views > 0 ? (stats.clicks / stats.views) * 100 : 0,
        }))
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 10);

      // Calculate zone performance
      const zonePerformance = new Map<
        string,
        { views: number; clicks: number }
      >();

      analytics?.forEach((event) => {
        const zone = event.zone || "unknown";

        if (!zonePerformance.has(zone)) {
          zonePerformance.set(zone, { views: 0, clicks: 0 });
        }

        const stats = zonePerformance.get(zone)!;
        if (event.event_type === "view") stats.views++;
        if (event.event_type === "click") stats.clicks++;
      });

      const zonePerformanceArray = Array.from(zonePerformance.entries())
        .map(([zone, stats]) => ({
          zone,
          views: stats.views,
          clicks: stats.clicks,
          ctr: stats.views > 0 ? (stats.clicks / stats.views) * 100 : 0,
        }))
        .sort((a, b) => b.views - a.views);

      return {
        total_ads: totalAds,
        active_ads: activeAds,
        total_views: totalViews,
        total_clicks: totalClicks,
        ctr: Math.round(ctr * 100) / 100,
        top_performing_ads: topPerformingAds,
        zone_performance: zonePerformanceArray,
      };
    } catch (error) {
      console.error("Error fetching ad stats:", error);
      return {
        total_ads: 0,
        active_ads: 0,
        total_views: 0,
        total_clicks: 0,
        ctr: 0,
        top_performing_ads: [],
        zone_performance: [],
      };
    }
  }

  /**
   * Get default zones if database is not available
   */
  private getDefaultZones(): AdZone[] {
    return [
      {
        id: "1",
        name: "homepage-hero",
        display_name: "Homepage Hero",
        description: "Large banner on homepage hero section",
        max_width: 1200,
        max_height: 400,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "sidebar",
        display_name: "Sidebar",
        description: "Sidebar banner",
        max_width: 300,
        max_height: 250,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "article-top",
        display_name: "Article Top",
        description: "Banner at top of articles",
        max_width: 728,
        max_height: 90,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
  }
}

// Export singleton instance
export const adBannerService = AdBannerService.getInstance();
