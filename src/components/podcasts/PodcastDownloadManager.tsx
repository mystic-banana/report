import React, { useState } from "react";
import {
  Download,
  Trash2,
  Play,
  Pause,
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { usePodcastDownloads } from "../../hooks/usePodcastDownloads";
import { usePlayerStore } from "../../store/playerStore";
import type { EnhancedEpisode } from "../../types/podcastTypes";

interface PodcastDownloadManagerProps {
  episode?: EnhancedEpisode;
  showFullManager?: boolean;
  className?: string;
}

const PodcastDownloadManager: React.FC<PodcastDownloadManagerProps> = ({
  episode,
  showFullManager = false,
  className = "",
}) => {
  const {
    downloads,
    downloadProgress,
    isLoading,
    startDownload,
    deleteDownload,
    isEpisodeDownloaded,
    getLocalEpisodeUrl,
    loadDownloads,
  } = usePodcastDownloads();

  const { setQueueAndPlay, currentEpisode, isPlaying } = usePlayerStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleDownload = async (episodeToDownload: EnhancedEpisode) => {
    if (!isOnline) {
      alert("You need an internet connection to download episodes.");
      return;
    }
    await startDownload(episodeToDownload);
  };

  const handleDelete = async (episodeId: string) => {
    if (
      window.confirm("Are you sure you want to delete this downloaded episode?")
    ) {
      await deleteDownload(episodeId);
    }
  };

  const handlePlayOffline = async (episodeToPlay: EnhancedEpisode) => {
    const localUrl = await getLocalEpisodeUrl(episodeToPlay.id);
    if (localUrl) {
      const offlineEpisode = {
        ...episodeToPlay,
        audio_url: localUrl,
        is_downloaded: true,
      };
      setQueueAndPlay([offlineEpisode], 0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDownloadStatus = (episodeId: string) => {
    const progress = downloadProgress[episodeId];
    const downloaded = isEpisodeDownloaded(episodeId);

    if (downloaded) return "completed";
    if (progress) return progress.status;
    return "none";
  };

  const renderDownloadButton = (episodeToRender: EnhancedEpisode) => {
    const status = getDownloadStatus(episodeToRender.id);
    const progress = downloadProgress[episodeToRender.id];

    switch (status) {
      case "completed":
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePlayOffline(episodeToRender)}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
              title="Play offline"
            >
              <Play size={16} />
            </button>
            <button
              onClick={() => handleDelete(episodeToRender.id)}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
              title="Delete download"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );

      case "downloading":
        return (
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-accent-600">
                <div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-400 animate-spin"
                  style={{
                    background: `conic-gradient(from 0deg, transparent ${360 - (progress?.progress || 0) * 3.6}deg, #3b82f6 ${360 - (progress?.progress || 0) * 3.6}deg)`,
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                {progress?.progress || 0}%
              </div>
            </div>
            <span className="text-sm text-gray-400">Downloading...</span>
          </div>
        );

      case "failed":
        return (
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-400" />
            <button
              onClick={() => handleDownload(episodeToRender)}
              className="text-sm text-accent-400 hover:text-accent-300 transition-colors"
            >
              Retry Download
            </button>
          </div>
        );

      case "pending":
        return (
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-sm text-gray-400">Preparing...</span>
          </div>
        );

      default:
        return (
          <button
            onClick={() => handleDownload(episodeToRender)}
            disabled={!isOnline}
            className="flex items-center space-x-2 px-3 py-1 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md text-sm transition-colors"
            title={
              isOnline
                ? "Download for offline listening"
                : "No internet connection"
            }
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        );
    }
  };

  // Single episode download button
  if (episode && !showFullManager) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {!isOnline && (
          <div className="flex items-center space-x-1 text-red-400 text-sm">
            <WifiOff size={16} />
            <span>Offline</span>
          </div>
        )}
        {renderDownloadButton(episode)}
      </div>
    );
  }

  // Full download manager
  const filteredDownloads = showOfflineOnly
    ? downloads.filter((d) => d.status === "completed")
    : downloads;

  const totalSize = downloads
    .filter((d) => d.status === "completed" && d.file_size)
    .reduce((sum, d) => sum + (d.file_size || 0), 0);

  if (isLoading) {
    return (
      <div className="bg-dark-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-700 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-dark-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-dark-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <HardDrive className="mr-2" size={24} />
          Downloaded Episodes
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            {isOnline ? (
              <>
                <Wifi size={16} className="text-green-400" />
                <span className="text-green-400">Online</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-400" />
                <span className="text-red-400">Offline</span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowOfflineOnly(!showOfflineOnly)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              showOfflineOnly
                ? "bg-accent-600 text-white"
                : "bg-dark-700 text-gray-300 hover:bg-dark-600"
            }`}
          >
            {showOfflineOnly ? "Show All" : "Offline Only"}
          </button>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-dark-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">Storage Used</span>
          <span className="text-white font-medium">
            {formatFileSize(totalSize)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Downloaded Episodes</span>
          <span className="text-white font-medium">
            {downloads.filter((d) => d.status === "completed").length}
          </span>
        </div>
      </div>

      {/* Downloads List */}
      <div className="space-y-4">
        {filteredDownloads.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Download size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {showOfflineOnly ? "No offline episodes" : "No downloads yet"}
            </p>
            <p className="text-sm">
              {showOfflineOnly
                ? "Download episodes to listen offline"
                : "Start downloading episodes for offline listening"}
            </p>
          </div>
        ) : (
          filteredDownloads.map((download) => {
            const episode = download.episodes as any;
            const podcast = download.podcasts as any;

            return (
              <div key={download.id} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {episode?.image_url || podcast?.image_url ? (
                      <img
                        src={episode?.image_url || podcast?.image_url}
                        alt={episode?.title || "Episode"}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-dark-600 rounded-lg flex items-center justify-center">
                        <Play size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium line-clamp-2 mb-1">
                      {episode?.title || "Unknown Episode"}
                    </h4>
                    <p className="text-gray-400 text-sm mb-2">
                      {podcast?.name || "Unknown Podcast"}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <CheckCircle size={12} className="text-green-400" />
                        <span>Downloaded</span>
                      </span>
                      {download.file_size && (
                        <span>{formatFileSize(download.file_size)}</span>
                      )}
                      {download.download_completed_at && (
                        <span>
                          {new Date(
                            download.download_completed_at,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handlePlayOffline({
                          id: episode?.id || download.episode_id,
                          title: episode?.title || "Unknown Episode",
                          audio_url: episode?.audio_url || "",
                          image_url:
                            episode?.image_url || podcast?.image_url || "",
                          podcast_name: podcast?.name || "Unknown Podcast",
                          podcast_id: download.podcast_id,
                          description: episode?.description || "",
                          pub_date:
                            episode?.pub_date || new Date().toISOString(),
                          duration: episode?.duration || "0",
                          is_downloaded: true,
                        })
                      }
                      className="p-2 bg-accent-600 hover:bg-accent-700 text-white rounded-full transition-colors"
                      title="Play offline"
                    >
                      {currentEpisode?.id === episode?.id && isPlaying ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(download.episode_id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                      title="Delete download"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {downloads.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dark-700">
          <button
            onClick={loadDownloads}
            className="w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-md transition-colors"
          >
            Refresh Downloads
          </button>
        </div>
      )}
    </div>
  );
};

export default PodcastDownloadManager;
