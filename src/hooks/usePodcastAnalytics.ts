import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/authStore";
import type { PodcastAnalytics } from "../types/podcastTypes";

interface AnalyticsSession {
  episodeId: string;
  podcastId: string;
  startTime: number;
  lastUpdateTime: number;
  totalDuration: number;
  sessionId?: string;
}

export const usePodcastAnalytics = () => {
  const { user } = useAuthStore();
  const [currentSession, setCurrentSession] = useState<AnalyticsSession | null>(
    null,
  );
  const [isTracking, setIsTracking] = useState(false);

  // Start tracking a new episode
  const startTracking = useCallback(
    async (episodeId: string, podcastId: string, totalDuration: number) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("podcast_analytics")
          .insert({
            user_id: user.id,
            episode_id: episodeId,
            podcast_id: podcastId,
            total_duration: totalDuration,
            device_type: getDeviceType(),
            user_agent: navigator.userAgent,
          })
          .select()
          .single();

        if (error) throw error;

        const session: AnalyticsSession = {
          episodeId,
          podcastId,
          startTime: Date.now(),
          lastUpdateTime: Date.now(),
          totalDuration,
          sessionId: data.id,
        };

        setCurrentSession(session);
        setIsTracking(true);
      } catch (error) {
        console.error("Error starting analytics tracking:", error);
      }
    },
    [user],
  );

  // Update listening progress
  const updateProgress = useCallback(
    async (currentTime: number) => {
      if (!currentSession || !user || !currentSession.sessionId) return;

      const now = Date.now();
      const timeSinceLastUpdate = (now - currentSession.lastUpdateTime) / 1000;

      // Only update if at least 5 seconds have passed
      if (timeSinceLastUpdate < 5) return;

      try {
        const durationListened = Math.floor(currentTime);
        const completionPercentage =
          currentSession.totalDuration > 0
            ? Math.min(
                (durationListened / currentSession.totalDuration) * 100,
                100,
              )
            : 0;

        await supabase
          .from("podcast_analytics")
          .update({
            duration_listened: durationListened,
            completion_percentage: completionPercentage,
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
      } catch (error) {
        console.error("Error updating analytics progress:", error);
      }
    },
    [currentSession, user],
  );

  // End tracking session
  const endTracking = useCallback(
    async (finalTime?: number) => {
      if (!currentSession || !user || !currentSession.sessionId) return;

      try {
        const durationListened = finalTime ? Math.floor(finalTime) : 0;
        const completionPercentage =
          currentSession.totalDuration > 0
            ? Math.min(
                (durationListened / currentSession.totalDuration) * 100,
                100,
              )
            : 0;

        await supabase
          .from("podcast_analytics")
          .update({
            play_ended_at: new Date().toISOString(),
            duration_listened: durationListened,
            completion_percentage: completionPercentage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSession.sessionId);

        setCurrentSession(null);
        setIsTracking(false);
      } catch (error) {
        console.error("Error ending analytics tracking:", error);
      }
    },
    [currentSession, user],
  );

  // Get analytics for a podcast
  const getPodcastAnalytics = useCallback(
    async (podcastId: string) => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("podcast_stats")
          .select("*")
          .eq("id", podcastId)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching podcast analytics:", error);
        return null;
      }
    },
    [user],
  );

  // Get user's listening history
  const getListeningHistory = useCallback(
    async (limit = 50) => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("podcast_analytics")
          .select(
            `
          *,
          episodes!inner(id, title, image_url, podcast_id),
          podcasts!inner(id, name, image_url)
        `,
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching listening history:", error);
        return [];
      }
    },
    [user],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentSession) {
        endTracking();
      }
    };
  }, []);

  return {
    startTracking,
    updateProgress,
    endTracking,
    getPodcastAnalytics,
    getListeningHistory,
    isTracking,
    currentSession,
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
