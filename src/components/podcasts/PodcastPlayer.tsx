import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Maximize2, Minimize2, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

const PodcastPlayer: React.FC = () => {
  const {
    currentEpisode,
    episodeQueue,
    currentQueueIndex,
    isPlaying,
    volume,
    isMuted,
    // setQueueAndPlay, // Will be used when playlist UI is integrated
    playNext,
    playPrevious,
    togglePlayPause,
    setIsPlaying, 
    setVolume,
    toggleMute,
    setIsMuted,
  } = usePlayerStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1); 
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (audioRef.current && currentEpisode) {
      if (audioRef.current.src !== currentEpisode.audio_url) {
        audioRef.current.src = currentEpisode.audio_url;
        audioRef.current.load(); 
        setCurrentTime(0); 
        setDuration(0);
      }
    } else if (audioRef.current && !currentEpisode) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false); 
    }
  }, [currentEpisode?.id, setIsPlaying]); 

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying && currentEpisode) {
      audioRef.current.play().catch(error => {
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

    const handleTimeUpdateEvent = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadataEvent = () => setDuration(audio.duration);
    const handlePlayEvent = () => setIsPlaying(true); 
    const handlePauseEvent = () => setIsPlaying(false); 
    const handleEndedEvent = () => playNext(); 
    const handleWaitingEvent = () => setIsBuffering(true);
    const handleCanPlayEvent = () => setIsBuffering(false);
    const handleVolumeChangeAudioEvent = () => {
      if (audioRef.current) {
        setVolume(audioRef.current.volume);
        setIsMuted(audioRef.current.muted);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdateEvent);
    audio.addEventListener('loadedmetadata', handleLoadedMetadataEvent);
    audio.addEventListener('play', handlePlayEvent);
    audio.addEventListener('pause', handlePauseEvent);
    audio.addEventListener('ended', handleEndedEvent);
    audio.addEventListener('waiting', handleWaitingEvent);
    audio.addEventListener('canplay', handleCanPlayEvent);
    audio.addEventListener('volumechange', handleVolumeChangeAudioEvent);

    audio.playbackRate = playbackRate;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdateEvent);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadataEvent);
      audio.removeEventListener('play', handlePlayEvent);
      audio.removeEventListener('pause', handlePauseEvent);
      audio.removeEventListener('ended', handleEndedEvent);
      audio.removeEventListener('waiting', handleWaitingEvent);
      audio.removeEventListener('canplay', handleCanPlayEvent);
      audio.removeEventListener('volumechange', handleVolumeChangeAudioEvent);
    };
  }, [playNext, setIsPlaying, setVolume, setIsMuted, playbackRate]); 

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
    const clickPositionInPixels = e.pageX - progressBar.getBoundingClientRect().left;
    const clickPositionInPercentage = clickPositionInPixels / progressBar.offsetWidth;
    const newTime = duration * clickPositionInPercentage;
    if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime); 
    }
  };

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
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

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const hasNextEpisode = currentQueueIndex < episodeQueue.length - 1;
  const hasPreviousEpisode = currentQueueIndex > 0;

  if (!currentEpisode) {
    return null; 
  }

  return (
    <>
      <audio ref={audioRef} />
      <div className={`fixed bottom-0 left-0 right-0 bg-dark-900 text-white shadow-2xl_top z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'h-full' : 'h-auto'}`}>
        <div className={`container mx-auto px-4 ${isExpanded ? 'py-8 h-full flex flex-col' : 'py-3'}`}>
          <div className={`${isExpanded ? 'flex-grow flex flex-col items-center justify-center' : 'flex items-center w-full'}`}>
            {isExpanded ? (
              <div className="w-full max-w-md text-center">
                {currentEpisode.image_url ? (
                  <img 
                    src={currentEpisode.image_url} 
                    alt={currentEpisode.title} 
                    className="w-64 h-64 object-cover rounded-lg mx-auto mb-6 shadow-xl"
                  />
                ) : (
                  <div className="w-64 h-64 bg-dark-700 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Music size={80} className="text-gray-500" />
                  </div>
                )}
                <h2 className="text-2xl font-bold mb-2 truncate" title={currentEpisode.title}>{currentEpisode.title}</h2>
                <p className="text-md text-gray-400 mb-6 truncate" title={currentEpisode.podcast_name}>{currentEpisode.podcast_name || 'Unknown Podcast'}</p>
                
                <div 
                  ref={progressBarRef}
                  className="w-full h-2 bg-dark-600 rounded-full relative cursor-pointer mb-4"
                  onClick={handleProgressBarSeek}
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-accent-500 rounded-full"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mb-6">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-center space-x-6 mb-8">
                  <button
                    onClick={handlePlayPrevious}
                    disabled={!hasPreviousEpisode}
                    className={`p-2 rounded-full transition-colors ${ 
                      hasPreviousEpisode 
                        ? 'text-gray-300 hover:text-white hover:bg-dark-700' 
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    aria-label="Previous episode"
                  >
                    <SkipBack size={24} />
                  </button>
                  
                  <button
                    onClick={handleTogglePlayPause}
                    className="p-4 bg-accent-600 hover:bg-accent-700 text-white rounded-full shadow-lg transition-colors transform hover:scale-105"
                    aria-label={isPlaying ? "Pause" : "Play"}
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
                    onClick={handlePlayNext}
                    disabled={!hasNextEpisode}
                    className={`p-2 rounded-full transition-colors ${ 
                      hasNextEpisode 
                        ? 'text-gray-300 hover:text-white hover:bg-dark-700' 
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    aria-label="Next episode"
                  >
                    <SkipForward size={24} />
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-4 w-full max-w-xs mx-auto">
                  <button onClick={handleToggleMute} className="text-gray-400 hover:text-white" aria-label={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <VolumeX size={20} /> : volume > 0.5 ? <Volume2 size={20} /> : volume > 0 ? <Volume1 size={20} /> : <VolumeX size={20} />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeSliderChange}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-dark-600 accent-accent-500"
                    aria-label="Volume"
                  />
                  <div className="w-16 text-center">
                    <button 
                      onClick={handleChangePlaybackRate}
                      className="px-2 py-1 bg-dark-700 hover:bg-dark-600 text-white text-sm rounded transition-colors"
                      aria-label={`Playback speed ${playbackRate}x`}
                    >
                      {playbackRate}x
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-shrink-0 mr-3">
                  {currentEpisode.image_url ? (
                    <img 
                      src={currentEpisode.image_url} 
                      alt={currentEpisode.title} 
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-dark-700 rounded flex items-center justify-center">
                      <Music size={20} className="text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="text-white text-sm font-medium truncate" title={currentEpisode.title}>{currentEpisode.title}</h3>
                  <p className="text-gray-400 text-xs truncate" title={currentEpisode.podcast_name}>{currentEpisode.podcast_name || 'Unknown Podcast'}</p>
                  
                  <div 
                    ref={progressBarRef}
                    className="h-1 bg-dark-700 rounded-full relative cursor-pointer mt-1"
                    onClick={handleProgressBarSeek}
                  >
                    <div 
                      className="absolute top-0 left-0 h-full bg-accent-500 rounded-full"
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlayPrevious}
                    disabled={!hasPreviousEpisode}
                    className={`p-1 rounded-full transition-colors ${ 
                      hasPreviousEpisode 
                        ? 'text-gray-300 hover:text-white' 
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    aria-label="Previous episode"
                  >
                    <SkipBack size={18} />
                  </button>
                  
                  <button
                    onClick={handleTogglePlayPause}
                    className="p-2 bg-accent-600 hover:bg-accent-700 text-white rounded-full transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isBuffering ? (
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      </div>
                    ) : isPlaying ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} className="ml-0.5" />
                    )}
                  </button>
                  
                  <button
                    onClick={handlePlayNext}
                    disabled={!hasNextEpisode}
                    className={`p-1 rounded-full transition-colors ${ 
                      hasNextEpisode 
                        ? 'text-gray-300 hover:text-white' 
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    aria-label="Next episode"
                  >
                    <SkipForward size={18} />
                  </button>

                  <button onClick={handleToggleMute} className="p-1 text-gray-400 hover:text-white" aria-label={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <VolumeX size={18} /> : volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                </div>
              </>
            )}
          </div>
          
          <button
            onClick={handleToggleExpand}
            className={`absolute ${isExpanded ? 'top-6 right-6' : 'top-1/2 -translate-y-1/2 right-4'} text-gray-400 hover:text-white transition-colors p-2`}
            aria-label={isExpanded ? 'Collapse player' : 'Expand player'}
          >
            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default PodcastPlayer;
