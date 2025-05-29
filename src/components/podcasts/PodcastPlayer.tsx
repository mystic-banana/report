import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import AdUnit from '../ads/AdUnit';

interface Episode {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  duration: number;
  published_at: string;
  image_url?: string;
  podcast_id: string;
  podcast_name?: string;
}

interface PodcastPlayerProps {
  episode: Episode | null;
  onPlayNextEpisode?: () => void;
  onPlayPreviousEpisode?: () => void;
  hasPreviousEpisode?: boolean;
  hasNextEpisode?: boolean;
  onPlayerStateChange?: (isPlaying: boolean) => void;
}

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  episode,
  onPlayNextEpisode,
  onPlayPreviousEpisode,
  hasPreviousEpisode = false,
  hasNextEpisode = false,
  onPlayerStateChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  
  // Set up audio element when episode changes
  useEffect(() => {
    if (!episode) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      
      // Reset the audio source
      audioRef.current.src = episode.audio_url;
      audioRef.current.load();
      
      // Auto play when a new episode is loaded
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            if (onPlayerStateChange) onPlayerStateChange(true);
          })
          .catch(error => {
            console.error('Auto-play was prevented:', error);
            setIsPlaying(false);
            if (onPlayerStateChange) onPlayerStateChange(false);
          });
      }
    }
  }, [episode?.id]);
  
  // Update player state when isPlaying changes
  useEffect(() => {
    if (onPlayerStateChange) {
      onPlayerStateChange(isPlaying);
    }
  }, [isPlaying, onPlayerStateChange]);

  // Set up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlayerStateChange) onPlayerStateChange(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      if (onPlayerStateChange) onPlayerStateChange(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onPlayerStateChange) onPlayerStateChange(false);
      
      // Auto play next episode if available
      if (hasNextEpisode && onPlayNextEpisode) {
        onPlayNextEpisode();
      }
    };
    
    const handleWaiting = () => {
      setIsBuffering(true);
    };
    
    const handleCanPlay = () => {
      setIsBuffering(false);
    };
    
    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    
    // Update playback rate
    audio.playbackRate = playbackRate;
    
    // Cleanup
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [hasNextEpisode, onPlayNextEpisode, playbackRate, onPlayerStateChange]);
  
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Play was prevented:', error);
      });
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = volume;
    }
  };
  
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const changePlaybackRate = () => {
    // Cycle through playback rates: 1 -> 1.25 -> 1.5 -> 1.75 -> 2 -> 0.75 -> 1
    const rates = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
    
    if (audioRef.current) {
      audioRef.current.playbackRate = rates[nextIndex];
    }
  };
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (!episode) {
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
      
      <div className={`fixed transition-all duration-300 ${
        isExpanded ? 'inset-0 z-50 bg-dark-900/95' : 'bottom-0 left-0 right-0 z-40'
      }`}>
        <div className={`mx-auto ${isExpanded ? 'h-full max-w-4xl p-6 flex flex-col' : 'bg-dark-800 shadow-lg'}`}>
          {/* Main player content */}
          <div className={`${isExpanded ? 'flex-1 flex flex-col' : 'p-4'}`}>
            {isExpanded ? (
              <div className="flex flex-col h-full">
                {/* Ad Unit for non-premium users - only in expanded view */}
                <AdUnit placement="podcast" className="mb-6" />
                
                {/* Expanded player content */}
                <div className="flex flex-col flex-1 items-center justify-center">
                  <div className="w-full max-w-md mb-8">
                    {episode.image_url ? (
                      <img 
                        src={episode.image_url} 
                        alt={episode.title}
                        className="w-full aspect-square object-cover rounded-lg shadow-xl"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-dark-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xl">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full max-w-2xl text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">{episode.title}</h2>
                    <p className="text-gray-400 mb-6">{episode.podcast_name || 'Unknown Podcast'}</p>
                    
                    <div className="mb-8">
                      <div 
                        ref={progressBarRef}
                        className="h-2 bg-dark-600 rounded-full relative cursor-pointer mb-2"
                        onClick={handleProgressBarClick}
                      >
                        <div 
                          className="absolute top-0 left-0 h-full bg-accent-500 rounded-full"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                        {isBuffering && (
                          <div className="absolute top-0 right-0 left-0 h-full flex justify-center items-center">
                            <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center items-center space-x-6 mb-8">
                      <button
                        onClick={onPlayPreviousEpisode}
                        disabled={!hasPreviousEpisode}
                        className={`p-2 rounded-full ${
                          hasPreviousEpisode 
                            ? 'text-white hover:bg-dark-700 transition-colors' 
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <SkipBack size={24} />
                      </button>
                      
                      <button
                        onClick={togglePlayPause}
                        className="p-4 bg-accent-600 hover:bg-accent-700 text-white rounded-full transition-colors"
                      >
                        {isBuffering ? (
                          <div className="w-8 h-8 flex items-center justify-center">
                            <div className="w-5 h-5 border-4 border-t-transparent border-white rounded-full animate-spin" />
                          </div>
                        ) : isPlaying ? (
                          <Pause size={32} />
                        ) : (
                          <Play size={32} className="ml-1" />
                        )}
                      </button>
                      
                      <button
                        onClick={onPlayNextEpisode}
                        disabled={!hasNextEpisode}
                        className={`p-2 rounded-full ${
                          hasNextEpisode 
                            ? 'text-white hover:bg-dark-700 transition-colors' 
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <SkipForward size={24} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <button onClick={toggleMute} className="text-gray-300 hover:text-white">
                          {isMuted ? (
                            <VolumeX size={20} />
                          ) : volume < 0.5 ? (
                            <Volume1 size={20} />
                          ) : (
                            <Volume2 size={20} />
                          )}
                        </button>
                        
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-20 accent-accent-500"
                        />
                      </div>
                      
                      <button
                        onClick={changePlaybackRate}
                        className="px-2 py-1 bg-dark-700 hover:bg-dark-600 text-white text-sm rounded transition-colors"
                      >
                        {playbackRate}x
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  {episode.image_url ? (
                    <img 
                      src={episode.image_url} 
                      alt={episode.title} 
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-dark-700 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No Img</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-white text-sm font-medium truncate">{episode.title}</h3>
                  <p className="text-gray-400 text-xs truncate">{episode.podcast_name || 'Unknown Podcast'}</p>
                  
                  <div 
                    ref={progressBarRef}
                    className="h-1 bg-dark-600 rounded-full relative cursor-pointer mt-2"
                    onClick={handleProgressBarClick}
                  >
                    <div 
                      className="absolute top-0 left-0 h-full bg-accent-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onPlayPreviousEpisode}
                    disabled={!hasPreviousEpisode}
                    className={`p-1 rounded-full ${
                      hasPreviousEpisode 
                        ? 'text-gray-300 hover:text-white' 
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <SkipBack size={16} />
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className="p-2 bg-accent-600 hover:bg-accent-700 text-white rounded-full transition-colors"
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
                    onClick={onPlayNextEpisode}
                    disabled={!hasNextEpisode}
                    className={`p-1 rounded-full ${
                      hasNextEpisode 
                        ? 'text-gray-300 hover:text-white' 
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <SkipForward size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Expand/collapse button */}
          <button
            onClick={toggleExpand}
            className={`absolute ${isExpanded ? 'top-4 right-4' : 'top-2 right-2'} text-gray-400 hover:text-white transition-colors`}
          >
            {isExpanded ? (
              <Minimize2 size={isExpanded ? 24 : 16} />
            ) : (
              <Maximize2 size={isExpanded ? 24 : 16} />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default PodcastPlayer;
