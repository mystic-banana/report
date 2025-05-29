import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Play, Pause, Clock, Calendar, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';

interface Episode {
  id: string;
  title: string;
  description?: string | null | undefined; // Make optional to match PodcastEpisode
  audio_url: string;
  duration?: string | number | null; // Make nullable to match PodcastEpisode
  pub_date?: string | null; // Make optional to match PodcastEpisode
  image_url?: string | null; // Make nullable to match PodcastEpisode
  podcast_id: string;
  guid?: string; // Add guid field to match PodcastEpisode
  created_at?: string; // Add fields that might be in PodcastEpisode
  updated_at?: string;
  published_at?: string; // Add to match PodcastEpisode type
}

interface PodcastEpisodesListProps {
  episodes?: Episode[];
  podcastId?: string; // Made optional for backward compatibility
  onPlayEpisode?: (episode: Episode) => void;
  currentEpisodeId?: string;
  isPlaying?: boolean;
  itemsPerPage?: number; // For pagination
}

const PodcastEpisodesList: React.FC<PodcastEpisodesListProps> = ({
  episodes: providedEpisodes,
  podcastId,
  onPlayEpisode,
  currentEpisodeId,
  isPlaying = false,
  itemsPerPage = 10 // Default to 10 episodes per page
}) => {
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [displayedEpisodes, setDisplayedEpisodes] = useState<Episode[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(!providedEpisodes);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);

  // If episodes are provided directly, use them
  useEffect(() => {
    if (providedEpisodes && providedEpisodes.length > 0) {
      setAllEpisodes(providedEpisodes);
      updateDisplayedEpisodes(providedEpisodes, 1);
      setLoading(false);
    } else if (podcastId) {
      // Fall back to fetching episodes if they're not provided but podcastId is
      fetchEpisodes();
    } else {
      // Neither episodes nor podcastId provided
      setLoading(false);
    }
  }, [providedEpisodes, podcastId]);
  
  // Update displayed episodes based on pagination
  const updateDisplayedEpisodes = useCallback((episodes: Episode[], page: number) => {
    const startIndex = 0;
    const endIndex = page * itemsPerPage;
    const episodesToDisplay = episodes.slice(startIndex, endIndex);
    
    setDisplayedEpisodes(episodesToDisplay);
    setHasMore(endIndex < episodes.length);
    setCurrentPage(page);
  }, [itemsPerPage]);

  const fetchEpisodes = async () => {
    if (!podcastId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('pub_date', { ascending: false });
      
      if (error) throw error;
      
      const episodes = data || [];
      setAllEpisodes(episodes);
      updateDisplayedEpisodes(episodes, 1);
    } catch (err: any) {
      console.error('Error fetching episodes:', err);
      setError(err.message || 'Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreEpisodes = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    updateDisplayedEpisodes(allEpisodes, nextPage);
    setLoadingMore(false);
  };
  
  const formatDuration = (duration: string | number) => {
    // If it's already a formatted string like '10:30' or '1:05:20', return it
    if (typeof duration === 'string') {
      // Check if it matches duration format like MM:SS or HH:MM:SS
      if (/^\d+:\d{2}(:\d{2})?$/.test(duration)) {
        return duration;
      }
      
      // Try to convert string to number if it's a numeric string
      const seconds = parseInt(duration, 10);
      if (isNaN(seconds)) return '00:00';
      duration = seconds;
    }
    
    // Handle number of seconds
    if (!duration) return '00:00';
    
    const hours = Math.floor(duration as number / 3600);
    const minutes = Math.floor((duration as number % 3600) / 60);
    const remainingSeconds = Math.floor(duration as number % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const toggleExpand = (episodeId: string) => {
    setExpandedEpisodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(episodeId)) {
        newSet.delete(episodeId);
      } else {
        newSet.add(episodeId);
      }
      return newSet;
    });
  };
  
  if (loading) {
    return (
      <div className="py-10 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p>Loading episodes...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8 text-center text-red-400">
        <p className="mb-2">Failed to load episodes</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  if (allEpisodes.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>No episodes found for this podcast</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="sr-only">Episodes</h3>
      <div className="space-y-4" aria-label="Podcast episodes list">
        {displayedEpisodes.map(episode => {
          const isExpanded = expandedEpisodes.has(episode.id);
          const isCurrentEpisode = episode.id === currentEpisodeId;
          
          return (
            <div 
              key={episode.id} 
              className={`bg-dark-800 rounded-lg overflow-hidden transition-all ${
                isCurrentEpisode ? 'border border-accent-500' : ''
              }`}
              aria-expanded={isExpanded}
              role="article"
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="mr-4">
                    <button
                      onClick={() => onPlayEpisode && onPlayEpisode(episode)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrentEpisode 
                          ? isPlaying 
                            ? 'bg-accent-600 text-white' 
                            : 'bg-accent-700 text-white' 
                          : 'bg-dark-700 text-white hover:bg-accent-800 transition-colors'
                      }`}
                      aria-label={`${isCurrentEpisode && isPlaying ? 'Pause' : 'Play'} episode: ${episode.title}`}
                    >
                      {isCurrentEpisode && isPlaying ? (
                        <Pause size={20} />
                      ) : (
                        <Play size={20} className="ml-1" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div
                      className="cursor-pointer"
                      onClick={() => toggleExpand(episode.id)}
                    >
                      <h4 className="text-xl font-medium text-white hover:text-accent-400 transition-colors">
                        {episode.title}
                      </h4>
                      
                      <div className="flex flex-wrap items-center mt-2 text-base text-gray-400 space-x-4">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1" aria-hidden="true" />
                          <span>
                            {episode.pub_date ? new Date(episode.pub_date).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1" aria-hidden="true" />
                          <span>{episode.duration ? formatDuration(episode.duration) : '00:00'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 text-gray-300 text-base leading-relaxed">
                        {episode.description ? (
                          <div dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(episode.description) 
                          }} />
                        ) : (
                          <p>No description available.</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => toggleExpand(episode.id)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} episode details`}
                  >
                    {isExpanded ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button 
              onClick={loadMoreEpisodes}
              disabled={loadingMore}
              className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-md flex items-center space-x-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Load more episodes"
            >
              {loadingMore ? (
                <>
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastEpisodesList;
