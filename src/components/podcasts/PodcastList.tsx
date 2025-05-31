import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { PodcastFeed, PodcastCategory } from '../../types';
import { Play, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface PodcastWithCategory extends PodcastFeed {
  category_name?: string;
}

const PodcastList: React.FC = () => {
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [podcastsByCategory, setPodcastsByCategory] = useState<Record<string, PodcastWithCategory[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('podcast_categories')
        .select('id, name, slug, description, created_at, updated_at')
        .order('name');

      if (catError) {
        console.error('Category fetch error:', catError);
        setError('Failed to load categories.');
        return;
      }

      if (!catData || catData.length === 0) {
        setError('No podcast categories found.');
        return;
      }

      setCategories(catData);

      // Fetch podcasts for each category with proper error handling
      const podcastsByCat: Record<string, PodcastWithCategory[]> = {};
      
      for (const cat of catData) {
        try {
          const { data: podData, error: podError } = await supabase
            .from('podcasts')
            .select(`
              id, 
              name, 
              slug, 
              description, 
              image_url, 
              created_at, 
              updated_at, 
              author, 
              category_id, 
              feed_url,
              status
            `)
            .eq('category_id', cat.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(5);

          if (podError) {
            console.error(`Error fetching podcasts for category ${cat.name}:`, podError);
            podcastsByCat[cat.id] = [];
          } else {
            podcastsByCat[cat.id] = (podData || []).map(podcast => ({
              ...podcast,
              category: cat.name,
              category_name: cat.name,
            }));
          }
        } catch (err) {
          console.error(`Exception fetching podcasts for category ${cat.name}:`, err);
          podcastsByCat[cat.id] = [];
        }
      }

      setPodcastsByCategory(podcastsByCat);
    } catch (err: any) {
      console.error('Error in fetchData:', err);
      setError(err.message || 'Failed to load podcast data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const scrollCategory = (categoryId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`category-${categoryId}`);
    if (container) {
      const scrollAmount = 320; // Width of one card + gap
      const currentScroll = scrollPositions[categoryId] || 0;
      const newScroll = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      container.scrollTo({ left: newScroll, behavior: 'smooth' });
      setScrollPositions(prev => ({ ...prev, [categoryId]: newScroll }));
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-8">
          {/* Category tabs skeleton */}
          <div className="flex overflow-x-auto gap-4 py-4 mb-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex-shrink-0 w-24 h-8 bg-gray-700 rounded-full"></div>
            ))}
          </div>
          
          {/* Category sections skeleton */}
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-10">
              <div className="w-48 h-8 bg-gray-700 rounded mb-4"></div>
              <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="flex-shrink-0 w-72 bg-gray-800 rounded-lg p-4">
                    <div className="w-full h-40 bg-gray-700 rounded mb-3"></div>
                    <div className="w-3/4 h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-12">
        <div className="bg-red-900/30 border border-red-800 text-white p-6 rounded-lg max-w-md mx-auto">
          <p className="mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="w-full text-center py-12">
        <div className="text-gray-400">
          <p className="text-lg mb-2">No podcast categories found.</p>
          <p className="text-sm">Check back later for new content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Category Navigation - Mobile First */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-3 py-4 mb-8 scrollbar-thin scrollbar-thumb-accent-400 scrollbar-track-transparent px-4 sm:px-0">
          <Link
            to="/podcasts"
            className="flex-shrink-0 px-4 py-2 bg-accent-600 text-white rounded-full text-sm font-semibold shadow-lg hover:bg-accent-700 transition-all duration-200"
          >
            All Podcasts
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/podcasts/category/${cat.slug}`}
              className="flex-shrink-0 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-full text-sm font-semibold shadow transition-all duration-200"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Category Sections */}
      {categories.map(cat => {
        const podcasts = podcastsByCategory[cat.id] || [];
        
        if (podcasts.length === 0) return null;

        return (
          <div key={cat.id} className="relative group">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{cat.name}</h2>
                <p className="text-gray-400 text-sm">{cat.description}</p>
              </div>
              <Link
                to={`/podcasts/category/${cat.slug}`}
                className="text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors hidden sm:block"
              >
                View All
              </Link>
            </div>

            {/* Podcast Cards Container */}
            <div className="relative">
              {/* Desktop Scroll Buttons */}
              <button
                onClick={() => scrollCategory(cat.id, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-dark-800/90 hover:bg-dark-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden lg:flex"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              
              <button
                onClick={() => scrollCategory(cat.id, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-dark-800/90 hover:bg-dark-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden lg:flex"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} className="text-white" />
              </button>

              {/* Scrollable Podcast Grid */}
              <div
                id={`category-${cat.id}`}
                className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-accent-400 scrollbar-track-transparent px-4 sm:px-0"
                style={{ scrollbarWidth: 'thin' }}
              >
                {podcasts.map(podcast => (
                  <Link
                    key={podcast.id}
                    to={`/podcasts/${podcast.slug || podcast.id}`}
                    className="flex-shrink-0 w-72 sm:w-80 group/card"
                  >
                    <div className="bg-dark-800 hover:bg-dark-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      {/* Podcast Image */}
                      <div className="relative aspect-video bg-dark-700">
                        {podcast.image_url ? (
                          <img
                            src={podcast.image_url}
                            alt={`${podcast.name} cover`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play size={48} className="text-gray-500" />
                          </div>
                        )}
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center shadow-lg">
                            <Play size={24} className="text-white ml-1" />
                          </div>
                        </div>
                      </div>

                      {/* Podcast Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover/card:text-accent-400 transition-colors">
                          {podcast.name || 'Untitled Podcast'}
                        </h3>
                        
                        <div className="flex items-center text-gray-400 text-sm mb-2">
                          <User size={14} className="mr-1" />
                          <span className="truncate">{podcast.author || 'Unknown Author'}</span>
                        </div>
                        
                        {podcast.description && (
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {podcast.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 bg-dark-700 px-2 py-1 rounded">
                            {cat.name}
                          </span>
                          <div className="flex items-center text-gray-500 text-xs">
                            <Clock size={12} className="mr-1" />
                            <span>{new Date(podcast.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile View All Link */}
            <div className="mt-4 text-center sm:hidden">
              <Link
                to={`/podcasts/category/${cat.slug}`}
                className="text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors"
              >
                View All {cat.name} Podcasts →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PodcastList;
