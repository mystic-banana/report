import React, { useState } from "react";
import {
  Star,
  Download,
  Play,
  Headphones,
  Heart,
  Share2,
  Clock,
  Calendar,
  Sparkles,
} from "lucide-react";
import { usePodcastDownloads } from "../../hooks/usePodcastDownloads";
import { usePodcastReviews } from "../../hooks/usePodcastReviews";
import { usePlayerStore } from "../../store/playerStore";
import type { EnhancedEpisode } from "../../types/podcastTypes";

interface Podcast {
  id: string;
  title: string;
  description: string;
  duration: string;
  coverImage: string;
  date: string;
  category?: string;
  hostName?: string;
  rating?: number;
  reviewCount?: number;
  episodes?: EnhancedEpisode[];
}

interface PodcastCardProps {
  podcast: Podcast;
  showDownloadButton?: boolean;
  showRating?: boolean;
  onPlay?: (episode: EnhancedEpisode) => void;
  variant?: "default" | "featured" | "compact";
  className?: string;
}

const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  showDownloadButton = false,
  showRating = true,
  onPlay,
  variant = "default",
  className = "",
}) => {
  const { isEpisodeDownloaded, startDownload } = usePodcastDownloads();
  const { stats } = usePodcastReviews(podcast.id);
  const { setQueueAndPlay } = usePlayerStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const latestEpisode = podcast.episodes?.[0];
  const isDownloaded = latestEpisode
    ? isEpisodeDownloaded(latestEpisode.id)
    : false;

  const handlePlayPodcast = () => {
    if (latestEpisode) {
      if (onPlay) {
        onPlay(latestEpisode);
      } else {
        setQueueAndPlay([latestEpisode], 0);
      }
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (latestEpisode && !isDownloaded) {
      await startDownload(latestEpisode);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement share functionality
  };

  const formattedDate = new Date(podcast.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (variant === "compact") {
    return (
      <div
        className={`group bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl overflow-hidden border border-dark-700 hover:border-accent-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center p-4 space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={podcast.coverImage}
              alt={podcast.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div
              className={`absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
            >
              <button
                onClick={handlePlayPodcast}
                className="p-2 bg-accent-500 hover:bg-accent-600 text-white rounded-full transition-colors shadow-lg"
              >
                <Play size={16} className="ml-0.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white line-clamp-1 group-hover:text-accent-400 transition-colors">
              {podcast.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-1">
              {podcast.hostName}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              {showRating && stats.averageRating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star size={12} className="text-yellow-400 fill-current" />
                  <span className="text-yellow-400 text-xs font-medium">
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
              <span className="text-gray-500 text-xs">{podcast.duration}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showDownloadButton && latestEpisode && (
              <button
                onClick={handleDownload}
                className={`p-2 rounded-full transition-colors ${isDownloaded ? "text-green-400" : "text-gray-400 hover:text-white"}`}
                title={isDownloaded ? "Downloaded" : "Download"}
              >
                {isDownloaded ? (
                  <Headphones size={16} />
                ) : (
                  <Download size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div
        className={`group relative bg-gradient-to-br from-dark-800 via-dark-850 to-dark-900 rounded-2xl overflow-hidden border border-accent-500/20 hover:border-accent-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent-500/20 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Mystical background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Sparkles size={24} className="text-accent-400" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Sparkles size={16} className="text-accent-400" />
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={podcast.coverImage}
            alt={podcast.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Overlay controls */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <button
              onClick={handlePlayPodcast}
              className="p-6 bg-accent-500 hover:bg-accent-600 text-white rounded-full transition-all duration-300 transform hover:scale-110 shadow-2xl"
            >
              <Play size={32} className="ml-1" />
            </button>
          </div>

          {/* Top right controls */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {podcast.category && (
              <span className="px-3 py-1 bg-accent-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                {podcast.category}
              </span>
            )}
          </div>

          {/* Bottom left info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white/80">
                <Clock size={14} />
                <span className="text-sm">{podcast.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-full transition-colors ${isFavorited ? "text-red-400" : "text-white/60 hover:text-white"}`}
                >
                  <Heart
                    size={16}
                    className={isFavorited ? "fill-current" : ""}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-white/60 hover:text-white rounded-full transition-colors"
                >
                  <Share2 size={16} />
                </button>
                {showDownloadButton && latestEpisode && (
                  <button
                    onClick={handleDownload}
                    className={`p-2 rounded-full transition-colors ${isDownloaded ? "text-green-400" : "text-white/60 hover:text-white"}`}
                  >
                    {isDownloaded ? (
                      <Headphones size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-accent-400 transition-colors">
            {podcast.title}
          </h3>

          <div className="flex items-center space-x-2 mb-3 text-sm text-gray-400">
            {podcast.hostName && (
              <>
                <span>By {podcast.hostName}</span>
                <span>&bull;</span>
              </>
            )}
            <div className="flex items-center space-x-1">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
          </div>

          <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
            {podcast.description}
          </p>

          <div className="flex items-center justify-between">
            {showRating && stats.averageRating > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-medium text-sm">
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">
                  ({stats.totalReviews})
                </span>
              </div>
            )}
            <button
              onClick={handlePlayPodcast}
              className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Listen Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`group bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl overflow-hidden border border-dark-700 hover:border-accent-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={podcast.coverImage}
          alt={podcast.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <button
            onClick={handlePlayPodcast}
            className="p-4 bg-accent-500 hover:bg-accent-600 text-white rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
          >
            <Play size={24} className="ml-1" />
          </button>
        </div>

        {/* Top controls */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {podcast.category && (
            <span className="px-2 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full">
              {podcast.category}
            </span>
          )}
          <div className="flex space-x-2">
            {showDownloadButton && latestEpisode && (
              <button
                onClick={handleDownload}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isDownloaded ? "bg-green-600 text-white" : "bg-black/50 text-white hover:bg-black/70"}`}
                title={isDownloaded ? "Downloaded" : "Download"}
              >
                {isDownloaded ? (
                  <Headphones size={16} />
                ) : (
                  <Download size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-accent-400 transition-colors">
          {podcast.title}
        </h3>

        <div className="flex items-center space-x-2 mb-3 text-sm text-gray-400">
          {podcast.hostName && (
            <>
              <span>By {podcast.hostName}</span>
              <span>&bull;</span>
            </>
          )}
          <span>{formattedDate}</span>
        </div>

        <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
          {podcast.description}
        </p>

        <div className="flex items-center justify-between border-t border-dark-700 pt-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-gray-400">
              <Clock size={14} />
              <span>{podcast.duration}</span>
            </div>
            {showRating && stats.averageRating > 0 && (
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-yellow-400 font-medium">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-500">({stats.totalReviews})</span>
              </div>
            )}
          </div>
          <button
            onClick={handlePlayPodcast}
            className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Listen
          </button>
        </div>
      </div>
    </div>
  );
};

export default PodcastCard;
