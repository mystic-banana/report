import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Headphones, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Article, Podcast } from '../../types';

const FeaturedContent: React.FC = () => {
  const [featuredContent, setFeaturedContent] = useState<(Article | Podcast)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch articles directly from Supabase
  const fetchFeaturedContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch articles
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);
      
      if (articlesError) {
        console.error('Error fetching featured content:', articlesError);
        setError(articlesError.message);
        setIsLoading(false);
        return;
      }
      
      if (!articlesData || articlesData.length === 0) {
        setFeaturedContent([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch categories to get names
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name');
      
      // Process articles
      const processedArticles = articlesData.map(article => {
        // Find category name if available
        let category = 'Uncategorized';
        if (article.category_id && categoriesData) {
          const categoryObj = categoriesData.find(cat => cat.id === article.category_id);
          if (categoryObj) {
            category = categoryObj.name;
          }
        }
        
        // Calculate read time (1 minute per 200 words, minimum 1 minute)
        const wordCount = article.content ? article.content.split(/\s+/).length : 0;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        
        // Set default image if none provided
        const coverImage = article.featured_image_url || 'https://images.pexels.com/photos/6952861/pexels-photo-6952861.jpeg?auto=compress&cs=tinysrgb&w=1600';
        
        return {
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.meta_description || '',
          content: article.content || '',
          coverImage,
          authorId: article.author_id || 'system-author',
          authorName: 'Mystic Banana Author',
          authorAvatar: '',
          publishedAt: article.published_at,
          category,
          tags: article.tags || [],
          isPremium: article.is_premium || false,
          readTime
        } as Article;
      });
      
      setFeaturedContent(processedArticles);
      console.log('Featured content:', processedArticles);
    } catch (err) {
      console.error('Unexpected error fetching featured content:', err);
      setError('Failed to load featured content');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFeaturedContent();
  }, []);
  
  // Function to check if content is an article
  const isArticle = (content: Article | Podcast): content is Article => {
    return 'readTime' in content;
  };

  // Motion variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse-slow w-8 h-8 rounded-full bg-accent-500"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-dark-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
            Featured Content
          </h2>
          <p className="text-dark-700 dark:text-dark-300 max-w-2xl mx-auto">
            Explore our curated selection of spiritual insights, cosmic wisdom, and transformative practices.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {featuredContent.slice(0, 6).map((content, index) => (
            <motion.div 
              key={content.id} 
              className={`rounded-lg overflow-hidden shadow-lg bg-white dark:bg-dark-800 hover:shadow-xl transition-shadow group ${
                index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
              variants={itemVariants}
            >
              <Link to={isArticle(content) ? `/articles/${content.slug}` : `/podcast/${content.id}`}>
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={content.coverImage} 
                    alt={content.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  {content.isPremium && (
                    <div className="absolute top-4 right-4 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      PREMIUM
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4">
                      <p className="text-white font-medium">Read More</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-medium text-accent-600 dark:text-accent-400 uppercase tracking-wider">
                      {isArticle(content) ? content.category : content.category}
                    </span>
                    <span className="mx-2 text-dark-300 dark:text-dark-600">•</span>
                    <div className="flex items-center text-xs text-dark-500 dark:text-dark-400">
                      {isArticle(content) ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          {content.readTime} min read
                        </>
                      ) : (
                        <>
                          <Headphones className="w-3 h-3 mr-1" />
                          {content.duration} min
                        </>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-serif text-xl font-semibold text-dark-800 dark:text-white mb-2 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors">
                    {content.title}
                  </h3>
                  
                  <p className="text-dark-700 dark:text-dark-300 text-sm line-clamp-3">
                    {isArticle(content) ? content.excerpt : content.description}
                  </p>
                  
                  <div className="mt-4 flex items-center">
                    <span className="text-xs text-dark-500 dark:text-dark-400">
                      By {isArticle(content) ? content.authorName : content.hostName}
                    </span>
                    <span className="mx-2 text-dark-300 dark:text-dark-600">•</span>
                    <span className="text-xs text-dark-500 dark:text-dark-400">
                      {new Date(content.publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="text-center mt-12">
          <Link 
            to="/magazine" 
            className="inline-flex items-center px-6 py-3 border border-accent-600 text-accent-600 hover:bg-accent-500 hover:text-white dark:border-accent-400 dark:text-accent-400 dark:hover:bg-accent-500 dark:hover:text-white font-medium rounded-md transition-colors"
          >
            View All Content
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedContent;