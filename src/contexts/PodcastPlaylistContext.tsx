import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/authStore";
import {
  PodcastPlaylist,
  PlaylistEpisode,
  EnhancedEpisode,
} from "../types/podcastTypes";
import toast from "react-hot-toast";

interface PodcastPlaylistContextType {
  // State
  playlists: PodcastPlaylist[];
  currentPlaylist: PodcastPlaylist | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUserPlaylists: () => Promise<void>;
  loadPlaylistById: (playlistId: string) => Promise<PodcastPlaylist | null>;
  createPlaylist: (
    name: string,
    description?: string,
    isPublic?: boolean,
  ) => Promise<PodcastPlaylist | null>;
  updatePlaylist: (
    playlistId: string,
    updates: Partial<PodcastPlaylist>,
  ) => Promise<boolean>;
  deletePlaylist: (playlistId: string) => Promise<boolean>;

  // Episode management
  addEpisodeToPlaylist: (
    playlistId: string,
    episodeId: string,
    podcastId: string,
  ) => Promise<boolean>;
  removeEpisodeFromPlaylist: (
    playlistId: string,
    episodeId: string,
  ) => Promise<boolean>;
  reorderPlaylistEpisodes: (
    playlistId: string,
    episodeIds: string[],
  ) => Promise<boolean>;
  getPlaylistEpisodes: (playlistId: string) => Promise<PlaylistEpisode[]>;

  // Utility functions
  isEpisodeInPlaylist: (playlistId: string, episodeId: string) => boolean;
  getPlaylistsContainingEpisode: (episodeId: string) => PodcastPlaylist[];
  refreshPlaylist: (playlistId: string) => Promise<void>;
  clearError: () => void;
}

const PodcastPlaylistContext = createContext<PodcastPlaylistContextType | null>(
  null,
);

export const usePodcastPlaylist = () => {
  const context = useContext(PodcastPlaylistContext);
  if (!context) {
    throw new Error(
      "usePodcastPlaylist must be used within a PodcastPlaylistProvider",
    );
  }
  return context;
};

interface PodcastPlaylistProviderProps {
  children: React.ReactNode;
}

export const PodcastPlaylistProvider: React.FC<
  PodcastPlaylistProviderProps
