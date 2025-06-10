import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface RssItem {
  title: string;
  description: string;
  content: string;
  link: string;
  pubDate: string;
  guid: string;
  author: string;
  thumbnail: string;
  enclosure: {
    link: string;
    type: string;
  };
}

interface RssFeed {
  title: string;
  description: string;
  image: string;
  link: string;
  author: string;
}

interface RssResponse {
  status: string;
  feed: RssFeed;
  items: RssItem[];
  message?: string;
}

// Function to fetch episodes for a podcast
export async function fetchEpisodesForPodcast(podcastId: string, feedUrl: string): Promise<{ success: boolean; error?: string; message?: string; episodeCount?: number }> {
  try {
    console.log(`Fetching episodes for podcast ${podcastId} from ${feedUrl}`);
    
    // Update the last_fetched_at timestamp for the podcast
    const { error: updateError } = await supabase
      .from('podcasts')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', podcastId);
      
    if (updateError) {
      console.error('Error updating last_fetched_at:', updateError);
    }
    
    // Try to fetch episodes from the feed using rss2json service
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`RSS feed API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json() as RssResponse;
      
      if (data.status !== 'ok') {
        throw new Error(`RSS feed error: ${data.message || 'Unknown error'}`);
      }
      
      // Update podcast metadata from feed info
      if (data.feed && data.feed.title) {
        const podcastName = data.feed.title;
        const podcastDescription = data.feed.description || '';
        const podcastImageUrl = data.feed.image || '';
        const podcastAuthor = data.feed.author || '';
        const podcastLink = data.feed.link || '';

        const generateSlug = (title: string) => {
          if (!title) return '';
          return title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^à-ü\w-]+/g, '') // Remove non-alphanumeric characters except hyphens and accented chars
            .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
        };
        const podcastSlug = generateSlug(podcastName);

        const { error: updatePodcastMetaError } = await supabase
          .from('podcasts')
          .update({
            name: podcastName,
            description: podcastDescription,
            image_url: podcastImageUrl,
            author: podcastAuthor,
            website_url: podcastLink,
            slug: podcastSlug,
            updated_at: new Date().toISOString()
          })
          .eq('id', podcastId);

        if (updatePodcastMetaError) {
          console.error('Error updating podcast metadata:', updatePodcastMetaError);
          // Log error but continue with episode processing for now
        } else {
          console.log(`Successfully updated metadata for podcast ${podcastId} with slug ${podcastSlug}`);
        }
      } else {
        console.warn(`Feed data or title missing for podcast ${podcastId}, cannot update metadata or slug.`);
      }

      console.log(`Successfully fetched RSS feed with ${data.items.length} items`);
      
      // Process episodes - limit to 20 to avoid database limits
      const episodes = data.items.slice(0, 20).map(item => ({
        id: uuidv4(),
        title: item.title || 'Untitled Episode',
        description: item.description || item.content || '',
        audio_url: item.enclosure?.link || '',
        duration: '0', // Usually not provided in rss2json
        pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        image_url: item.thumbnail || data.feed.image || '',
        podcast_id: podcastId,
        guid: item.guid || item.link || `${podcastId}-${Math.random()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })).filter(episode => episode.audio_url);
      
      if (episodes.length === 0) {
        const errorMsg = 'No valid episodes with audio URLs found in the feed.';
        console.log(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      console.log(`Inserting ${episodes.length} episodes`);
      
      // Insert episodes in batches to avoid size limits
      const batchSize = 5;
      for (let i = 0; i < episodes.length; i += batchSize) {
        const batch = episodes.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('episodes')
          .upsert(batch, { onConflict: 'guid' });
        
        if (insertError) {
          console.error(`Error inserting episodes batch ${Math.floor(i/batchSize) + 1}:`, insertError);
          // If upsert fails, try regular insert
          if (insertError.code === '42P10') { // No unique constraint error
            const { error: fallbackError } = await supabase
              .from('episodes')
              .insert(batch);
              
            if (fallbackError) {
              const errorMsg = `Fallback insert also failed: ${(fallbackError as Error).message}`;
              console.error(errorMsg);
              return { success: false, error: errorMsg };
            }
          } else {
            const errorMsg = `Error inserting episodes batch: ${(insertError as Error).message}`;
            console.error(errorMsg);
            return { success: false, error: errorMsg };
          }
        }
      }
      
      return { success: true, message: `Successfully inserted ${episodes.length} episodes.`, episodeCount: episodes.length };
    } catch (rssError) {
      const errorMsg = `Error fetching or parsing RSS feed: ${(rssError as Error).message}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = `Unexpected error in fetchEpisodesForPodcast: ${(error as Error).message}`;
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
}
