import { create } from 'zustand';
import type { Episode } from '../types/playerTypes';

interface PlayerState {
  currentEpisode: Episode | null;
  episodeQueue: Episode[];
  currentQueueIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  // Add other player states if they need to be global, e.g., currentTime, duration, playbackRate

  setQueueAndPlay: (episodes: Episode[], startIndex: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentEpisode: (episode: Episode | null) => void; // For direct control if needed
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setIsMuted: (muted: boolean) => void;
  // TODO: Add actions for seeking, playback rate, etc., if PodcastPlayer's internal logic for these is moved here
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentEpisode: null,
  episodeQueue: [],
  currentQueueIndex: -1,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,

  setQueueAndPlay: (episodes, startIndex) => {
    if (startIndex < 0 || startIndex >= episodes.length) {
      console.error('Invalid start index for playlist');
      return;
    }
    set({
      episodeQueue: episodes,
      currentQueueIndex: startIndex,
      currentEpisode: episodes[startIndex],
      isPlaying: true, // Auto-play when setting a new queue and episode
    });
  },

  playNext: () => {
    const { episodeQueue, currentQueueIndex } = get();
    if (currentQueueIndex < episodeQueue.length - 1) {
      const nextIndex = currentQueueIndex + 1;
      set({
        currentQueueIndex: nextIndex,
        currentEpisode: episodeQueue[nextIndex],
        isPlaying: true,
      });
    } else {
      // Optionally, stop playing or loop
      set({ isPlaying: false });
      console.log('End of queue');
    }
  },

  playPrevious: () => {
    const { currentQueueIndex, episodeQueue } = get();
    if (currentQueueIndex > 0) {
      const prevIndex = currentQueueIndex - 1;
      set({
        currentQueueIndex: prevIndex,
        currentEpisode: episodeQueue[prevIndex],
        isPlaying: true,
      });
    } else {
      // Optionally, restart current song or do nothing
      console.log('Start of queue');
    }
  },

  togglePlayPause: () => {
    set(state => ({ isPlaying: !state.isPlaying }));
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  setCurrentEpisode: (episode) => {
    // This is a more direct setter, might not be needed if setQueueAndPlay is always used
    set({ currentEpisode: episode });
  },

  setVolume: (volume) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    set({ volume: newVolume, isMuted: newVolume === 0 });
  },

  toggleMute: () => {
    set(state => {
      const newMuted = !state.isMuted;
      if (newMuted) { // Muting
        return { isMuted: true };
      } else { // Unmuting
        return {
          isMuted: false,
          // If volume was 0 when unmuting, set it to a default, otherwise keep current volume
          volume: state.volume === 0 ? 0.5 : state.volume,
        };
      }
    });
  },

  setIsMuted: (muted) => {
    set(state => {
      if (muted) { // Muting
        return { isMuted: true };
      } else { // Unmuting
        return {
          isMuted: false,
          // If volume was 0 when unmuting, set it to a default, otherwise keep current volume
          volume: state.volume === 0 ? 0.5 : state.volume,
        };
      }
    });
  },
}));

// It's important to ensure the Episode type is correctly imported.
// If it's not exported from PodcastPlayer.tsx, we might need to define it here or in a shared types file.
// For now, assuming it's available as: import { Episode } from '../components/podcasts/PodcastPlayer';
