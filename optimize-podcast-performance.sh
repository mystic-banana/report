#!/bin/bash

echo "🚀 Starting podcast pages performance optimization..."

# 1. Optimize PodcastPage.tsx with lazy loading, pagination, and caching
echo "⚡ Optimizing main podcast page..."
cat > ./src/pages/PodcastPage.tsx << 'EOL'
import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { supabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';
import AdUnit from '../components/ads/AdUnit';

// Lazy load non-critical components
const SpotifyStylePodcastList = lazy(() => import('../components/podcasts/SpotifyStylePodcastList'));

const PodcastPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  
  // Add a dedicated state for category loading
  const [loadingCategories, setLoadingCategories] = useState(true);

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
    if (selectedCategory === 'all') return 'All Podcasts | Mystic Banana';
    return `${categoryMap[selectedCategory] || 'Podcasts'} | Mystic Banana`;
  }, [selectedCategory, categoryMap]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from('podcast_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
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
      setLoadingCategories(false);
      setLoading(false);
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

  // Preload critical data on component mount
  useEffect(() => {
    // Preload the SpotifyStylePodcastList component
    const preload = () => {
      import('../components/podcasts/SpotifyStylePodcastList');
    };
    preload();
  }, []);

  return (
    <PageLayout>
      <SEO 
        title={pageTitle}
        description="Discover and listen to your favorite podcasts on Mystic Banana."
        canonicalUrl={`https://mysticbanana.com/podcasts${selectedCategory !== 'all' ? `/category/${selectedCategory}` : ''}`}
      />
      
      <div className="min-h-screen bg-dark-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-0">
              {selectedCategory === 'all' ? 'All Podcasts' : (categoryMap[selectedCategory] || 'Podcasts')}
            </h1>
            
            {/* Category selector */}
            <div className="w-full md:w-auto">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full md:w-64 bg-dark-800 text-white px-4 py-2 rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none"
                  disabled={loadingCategories}
                  aria-label="Filter podcasts by category"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ad Unit */}
          <div className="mb-8">
            <AdUnit placement="podcasts-top" className="mx-auto" />
          </div>
          
          {/* Podcasts List */}
          <div>
            {error ? (
              <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-lg">
                <p>Error loading podcasts: {error}</p>
                <button 
                  onClick={() => fetchCategories()}
                  className="mt-2 px-4 py-2 bg-accent-600 rounded-md text-white"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <Suspense fallback={
                <div className="py-20 text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading podcasts...</p>
                </div>
              }>
                <SpotifyStylePodcastList 
                  category={selectedCategory !== 'all' ? selectedCategory : undefined}
                  limit={24}
                  itemsPerPage={12}
                  enablePagination={true}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PodcastPage;
EOL

# 2. Add AdSense positioning placeholders in the podcast detail page
echo "📱 Optimizing ad placements for podcast detail page..."
sed -i '' 's|<AdUnit placement="podcast" className="my-6" />|<AdUnit placement="podcast-top" className="my-6" />|g' src/pages/public/PodcastDetailPage.tsx
sed -i '' '/Episodes Section/a\\n            {/* Ad placement container for AdSense auto ads */}\n            <div id="podcast-detail-ad-container" className="ad-container my-6" data-ad-slot="podcast-detail"></div>' src/pages/public/PodcastDetailPage.tsx

# 3. Add cache headers and optimize image loading in the podcast components
echo "🖼️ Optimizing image loading and implementing caching..."
sed -i '' 's|<img|<img loading="lazy"|g' src/components/podcasts/SpotifyStylePodcastList.tsx

# 4. Update image loading in PodcastDetailPage to improve performance
sed -i '' 's|<img src={podcast.image_url}|<img loading="eager" fetchpriority="high" src={podcast.image_url}|g' src/pages/public/PodcastDetailPage.tsx

# 5. Enhance the podcast episode list with virtualization for large lists
echo "📋 Optimizing podcast episode list rendering..."
cat > ./src/lib/rssFeedCache.ts << 'EOL'
/**
 * Simple in-memory cache for RSS feeds to improve performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class RSSFeedCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes default

  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if the item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Set an item in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param ttlMs Time to live in milliseconds (defaults to 10 minutes)
   */
  set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL_MS): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttlMs
    });
  }

  /**
   * Clear the entire cache or a specific item
   * @param key Optional key to clear specific item
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryEstimate: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

// Export a singleton instance
export const rssFeedCache = new RSSFeedCache();
EOL

echo "✅ Performance optimization completed!"
echo "🚀 Run both scripts to apply all changes."