> = ({ children }) => {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState<PodcastPlaylist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] =
    useState<PodcastPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodePlaylistMap, setEpisodePlaylistMap] = useState<
    Map<string, Set<string>>
  >(new Map());

  // Load user's playlists
  const loadUserPlaylists = useCallback(async () => {
    if (!user) {
      setPlaylists([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: playlistsData, error: playlistsError } = await supabase
        .from("podcast_playlists")
        .select(
          `
          id,
          name,
          description,
          is_public,
          cover_image_url,
          created_at,
          updated_at
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (playlistsError) throw playlistsError;

      // Get episode counts and total duration for each playlist
      const playlistsWithStats = await Promise.all(
        (playlistsData || []).map(async (playlist) => {
          const { data: episodeData, error: episodeError } = await supabase
            .from("podcast_playlist_episodes")
            .select(
              `
              id,
              episode_id,
              episodes!inner(
                id,
                title,
                duration
              )
            `,
            )
            .eq("playlist_id", playlist.id)
            .order("position", { ascending: true });

          if (episodeError) {
            console.error(
              `Error loading episodes for playlist ${playlist.id}:`,
              episodeError,
            );
          }

          const episodes = episodeData || [];
          const episodeCount = episodes.length;

          // Calculate total duration (assuming duration is in seconds or a parseable format)
          const totalDuration = episodes.reduce((total, ep) => {
            const duration = ep.episodes?.duration;
            if (typeof duration === "string") {
              // Parse duration string (e.g., "1:23:45" or "23:45")
              const parts = duration.split(":").map(Number);
              if (parts.length === 3) {
                return total + (parts[0] * 3600 + parts[1] * 60 + parts[2]);
              } else if (parts.length === 2) {
                return total + (parts[0] * 60 + parts[1]);
              }
            } else if (typeof duration === "number") {
              return total + duration;
            }
            return total;
          }, 0);

          return {
            ...playlist,
            user_id: user.id,
            episode_count: episodeCount,
            total_duration: totalDuration,
          };
        }),
      );

      setPlaylists(playlistsWithStats);

      // Build episode-playlist mapping for quick lookups
      const episodeMap = new Map<string, Set<string>>();
      for (const playlist of playlistsWithStats) {
        const { data: episodeData } = await supabase
          .from("podcast_playlist_episodes")
          .select("episode_id")
          .eq("playlist_id", playlist.id);

        (episodeData || []).forEach(({ episode_id }) => {
          if (!episodeMap.has(episode_id)) {
            episodeMap.set(episode_id, new Set());
          }
          episodeMap.get(episode_id)!.add(playlist.id);
        });
      }
      setEpisodePlaylistMap(episodeMap);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load playlists";
      setError(errorMessage);
      console.error("Error loading playlists:", err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load specific playlist by ID
  const loadPlaylistById = useCallback(
    async (playlistId: string): Promise<PodcastPlaylist | null> => {
      try {
        setError(null);

        const { data: playlistData, error: playlistError } = await supabase
          .from("podcast_playlists")
          .select(
            `
          id,
          user_id,
          name,
          description,
          is_public,
          cover_image_url,
          created_at,
          updated_at
        `,
          )
          .eq("id", playlistId)
          .single();

        if (playlistError) throw playlistError;

        // Get episodes for this playlist
        const { data: episodeData, error: episodeError } = await supabase
          .from("podcast_playlist_episodes")
          .select(
            `
          id,
          episode_id,
          position,
          added_at,
          episodes!inner(
            id,
            title,
            audio_url,
            image_url,
            duration,
            podcasts!inner(
              id,
              name
            )
          )
        `,
          )
          .eq("playlist_id", playlistId)
          .order("position", { ascending: true });

        if (episodeError) {
          console.error("Error loading playlist episodes:", episodeError);
        }

        const episodes: PlaylistEpisode[] = (episodeData || []).map((ep) => ({
          id: ep.id,
          playlist_id: playlistId,
          episode_id: ep.episode_id,
          position: ep.position,
          added_at: ep.added_at,
          episode: {
            id: ep.episodes.id,
            title: ep.episodes.title,
            audio_url: ep.episodes.audio_url,
            image_url: ep.episodes.image_url,
            duration: ep.episodes.duration,
            podcast_name: ep.episodes.podcasts?.name,
          },
        }));

        const totalDuration = episodes.reduce((total, ep) => {
          const duration = ep.episode?.duration;
          if (typeof duration === "string") {
            const parts = duration.split(":").map(Number);
            if (parts.length === 3) {
              return total + (parts[0] * 3600 + parts[1] * 60 + parts[2]);
            } else if (parts.length === 2) {
              return total + (parts[0] * 60 + parts[1]);
            }
          } else if (typeof duration === "number") {
            return total + duration;
          }
          return total;
        }, 0);

        const fullPlaylist: PodcastPlaylist = {
          ...playlistData,
          episode_count: episodes.length,
          total_duration: totalDuration,
          episodes,
        };

        setCurrentPlaylist(fullPlaylist);
        return fullPlaylist;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load playlist";
        setError(errorMessage);
        console.error("Error loading playlist:", err);
        toast.error(errorMessage);
        return null;
      }
    },
    [],
  );

  // Create new playlist
  const createPlaylist = useCallback(
    async (
      name: string,
      description?: string,
      isPublic: boolean = false,
    ): Promise<PodcastPlaylist | null> => {
      if (!user || !name.trim()) {
        toast.error("Please provide a playlist name");
        return null;
      }

      try {
        setError(null);

        const { data, error } = await supabase
          .from("podcast_playlists")
          .insert([
            {
              user_id: user.id,
              name: name.trim(),
              description: description?.trim() || null,
              is_public: isPublic,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        const newPlaylist: PodcastPlaylist = {
          ...data,
          episode_count: 0,
          total_duration: 0,
          episodes: [],
        };

        setPlaylists((prev) => [newPlaylist, ...prev]);
        toast.success("Playlist created successfully!");
        return newPlaylist;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create playlist";
        setError(errorMessage);
        console.error("Error creating playlist:", err);
        toast.error(errorMessage);
        return null;
      }
    },
    [user],
  );

  // Update playlist
  const updatePlaylist = useCallback(
    async (
      playlistId: string,
      updates: Partial<PodcastPlaylist>,
    ): Promise<boolean> => {
      if (!user) return false;

      try {
        setError(null);

        const { error } = await supabase
          .from("podcast_playlists")
          .update({
            name: updates.name,
            description: updates.description,
            is_public: updates.is_public,
            cover_image_url: updates.cover_image_url,
          })
          .eq("id", playlistId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Update local state
        setPlaylists((prev) =>
          prev.map((playlist) =>
            playlist.id === playlistId ? { ...playlist, ...updates } : playlist,
          ),
        );

        if (currentPlaylist?.id === playlistId) {
          setCurrentPlaylist((prev) => (prev ? { ...prev, ...updates } : null));
        }

        toast.success("Playlist updated successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update playlist";
        setError(errorMessage);
        console.error("Error updating playlist:", err);
        toast.error(errorMessage);
        return false;
      }
    },
    [user, currentPlaylist],
  );

  // Delete playlist
  const deletePlaylist = useCallback(
    async (playlistId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        setError(null);

        const { error } = await supabase
          .from("podcast_playlists")
          .delete()
          .eq("id", playlistId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Update local state
        setPlaylists((prev) =>
          prev.filter((playlist) => playlist.id !== playlistId),
        );

        if (currentPlaylist?.id === playlistId) {
          setCurrentPlaylist(null);
        }

        // Update episode-playlist mapping
        setEpisodePlaylistMap((prev) => {
          const newMap = new Map(prev);
          for (const [episodeId, playlistIds] of newMap.entries()) {
            playlistIds.delete(playlistId);
            if (playlistIds.size === 0) {
              newMap.delete(episodeId);
            }
          }
          return newMap;
        });

        toast.success("Playlist deleted successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete playlist";
        setError(errorMessage);
        console.error("Error deleting playlist:", err);
        toast.error(errorMessage);
        return false;
      }
    },
    [user, currentPlaylist],
  );

  // Add episode to playlist
  const addEpisodeToPlaylist = useCallback(
    async (
      playlistId: string,
      episodeId: string,
      podcastId: string,
    ): Promise<boolean> => {
      if (!user) return false;

      try {
        setError(null);

        // Get current max position
        const { data: positionData } = await supabase
          .from("podcast_playlist_episodes")
          .select("position")
          .eq("playlist_id", playlistId)
          .order("position", { ascending: false })
          .limit(1);

        const nextPosition = (positionData?.[0]?.position || 0) + 1;

        const { error } = await supabase
          .from("podcast_playlist_episodes")
          .insert([
            {
              playlist_id: playlistId,
              episode_id: episodeId,
              podcast_id: podcastId,
              position: nextPosition,
            },
          ]);

        if (error) throw error;

        // Update local state
        setPlaylists((prev) =>
          prev.map((playlist) =>
            playlist.id === playlistId
              ? { ...playlist, episode_count: playlist.episode_count + 1 }
              : playlist,
          ),
        );

        // Update episode-playlist mapping
        setEpisodePlaylistMap((prev) => {
          const newMap = new Map(prev);
          if (!newMap.has(episodeId)) {
            newMap.set(episodeId, new Set());
          }
          newMap.get(episodeId)!.add(playlistId);
          return newMap;
        });

        toast.success("Episode added to playlist!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to add episode to playlist";
        setError(errorMessage);
        console.error("Error adding episode to playlist:", err);
        toast.error(errorMessage);
        return false;
      }
    },
    [user],
  );

  // Remove episode from playlist
  const removeEpisodeFromPlaylist = useCallback(
    async (playlistId: string, episodeId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        setError(null);

        const { error } = await supabase
          .from("podcast_playlist_episodes")
          .delete()
          .eq("playlist_id", playlistId)
          .eq("episode_id", episodeId);

        if (error) throw error;

        // Update local state
        setPlaylists((prev) =>
          prev.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  episode_count: Math.max(0, playlist.episode_count - 1),
                }
              : playlist,
          ),
        );

        // Update current playlist if it's loaded
        if (currentPlaylist?.id === playlistId) {
          setCurrentPlaylist((prev) =>
            prev
              ? {
                  ...prev,
                  episode_count: Math.max(0, prev.episode_count - 1),
                  episodes:
                    prev.episodes?.filter(
                      (ep) => ep.episode_id !== episodeId,
                    ) || [],
                }
              : null,
          );
        }

        // Update episode-playlist mapping
        setEpisodePlaylistMap((prev) => {
          const newMap = new Map(prev);
          if (newMap.has(episodeId)) {
            newMap.get(episodeId)!.delete(playlistId);
            if (newMap.get(episodeId)!.size === 0) {
              newMap.delete(episodeId);
            }
          }
          return newMap;
        });

        toast.success("Episode removed from playlist!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove episode from playlist";
        setError(errorMessage);
        console.error("Error removing episode from playlist:", err);
        toast.error(errorMessage);
        return false;
      }
    },
    [user, currentPlaylist],
  );

  // Reorder playlist episodes
  const reorderPlaylistEpisodes = useCallback(
    async (playlistId: string, episodeIds: string[]): Promise<boolean> => {
      if (!user) return false;

      try {
        setError(null);

        // Update positions for all episodes
        const updates = episodeIds.map((episodeId, index) => ({
          playlist_id: playlistId,
          episode_id: episodeId,
          position: index + 1,
        }));

        for (const update of updates) {
          const { error } = await supabase
            .from("podcast_playlist_episodes")
            .update({ position: update.position })
            .eq("playlist_id", update.playlist_id)
            .eq("episode_id", update.episode_id);

          if (error) throw error;
        }

        // Refresh current playlist if it matches
        if (currentPlaylist?.id === playlistId) {
          await loadPlaylistById(playlistId);
        }

        toast.success("Playlist reordered successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reorder playlist";
        setError(errorMessage);
        console.error("Error reordering playlist:", err);
        toast.error(errorMessage);
        return false;
      }
    },
    [user, currentPlaylist, loadPlaylistById],
  );

  // Get playlist episodes
  const getPlaylistEpisodes = useCallback(
    async (playlistId: string): Promise<PlaylistEpisode[]> => {
      try {
        const { data, error } = await supabase
          .from("podcast_playlist_episodes")
          .select(
            `
          id,
          episode_id,
          position,
          added_at,
          episodes!inner(
            id,
            title,
            audio_url,
            image_url,
            duration,
            podcasts!inner(
              id,
              name
            )
          )
        `,
          )
          .eq("playlist_id", playlistId)
          .order("position", { ascending: true });

        if (error) throw error;

        return (data || []).map((ep) => ({
          id: ep.id,
          playlist_id: playlistId,
          episode_id: ep.episode_id,
          position: ep.position,
          added_at: ep.added_at,
          episode: {
            id: ep.episodes.id,
            title: ep.episodes.title,
            audio_url: ep.episodes.audio_url,
            image_url: ep.episodes.image_url,
            duration: ep.episodes.duration,
            podcast_name: ep.episodes.podcasts?.name,
          },
        }));
      } catch (err) {
        console.error("Error loading playlist episodes:", err);
        return [];
      }
    },
    [],
  );

  // Utility functions
  const isEpisodeInPlaylist = useCallback(
    (playlistId: string, episodeId: string): boolean => {
      return episodePlaylistMap.get(episodeId)?.has(playlistId) || false;
    },
    [episodePlaylistMap],
  );

  const getPlaylistsContainingEpisode = useCallback(
    (episodeId: string): PodcastPlaylist[] => {
      const playlistIds = episodePlaylistMap.get(episodeId);
      if (!playlistIds) return [];

      return playlists.filter((playlist) => playlistIds.has(playlist.id));
    },
    [episodePlaylistMap, playlists],
  );

  const refreshPlaylist = useCallback(
    async (playlistId: string): Promise<void> => {
      await loadPlaylistById(playlistId);
    },
    [loadPlaylistById],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load playlists when user changes
  useEffect(() => {
    loadUserPlaylists();
  }, [loadUserPlaylists]);

  const value: PodcastPlaylistContextType = {
    // State
    playlists,
    currentPlaylist,
    isLoading,
    error,

    // Actions
    loadUserPlaylists,
    loadPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,

    // Episode management
    addEpisodeToPlaylist,
    removeEpisodeFromPlaylist,
    reorderPlaylistEpisodes,
    getPlaylistEpisodes,

    // Utility functions
    isEpisodeInPlaylist,
    getPlaylistsContainingEpisode,
    refreshPlaylist,
    clearError,
  };

  return (
    <PodcastPlaylistContext.Provider value={value}>
      {children}
    </PodcastPlaylistContext.Provider>
  );
};

export default PodcastPlaylistProvider;
