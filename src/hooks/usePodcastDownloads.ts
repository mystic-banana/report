import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/authStore";
import type { PodcastDownload, EnhancedEpisode } from "../types/podcastTypes";

interface DownloadProgress {
  episodeId: string;
  progress: number;
  status: "pending" | "downloading" | "completed" | "failed";
  error?: string;
}

export const usePodcastDownloads = () => {
  const { user } = useAuthStore();
  const [downloads, setDownloads] = useState<PodcastDownload[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, DownloadProgress>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // Load user's downloads
  const loadDownloads = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("podcast_downloads")
        .select(
          `
          *,
          episodes!inner(id, title, audio_url, image_url, duration),
          podcasts!inner(id, name, image_url)
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error("Error loading downloads:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Start download
  const startDownload = useCallback(
    async (episode: EnhancedEpisode) => {
      if (!user || !episode.audio_url) return;

      try {
        // Check if already downloaded or downloading
        const existingDownload = downloads.find(
          (d) => d.episode_id === episode.id,
        );
        if (
          existingDownload &&
          ["completed", "downloading"].includes(existingDownload.status)
        ) {
          return;
        }

        // Create download record
        const { data, error } = await supabase
          .from("podcast_downloads")
          .upsert({
            user_id: user.id,
            episode_id: episode.id,
            podcast_id: episode.podcast_id,
            download_url: episode.audio_url,
            status: "pending",
            progress_percentage: 0,
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setDownloadProgress((prev) => ({
          ...prev,
          [episode.id]: {
            episodeId: episode.id,
            progress: 0,
            status: "pending",
          },
        }));

        // Start actual download
        await downloadEpisode(episode, data.id);
      } catch (error) {
        console.error("Error starting download:", error);
        setDownloadProgress((prev) => ({
          ...prev,
          [episode.id]: {
            episodeId: episode.id,
            progress: 0,
            status: "failed",
            error: "Failed to start download",
          },
        }));
      }
    },
    [user, downloads],
  );

  // Download episode file
  const downloadEpisode = async (
    episode: EnhancedEpisode,
    downloadId: string,
  ) => {
    try {
      setDownloadProgress((prev) => ({
        ...prev,
        [episode.id]: {
          episodeId: episode.id,
          progress: 0,
          status: "downloading",
        },
      }));

      // Update database status
      await supabase
        .from("podcast_downloads")
        .update({ status: "downloading" })
        .eq("id", downloadId);

      // Download the file
      const response = await fetch(episode.audio_url);
      if (!response.ok) throw new Error("Download failed");

      const contentLength = response.headers.get("content-length");
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Unable to read response");

      const chunks: Uint8Array[] = [];
      let downloadedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        downloadedSize += value.length;

        const progress = totalSize > 0 ? (downloadedSize / totalSize) * 100 : 0;

        setDownloadProgress((prev) => ({
          ...prev,
          [episode.id]: {
            episodeId: episode.id,
            progress: Math.round(progress),
            status: "downloading",
          },
        }));

        // Update database progress
        await supabase
          .from("podcast_downloads")
          .update({ progress_percentage: Math.round(progress) })
          .eq("id", downloadId);
      }

      // Create blob and store locally
      const blob = new Blob(chunks, { type: "audio/mpeg" });
      const localUrl = URL.createObjectURL(blob);

      // Store in IndexedDB for offline access
      await storeEpisodeLocally(episode.id, blob);

      // Update database as completed
      await supabase
        .from("podcast_downloads")
        .update({
          status: "completed",
          progress_percentage: 100,
          download_completed_at: new Date().toISOString(),
          file_size: downloadedSize,
          local_path: localUrl,
        })
        .eq("id", downloadId);

      setDownloadProgress((prev) => ({
        ...prev,
        [episode.id]: {
          episodeId: episode.id,
          progress: 100,
          status: "completed",
        },
      }));

      // Reload downloads
      await loadDownloads();
    } catch (error) {
      console.error("Error downloading episode:", error);

      setDownloadProgress((prev) => ({
        ...prev,
        [episode.id]: {
          episodeId: episode.id,
          progress: 0,
          status: "failed",
          error: error instanceof Error ? error.message : "Download failed",
        },
      }));

      // Update database as failed
      await supabase
        .from("podcast_downloads")
        .update({
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "Download failed",
        })
        .eq("id", downloadId);
    }
  };

  // Delete download
  const deleteDownload = useCallback(
    async (episodeId: string) => {
      if (!user) return;

      try {
        await supabase
          .from("podcast_downloads")
          .update({ status: "deleted" })
          .eq("user_id", user.id)
          .eq("episode_id", episodeId);

        // Remove from IndexedDB
        await removeEpisodeFromLocal(episodeId);

        // Update local state
        setDownloads((prev) => prev.filter((d) => d.episode_id !== episodeId));
        setDownloadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[episodeId];
          return newProgress;
        });
      } catch (error) {
        console.error("Error deleting download:", error);
      }
    },
    [user],
  );

  // Check if episode is downloaded
  const isEpisodeDownloaded = useCallback(
    (episodeId: string) => {
      return downloads.some(
        (d) => d.episode_id === episodeId && d.status === "completed",
      );
    },
    [downloads],
  );

  // Get local episode URL
  const getLocalEpisodeUrl = useCallback(
    async (episodeId: string): Promise<string | null> => {
      try {
        const blob = await getEpisodeFromLocal(episodeId);
        return blob ? URL.createObjectURL(blob) : null;
      } catch (error) {
        console.error("Error getting local episode:", error);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    if (user) {
      loadDownloads();
    }
  }, [user, loadDownloads]);

  return {
    downloads,
    downloadProgress,
    isLoading,
    startDownload,
    deleteDownload,
    isEpisodeDownloaded,
    getLocalEpisodeUrl,
    loadDownloads,
  };
};

// IndexedDB helpers for offline storage
const DB_NAME = "PodcastDownloads";
const DB_VERSION = 1;
const STORE_NAME = "episodes";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

const storeEpisodeLocally = async (
  episodeId: string,
  blob: Blob,
): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  await new Promise<void>((resolve, reject) => {
    const request = store.put({ id: episodeId, blob, timestamp: Date.now() });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const getEpisodeFromLocal = async (episodeId: string): Promise<Blob | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise<Blob | null>((resolve, reject) => {
      const request = store.get(episodeId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
    });
  } catch (error) {
    console.error("Error getting episode from local storage:", error);
    return null;
  }
};

const removeEpisodeFromLocal = async (episodeId: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(episodeId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Error removing episode from local storage:", error);
  }
};
