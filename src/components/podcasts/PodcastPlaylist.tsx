import React, { useState, useEffect } from "react";
import { Plus, Check, Loader2, Music, Heart, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  episode_count?: number;
  cover_image_url?: string;
}

interface PodcastPlaylistProps {
  currentPodcast: {
    id: string;
    name: string;
  };
  currentEpisode: {
    id: string;
    title: string;
  } | null;
}

const PodcastPlaylist: React.FC<PodcastPlaylistProps> = ({
  currentPodcast,
  currentEpisode,
}) => {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [episodeInPlaylists, setEpisodeInPlaylists] = useState<Set<string>>(
    new Set(),
  );

  // Load user's playlists
  const loadPlaylists = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data: playlistsData, error: playlistsError } = await supabase
        .from("podcast_playlists")
        .select(
          `
          id,
          name,
          description,
          cover_image_url
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (playlistsError) throw playlistsError;

      // Get episode counts for each playlist
      const playlistsWithCounts = await Promise.all(
        (playlistsData || []).map(async (playlist) => {
          const { count } = await supabase
            .from("podcast_playlist_episodes")
            .select("*", { count: "exact", head: true })
            .eq("playlist_id", playlist.id);

          return {
            ...playlist,
            episode_count: count || 0,
          };
        }),
      );

      setPlaylists(playlistsWithCounts);

      // Check which playlists already contain the current episode
      if (currentEpisode) {
        const { data: episodePlaylistData } = await supabase
          .from("podcast_playlist_episodes")
          .select("playlist_id")
          .eq("episode_id", currentEpisode.id);

        const playlistIds = new Set(
          (episodePlaylistData || []).map((item) => item.playlist_id),
        );
        setEpisodeInPlaylists(playlistIds);
      }
    } catch (error) {
      console.error("Error loading playlists:", error);
      toast.error("Failed to load playlists");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [user, currentEpisode]);

  // Create new playlist
  const createPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;

    try {
      setIsCreating(true);

      const { data, error } = await supabase
        .from("podcast_playlists")
        .insert([
          {
            user_id: user.id,
            name: newPlaylistName.trim(),
            description: newPlaylistDescription.trim() || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setPlaylists((prev) => [{ ...data, episode_count: 0 }, ...prev]);

      // Reset form
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setShowCreateForm(false);

      toast.success("Playlist created successfully!");
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist");
    } finally {
      setIsCreating(false);
    }
  };

  // Add episode to playlist
  const addToPlaylist = async (playlistId: string) => {
    if (!currentEpisode || !user) return;

    try {
      setAddingToPlaylist(playlistId);

      // Add episode to playlist with podcast_id
      const { error: insertError } = await supabase
        .from("podcast_playlist_episodes")
        .insert([
          {
            playlist_id: playlistId,
            episode_id: currentEpisode.id,
            podcast_id: currentPodcast.id,
          },
        ]);

      if (insertError) throw insertError;

      // Update local state
      setEpisodeInPlaylists((prev) => new Set([...prev, playlistId]));
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === playlistId
            ? { ...playlist, episode_count: (playlist.episode_count || 0) + 1 }
            : playlist,
        ),
      );

      toast.success("Episode added to playlist!");
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add episode to playlist");
    } finally {
      setAddingToPlaylist(null);
    }
  };

  // Remove episode from playlist
  const removeFromPlaylist = async (playlistId: string) => {
    if (!currentEpisode || !user) return;

    try {
      setAddingToPlaylist(playlistId);

      const { error } = await supabase
        .from("podcast_playlist_episodes")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("episode_id", currentEpisode.id);

      if (error) throw error;

      // Update local state
      setEpisodeInPlaylists((prev) => {
        const newSet = new Set(prev);
        newSet.delete(playlistId);
        return newSet;
      });
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === playlistId
            ? {
                ...playlist,
                episode_count: Math.max(0, (playlist.episode_count || 0) - 1),
              }
            : playlist,
        ),
      );

      toast.success("Episode removed from playlist!");
    } catch (error) {
      console.error("Error removing from playlist:", error);
      toast.error("Failed to remove episode from playlist");
    } finally {
      setAddingToPlaylist(null);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <Music size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">
          Sign in to create and manage playlists
        </p>
        <button className="px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors">
          Sign In
        </button>
      </div>
    );
  }

  if (!currentEpisode) {
    return (
      <div className="text-center py-8">
        <Music size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Select an episode to add to playlists</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Episode Info */}
      <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700">
        <h4 className="font-medium text-white mb-1">Adding to playlists:</h4>
        <p className="text-sm text-gray-400 line-clamp-2">
          {currentEpisode.title}
        </p>
        <p className="text-xs text-gray-500 mt-1">from {currentPodcast.name}</p>
      </div>

      {/* Create New Playlist */}
      <div className="border-b border-dark-700 pb-4">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 w-full p-3 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg border border-dark-700 hover:border-accent-500/30 transition-all text-left"
          >
            <Plus size={20} className="text-accent-400" />
            <span className="text-white font-medium">Create New Playlist</span>
          </button>
        ) : (
          <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                maxLength={100}
              />
              <textarea
                placeholder="Description (optional)"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                rows={2}
                maxLength={500}
              />
              <div className="flex space-x-2">
                <button
                  onClick={createPlaylist}
                  disabled={!newPlaylistName.trim() || isCreating}
                  className="flex items-center space-x-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
                >
                  {isCreating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  <span>{isCreating ? "Creating..." : "Create"}</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPlaylistName("");
                    setNewPlaylistDescription("");
                  }}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Existing Playlists */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2
              size={32}
              className="text-accent-500 animate-spin mx-auto mb-4"
            />
            <p className="text-gray-400">Loading playlists...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-8">
            <Heart size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No playlists yet</p>
            <p className="text-sm text-gray-500">
              Create your first playlist to get started
            </p>
          </div>
        ) : (
          playlists.map((playlist) => {
            const isInPlaylist = episodeInPlaylists.has(playlist.id);
            const isProcessing = addingToPlaylist === playlist.id;

            return (
              <div
                key={playlist.id}
                className="flex items-center justify-between p-3 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg border border-dark-700 hover:border-accent-500/30 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white line-clamp-1">
                    {playlist.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm text-gray-400">
                      {playlist.episode_count || 0} episode
                      {(playlist.episode_count || 0) !== 1 ? "s" : ""}
                    </p>
                    {playlist.description && (
                      <>
                        <span className="text-gray-600">&bull;</span>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {playlist.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    isInPlaylist
                      ? removeFromPlaylist(playlist.id)
                      : addToPlaylist(playlist.id)
                  }
                  disabled={isProcessing}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-all ${
                    isInPlaylist
                      ? "bg-green-600/20 text-green-400 hover:bg-red-600/20 hover:text-red-400"
                      : "bg-accent-600 hover:bg-accent-700 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isInPlaylist ? (
                    <>
                      <Check size={16} />
                      <span className="hidden sm:inline">Added</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span className="hidden sm:inline">Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PodcastPlaylist;
