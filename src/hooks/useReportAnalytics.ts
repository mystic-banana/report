import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/authStore";

interface ReportAnalyticsSession {
  reportId: string;
  reportType: string;
  startTime: number;
  lastUpdateTime: number;
  wordCount: number;
  sessionId?: string;
  sectionsViewed: string[];
  interactions: ReportInteraction[];
}

interface ReportInteraction {
  type:
    | "scroll"
    | "search"
    | "bookmark"
    | "share"
    | "export"
    | "print"
    | "zoom"
    | "toc_navigation"
    | "text_to_speech"
    | "annotation"
    | "comparison"
    | "highlight"
    | "note_creation";
  timestamp: number;
  data?: any;
}

interface ReportAnalytics {
  id: string;
  user_id: string;
  report_id: string;
  report_type: string;
  session_duration: number;
  reading_progress: number;
  sections_viewed: string[];
  interactions_count: number;
  interactions_data: ReportInteraction[];
  word_count: number;
  reading_speed: number; // words per minute
  completion_percentage: number;
  bookmarked: boolean;
  shared: boolean;
  exported: boolean;
  device_type: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

interface ReportEngagementMetrics {
  totalViews: number;
  averageReadingTime: number;
  averageCompletionRate: number;
  popularSections: { section: string; views: number }[];
  interactionTypes: { type: string; count: number }[];
  exportCount: number;
  shareCount: number;
  bookmarkCount: number;
}

export const useReportAnalytics = () => {
  const { user } = useAuthStore();
  const [currentSession, setCurrentSession] =
    useState<ReportAnalyticsSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [sectionsInView, setSectionsInView] = useState<Set<string>>(new Set());

  // Start tracking a new report session
  const startReportTracking = useCallback(
    async (reportId: string, reportType: string, wordCount: number) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("report_analytics")
          .insert({
            user_id: user.id,
            report_id: reportId,
            report_type: reportType,
            word_count: wordCount,
            device_type: getDeviceType(),
            user_agent: navigator.userAgent,
            reading_progress: 0,
            completion_percentage: 0,
            sections_viewed: [],
            interactions_data: [],
            interactions_count: 0,
          })
          .select()
          .single();

        if (error) throw error;

        const session: ReportAnalyticsSession = {
          reportId,
          reportType,
          startTime: Date.now(),
          lastUpdateTime: Date.now(),
          wordCount,
          sessionId: data.id,
          sectionsViewed: [],
          interactions: [],
        };

        setCurrentSession(session);
        setIsTracking(true);
        setReadingStartTime(Date.now());

        // Track initial view interaction
        await trackReportInteraction("view", { reportId, reportType });
      } catch (error) {
        console.error("Error starting report analytics tracking:", error);
      }
    },
    [user],
  );

  // Update reading progress
  const updateReadingProgress = useCallback(
    async (progressPercentage: number) => {
      if (!currentSession || !user || !currentSession.sessionId) return;

      const now = Date.now();
      const timeSinceLastUpdate = (now - currentSession.lastUpdateTime) / 1000;

      // Only update if at least 3 seconds have passed
      if (timeSinceLastUpdate < 3) return;

      try {
        const sessionDuration = Math.floor(
          (now - currentSession.startTime) / 1000,
        );
        const readingSpeed =
          sessionDuration > 0
            ? Math.round(
                (currentSession.wordCount * (progressPercentage / 100)) /
                  (sessionDuration / 60),
              )
            : 0;

        await supabase
          .from("report_analytics")
          .update({
            reading_progress: progressPercentage,
            completion_percentage: progressPercentage,
            session_duration: sessionDuration,
            reading_speed: readingSpeed,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSession.sessionId);

        setCurrentSession((prev) =>
          prev
            ? {
                ...prev,
                lastUpdateTime: now,
              }
            : null,
        );

        // Track milestone progress
        if (
          progressPercentage >= 25 &&
          !currentSession.interactions.some(
            (i) => i.type === "scroll" && i.data?.milestone === 25,
          )
        ) {
          await trackReportInteraction("scroll", {
            milestone: 25,
            progress: progressPercentage,
          });
        }
        if (
          progressPercentage >= 50 &&
          !currentSession.interactions.some(
            (i) => i.type === "scroll" && i.data?.milestone === 50,
          )
        ) {
          await trackReportInteraction("scroll", {
            milestone: 50,
            progress: progressPercentage,
          });
        }
        if (
          progressPercentage >= 75 &&
          !currentSession.interactions.some(
            (i) => i.type === "scroll" && i.data?.milestone === 75,
          )
        ) {
          await trackReportInteraction("scroll", {
            milestone: 75,
            progress: progressPercentage,
          });
        }
        if (
          progressPercentage >= 100 &&
          !currentSession.interactions.some(
            (i) => i.type === "scroll" && i.data?.milestone === 100,
          )
        ) {
          await trackReportInteraction("scroll", {
            milestone: 100,
            progress: progressPercentage,
          });
        }
      } catch (error) {
        console.error("Error updating reading progress:", error);
      }
    },
    [currentSession, user],
  );

  // Track specific report interactions
  const trackReportInteraction = useCallback(
    async (interactionType: ReportInteraction["type"], data?: any) => {
      if (!currentSession || !user || !currentSession.sessionId) return;

      try {
        const interaction: ReportInteraction = {
          type: interactionType,
          timestamp: Date.now(),
          data,
        };

        const updatedInteractions = [
          ...currentSession.interactions,
          interaction,
        ];

        await supabase
          .from("report_analytics")
          .update({
            interactions_data: updatedInteractions,
            interactions_count: updatedInteractions.length,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSession.sessionId);

        setCurrentSession((prev) =>
          prev
            ? {
                ...prev,
                interactions: updatedInteractions,
              }
            : null,
        );
      } catch (error) {
        console.error("Error tracking report interaction:", error);
      }
    },
    [currentSession, user],
  );

  // Track section views
  const trackSectionView = useCallback(
    async (sectionId: string, sectionTitle: string) => {
      if (!currentSession || !user || !currentSession.sessionId) return;
      if (currentSession.sectionsViewed.includes(sectionId)) return;

      try {
        const updatedSections = [...currentSession.sectionsViewed, sectionId];

        await supabase
          .from("report_analytics")
          .update({
            sections_viewed: updatedSections,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSession.sessionId);

        setCurrentSession((prev) =>
          prev
            ? {
                ...prev,
                sectionsViewed: updatedSections,
              }
            : null,
        );

        await trackReportInteraction("toc_navigation", {
          sectionId,
          sectionTitle,
          totalSectionsViewed: updatedSections.length,
        });
      } catch (error) {
        console.error("Error tracking section view:", error);
      }
    },
    [currentSession, user, trackReportInteraction],
  );

  // Track report exports
  const trackReportExport = useCallback(
    async (exportType: "pdf" | "html" | "docx" | "txt", reportId: string) => {
      if (!user) return;

      try {
        // Update current session if active
        if (currentSession?.sessionId) {
          await supabase
            .from("report_analytics")
            .update({
              exported: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentSession.sessionId);
        }

        // Track export event
        await supabase.from("report_export_events").insert({
          user_id: user.id,
          report_id: reportId,
          export_type: exportType,
          device_type: getDeviceType(),
        });

        await trackReportInteraction("export", {
          exportType,
          reportId,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Error tracking report export:", error);
      }
    },
    [currentSession, user, trackReportInteraction],
  );

  // Track report shares
  const trackReportShare = useCallback(
    async (
      shareMethod: "native" | "copy" | "email" | "social",
      reportId: string,
    ) => {
      if (!user) return;

      try {
        // Update current session if active
        if (currentSession?.sessionId) {
          await supabase
            .from("report_analytics")
            .update({
              shared: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentSession.sessionId);
        }

        // Track share event
        await supabase.from("report_share_events").insert({
          user_id: user.id,
          report_id: reportId,
          share_method: shareMethod,
          device_type: getDeviceType(),
        });

        await trackReportInteraction("share", {
          shareMethod,
          reportId,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Error tracking report share:", error);
      }
    },
    [currentSession, user, trackReportInteraction],
  );

  // End tracking session
  const endReportTracking = useCallback(async () => {
    if (!currentSession || !user || !currentSession.sessionId) return;

    try {
      const now = Date.now();
      const sessionDuration = Math.floor(
        (now - currentSession.startTime) / 1000,
      );
      const readingSpeed =
        sessionDuration > 0
          ? Math.round(currentSession.wordCount / (sessionDuration / 60))
          : 0;

      await supabase
        .from("report_analytics")
        .update({
          session_ended_at: new Date().toISOString(),
          session_duration: sessionDuration,
          reading_speed: readingSpeed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSession.sessionId);

      setCurrentSession(null);
      setIsTracking(false);
      setReadingStartTime(null);
      setSectionsInView(new Set());
    } catch (error) {
      console.error("Error ending report analytics tracking:", error);
    }
  }, [currentSession, user]);

  // Get analytics for a specific report
  const getReportAnalytics = useCallback(
    async (reportId: string): Promise<ReportEngagementMetrics | null> => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("report_analytics")
          .select("*")
          .eq("report_id", reportId);

        if (error) throw error;
        if (!data || data.length === 0) return null;

        // Calculate engagement metrics
        const totalViews = data.length;
        const averageReadingTime =
          data.reduce(
            (sum, session) => sum + (session.session_duration || 0),
            0,
          ) / totalViews;
        const averageCompletionRate =
          data.reduce(
            (sum, session) => sum + (session.completion_percentage || 0),
            0,
          ) / totalViews;

        // Aggregate section views
        const sectionViewCounts: { [key: string]: number } = {};
        data.forEach((session) => {
          (session.sections_viewed || []).forEach((section: string) => {
            sectionViewCounts[section] = (sectionViewCounts[section] || 0) + 1;
          });
        });

        const popularSections = Object.entries(sectionViewCounts)
          .map(([section, views]) => ({ section, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        // Aggregate interaction types
        const interactionTypeCounts: { [key: string]: number } = {};
        data.forEach((session) => {
          (session.interactions_data || []).forEach(
            (interaction: ReportInteraction) => {
              interactionTypeCounts[interaction.type] =
                (interactionTypeCounts[interaction.type] || 0) + 1;
            },
          );
        });

        const interactionTypes = Object.entries(interactionTypeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);

        const exportCount = data.filter((session) => session.exported).length;
        const shareCount = data.filter((session) => session.shared).length;
        const bookmarkCount = data.filter(
          (session) => session.bookmarked,
        ).length;

        return {
          totalViews,
          averageReadingTime,
          averageCompletionRate,
          popularSections,
          interactionTypes,
          exportCount,
          shareCount,
          bookmarkCount,
        };
      } catch (error) {
        console.error("Error fetching report analytics:", error);
        return null;
      }
    },
    [user],
  );

  // Get user's report reading history
  const getReportReadingHistory = useCallback(
    async (limit = 50): Promise<ReportAnalytics[]> => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("report_analytics")
          .select(
            `
            *,
            astrology_reports!inner(id, title, report_type, is_premium)
          `,
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching report reading history:", error);
        return [];
      }
    },
    [user],
  );

  // Get aggregated analytics for dashboard
  const getDashboardAnalytics = useCallback(
    async (dateRange?: { start: Date; end: Date }) => {
      if (!user) return null;

      try {
        let query = supabase
          .from("report_analytics")
          .select(
            `
            *,
            astrology_reports!inner(id, title, report_type, is_premium)
          `,
          )
          .eq("user_id", user.id);

        if (dateRange) {
          query = query
            .gte("created_at", dateRange.start.toISOString())
            .lte("created_at", dateRange.end.toISOString());
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
        return null;
      }
    },
    [user],
  );

  // Get popular reports across all users (anonymized)
  const getPopularReports = useCallback(async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from("report_analytics")
        .select(
          `
            report_id,
            astrology_reports!inner(id, title, report_type, is_premium)
          `,
        )
        .limit(1000); // Get a large sample

      if (error) throw error;

      // Count report views
      const reportCounts = new Map();
      data?.forEach((item) => {
        const reportId = item.report_id;
        const report = item.astrology_reports;
        if (!reportCounts.has(reportId)) {
          reportCounts.set(reportId, {
            ...report,
            views: 0,
          });
        }
        reportCounts.get(reportId).views++;
      });

      // Convert to array and sort by views
      return Array.from(reportCounts.values())
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching popular reports:", error);
      return [];
    }
  }, []);

  // Get aggregated user reading stats
  const getUserReadingStats = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("report_analytics")
        .select(
          "session_duration, completion_percentage, word_count, reading_speed",
        )
        .eq("user_id", user.id);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const totalReadingTime = data.reduce(
        (sum, session) => sum + (session.session_duration || 0),
        0,
      );
      const averageCompletionRate =
        data.reduce(
          (sum, session) => sum + (session.completion_percentage || 0),
          0,
        ) / data.length;
      const totalWordsRead = data.reduce(
        (sum, session) =>
          sum +
          ((session.word_count || 0) * (session.completion_percentage || 0)) /
            100,
        0,
      );
      const averageReadingSpeed =
        data
          .filter((s) => s.reading_speed > 0)
          .reduce((sum, session) => sum + (session.reading_speed || 0), 0) /
        data.filter((s) => s.reading_speed > 0).length;
      const reportsRead = data.length;

      return {
        totalReadingTime: Math.round(totalReadingTime / 60), // in minutes
        averageCompletionRate: Math.round(averageCompletionRate),
        totalWordsRead: Math.round(totalWordsRead),
        averageReadingSpeed: Math.round(averageReadingSpeed || 0),
        reportsRead,
      };
    } catch (error) {
      console.error("Error fetching user reading stats:", error);
      return null;
    }
  }, [user]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentSession) {
        endReportTracking();
      }
    };
  }, []);

  // Set up intersection observer for section tracking
  useEffect(() => {
    if (!isTracking) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          const sectionTitle = entry.target.textContent?.slice(0, 100) || "";

          if (entry.isIntersecting) {
            setSectionsInView((prev) => new Set([...prev, sectionId]));
            trackSectionView(sectionId, sectionTitle);
          } else {
            setSectionsInView((prev) => {
              const newSet = new Set(prev);
              newSet.delete(sectionId);
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    // Observe all headings
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [isTracking, trackSectionView]);

  return {
    // Session management
    startReportTracking,
    endReportTracking,
    isTracking,
    currentSession,

    // Progress tracking
    updateReadingProgress,
    trackReportInteraction,
    trackSectionView,

    // Action tracking
    trackReportExport,
    trackReportShare,

    // Analytics retrieval
    getReportAnalytics,
    getReportReadingHistory,
    getUserReadingStats,
    getDashboardAnalytics,
    getPopularReports,

    // State
    sectionsInView,
    readingStartTime,
  };
};

// Helper function to detect device type
function getDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
    return "mobile";
  } else if (/tablet|ipad/i.test(userAgent)) {
    return "tablet";
  } else {
    return "desktop";
  }
}
