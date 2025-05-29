import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { PodcastFeed, PodcastCategory } from '../../types';
import PageLayout from '../../components/layout/PageLayout';
import SEO from '../../components/SEO';
import { Play, ArrowLeft } from 'lucide-react';
import AdUnit from '../../components/ads/AdUnit';

interface PodcastCategoryPageProps {}

const PodcastCategoryPage: React.FC<PodcastCategoryPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<PodcastCategory | null>(null);
  const [podcasts, setPodcasts] = useState<PodcastFeed[]>([]);
  const [allCategories, setAllCategories] = useState<PodcastCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndPodcasts();
      fetchAllCategories();
    }
  }, [slug]);


  const fetchAllCategories = async () => {
    const { data: cats } = await supabase
      .from('podcast_categories')
      .select('id, name, slug, description, created_at, updated_at');
    setAllCategories(cats || []);
  };

  const fetchCategoryAndPodcasts = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch category details by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('podcast_categories')
        .select('id, name, slug, description, created_at, updated_at')
        .eq('slug', slug)
        .single();
      
      if (categoryError) {
        // Try to use fallback categories if we can't find the real one
        const fallbackCategories: Record<string, PodcastCategory> = {
          'temp-tech': { id: 'temp-tech', name: 'Technology', slug: 'temp-tech', description: 'Tech-related podcasts', created_at: '', updated_at: '' },
          'temp-business': { id: 'temp-business', name: 'Business', slug: 'temp-business', description: 'Business and entrepreneurship', created_at: '', updated_at: '' },
          'temp-science': { id: 'temp-science', name: 'Science', slug: 'temp-science', description: 'Science and research', created_at: '', updated_at: '' },
          'temp-entertainment': { id: 'temp-entertainment', name: 'Entertainment', slug: 'temp-entertainment', description: 'Entertainment and pop culture', created_at: '', updated_at: '' },
          'temp-health': { id: 'temp-health', name: 'Health', slug: 'temp-health', description: 'Health and wellness', created_at: '', updated_at: '' },
        };
        
        if (slug && fallbackCategories[slug]) {
          setCategory(fallbackCategories[slug]);
        } else {
          setCategory({
            id: slug || '',
            name: slug ? slug.replace(/-/g, ' ') : '',
            slug: slug || '',
            description: `Explore our collection of ${slug ? slug.replace(/-/g, ' ') : ''} podcasts for spiritual growth and enlightenment.`,
            created_at: '',
            updated_at: ''
          });
        }
      } else {
        setCategory(categoryData);
      }
      
      // Fetch podcasts in this category
      const { data: podcastsData, error: podcastsError } = await supabase
        .from('podcasts')
        .select('id, name, slug, description, image_url, created_at, updated_at, author, category_id, feed_url')
        .eq('category_id', categoryData?.id)
        .in('status', ['approved', 'published'])
        .order('created_at', { ascending: false });
      
      if (podcastsError) throw podcastsError;
      
      setPodcasts((podcastsData || []).map(podcast => ({
      ...podcast,
      category: categoryData?.name || (category ? category.name : ''),
    })));

    } catch (err: any) {
      console.error('Error fetching category and podcasts:', err);
      setError(err.message || 'Failed to load category and podcasts');
    } finally {
      setLoading(false);
    }
  };

  // Generate structured data for the podcast category
  const generateCategoryJsonLd = (): Record<string, any> | undefined => {
    if (!category) return undefined;
    
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${category.name} Podcasts | Mystic Banana`,
      "description": category.description,
      "url": `https://mysticbanana.com/podcasts/category/${categoryId}`,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": podcasts.map((podcast, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "PodcastSeries",
            "name": podcast.name,
            "url": `https://mysticbanana.com/podcasts/${podcast.id}`,
            "image": podcast.image_url,
            "description": podcast.description,
            "author": {
              "@type": "Person",
              "name": podcast.author || "Mystic Banana"
            }
          }
        }))
      }
    };
  };

  return (
    <PageLayout>
      {/* SEO Component */}
      {category && (
        <SEO
          title={`${category.name} Podcasts | Mystic Banana`}
          description={category.description || `Explore our collection of ${category.name} podcasts for spiritual growth and enlightenment.`}
          canonicalUrl={`/podcasts/category/${categoryId}`}
          ogType="website"
          ogImage={podcasts[0]?.image_url || '/images/podcast-category-default.jpg'}
          ogImageAlt={`${category.name} Podcasts`}
          keywords={[category.name, 'podcasts', 'spiritual', 'mystic', 'enlightenment', 'meditation']}
          jsonLd={generateCategoryJsonLd()}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-800 text-white pb-20">
        {/* Hero Banner - Spotify Style */}
        <div className="bg-gradient-to-r from-accent-800 to-accent-600 py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center mb-8">
              <Link to="/podcasts" className="text-white hover:text-accent-300 transition-colors flex items-center">
                <ArrowLeft className="mr-2" size={24} />
                <span>Back to podcasts</span>
              </Link>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category?.name || 'Category'} Podcasts</h1>
            <p className="text-lg opacity-90 max-w-2xl">
              {category?.description || 'Explore our collection of podcasts in this category.'}
            </p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto max-w-6xl px-6 pt-12">
          {/* Ad Unit */}
          <div className="mb-12">
            <AdUnit placement="podcast" className="w-full" />
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-t-accent-500 border-r-accent-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
              <p className="text-gray-400">{error}</p>
            </div>
          ) : (
            <>
              <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 capitalize">
                  {category?.name} Podcasts
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  {category?.description}
                </p>
                
                {/* Breadcrumbs for SEO */}
                <nav className="flex justify-center text-sm text-gray-400 mt-6" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                      <Link to="/" className="hover:text-accent-400">Home</Link>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="mx-2">/</span>
                        <Link to="/podcasts" className="hover:text-accent-400">Podcasts</Link>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="mx-2">/</span>
                        <span className="text-accent-400 capitalize">{category?.name}</span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </header>
              
              {podcasts.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-medium text-white mb-4">No Podcasts Found</h2>
                  <p className="text-gray-400 mb-6">There are no podcasts in this category yet.</p>
                  <a href="/podcasts" className="px-6 py-3 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors" title="Browse All Podcasts">
                    Browse All Podcasts
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {podcasts.map(podcast => (
                    <a
                      key={podcast.id}
                      href={`/podcasts/${podcast.slug || podcast.id}`}
                      className="group"
                      title={podcast.name}
                    >
                      <div className="bg-dark-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="relative aspect-square">
                          {podcast.image_url ? (
                            <img 
                              src={podcast.image_url} 
                              alt={podcast.name} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                              <span className="text-gray-400 text-sm">No Image</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center">
                              <Play size={24} className="text-white ml-1" />
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
                    </a>
                  ))}
                </div>
              )}
              
              {/* Category Navigation */}
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-white mb-6">Explore Other Categories</h2>
                <div className="flex flex-wrap gap-4">
                  {allCategories && allCategories.filter(cat => cat.slug !== slug).map(cat => (
                    <a
                      key={cat.id}
                      href={`/podcasts/category/${cat.slug}`}
                      className={`px-4 py-2 rounded-full text-sm font-medium bg-dark-800 text-gray-300 hover:bg-dark-700`}
                      title={`View ${cat.name} Podcasts`}
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PodcastCategoryPage;
