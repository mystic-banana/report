import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Minimize2,
  Music,
  Heart,
  Share2,
  Download,
  List,
  Shuffle,
  Repeat,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { usePodcastAnalytics } from "../../hooks/usePodcastAnalytics";

const PodcastPlayer: React.FC = () => {
  const {
    currentEpisode,
    episodeQueue,
    currentQueueIndex,
    isPlaying,
    volume,
    isMuted,
    playNext,
    playPrevious,
    togglePlayPause,
    setIsPlaying,
    setVolume,
    toggleMute,
    setIsMuted,
  } = usePlayerStore();

  const { startTracking, updateProgress, endTracking, isTracking } =
    usePodcastAnalytics();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showQueue, setShowQueue] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (audioRef.current && currentEpisode) {
      if (audioRef.current.src !== currentEpisode.audio_url) {
        if (isTracking) {
          endTracking(currentTime);
        }

        audioRef.current.src = currentEpisode.audio_url;
        audioRef.current.load();
        setCurrentTime(0);
        setDuration(0);

        const episodeDuration = parseFloat(currentEpisode.duration) || 0;
        startTracking(
          currentEpisode.id,
          currentEpisode.podcast_id,
          episodeDuration,
        );
      }
    } else if (audioRef.current && !currentEpisode) {
      if (isTracking) {
        endTracking(currentTime);
      }

      audioRef.current.pause();
      audioRef.current.src = "";
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [
    currentEpisode?.id,
    setIsPlaying,
    startTracking,
    endTracking,
    isTracking,
    currentTime,
  ]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying && currentEpisode) {
      audioRef.current.play().catch((error) => {
        console.error("Error attempting to play audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentEpisode, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdateEvent = () => {
      const newTime = audio.currentTime;
      setCurrentTime(newTime);
      if (Math.floor(newTime) % 5 === 0) {
        updateProgress(newTime);
      }
    };
    const handleLoadedMetadataEvent = () => setDuration(audio.duration);
    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);
    const handleEndedEvent = () => {
      endTracking(currentTime);
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    const handleWaitingEvent = () => setIsBuffering(true);
    const handleCanPlayEvent = () => setIsBuffering(false);
    const handleVolumeChangeAudioEvent = () => {
      if (audioRef.current) {
        setVolume(audioRef.current.volume);
        setIsMuted(audioRef.current.muted);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdateEvent);
    audio.addEventListener("loadedmetadata", handleLoadedMetadataEvent);
    audio.addEventListener("play", handlePlayEvent);
    audio.addEventListener("pause", handlePauseEvent);
    audio.addEventListener("ended", handleEndedEvent);
    audio.addEventListener("waiting", handleWaitingEvent);
    audio.addEventListener("canplay", handleCanPlayEvent);
    audio.addEventListener("volumechange", handleVolumeChangeAudioEvent);

    audio.playbackRate = playbackRate;

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdateEvent);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadataEvent);
      audio.removeEventListener("play", handlePlayEvent);
      audio.removeEventListener("pause", handlePauseEvent);
      audio.removeEventListener("ended", handleEndedEvent);
      audio.removeEventListener("waiting", handleWaitingEvent);
      audio.removeEventListener("canplay", handleCanPlayEvent);
      audio.removeEventListener("volumechange", handleVolumeChangeAudioEvent);
    };
  }, [
    playNext,
    setIsPlaying,
    setVolume,
    setIsMuted,
    playbackRate,
    repeatMode,
    currentTime,
    endTracking,
    updateProgress,
  ]);

  const handleTogglePlayPause = useCallback(() => {
    if (!currentEpisode) return;
    togglePlayPause();
  }, [togglePlayPause, currentEpisode]);

  const handlePlayNext = useCallback(() => {
    playNext();
  }, [playNext]);

  const handlePlayPrevious = useCallback(() => {
    playPrevious();
  }, [playPrevious]);

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleToggleMute = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const handleProgressBarSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current || !currentEpisode) return;
    const progressBar = progressBarRef.current;
    const clickPositionInPixels =
      e.pageX - progressBar.getBoundingClientRect().left;
    const clickPositionInPercentage =
      clickPositionInPixels / progressBar.offsetWidth;
    const newTime = duration * clickPositionInPercentage;
    if (isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleChangePlaybackRate = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  }, [playbackRate]);

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 15,
        duration,
      );
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 15,
        0,
      );
    }
  };

  const handleVolumeHover = () => {
    setShowVolumeSlider(true);
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
  };

  const handleVolumeLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 1000);
  };

  const toggleRepeatMode = () => {
    const modes: ("off" | "one" | "all")[] = ["off", "one", "all"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const hasNextEpisode = currentQueueIndex < episodeQueue.length - 1;
  const hasPreviousEpisode = currentQueueIndex > 0;

  if (!currentEpisode) {
    return null;
  }

  return (
    <>
      <audio ref={audioRef} />
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-dark-900 via-dark-800 to-dark-900 text-white shadow-2xl z-50 transition-all duration-300 ease-in-out ${isExpanded ? "h-full" : "h-auto"} border-t border-accent-500/20`}
      >
        {/* Expanded Player */}
        {isExpanded ? (
          <div className="container mx-auto px-4 py-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleToggleExpand}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronDown size={24} />
              </button>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Heart size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Share2 size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className={`p-2 transition-colors ${showQueue ? "text-accent-400" : "text-gray-400 hover:text-white"}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto w-full">
              {/* Album Art */}
              <div className="relative mb-8">
                {currentEpisode.image_url ? (
                  <img
                    src={currentEpisode.image_url}
                    alt={currentEpisode.title}
                    className="w-80 h-80 object-cover rounded-2xl shadow-2xl"
                  />
                ) : (
                  <div className="w-80 h-80 bg-gradient-to-br from-accent-600 to-accent-800 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Music size={120} className="text-white/50" />
                  </div>
                )}
                {/* Floating controls overlay */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-dark-800/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                  <span className="text-xs text-gray-300">
                    {formatTime(currentTime)}
                  </span>
                  <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Track Info */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                  {currentEpisode.title}
                </h2>
                <p className="text-lg text-gray-400">
                  {currentEpisode.podcast_name || "Unknown Podcast"}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full mb-8">
                <div
                  ref={progressBarRef}
                  className="w-full h-2 bg-dark-600 rounded-full relative cursor-pointer group"
                  onClick={handleProgressBarSeek}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-150"
                    style={{
                      width: `${(currentTime / (duration || 1)) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      left: `${(currentTime / (duration || 1)) * 100}%`,
                      marginLeft: "-8px",
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center space-x-8 mb-8">
                <button
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`p-2 rounded-full transition-colors ${isShuffled ? "text-accent-400" : "text-gray-400 hover:text-white"}`}
                >
                  <Shuffle size={20} />
                </button>

                <button
                  onClick={handlePlayPrevious}
                  disabled={!hasPreviousEpisode}
                  className={`p-3 rounded-full transition-colors ${hasPreviousEpisode ? "text-white hover:bg-dark-700" : "text-gray-600 cursor-not-allowed"}`}
                >
                  <SkipBack size={24} />
                </button>

                <button
                  onClick={handleSkipBackward}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="relative">
                    <SkipBack size={20} />
                    <span className="absolute -bottom-1 -right-1 text-xs font-bold">
                      15
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleTogglePlayPause}
                  className="p-6 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-full shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  {isBuffering ? (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin" />
                    </div>
                  ) : isPlaying ? (
                    <Pause size={32} />
                  ) : (
                    <Play size={32} className="ml-1" />
                  )}
                </button>

                <button
                  onClick={handleSkipForward}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="relative">
                    <SkipForward size={20} />
                    <span className="absolute -bottom-1 -right-1 text-xs font-bold">
                      15
                    </span>
                  </div>
                </button>

                <button
                  onClick={handlePlayNext}
                  disabled={!hasNextEpisode}
                  className={`p-3 rounded-full transition-colors ${hasNextEpisode ? "text-white hover:bg-dark-700" : "text-gray-600 cursor-not-allowed"}`}
                >
                  <SkipForward size={24} />
                </button>

                <button
                  onClick={toggleRepeatMode}
                  className={`p-2 rounded-full transition-colors relative ${
                    repeatMode !== "off"
                      ? "text-accent-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Repeat size={20} />
                  {repeatMode === "one" && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                  )}
                </button>
              </div>

              {/* Secondary Controls */}
              <div className="flex items-center justify-center space-x-6 w-full max-w-sm">
                <div
                  className="relative flex items-center space-x-2"
                  onMouseEnter={handleVolumeHover}
                  onMouseLeave={handleVolumeLeave}
                >
                  <button
                    onClick={handleToggleMute}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX size={20} />
                    ) : volume > 0.5 ? (
                      <Volume2 size={20} />
                    ) : volume > 0 ? (
                      <Volume1 size={20} />
                    ) : (
                      <VolumeX size={20} />
                    )}
                  </button>
                  {showVolumeSlider && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-dark-800 rounded-lg p-2 shadow-xl">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeSliderChange}
                        className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-dark-600 accent-accent-500 transform rotate-90"
                        style={{ transformOrigin: "center" }}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleChangePlaybackRate}
                  className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-white text-sm rounded-full transition-colors font-medium"
                >
                  {playbackRate}x
                </button>

                <button className="text-gray-400 hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Compact Player */
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center space-x-3">
              {/* Episode Art */}
              <div className="flex-shrink-0">
                {currentEpisode.image_url ? (
                  <img
                    src={currentEpisode.image_url}
                    alt={currentEpisode.title}
                    className="w-12 h-12 object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-600 to-accent-800 rounded-lg flex items-center justify-center shadow-lg">
                    <Music size={20} className="text-white" />
                  </div>
                )}
              </div>

              {/* Episode Info & Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white text-sm font-medium truncate pr-2">
                    {currentEpisode.title}
                  </h3>
                  <button
                    onClick={handleToggleExpand}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    <ChevronUp size={16} />
                  </button>
                </div>
                <p className="text-gray-400 text-xs truncate mb-2">
                  {currentEpisode.podcast_name || "Unknown Podcast"}
                </p>
                <div
                  ref={progressBarRef}
                  className="h-1 bg-dark-700 rounded-full relative cursor-pointer group"
                  onClick={handleProgressBarSeek}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-150"
                    style={{
                      width: `${(currentTime / (duration || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePlayPrevious}
                  disabled={!hasPreviousEpisode}
                  className={`p-1 rounded-full transition-colors ${hasPreviousEpisode ? "text-gray-300 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
                >
                  <SkipBack size={16} />
                </button>

                <button
                  onClick={handleTogglePlayPause}
                  className="p-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  {isBuffering ? (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    </div>
                  ) : isPlaying ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} className="ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handlePlayNext}
                  disabled={!hasNextEpisode}
                  className={`p-1 rounded-full transition-colors ${hasNextEpisode ? "text-gray-300 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
                >
                  <SkipForward size={16} />
                </button>

                <div className="relative">
                  <button
                    onClick={handleToggleMute}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    onMouseEnter={handleVolumeHover}
                  >
                    {isMuted ? (
                      <VolumeX size={16} />
                    ) : volume > 0 ? (
                      <Volume2 size={16} />
                    ) : (
                      <VolumeX size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Queue Sidebar */}
        {showQueue && isExpanded && (
          <div className="absolute top-0 right-0 w-80 h-full bg-dark-900/95 backdrop-blur-sm border-l border-accent-500/20 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Up Next</h3>
              <button
                onClick={() => setShowQueue(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronDown size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {episodeQueue
                .slice(currentQueueIndex + 1)
                .map((episode, index) => (
                  <div
                    key={episode.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    <img
                      src={episode.image_url || "/placeholder-podcast.jpg"}
                      alt={episode.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-1">
                        {episode.title}
                      </p>
                      <p className="text-gray-400 text-xs line-clamp-1">
                        {episode.podcast_name}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PodcastPlayer;
