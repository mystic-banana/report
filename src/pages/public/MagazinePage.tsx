import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search, Clock, Calendar, Tag, Bookmark, TrendingUp, Crown, Heart, Share, ChevronRight } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description?: string;
  content?: string;
  featured_image_url?: string;
  coverImage?: string; // For compatibility with UI
  is_premium?: boolean;
  isPremium?: boolean; // For compatibility with UI
  published_at?: string;
  publishedAt?: string; // For compatibility with UI
  category_id?: string;
  categoryName?: string;
  category?: string; // For compatibility with UI
  excerpt?: string; // For compatibility with UI
  authorName?: string; // For compatibility with UI
  authorAvatar?: string; // For compatibility with UI
  readTime: number;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

const MagazinePage: React.FC = () => {
  const { page = '1', category } = useParams<{ page: string; category?: string }>();
  const pageNumber = parseInt(page, 10);
  
  // State variables
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(category || null);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<{[key: string]: Article[]}>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderInterval = useRef<number | null>(null);
  
  // Computed values
  const totalSlides = Math.min(3, filteredArticles.length);
  const articlesPerPage = 9;
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  
  // Function to fetch articles directly from Supabase
  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch articles
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
        
      if (articlesError) {
        console.error('Error fetching articles:', articlesError);
        setError(articlesError.message);
        setIsLoading(false);
        return;
      }
      
      if (!articlesData || articlesData.length === 0) {
        setArticles([]);
        setFilteredArticles([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug');
        
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      }
      
      // Process articles
      const processedArticles = articlesData.map(article => {
        // Find category name if available
        let categoryName = 'Uncategorized';
        if (article.category_id && categoriesData) {
          const category = categoriesData.find(cat => cat.id === article.category_id);
          if (category) {
            categoryName = category.name;
          }
        }
        
        // Calculate read time (1 minute per 200 words, minimum 1 minute)
        const wordCount = article.content ? article.content.split(/\s+/).length : 0;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        
        return {
          ...article,
          categoryName,
          readTime
        };
      });
      
      // Set state
      setArticles(processedArticles);
      setFilteredArticles(processedArticles);
      if (categoriesData) {
        setCategoryList(categoriesData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch articles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchArticles();
  }, []);

  // Setup auto-slide for hero section
  useEffect(() => {
    // Start auto-sliding
    sliderInterval.current = window.setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 5000);
    
    // Clean up interval on unmount
    return () => {
      if (sliderInterval.current) {
        clearInterval(sliderInterval.current);
      }
    };
  }, [totalSlides]);
  
  useEffect(() => {
    // Filter articles based on search query and active category
    if (articles.length === 0) return;

    let filtered = [...articles];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) || 
        (article.meta_description && article.meta_description.toLowerCase().includes(query))
      );
    }
    
    if (activeCategory) {
      filtered = filtered.filter(article => article.category_id === activeCategory);
    }
    
    setFilteredArticles(filtered);
    
    // Group articles by category for category sections
    if (categoryList.length > 0) {
      const articlesByCategory: {[key: string]: Article[]} = {};
      
      categoryList.forEach(category => {
        const categoryArticles = articles.filter(article => article.category_id === category.id);
        if (categoryArticles.length > 0) {
          articlesByCategory[category.id] = categoryArticles
            .sort((a, b) => {
              const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
              const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, 3); // Get only 3 latest articles per category
        }
      });
      
      setCategoryArticles(articlesByCategory);
    }
  }, [articles, searchQuery, activeCategory, categoryList]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-600"></div>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">Error Loading Articles</h2>
            <p className="text-dark-600 dark:text-dark-400 mb-6">{error}</p>
            <button 
              onClick={() => fetchArticles()} 
              className="mt-4 px-4 py-2 bg-accent-600 text-white rounded hover:bg-accent-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      {/* Hero Section with Large Featured Article */}
      <section className="relative bg-dark-950 pt-24 pb-16 text-white overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/90 to-dark-950/40 z-10"></div>
        
        {filteredArticles.length > 0 && (
          <div className="absolute inset-0 z-0">
            <img 
              src={filteredArticles[currentSlide]?.featured_image_url || 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1600'} 
              alt="Background" 
              className="w-full h-full object-cover opacity-40"
            />
          </div>
        )}
        
        <div className="container mx-auto px-4 relative z-20">
          {/* Hero Slider */}
          <div className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl">
            {/* Slider content */}
            <div className="relative">
              {filteredArticles.slice(0, 3).map((article, index) => (
                <div 
                  key={article.id} 
                  className={`transition-opacity duration-700 ${currentSlide === index ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-dark-800/70 backdrop-blur-sm p-8 rounded-2xl">
                    <div className="relative h-80 overflow-hidden rounded-xl">
                      <img 
                        src={article.featured_image_url || 'https://images.pexels.com/photos/6952861/pexels-photo-6952861.jpeg?auto=compress&cs=tinysrgb&w=1600'} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute top-4 left-4 flex space-x-2">
                        <span className="bg-dark-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                          {article.categoryName}
                        </span>
                        
                        <span className="flex items-center bg-dark-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                          <Clock className="w-3 h-3 mr-1" /> {article.readTime} min read
                        </span>
                      </div>
                      
                      {article.is_premium && (
                        <div className="absolute top-4 right-4">
                          <span className="flex items-center bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                            <Crown className="w-3 h-3 mr-1" /> Premium
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        <Link to={`/magazine/${article.slug}`} className="hover:text-accent-400 transition-colors">
                          {article.title}
                        </Link>
                      </h2>
                      
                      <p className="text-gray-300 mb-6">
                        {article.meta_description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {article.authorAvatar ? (
                            <img 
                              src={article.authorAvatar} 
                              alt={article.authorName} 
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-accent-600 mr-3 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {article.authorName ? article.authorName.charAt(0) : 'A'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium">
                              {article.authorName || 'Anonymous'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : 'Recent'}
                            </div>
                          </div>
                        </div>
                        
                        <Link 
                          to={`/magazine/${article.slug}`}
                          className="px-5 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md transition-colors"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Slider controls */}
            <div className="absolute bottom-6 right-6 flex space-x-2">
              {filteredArticles.slice(0, 3).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index 
                      ? 'bg-accent-600 w-6' 
                      : 'bg-gray-400 hover:bg-accent-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Latest Articles */}
      <section className="py-16 bg-white dark:bg-dark-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-serif font-bold text-dark-900 dark:text-white">Latest Articles</h2>
            
            {/* Search bar */}
            <div className="relative max-w-md w-full hidden md:block">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-700 rounded-md bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-500" />
            </div>
          </div>
          
          {filteredArticles.length > 0 ? (
            <div>
              {/* Display latest 3 articles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredArticles.slice(0, 3).map(article => (
                  <article key={article.id} className="group bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative">
                      <Link to={`/magazine/${article.slug}`} className="block aspect-[16/10] overflow-hidden">
                        <img
                          src={article.featured_image_url || 'https://images.pexels.com/photos/6952861/pexels-photo-6952861.jpeg?auto=compress&cs=tinysrgb&w=1600'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      
                      {/* Bookmark Button */}
                      <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-dark-600 hover:text-accent-600 transition-colors z-10">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-xs text-dark-500 dark:text-dark-400">
                          <span className="flex items-center mr-3">
                            <Clock className="w-3 h-3 mr-1" />
                            {article.readTime} min read
                          </span>
                          <span>
                            {article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : 'Recent'}
                          </span>
                        </div>
                        
                        {article.is_premium && (
                          <span className="flex items-center text-amber-500 dark:text-amber-400 text-xs font-medium">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-lg text-dark-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors mb-3">
                        <Link to={`/magazine/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>
                      
                      <p className="text-dark-600 dark:text-dark-400 text-sm line-clamp-2 mb-4">
                        {article.meta_description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-700">
                        <div className="flex items-center">
                          {article.authorAvatar ? (
                            <img 
                              src={article.authorAvatar} 
                              alt={article.authorName} 
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-800 mr-2 flex items-center justify-center">
                              <span className="text-xs text-accent-700 dark:text-accent-300 font-medium">
                                {article.authorName ? article.authorName.charAt(0) : 'A'}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-medium text-dark-800 dark:text-dark-200">
                            {article.authorName}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-dark-500 hover:text-accent-600 transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-dark-500 hover:text-accent-600 transition-colors">
                            <Share className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-dark-800 dark:text-white mb-2">No Articles Found</h3>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try a different search term.`
                  : "We couldn't find any articles. Please check back later."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Category Sections - Show articles by category */}
      {Object.keys(categoryArticles).map(categoryId => {
        const category = categoryList.find(c => c.id === categoryId);
        const articles = categoryArticles[categoryId];
        
        if (!category || articles.length === 0) return null;
        
        return (
          <section key={categoryId} className="py-12 bg-gray-50 dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-dark-900 dark:text-white">{category.name}</h2>
                <Link 
                  to={`/magazine/categories/${categoryId}`} 
                  className="text-accent-600 hover:text-accent-700 font-medium text-sm flex items-center"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articles.map(article => (
                  <article key={article.id} className="group bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative">
                      <Link to={`/magazine/${article.slug}`} className="block aspect-[16/10] overflow-hidden">
                        <img
                          src={article.featured_image_url || 'https://images.pexels.com/photos/6952861/pexels-photo-6952861.jpeg?auto=compress&cs=tinysrgb&w=1600'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      
                      {/* Bookmark Button */}
                      <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-dark-600 hover:text-accent-600 transition-colors z-10">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-xs text-dark-500 dark:text-dark-400">
                          <span className="flex items-center mr-3">
                            <Clock className="w-3 h-3 mr-1" />
                            {article.readTime} min read
                          </span>
                          <span>
                            {article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : 'Recent'}
                          </span>
                        </div>
                        
                        {article.is_premium && (
                          <span className="flex items-center text-amber-500 dark:text-amber-400 text-xs font-medium">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-lg text-dark-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors mb-3">
                        <Link to={`/magazine/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>
                      
                      <p className="text-dark-600 dark:text-dark-400 text-sm line-clamp-2 mb-4">
                        {article.meta_description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-700">
                        <div className="flex items-center">
                          {article.authorAvatar ? (
                            <img 
                              src={article.authorAvatar} 
                              alt={article.authorName} 
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-800 mr-2 flex items-center justify-center">
                              <span className="text-xs text-accent-700 dark:text-accent-300 font-medium">
                                {article.authorName ? article.authorName.charAt(0) : 'A'}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-medium text-dark-800 dark:text-dark-200">
                            {article.authorName}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-dark-500 hover:text-accent-600 transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-dark-500 hover:text-accent-600 transition-colors">
                            <Share className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </PageLayout>
  );
};

export default MagazinePage;
