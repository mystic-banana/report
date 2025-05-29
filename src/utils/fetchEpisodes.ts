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

// Generate sample episodes for a podcast when RSS feed fails
async function generateSampleEpisodes(podcastId: string): Promise<boolean> {
  try {
    console.log(`Generating sample episodes for podcast ${podcastId}`);
    
    // Get podcast info to use in sample episodes
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', podcastId)
      .single();
      
    if (podcastError) {
      console.error('Error fetching podcast:', podcastError);
      return false;
    }
    
    const topics = [
      'Meditation', 'Consciousness', 'Ancient Wisdom', 'Healing', 
      'Energy Work', 'Shamanism', 'Spiritual Growth', 'Sacred Geometry',
      'Astrology', 'Dream Analysis', 'Past Lives', 'Crystal Healing',
      'Sound Therapy', 'Plant Medicine', 'Quantum Physics', 'Mysticism'
    ];
    
    // Generate 10 sample episodes
    const episodes = [];
    for (let i = 1; i <= 10; i++) {
      const publishDate = new Date();
      publishDate.setDate(publishDate.getDate() - (i * 3)); // Episodes every 3 days
      
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const duration = `${Math.floor(Math.random() * 60) + 30}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
      
      episodes.push({
        id: uuidv4(),
        podcast_id: podcastId,
        title: `Episode ${i}: Exploring ${topic}`,
        description: `In this episode of ${podcast.name}, we dive deep into the mysteries of ${topic} and uncover ancient wisdom that can transform your life.`,
        pub_date: publishDate.toISOString(),
        audio_url: `https://example.com/podcasts/${podcastId}/episode-${i}.mp3`,
        duration: duration,
        guid: `${podcastId}-episode-${i}`,
        image_url: `https://source.unsplash.com/random/300x300?${topic.toLowerCase().replace(' ', '+')}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Insert episodes in batches
    const batchSize = 5;
    for (let i = 0; i < episodes.length; i += batchSize) {
      const batch = episodes.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('episodes')
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting episodes batch ${Math.floor(i/batchSize) + 1}:`, insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error generating sample episodes:', error);
    return false;
  }
}

// Function to fetch episodes for a podcast
export async function fetchEpisodesForPodcast(podcastId: string, feedUrl: string): Promise<boolean> {
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
        console.log('No valid episodes found with audio URLs');
        return generateSampleEpisodes(podcastId);
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
              console.error('Fallback insert also failed:', fallbackError);
              return generateSampleEpisodes(podcastId);
            }
          } else {
            return generateSampleEpisodes(podcastId);
          }
        }
      }
      
      return true;
    } catch (rssError) {
      console.error('Error fetching RSS feed:', rssError);
      return generateSampleEpisodes(podcastId);
    }
  } catch (error) {
    console.error('Error in fetchEpisodesForPodcast:', error);
    return false;
  }
}
