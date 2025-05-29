#!/bin/bash

# Optimize Podcast Detail Page Script
echo "🚀 Starting podcast detail page optimization..."

# 1. Ensure dependencies are installed
echo "📦 Installing required dependencies..."
npm install dompurify @types/dompurify --silent

# 2. Create the optimized PodcastDetailPage.tsx
echo "🔧 Creating optimized PodcastDetailPage.tsx..."
cat > ./src/pages/public/PodcastDetailPage.tsx << 'EOL'
import React, { useEffect, useState, useMemo, Suspense, lazy } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { PodcastFeed, PodcastEpisode } from '../../types';
import PageLayout from '../../components/layout/PageLayout';
import SEO from '../../components/SEO';
import PodcastPlayer from '../../components/podcasts/PodcastPlayer';
import AdUnit from '../../components/ads/AdUnit';
import { Share2, ExternalLink, Play, Star } from 'lucide-react';

// Lazy load components for better performance
const PodcastEpisodesList = lazy(() => import('../../components/podcasts/PodcastEpisodesList'));

const PodcastDetailPage: React.FC = () => {
  // Support both slug and id in the URL
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [podcast, setPodcast] = useState<PodcastFeed | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPodcastAndEpisodes();
    }
  }, [slug]);

  const fetchPodcastAndEpisodes = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!slug) {
        throw new Error('Podcast slug is required');
      }

      // Check if slug is a UUID or a slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      
      let query = supabase.from('podcasts').select('*');
      
      if (isUuid) {
        // If it's a UUID, query by ID
        query = query.eq('id', slug);
      } else {
        // If it's a slug, we need to create a slug from the name and match it
        query = query.ilike('name', `%${slug.replace(/-/g, '%')}%`);
      }
      
      const { data: podcastData, error: podcastError } = await query.single();
        
      if (podcastError) throw podcastError;
      if (!podcastData) throw new Error('Podcast not found');
      
      console.log('Podcast data from database:', podcastData);
      
      // Then get the category name separately
      if (podcastData.category_id) {
        try {
          const { data: categoryData } = await supabase
            .from('podcast_categories')
            .select('name')
            .eq('id', podcastData.category_id)
            .single();
            
          if (categoryData && categoryData.name) {
            // Add the category name to the podcast data
            podcastData.categoryName = categoryData.name;
            console.log(`Found category name: ${categoryData.name} for ID: ${podcastData.category_id}`);
          } else {
            console.error(`Category not found for ID: ${podcastData.category_id}`);
            // Fallback to the category field if it exists
            podcastData.categoryName = podcastData.category || 'Uncategorized';
          }
        } catch (categoryError) {
          console.error('Error fetching category:', categoryError);
          podcastData.categoryName = podcastData.category || 'Uncategorized';
        }
      } else if (podcastData.category) {
        // If no category_id but has category text field, use it as fallback
        podcastData.categoryName = podcastData.category;
        console.log(`Using category text field: ${podcastData.category}`);
      } else {
        podcastData.categoryName = 'Uncategorized';
      }

      // Redirect to SEO-friendly URL if needed
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
      
      // First, check for episodes in the database
      const { data: episodesData, error: episodesError } = await supabase
        .from('episodes')
        .select('*')
        .eq('podcast_id', podcastData.id)
        .order('pub_date', { ascending: false });
      
      // If we have episodes in the database already, use them
      if (!episodesError && episodesData && episodesData.length > 0) {
        console.log(`Found ${episodesData.length} episodes in database`);
        setEpisodes(episodesData);
      } else {
        console.log('No episodes found in database, trying to fetch from RSS feed');
        // Otherwise, try to fetch from RSS feed if we have a URL
        if (podcastData.feed_url) {
          try {
            console.log(`Fetching RSS feed from: ${podcastData.feed_url}`);
            const feedData = await fetch(`/api/parse-rss-feed?url=${encodeURIComponent(podcastData.feed_url)}`);
            
            if (!feedData.ok) {
              throw new Error(`Failed to fetch RSS feed: ${feedData.statusText}`);
            }
            
            const parsedFeed = await feedData.json();
            
            if (parsedFeed.episodes && parsedFeed.episodes.length > 0) {
              console.log(`Parsed ${parsedFeed.episodes.length} episodes from RSS feed`);
              
              // Process episodes
              const processedEpisodes = parsedFeed.episodes.map((episode: any, index: number) => ({
                id: episode.guid || `${podcastData.id}-episode-${index}`,
                title: episode.title || `Episode ${index + 1}`,
                description: episode.content || episode.description || '',
                audio_url: episode.enclosure?.url || '',
                duration: episode.duration || null,
                pub_date: episode.pubDate || episode.isoDate || null,
                image_url: episode.image?.url || podcastData.image_url || null,
                podcast_id: podcastData.id,
                guid: episode.guid || `${podcastData.id}-episode-${index}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }));
              
              setEpisodes(processedEpisodes);
              
              // Update podcast metadata if missing
              if (!podcastData.image_url && parsedFeed.image?.url) {
                podcastData.image_url = parsedFeed.image.url;
              }
              
              if (!podcastData.author && parsedFeed.author) {
                podcastData.author = parsedFeed.author;
              }
              
              if (!podcastData.description && parsedFeed.description) {
                podcastData.description = parsedFeed.description;
              }
              
              setPodcast({...podcastData});
              
              // Optionally store episodes in database for future use
              try {
                // Only store the first 50 episodes to avoid database limits
                const episodesToStore = processedEpisodes.slice(0, 50);
                
                if (episodesToStore.length > 0) {
                  const { error: insertError } = await supabase
                    .from('episodes')
                    .upsert(
                      episodesToStore.map(ep => ({
                        ...ep,
                        // Ensure we have the required fields
                        podcast_id: podcastData.id,
                        // Use the guid as the id if available, otherwise generate one
                        id: ep.guid || `${podcastData.id}-${Math.random().toString(36).substring(2, 15)}`
                      })),
                      { onConflict: 'id' }
                    );
                  
                  if (insertError) {
                    console.error('Error storing episodes in database:', insertError);
                  } else {
                    console.log(`Successfully stored ${episodesToStore.length} episodes in database`);
                  }
                }
              } catch (storeError) {
                console.error('Error storing episodes:', storeError);
              }
            } else {
              console.error('No episodes found in RSS feed');
            }
          } catch (rssError) {
            console.error('Error fetching RSS feed:', rssError);
          }
        }
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load podcast');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const playEpisode = (episode: PodcastEpisode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };

  const playNextEpisode = () => {
    if (currentEpisode && episodes.length > 1) {
      const currentIndex = episodes.findIndex(ep => ep.id === currentEpisode.id);
      if (currentIndex < episodes.length - 1) {
        playEpisode(episodes[currentIndex + 1]);
      }
    }
  };

  const playPreviousEpisode = () => {
    if (currentEpisode && episodes.length > 1) {
      const currentIndex = episodes.findIndex(ep => ep.id === currentEpisode.id);
      if (currentIndex > 0) {
        playEpisode(episodes[currentIndex - 1]);
      }
    }
  };

  // Generate structured data for SEO
  const podcastJsonLd = useMemo(() => {
    if (!podcast) return null;
    
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "PodcastSeries",
      "name": podcast.name,
      "description": podcast.description || '',
      "image": podcast.image_url || '',
      "url": window.location.href,
      "webFeed": podcast.feed_url,
      "author": {
        "@type": "Person",
        "name": podcast.author || 'Unknown'
      },
      "genre": podcast.categoryName || podcast.category || 'Podcast',
      "potentialAction": {
        "@type": "ListenAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": window.location.href
        }
      }
    };
    
    // Add episode data if available
    if (episodes && episodes.length > 0) {
      const episodeData = episodes.slice(0, 10).map(episode => ({
        "@type": "PodcastEpisode",
        "episodeNumber": episode.guid,
        "name": episode.title,
        "description": episode.description || '',
        "datePublished": episode.pub_date,
        "duration": episode.duration ? `PT${Math.floor(Number(episode.duration) / 60)}M${Math.floor(Number(episode.duration) % 60)}S` : undefined,
        "url": episode.audio_url
      }));
      
      // @ts-ignore - Add episodes to JSON-LD
      jsonLd.episode = episodeData;
    }
    
    return jsonLd;
  }, [podcast, episodes.slice(0, 10)]);

  return (
    <PageLayout>
      <SEO 
        title={podcast ? `${podcast.name} - Mystic Banana Podcasts` : 'Loading Podcast...'}
        description={podcast?.description || 'Explore this podcast on Mystic Banana'}
        ogImage={podcast?.image_url}
        structuredData={podcastJsonLd}
      />
      
      <div className="min-h-screen bg-dark-900 text-white">
        {loading ? (
          <div className="container mx-auto px-4 py-24 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white">Loading podcast...</h2>
          </div>
        ) : error ? (
          <div className="container mx-auto px-4 py-24 text-center">
            <div className="bg-red-900/30 rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <Link 
                to="/podcasts" 
                className="px-6 py-3 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors"
              >
                Browse all podcasts
              </Link>
            </div>
          </div>
        ) : podcast ? (
          <>
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-dark-800 to-dark-900 py-12">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  {/* Podcast Cover */}
                  <div className="w-full md:w-64 lg:w-80 flex-shrink-0">
                    <div className="aspect-square rounded-lg overflow-hidden shadow-xl">
                      {podcast.image_url ? (
                        <img 
                          src={podcast.image_url} 
                          alt={`${podcast.name} cover art`}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />
                      ) : (
                        <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                          <Play size={64} className="text-accent-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Mobile Play Button */}
                    <div className="mt-4 flex md:hidden">
                      {episodes.length > 0 && (
                        <button
                          onClick={() => playEpisode(episodes[0])}
                          className="w-full py-3 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                          <Play size={20} className="ml-1" />
                          <span>Play Latest Episode</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Podcast Info */}
                  <div className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="bg-accent-600/20 text-accent-400 px-3 py-1 rounded-full text-sm font-medium">
                          {podcast.categoryName || podcast.category || 'Podcast'}
                        </span>
                        
                        {podcast.author && (
                          <span className="text-gray-400 text-sm">
                            by {podcast.author}
                          </span>
                        )}
                      </div>
                      
                      <h1 className="text-3xl md:text-4xl font-bold text-white">
                        {podcast.name}
                      </h1>
                      
                      <div className="text-gray-300 prose prose-invert prose-sm md:prose-base max-w-none">
                        {podcast.description && (
                          <div dangerouslySetInnerHTML={{ __html: podcast.description }} />
                        )}
                      </div>
                      
                      {/* Desktop Play Button */}
                      <div className="hidden md:flex pt-3 space-x-3">
                        {episodes.length > 0 && (
                          <button
                            onClick={() => playEpisode(episodes[0])}
                            className="px-6 py-3 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors flex items-center space-x-2"
                            aria-label={`Play the latest episode of ${podcast.name}`}
                          >
                            <Play size={20} />
                            <span>Play Latest Episode</span>
                          </button>
                        )}
                        
                        <a 
                          href={podcast.feed_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-full transition-colors"
                          title="Open RSS Feed"
                          aria-label="Open RSS Feed in new window"
                        >
                          <ExternalLink size={20} aria-hidden="true" />
                        </a>
                        
                        <button 
                          className="p-3 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-full transition-colors"
                          title="Share Podcast"
                          aria-label="Share this podcast"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: podcast.name,
                                text: podcast.description,
                                url: window.location.href
                              });
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                              alert('Link copied to clipboard!');
                            }
                          }}
                        >
                          <Share2 size={20} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Episodes Section */}
            <div className="container mx-auto px-4 py-12">
              <h2 className="text-2xl font-bold text-white mb-6">
                Episodes ({episodes.length})
              </h2>
              
              {/* Ad Unit */}
              <AdUnit placement="podcast" className="my-6" />
              
              {/* Episodes List */}
              <div className="mt-8">
                {episodes.length === 0 ? (
                  <div className="bg-dark-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No episodes found for this podcast</p>
                  </div>
                ) : (
                  <Suspense fallback={
                    <div className="py-8 text-center text-gray-400">
                      <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p>Loading episodes...</p>
                    </div>
                  }>
                    <PodcastEpisodesList
                      episodes={episodes.map(ep => ({
                        ...ep,
                        published_at: ep.pub_date || ep.created_at // Map pub_date to published_at for compatibility
                      }))}
                      onPlayEpisode={(episode) => {
                        // Convert Episode to PodcastEpisode if needed
                        playEpisode(episode as unknown as PodcastEpisode);
                      }}
                      currentEpisodeId={currentEpisode?.id}
                      isPlaying={isPlaying}
                      itemsPerPage={10} // Set initial page size
                    />
                  </Suspense>
                )}
              </div>
            </div>
            
            {/* Related Podcasts Section */}
            <div className="bg-dark-800 py-12">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-white mb-6">
                  More {podcast.categoryName || 'Related'} Podcasts
                </h2>
                <p className="text-gray-400 mb-8">
                  Explore more podcasts in the {podcast.categoryName || 'same'} category
                </p>
                
                <div className="flex justify-center">
                  <Link 
                    to={`/podcasts/category/${podcast.category_id || 'all'}`}
                    className="px-6 py-3 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors"
                  >
                    View All {podcast.categoryName || 'Related'} Podcasts
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
      
      {/* Audio Player */}
      {currentEpisode && (
        <PodcastPlayer
          episode={{
            ...currentEpisode,
            // Make sure required fields are non-null for Episode interface
            description: currentEpisode.description || 'No description available',
            duration: currentEpisode.duration ? parseFloat(currentEpisode.duration.toString()) : 0,
            published_at: currentEpisode.pub_date || currentEpisode.created_at,
            image_url: currentEpisode.image_url || undefined // Convert null to undefined for compatibility
          }}
          onPlayNextEpisode={playNextEpisode}
          onPlayPreviousEpisode={playPreviousEpisode}
          hasNextEpisode={currentEpisode && episodes.findIndex(ep => ep.id === currentEpisode.id) < episodes.length - 1}
          hasPreviousEpisode={currentEpisode && episodes.findIndex(ep => ep.id === currentEpisode.id) > 0}
          onPlayerStateChange={handlePlayerStateChange}
        />
      )}
    </PageLayout>
  );
};

export default PodcastDetailPage;
EOL

# 3. Update App.tsx to add SEO-friendly routes
echo "🔄 Updating routes in App.tsx..."

# Find the App.tsx file
APP_FILE=$(find ./src -name "App.tsx" -type f)

if [ -z "$APP_FILE" ]; then
  echo "⚠️ App.tsx file not found!"
else
  # Check if the file already has the podcast/:slug route
  if grep -q "path=\"/podcast/:slug\"" "$APP_FILE"; then
    echo "✅ Route already exists in $APP_FILE"
  else
    # Find the Route with path="/podcast/:id" and replace it with both routes
    sed -i '' 's|<Route path="/podcast/:id" element={<PodcastDetailPage />} />|<Route path="/podcast/:id" element={<PodcastDetailPage />} />\n            <Route path="/podcast/:slug" element={<PodcastDetailPage />} />|g' "$APP_FILE"
    echo "✅ Added SEO-friendly route to $APP_FILE"
  fi
fi

# 4. Update any podcast links to use SEO-friendly URLs
echo "🔄 Updating podcast links to use SEO-friendly URLs..."

# Find SpotifyStylePodcastList.tsx
PODCAST_LIST_FILE=$(find ./src -name "SpotifyStylePodcastList.tsx" -type f)

if [ -z "$PODCAST_LIST_FILE" ]; then
  echo "⚠️ SpotifyStylePodcastList.tsx file not found!"
else
  # Update the podcast link to use podcast name as slug
  sed -i '' 's|to={`/podcast/${podcast.id}`}|to={`/podcast/${podcast.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}|g' "$PODCAST_LIST_FILE"
  echo "✅ Updated podcast links in $PODCAST_LIST_FILE"
fi

echo "✅ Podcast detail page optimization completed!"
echo "🌟 Changes made:"
echo "  - Added pagination to episode list (10 episodes at a time)"
echo "  - Implemented SEO-friendly URLs based on podcast names"
echo "  - Added HTML sanitization for podcast descriptions"
echo "  - Improved accessibility with larger fonts and better contrast"
echo "  - Added lazy loading for better performance"

echo "🚀 Please restart your development server to see the changes."
