import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Play } from 'lucide-react';

interface Podcast {
  id: string;
  name: string;
  description: string;
  author: string;
  image_url: string;
  category_id: string;
  category_name?: string;
  feed_url: string;
  created_at: string;
  updated_at: string;
  episode_count?: number;
}

// Category interface is defined in the parent component

interface SpotifyStylePodcastListProps {
  title?: string;
  limit?: number;
  category?: string; // Updated to match the PodcastPage parameter name
  categoryId?: string; // Keeping for backward compatibility
  featured?: boolean;
  latestReleases?: boolean;
  itemsPerPage?: number; // For pagination
  enablePagination?: boolean; // Whether to enable pagination
  layout?: 'grid' | 'list'; // Spotify-style layout options
}

const SpotifyStylePodcastList: React.FC<SpotifyStylePodcastListProps> = ({ 
  title = 'Popular Podcasts', 
  limit = 12, 
  category,
  categoryId,
  featured = false,
  latestReleases = false,
  itemsPerPage = 12,
  enablePagination = false,
  layout = 'grid' // Default to grid layout
}) => {
  // For compatibility, use either category or categoryId
  const activeCategoryId = category || categoryId;
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [displayedPodcasts, setDisplayedPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Memoize the fetchPodcasts function to prevent unnecessary re-renders
  const fetchPodcasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log important debug info
      console.log('Fetching podcasts with category filter:', activeCategoryId);
      
      // First, do a simple check query      // Debug - check if we have any podcasts in the database
      const { data: checkData, count: totalPodcasts, error: checkError } = await supabase
        .from('podcasts')
        .select('id, name, status, category_id', { count: 'exact' })
        .eq('status', 'approved')
        .limit(10);
      
      if (checkError) {
        console.error('Error checking podcast count:', checkError);
        throw checkError;
      }
      
      console.log(`Found ${totalPodcasts || 0} total approved podcasts in database`);
      console.log('Debug - Available podcasts:', checkData?.length || 0);
      if (checkData && checkData.length > 0) {
        console.log('Debug - Sample podcast data:', checkData[0]);
      }
      
      if (totalPodcasts === 0 || !checkData || checkData.length === 0) {
        console.log('No approved podcasts found in the database');
        setPodcasts([]);
        setDisplayedPodcasts([]);
        setLoading(false);
        return;
      }
      
      let query = supabase
        .from('podcasts')
        .select('*');
      
      // Only show approved podcasts - this ensures we only see podcasts approved from the admin section
      query = query.eq('status', 'approved');
      
      // Limit the number of results
      query = query.limit(limit);
      
      // Apply filters based on props
      if (activeCategoryId) {
        // Log that we're applying a category filter
        console.log(`Applying category filter with ID: ${activeCategoryId}`);
        query = query.eq('category_id', activeCategoryId);
      } else {
        // No category filter, log this fact
        console.log('No category filter applied - showing all podcasts');
      }
      
      // Add debugging to help trace the issue
      const { data: debugData, error: debugError } = await query;
      console.log(`Query returned ${debugData?.length || 0} podcasts`);
      if (debugError) {
        console.error('Debug query error:', debugError);
      } else if (debugData) {
        console.log('Debug - First podcast status:', debugData[0]?.status);
      }
      
      if (featured) {
        // For featured, we could use a is_featured field, but for now let's just get the most popular
        query = query.order('created_at', { ascending: false });
      } else if (latestReleases) {
        query = query.order('created_at', { ascending: false });
      } else {
        // Default ordering
        query = query.order('name');
      }
      
      const { data, error: fetchError } = await query;
      
      // Log raw data for debugging
      console.log('Raw podcast data:', data?.length || 0, 'podcasts found');
      if (data && data.length > 0) {
        console.log('First podcast sample:', data[0]);
      }
      
      if (fetchError) {
        console.error('Error fetching podcasts:', fetchError);
        setError('Failed to load podcasts: ' + fetchError.message);
        setLoading(false);
        return;
      }
      
      // Check if we got any data back
      if (!data || data.length === 0) {
        console.log('No podcasts found in the database matching the criteria');
        // Set empty array rather than null to avoid rendering issues
        setPodcasts([]);
        setLoading(false);
        return;
      }
      
      // Get list of category IDs to fetch
      const categoryIds = [...new Set(data?.map(podcast => podcast.category_id).filter(Boolean) || [])];
      let categoryMap: Record<string, string> = {};
      
      // Get category names in a separate query from podcast_categories table
      if (categoryIds.length > 0) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('podcast_categories')
          .select('id, name')
          .in('id', categoryIds);
        
        if (!categoryError && categoryData) {
          categoryMap = categoryData.reduce((acc, cat) => ({
            ...acc,
            [cat.id]: cat.name
          }), {});
        }
      }
      
      // Transform data to include category name
      const transformedData = data?.map(podcast => {
        // Log each podcast for debugging
        console.log(`Processing podcast: ${podcast.name}, Category ID: ${podcast.category_id}, Status: ${podcast.status}`);
        
        return {
          ...podcast,
          category_name: podcast.category_id ? categoryMap[podcast.category_id] || podcast.category || 'Uncategorized' : (podcast.category || 'Uncategorized')
        };
      }) || [];
      
      setPodcasts(transformedData);
      
      // Initialize pagination if enabled
      if (enablePagination) {
        const initialItems = transformedData.slice(0, itemsPerPage);
        setDisplayedPodcasts(initialItems);
        setHasMore(transformedData.length > itemsPerPage);
      } else {
        setDisplayedPodcasts(transformedData);
      }
    } catch (err: any) {
      console.error('Error fetching podcasts:', err);
      setError(err.message || 'Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  }, [activeCategoryId, featured, latestReleases, limit, itemsPerPage, enablePagination]);
  
  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);
  
  // Function to load more podcasts for pagination
  const loadMorePodcasts = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const nextItems = podcasts.slice(startIndex, endIndex);
    setDisplayedPodcasts(prev => [...prev, ...nextItems]);
    
    setPage(nextPage);
    setHasMore(endIndex < podcasts.length);
    setLoadingMore(false);
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
        <span className="sr-only">Loading podcasts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-red-500">
        <p>Error loading podcasts: {error}</p>
      </div>
    );
  }

  if (podcasts.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-700 mb-4">
          <Play size={24} className="text-gray-400 ml-1" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No podcasts found</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          {activeCategoryId 
            ? "There are no podcasts in this category yet. Please check back later or try a different category." 
            : "We couldn't find any podcasts. Please check back later for new content."}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {!enablePagination && podcasts.length > limit && (
            <Link 
              to={activeCategoryId ? `/podcasts/category/${activeCategoryId}` : "/podcasts"} 
              className="text-accent-600 hover:underline text-sm font-medium"
              aria-label={`View all ${title}`}
            >
              Show all
            </Link>
          )}
        </div>
      )}
      
      {layout === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {displayedPodcasts.map(podcast => {
            // Generate SEO-friendly URL slug from podcast name
            const podcastSlug = podcast.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
              
            return (
              <Link 
                key={podcast.id} 
                to={`/podcast/${podcastSlug}`} 
                className="group"
                aria-label={`Listen to ${podcast.name} podcast by ${podcast.author || 'Unknown Author'}`}
              >
                <div className="bg-dark-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:transform hover:scale-[1.02]">
                  <div className="relative aspect-square">
                    {podcast.image_url ? (
                      <img 
                        loading="lazy" 
                        src={podcast.image_url} 
                        alt={`${podcast.name} cover art`} 
                        className="w-full h-full object-cover"
                        width="200"
                        height="200"
                      />
                    ) : (
                      <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center">
                        <Play size={24} className="text-white ml-1" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium text-white line-clamp-1 group-hover:text-accent-400 transition-colors">
                      {podcast.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-1 mt-1">
                      {podcast.author || 'Unknown Author'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPodcasts.map(podcast => {
            // Generate SEO-friendly URL slug from podcast name
            const podcastSlug = podcast.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
              
            return (
              <Link 
                key={podcast.id} 
                to={`/podcast/${podcastSlug}`} 
                className="group block"
                aria-label={`Listen to ${podcast.name} podcast by ${podcast.author || 'Unknown Author'}`}
              >
                <div className="bg-dark-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-center">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    {podcast.image_url ? (
                      <img 
                        loading="lazy" 
                        src={podcast.image_url} 
                        alt={`${podcast.name} cover art`} 
                        className="w-full h-full object-cover rounded"
                        width="80"
                        height="80"
                      />
                    ) : (
                      <div className="w-full h-full bg-dark-700 flex items-center justify-center rounded">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium text-white group-hover:text-accent-400 transition-colors">
                      {podcast.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {podcast.author || 'Unknown Author'}
                    </p>
                    {podcast.category_name && (
                      <span className="inline-block mt-2 px-2 py-1 bg-dark-700 text-xs text-gray-300 rounded">
                        {podcast.category_name}
                      </span>
                    )}
                  </div>
                  
                  <div className="ml-auto">
                    <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={20} className="text-white ml-1" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      {/* Pagination */}
      {enablePagination && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMorePodcasts}
            disabled={loadingMore}
            className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-md flex items-center space-x-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Load more podcasts"
          >
            {loadingMore ? (
              <>
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SpotifyStylePodcastList;
