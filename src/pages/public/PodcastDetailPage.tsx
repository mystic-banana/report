import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { fetchEpisodesForPodcast } from '../../utils/fetchEpisodes';
import { Headphones, RefreshCw, Play, Pause, Calendar, Clock } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import PodcastPlayer from '../../components/podcasts/PodcastPlayer';
import SEO from '../../components/SEO';
import AdUnit from '../../components/ads/AdUnit';
import { formatDistanceToNow } from 'date-fns';

// Helper function to check if a string is a UUID
const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const PodcastDetailPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [podcast, setPodcast] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<any>(null);
  const [refreshingEpisodes, setRefreshingEpisodes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recommendedPodcasts, setRecommendedPodcasts] = useState<any[]>([]);
  
  useEffect(() => {
    fetchPodcastAndEpisodes();
    window.scrollTo(0, 0);
  }, [slug]);
  
  // Function to refresh episodes from the RSS feed
  const refreshEpisodes = async () => {
    if (!podcast?.feed_url || !podcast?.id || refreshingEpisodes) {
      return;
    }
    
    setRefreshingEpisodes(true);
    
    try {
      const success = await fetchEpisodesForPodcast(podcast.id, podcast.feed_url);
      
      if (success) {
        // Fetch updated episodes from the database
        const { data: updatedEpisodes, error: fetchError } = await supabase
          .from('episodes')
          .select('*')
          .eq('podcast_id', podcast.id)
          .order('pub_date', { ascending: false });
          
        if (fetchError) {
          console.error('Error fetching updated episodes:', fetchError);
        } else {
          setEpisodes(updatedEpisodes || []);
        }
      }
    } catch (err) {
      console.error('Error refreshing episodes:', err);
    } finally {
      setRefreshingEpisodes(false);
    }
  };
  
  // Fetch podcast and episodes data
  const fetchPodcastAndEpisodes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let podcastData;
      
      // Check if slug is a UUID
      if (isUUID(slug)) {
        const { data, error: podcastError } = await supabase
          .from('podcasts')
          .select('*')
          .eq('id', slug)
          .eq('status', 'approved')
          .single();
          
        if (podcastError) {
          throw new Error(`Error fetching podcast: ${podcastError.message}`);
        }
        
        podcastData = data;
      } else {
        // Handle slug as a string (name-based slug)
        // First try exact match on slug field if it exists
        try {
          const { data: slugMatch, error: slugError } = await supabase
            .from('podcasts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'approved')
            .maybeSingle(); // Use maybeSingle to avoid errors if no match

          // If we found a match by slug field, use it
          if (!slugError && slugMatch) {
            podcastData = slugMatch;
          } else {
            // Otherwise, try to match by converting name to slug format
            const { data: nameMatches, error: nameError } = await supabase
              .from('podcasts')
              .select('*')
              .eq('status', 'approved')
              .filter('name', 'ilike', `%${slug.replace(/-/g, ' ')}%`)
              .order('created_at', { ascending: false });
              
            if (nameError) {
              throw nameError;
            }
            
            // If we have exactly one match, use it
            if (nameMatches && nameMatches.length === 1) {
              podcastData = nameMatches[0];
            } else if (nameMatches && nameMatches.length > 0) {
              // If we have multiple matches, use the first one but log a warning
              console.warn(`Multiple podcasts matched slug '${slug}', using the most recent one`);
              podcastData = nameMatches[0];
            } else {
              // No matches found
              throw new Error('Podcast not found');
            }
          }
        } catch (slugError) {
          console.error('Error in slug matching:', slugError);
          throw new Error('Error finding podcast');
        }
      }
      
      if (!podcastData) {
        throw new Error('Podcast not found');
      }
      
      // Try to fetch category name if category_id exists
      if (podcastData.category_id) {
        try {
          const { data: categoryData, error: categoryError } = await supabase
            .from('podcast_categories')
            .select('name')
            .eq('id', podcastData.category_id)
            .single();
            
          if (!categoryError && categoryData) {
            podcastData.categoryName = categoryData.name;
          } else {
            podcastData.categoryName = podcastData.category || 'Uncategorized';
          }
        } catch (categoryError) {
          console.error('Error fetching category:', categoryError);
          podcastData.categoryName = podcastData.category || 'Uncategorized';
        }
      } else if (podcastData.category) {
        // If no category_id but has category text field, use it as fallback
        podcastData.categoryName = podcastData.category;
      } else {
        podcastData.categoryName = 'Uncategorized';
      }
      
      // Redirect to SEO-friendly URL if needed
      const isUuid = isUUID(slug);
      if (!isUuid && podcastData) {
        const seoFriendlySlug = podcastData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
          
        // Only redirect if the current URL doesn't match the SEO-friendly one
        if (slug !== seoFriendlySlug && slug.length > 0) {
          navigate(`/podcast/${seoFriendlySlug}`, { replace: true });
          return; // Stop execution as we're redirecting
        }
      }
      
      setPodcast(podcastData);
      
      // Fetch episodes for this podcast
      const { data: episodesData, error: episodesError } = await supabase
        .from('episodes')
        .select('*')
        .eq('podcast_id', podcastData.id)
        .order('pub_date', { ascending: false });
        
      if (episodesError) {
        console.error('Error fetching episodes:', episodesError);
      } else {
        console.log(`Found ${episodesData?.length || 0} episodes for podcast ${podcastData.id}`);
        setEpisodes(episodesData || []);
      }
      
      // Auto-fetch episodes if none exist and we have a feed URL
      if ((!episodesData || episodesData.length === 0) && podcastData.feed_url) {
        console.log('No episodes found, automatically refreshing...');
        // We'll do this in the background after rendering the UI
        setTimeout(() => {
          refreshEpisodes();
        }, 500);
      }
      
      // Fetch recommended podcasts in the same category
      if (podcastData.category_id) {
        const { data: relatedPodcasts, error: relatedError } = await supabase
          .from('podcasts')
          .select('*')
          .eq('status', 'approved')
          .eq('category_id', podcastData.category_id)
          .neq('id', podcastData.id)
          .limit(4);
          
        if (!relatedError && relatedPodcasts) {
          setRecommendedPodcasts(relatedPodcasts);
        }
      }
    } catch (err) {
      console.error('Error in fetchPodcastAndEpisodes:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle playing an episode
  const handlePlayEpisode = (episode: any) => {
    if (currentEpisode?.id === episode.id) {
      // Toggle play/pause for current episode
      setIsPlaying(!isPlaying);
      return;
    }
    
    // Play new episode
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };
  
  // Play next or previous episode
  const handlePlayNextEpisode = () => {
    if (!currentEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex === -1 || currentIndex === episodes.length - 1) return;
    
    setCurrentEpisode(episodes[currentIndex + 1]);
    setIsPlaying(true);
  };
  
  const handlePlayPreviousEpisode = () => {
    if (!currentEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex <= 0) return;
    
    setCurrentEpisode(episodes[currentIndex - 1]);
    setIsPlaying(true);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  // Format duration for display
  const formatDuration = (duration: string) => {
    if (!duration) return 'Unknown duration';
    
    // If duration is already in MM:SS format, return as is
    if (/^\d+:\d+$/.test(duration)) {
      return duration;
    }
    
    // Try to convert seconds to MM:SS
    try {
      const seconds = parseInt(duration, 10);
      if (isNaN(seconds)) return duration;
      
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    } catch (e) {
      return duration;
    }
  };
  
  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen bg-dark-900 text-white">
          <div className="animate-spin mr-2">
            <RefreshCw size={24} />
          </div>
          <p>Loading podcast...</p>
        </div>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-dark-900 text-white p-4">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-center mb-6">{error}</p>
          <Link 
            to="/podcasts" 
            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-md transition-colors"
          >
            Back to Podcasts
          </Link>
        </div>
      </PageLayout>
    );
  }
  
  if (!podcast) {
    return (
      <PageLayout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-dark-900 text-white p-4">
          <h1 className="text-2xl font-bold mb-4">Podcast Not Found</h1>
          <p className="text-center mb-6">The podcast you're looking for doesn't exist or has not been approved yet.</p>
          <Link 
            to="/podcasts" 
            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-md transition-colors"
          >
            Browse all podcasts
          </Link>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <SEO 
        title={`${podcast?.name || 'Podcast'} | Mystic Banana`}
        description={podcast?.description || 'Listen to this fascinating podcast on Mystic Banana.'}
        ogType="article"
        ogImage={podcast?.image_url || '/images/podcast-default.jpg'}
      />

      {/* Podcast Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Podcast Image */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="aspect-square bg-dark-800 rounded-lg overflow-hidden">
              {podcast.image_url ? (
                <img 
                  src={podcast.image_url} 
                  alt={podcast.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-700">
                  <Headphones size={64} className="text-accent-500" />
                </div>
              )}
            </div>
          {/* Podcast Info */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-3xl font-bold mb-2">{podcast.name}</h1>
            
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <span className="bg-accent-500 text-white px-2 py-1 rounded text-xs mr-3">
                {podcast.categoryName}
              </span>
              {podcast.author && (
                <span className="ml-2">By {podcast.author}</span>
              )}
            </div>
            
            {podcast.description && (
              <div className="mb-4 text-gray-300 prose prose-dark max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(podcast.description) }} />
            )}
            
            <div className="flex items-center gap-4">
              <Link 
                to="/podcasts" 
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
              >
                Browse all podcasts
              </Link>
              {podcast?.feed_url && episodes.length > 0 && (
                <button 
                  onClick={refreshEpisodes}
                  disabled={refreshingEpisodes}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-dark-700 hover:bg-dark-600 disabled:bg-dark-700/50 text-gray-300 rounded-md transition-colors"
                >
                  <RefreshCw size={14} className={refreshingEpisodes ? 'animate-spin' : ''} />
                  <span>{refreshingEpisodes ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              )}
            </div>
          </div>
        
// ...
          <div className="mb-8">
            <AdUnit placement="podcast" className="mx-auto" />
          </div>
          
          {/* Episodes Section */}
          <div className="mt-10 mb-12">
            <h2 className="text-2xl font-bold mb-4">Episodes</h2>
            
            {episodes.length === 0 ? (
              <div className="text-center py-12 bg-dark-800 rounded-lg">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">Loading Episodes</h3>
                  <p className="text-gray-400 mb-6 max-w-md">We're syncing episodes for this podcast. This may take a moment.</p>
                  {podcast?.feed_url && (
                    <button 
                      onClick={refreshEpisodes}
                      disabled={refreshingEpisodes || loading}
                      className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/50 text-white rounded-md transition-colors"
                    >
                      {refreshingEpisodes ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Syncing Episodes...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={18} />
                          <span>Sync Episodes Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {episodes.map((episode) => (
                  <div key={episode.id} className="bg-dark-800 rounded-lg p-4 hover:bg-dark-700 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Episode image or placeholder */}
                      <div className="hidden md:block flex-shrink-0">
                        <div className="w-20 h-20 rounded overflow-hidden bg-dark-700">
                          {episode.image_url ? (
                            <img src={episode.image_url} alt={episode.title} className="w-full h-full object-cover" />
                          ) : podcast.image_url ? (
                            <img src={podcast.image_url} alt={podcast.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Headphones size={24} className="text-accent-500" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Episode details */}
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold mb-1">{episode.title}</h3>
                        
                        <div className="flex items-center text-xs text-gray-400 mb-2">
                          {episode.pub_date && (
                            <div className="flex items-center mr-3">
                              <Calendar size={12} className="mr-1" />
                              <span>{formatDate(episode.pub_date)}</span>
                            </div>
                          )}
                          {episode.duration && (
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              <span>{formatDuration(episode.duration)}</span>
                            </div>
                          )}
                        </div>
                        
                        {episode.description && (
                          <p className="text-sm text-gray-300 line-clamp-2 mb-3">{episode.description}</p>
                        )}
                        
                        {/* Play button */}
                        <button
                          onClick={() => handlePlayEpisode(episode)}
                          className="inline-flex items-center gap-2 text-sm text-accent-400 hover:text-accent-500"
                        >
                          {currentEpisode?.id === episode.id && isPlaying ? (
                            <>
                              <Pause size={16} />
                              <span>Pause Episode</span>
                            </>
                          ) : (
                            <>
                              <Play size={16} />
                              <span>Play Episode</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recommended Podcasts Section */}
          {recommendedPodcasts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedPodcasts.map(recommendedPodcast => (
                  <Link 
                    key={recommendedPodcast.id} 
                    to={`/podcasts/${recommendedPodcast.slug || recommendedPodcast.id}`}
                    className="block group"
                  >
                    <div className="bg-dark-800 rounded-lg overflow-hidden hover:bg-dark-700 transition-colors">
                      <div className="aspect-square relative">
                        {recommendedPodcast.image_url ? (
                          <img 
                            src={recommendedPodcast.image_url} 
                            alt={recommendedPodcast.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-dark-700">
                            <Headphones size={32} className="text-accent-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="bg-accent-500 rounded-full p-3">
                            <Play size={24} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white line-clamp-1 group-hover:text-accent-400 transition-colors">
                          {recommendedPodcast.name}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                          {recommendedPodcast.author || 'Unknown Author'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed podcast player at bottom */}
      {currentEpisode && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <PodcastPlayer 
            episode={{
              ...currentEpisode,
              podcast_name: podcast.name,
              published_at: currentEpisode.pub_date
            }}
            onPlayNextEpisode={handlePlayNextEpisode}
            onPlayPreviousEpisode={handlePlayPreviousEpisode}
            hasNextEpisode={episodes.findIndex(e => e.id === currentEpisode.id) < episodes.length - 1}
            hasPreviousEpisode={episodes.findIndex(e => e.id === currentEpisode.id) > 0}
            onPlayerStateChange={setIsPlaying}
          />
        </div>
      )}
    </PageLayout>
  );
};

export default PodcastDetailPage;
