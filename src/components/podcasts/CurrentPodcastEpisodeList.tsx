import React from 'react';
import { Play, Pause, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import type { Episode } from '../../types/playerTypes';

interface CurrentPodcastEpisodeListProps {
  episodes: Episode[];
  podcastName?: string;
}

const CurrentPodcastEpisodeList: React.FC<CurrentPodcastEpisodeListProps> = ({ episodes, podcastName }) => {
  const {
    currentEpisode,
    isPlaying,
    setQueueAndPlay,
    togglePlayPause
  } = usePlayerStore();

  if (!episodes || episodes.length === 0) {
    return <p className="text-gray-400">No episodes available for this podcast.</p>;
  }

  const handleEpisodeClick = (episode: Episode, index: number) => {
    if (currentEpisode?.id === episode.id) {
      togglePlayPause();
    } else {
      // Ensure episodes passed to setQueueAndPlay have podcastName if not already present
      const episodesWithPodcastName = episodes.map(ep => ({
        ...ep,
        podcast_name: ep.podcast_name || podcastName || 'Unknown Podcast'
      }));
      setQueueAndPlay(episodesWithPodcastName, index);
    }
  };

  return (
    <div className="space-y-2">
      {episodes.map((episode, index) => (
        <div
          key={episode.id}
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
            ${currentEpisode?.id === episode.id ? 'bg-dark-700 shadow-md' : 'hover:bg-dark-600'}`}
          onClick={() => handleEpisodeClick(episode, index)}
        >
          <div className="flex-shrink-0 w-10 h-10 mr-3">
            {episode.image_url ? (
              <img src={episode.image_url} alt={episode.title} className="w-full h-full object-cover rounded" />
            ) : (
              <div className="w-full h-full bg-dark-500 rounded flex items-center justify-center">
                <Music size={20} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p 
              className={`font-medium truncate ${currentEpisode?.id === episode.id ? 'text-accent-400' : 'text-gray-100'}`}
              title={episode.title}
            >
              {episode.title}
            </p>
            <p className="text-xs text-gray-400 truncate" title={episode.podcast_name || podcastName}>
              {episode.podcast_name || podcastName || 'Episode'}
            </p>
          </div>
          <button 
            aria-label={currentEpisode?.id === episode.id && isPlaying ? 'Pause' : 'Play'}
            className="ml-3 p-2 rounded-full hover:bg-dark-500 transition-colors"
          >
            {currentEpisode?.id === episode.id && isPlaying ? (
              <Pause size={20} className="text-accent-400" />
            ) : (
              <Play size={20} className={`${currentEpisode?.id === episode.id ? 'text-accent-400' : 'text-gray-300'}`} />
            )}
          </button>
        </div>
      ))}
    </div>
  );
};

export default CurrentPodcastEpisodeList;
