import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { supabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';
import AdUnit from '../components/ads/AdUnit';
import PodcastList from '../components/podcasts/PodcastList';
import { Headphones, Search, Music, TrendingUp, Clock } from 'lucide-react';

const PodcastPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Use memoized category lookup for better performance
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = { all: 'All Podcasts' };
    categories.forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // Get page title based on selected category
  const pageTitle = useMemo(() => {
    if (selectedCategory === 'all') return 'Podcasts | Mystic Banana - Discover Amazing Shows';
    return `${categoryMap[selectedCategory] || 'Podcasts'} | Mystic Banana`;
  }, [selectedCategory, categoryMap]);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching podcast categories');
      
      const { data, error } = await supabase
        .from('podcast_categories')
        .select('*')
        .order('name');
        
      if (data && data.length > 0) {
        console.log(`Found ${data.length} categories:`, data.map(c => c.name).join(', '));
      } else {
        console.log('No categories found');
      }
      
      if (error) throw error;
      
      console.log('Successfully fetched categories:', data?.length || 0);
      setCategories(data || []);
      
      // If categoryId is provided but not found in categories, redirect to all
      if (categoryId && categoryId !== 'all' && data) {
        const categoryExists = data.some(cat => cat.id === categoryId);
        if (!categoryExists) {
          navigate('/podcasts', { replace: true });
          setSelectedCategory('all');
        }
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, navigate]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(categoryId === 'all' ? '/podcasts' : `/podcasts/category/${categoryId}`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      console.log('Searching for:', searchQuery);
      
      // Search in podcast names, descriptions and authors
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`Found ${data?.length || 0} podcasts matching "${searchQuery}"`);
      setSearchResults(data || []);
      
      // If no results, we'll show a message in the UI
      if (data?.length === 0) {
        console.log('No podcasts found matching the search criteria');
      }
    } catch (err: any) {
      console.error('Error searching podcasts:', err);
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <PageLayout>
      <SEO 
        title={pageTitle}
        description="Discover and listen to your favorite podcasts on Mystic Banana. Stream the latest episodes from popular shows across different categories including spirituality, meditation, philosophy, and more."
        ogType="website"
        ogImage="/images/podcast-page-cover.jpg"
        canonicalUrl={`https://mysticbanana.com/podcasts${selectedCategory !== 'all' ? `/category/${selectedCategory}` : ''}`}
      />
      
      <div className="min-h-screen bg-dark-900 text-white">
        {/* Hero Section - Mobile First */}
        <div className="relative bg-gradient-to-br from-accent-600 via-accent-700 to-accent-800 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                  <Headphones size={32} className="text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Discover Amazing Podcasts
              </h1>
              
              <p className="text-lg sm:text-xl text-accent-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Explore thousands of podcasts across spirituality, meditation, philosophy, and more. 
                Find your next favorite show today.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search podcasts..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                  />
                </div>
              </form>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{categories.length}</div>
                  <div className="text-sm text-accent-100">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">1000+</div>
                  <div className="text-sm text-accent-100">Episodes</div>
                </div>
                <div className="text-center col-span-2 sm:col-span-1">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-sm text-accent-100">Streaming</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Error State */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-white p-4 sm:p-6 rounded-lg mb-8 max-w-2xl mx-auto">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">!</span>
                </div>
                <h3 className="font-semibold">Error Loading Podcasts</h3>
              </div>
              <p className="text-red-200 mb-4">{error}</p>
              <button 
                onClick={() => fetchCategories()}
                className="px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Search Results Section */}
          {searchResults.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Search className="mr-3 text-accent-500" size={24} />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Search Results</h2>
                </div>
                <button 
                  onClick={clearSearch}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1 px-3 py-1 bg-dark-800 rounded-full transition-colors"
                >
                  Clear search
                </button>
              </div>
              
              {isSearching ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Searching podcasts...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {searchResults.map(podcast => (
                    <a 
                      key={podcast.id}
                      href={`/podcasts/${podcast.slug || podcast.id}`}
                      className="group bg-dark-800 rounded-lg overflow-hidden hover:bg-dark-700 transition-colors duration-200"
                    >
                      <div className="aspect-square relative">
                        {podcast.image_url ? (
                          <img 
                            src={podcast.image_url} 
                            alt={podcast.name} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-dark-700">
                            <Headphones size={32} className="text-accent-500" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-white line-clamp-1 group-hover:text-accent-400 transition-colors">
                          {podcast.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-1 mt-1">
                          {podcast.author || 'Unknown Author'}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* No Results Message */}
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="mb-12 bg-dark-800 rounded-lg p-8 text-center">
              <Search size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No podcasts found</h3>
              <p className="text-gray-400 mb-6">We couldn't find any podcasts matching "{searchQuery}"</p>
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-full font-medium transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
          
          {/* Featured Section - Only show if not searching */}
          {(!searchQuery || searchResults.length === 0) && (
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <TrendingUp className="mr-3 text-accent-500" size={24} />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Podcasts</h2>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading amazing podcasts...</p>
                </div>
              ) : (
                <PodcastList />
              )}
            </div>
          )}

          {/* Ad Unit */}
          <div className="mb-12">
            <AdUnit placement="podcast" className="mx-auto" />
          </div>

          {/* Browse Categories */}
          {!isLoading && categories.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Music className="mr-3 text-accent-500" size={24} />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Browse by Category</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {categories.slice(0, 8).map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className="group bg-dark-800 hover:bg-dark-700 rounded-lg p-6 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white group-hover:text-accent-400 transition-colors">
                        {category.name}
                      </h3>
                      <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center group-hover:bg-accent-500/30 transition-colors">
                        <Music size={16} className="text-accent-400" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {category.description || 'Explore podcasts in this category'}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      <span>Latest episodes available</span>
                    </div>
                  </button>
                ))}
              </div>

              {categories.length > 8 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => {/* TODO: Show all categories */}}
                    className="px-6 py-3 bg-dark-800 hover:bg-dark-700 text-white rounded-lg font-medium transition-colors"
                  >
                    View All Categories
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recent Episodes Section */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Clock className="mr-3 text-accent-500" size={24} />
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Latest Episodes</h2>
            </div>
            
            <div className="bg-dark-800 rounded-lg p-6">
              <p className="text-gray-400 text-center py-8">
                Latest episodes will be displayed here once RSS feeds are processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PodcastPage;
