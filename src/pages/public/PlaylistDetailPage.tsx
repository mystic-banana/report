import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Play,
  Pause,
  MoreVertical,
  Edit3,
  Trash2,
  Share2,
  Download,
  Clock,
  Music,
  ArrowLeft,
  GripVertical,
  X,
  Check,
  Globe,
  Lock,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import { usePodcastPlaylist } from "../../contexts/PodcastPlaylistContext";
import { usePlayerStore } from "../../store/playerStore";
import { useAuthStore } from "../../store/authStore";
import {
  PodcastPlaylist,
  PlaylistEpisode,
  EnhancedEpisode,
} from "../../types/podcastTypes";
import toast from "react-hot-toast";
import { format } from "date-fns";

const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentPlaylist,
    isLoading,
    error,
    loadPlaylistById,
    updatePlaylist,
    deletePlaylist,
    removeEpisodeFromPlaylist,
    reorderPlaylistEpisodes,
    clearError,
  } = usePodcastPlaylist();
  const { currentEpisode, isPlaying, setQueueAndPlay, togglePlayPause } =
    usePlayerStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [draggedEpisode, setDraggedEpisode] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [episodeMenuOpen, setEpisodeMenuOpen] = useState<string | null>(null);
  const [removingEpisode, setRemovingEpisode] = useState<string | null>(null);

  // Load playlist data
  useEffect(() => {
    if (id) {
      loadPlaylistById(id);
    }
  }, [id, loadPlaylistById]);

  // Initialize edit form when playlist loads
  useEffect(() => {
    if (currentPlaylist) {
      setEditName(currentPlaylist.name);
      setEditDescription(currentPlaylist.description || "");
      setEditIsPublic(currentPlaylist.is_public);
    }
  }, [currentPlaylist]);

  // Clear error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handlePlayPlaylist = () => {
    if (!currentPlaylist?.episodes || currentPlaylist.episodes.length === 0) {
      toast.error("No episodes in this playlist");
      return;
    }

    const episodes: EnhancedEpisode[] = currentPlaylist.episodes
      .filter((ep) => ep.episode)
      .map((ep) => ({
        id: ep.episode!.id,
        title: ep.episode!.title,
        audio_url: ep.episode!.audio_url,
        image_url: ep.episode!.image_url,
        podcast_name: ep.episode!.podcast_name,
        podcast_id: "", // We don't have this in the current structure
        duration: ep.episode!.duration,
      }));

    if (episodes.length > 0) {
      setQueueAndPlay(episodes, 0);
    }
  };

  const handlePlayEpisode = (episode: PlaylistEpisode) => {
    if (!episode.episode) return;

    const enhancedEpisode: EnhancedEpisode = {
      id: episode.episode.id,
      title: episode.episode.title,
      audio_url: episode.episode.audio_url,
      image_url: episode.episode.image_url,
      podcast_name: episode.episode.podcast_name,
      podcast_id: "",
      duration: episode.episode.duration,
    };

    // If this episode is currently playing, toggle play/pause
    if (currentEpisode?.id === episode.episode.id) {
      togglePlayPause();
    } else {
      setQueueAndPlay([enhancedEpisode], 0);
    }
  };

  const handleSaveEdit = async () => {
    if (!currentPlaylist || !editName.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    const success = await updatePlaylist(currentPlaylist.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      is_public: editIsPublic,
    });

    if (success) {
      setIsEditing(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!currentPlaylist) return;

    const success = await deletePlaylist(currentPlaylist.id);
    if (success) {
      navigate("/podcasts");
    }
  };

  const handleRemoveEpisode = async (episodeId: string) => {
    if (!currentPlaylist) return;

    setRemovingEpisode(episodeId);
    const success = await removeEpisodeFromPlaylist(
      currentPlaylist.id,
      episodeId,
    );
    if (success) {
      // Reload playlist to get updated data
      await loadPlaylistById(currentPlaylist.id);
    }
    setRemovingEpisode(null);
    setEpisodeMenuOpen(null);
  };

  const handleDragStart = (e: React.DragEvent, episodeId: string) => {
    setDraggedEpisode(episodeId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (!draggedEpisode || !currentPlaylist?.episodes) return;

    const episodes = [...currentPlaylist.episodes];
    const dragIndex = episodes.findIndex(
      (ep) => ep.episode_id === draggedEpisode,
    );

    if (dragIndex === -1 || dragIndex === dropIndex) {
      setDraggedEpisode(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder episodes array
    const [draggedItem] = episodes.splice(dragIndex, 1);
    episodes.splice(dropIndex, 0, draggedItem);

    // Create new order array
    const newOrder = episodes.map((ep) => ep.episode_id);

    const success = await reorderPlaylistEpisodes(currentPlaylist.id, newOrder);
    if (!success) {
      toast.error("Failed to reorder episodes");
    }

    setDraggedEpisode(null);
    setDragOverIndex(null);
  };

  const formatDuration = (duration: string | undefined): string => {
    if (!duration) return "--:--";

    if (typeof duration === "string" && duration.includes(":")) {
      return duration;
    }

    // If duration is in seconds
    const seconds = parseInt(duration.toString());
    if (isNaN(seconds)) return "--:--";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTotalDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="text-accent-500 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-400">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (error || !currentPlaylist) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Music size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {error || "Playlist not found"}
          </h2>
          <p className="text-gray-400 mb-6">
            The playlist you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Link
            to="/podcasts"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Podcasts</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === currentPlaylist.user_id;
  const episodes = currentPlaylist.episodes || [];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-dark-800 to-dark-900 border-b border-dark-700">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <nav className="text-sm text-gray-400">
              <Link
                to="/podcasts"
                className="hover:text-white transition-colors"
              >
                Podcasts
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">Playlist</span>
            </nav>
          </div>

          {/* Playlist Info */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8">
            {/* Cover Image */}
            <div className="w-48 h-48 bg-gradient-to-br from-accent-600 to-accent-800 rounded-xl flex items-center justify-center mb-6 lg:mb-0 flex-shrink-0">
              {currentPlaylist.cover_image_url ? (
                <img
                  src={currentPlaylist.cover_image_url}
                  alt={currentPlaylist.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Music size={64} className="text-white/80" />
              )}
            </div>

            {/* Playlist Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-accent-400">
                  PLAYLIST
                </span>
                {currentPlaylist.is_public ? (
                  <Globe
                    size={14}
                    className="text-green-400"
                    title="Public playlist"
                  />
                ) : (
                  <Lock
                    size={14}
                    className="text-gray-400"
                    title="Private playlist"
                  />
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-4xl font-bold text-white bg-transparent border-b-2 border-accent-500 focus:outline-none focus:border-accent-400 w-full"
                    placeholder="Playlist name"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-gray-300 bg-dark-700 border border-dark-600 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                    placeholder="Add a description..."
                    rows={3}
                  />
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={editIsPublic}
                        onChange={(e) => setEditIsPublic(e.target.checked)}
                        className="w-4 h-4 text-accent-600 bg-dark-700 border-dark-600 rounded focus:ring-accent-500"
                      />
                      <span>Make playlist public</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center space-x-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Check size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-white mb-4">
                    {currentPlaylist.name}
                  </h1>
                  {currentPlaylist.description && (
                    <p className="text-gray-300 mb-4 max-w-2xl">
                      {currentPlaylist.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>Created by you</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Music size={14} />
                      <span>
                        {episodes.length} episode
                        {episodes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {currentPlaylist.total_duration > 0 && (
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>
                          {formatTotalDuration(currentPlaylist.total_duration)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>
                        Created{" "}
                        {format(
                          new Date(currentPlaylist.created_at),
                          "MMM d, yyyy",
                        )}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center space-x-4 mt-8">
              <button
                onClick={handlePlayPlaylist}
                disabled={episodes.length === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <Play size={20} />
                <span>Play All</span>
              </button>

              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    <Edit3 size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </>
              )}

              <button className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg font-medium transition-colors">
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Episodes List */}
      <div className="container mx-auto px-4 py-8">
        {episodes.length === 0 ? (
          <div className="text-center py-16">
            <Music size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No episodes in this playlist
            </h3>
            <p className="text-gray-400 mb-6">
              Start adding episodes to build your perfect playlist.
            </p>
            <Link
              to="/podcasts"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors"
            >
              <span>Browse Podcasts</span>
            </Link>
          </div>
        ) : (
          <div className="bg-dark-800/50 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-dark-700 text-sm font-medium text-gray-400">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-2">Podcast</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-1"></div>
            </div>

            {/* Episodes */}
            <div className="divide-y divide-dark-700">
              {episodes.map((episode, index) => {
                const isCurrentlyPlaying =
                  currentEpisode?.id === episode.episode?.id && isPlaying;
                const isCurrentEpisode =
                  currentEpisode?.id === episode.episode?.id;
                const isRemoving = removingEpisode === episode.episode_id;

                return (
                  <div
                    key={episode.id}
                    draggable={isOwner}
                    onDragStart={(e) =>
                      isOwner && handleDragStart(e, episode.episode_id)
                    }
                    onDragOver={(e) => isOwner && handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => isOwner && handleDrop(e, index)}
                    className={`grid grid-cols-12 gap-4 p-4 hover:bg-dark-700/50 transition-colors group relative ${
                      dragOverIndex === index
                        ? "border-t-2 border-accent-500"
                        : ""
                    } ${
                      draggedEpisode === episode.episode_id ? "opacity-50" : ""
                    } ${isCurrentEpisode ? "bg-accent-500/10" : ""}`}
                  >
                    {/* Position */}
                    <div className="col-span-1 flex items-center">
                      {isOwner ? (
                        <div className="flex items-center space-x-2">
                          <GripVertical
                            size={16}
                            className="text-gray-500 cursor-grab"
                          />
                          <span className="text-gray-400 text-sm">
                            {index + 1}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Title & Play Button */}
                    <div className="col-span-6 flex items-center space-x-3">
                      <button
                        onClick={() => handlePlayEpisode(episode)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isCurrentlyPlaying
                            ? "bg-accent-600 text-white"
                            : "bg-dark-700 text-gray-300 hover:bg-accent-600 hover:text-white"
                        }`}
                      >
                        {isCurrentlyPlaying ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>

                      <div className="flex items-center space-x-3 min-w-0">
                        {episode.episode?.image_url && (
                          <img
                            src={episode.episode.image_url}
                            alt={episode.episode.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <h4
                            className={`font-medium line-clamp-1 ${
                              isCurrentEpisode
                                ? "text-accent-400"
                                : "text-white"
                            }`}
                          >
                            {episode.episode?.title || "Unknown Episode"}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-1">
                            Added{" "}
                            {format(new Date(episode.added_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Podcast */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-300 text-sm line-clamp-1">
                        {episode.episode?.podcast_name || "Unknown Podcast"}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-400 text-sm">
                        {formatDuration(episode.episode?.duration)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end">
                      {isRemoving ? (
                        <Loader2
                          size={16}
                          className="text-gray-400 animate-spin"
                        />
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setEpisodeMenuOpen(
                                episodeMenuOpen === episode.episode_id
                                  ? null
                                  : episode.episode_id,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {episodeMenuOpen === episode.episode_id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-dark-700 border border-dark-600 rounded-lg shadow-lg z-10">
                              <div className="py-1">
                                <button className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors flex items-center space-x-2">
                                  <Download size={14} />
                                  <span>Download</span>
                                </button>
                                <button className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors flex items-center space-x-2">
                                  <Share2 size={14} />
                                  <span>Share</span>
                                </button>
                                {isOwner && (
                                  <button
                                    onClick={() =>
                                      handleRemoveEpisode(episode.episode_id)
                                    }
                                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-dark-600 transition-colors flex items-center space-x-2"
                                  >
                                    <Trash2 size={14} />
                                    <span>Remove from playlist</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-xl max-w-md w-full p-6 border border-dark-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Delete Playlist
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{currentPlaylist.name}"? This
              action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDeletePlaylist}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Playlist
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close episode menu */}
      {episodeMenuOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setEpisodeMenuOpen(null)}
        />
      )}
    </div>
  );
};

export default PlaylistDetailPage;
