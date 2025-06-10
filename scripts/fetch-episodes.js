// Script to fetch episodes for all podcasts and populate the episodes table
import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import { randomUUID } from 'crypto';

// Initialize Supabase client
const supabaseUrl = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to safely get nested properties
function safeGet(obj, path, defaultValue) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[key];
  }

  return (current === null || current === undefined) ? defaultValue : current;
}

// Parse RSS feed and extract episodes
async function parseRssFeed(feedUrl) {
  console.log(`Parsing RSS feed: ${feedUrl}`);
  
  try {
    const parser = new Parser({
      customFields: {
        item: [
          ['itunes:duration', 'itunes.duration'],
          ['itunes:image', 'itunes.image', { keepArray: false }],
          ['itunes:summary', 'itunes.summary'],
          ['itunes:explicit', 'itunes.explicit'],
          ['itunes:season', 'itunes.season'],
          ['itunes:episode', 'itunes.episode'],
        ],
        feed: [
          ['itunes:author', 'itunes.author'],
          ['itunes:owner', 'itunes.owner'],
          ['itunes:image', 'itunes.image', { keepArray: false }],
          ['itunes:summary', 'itunes.summary'],
          ['itunes:category', 'itunes.category', { keepArray: true }],
        ],
      },
    });

    const feed = await parser.parseURL(feedUrl);
    
    const feedDetails = {
      name: feed.title || 'Untitled Podcast',
      feed_url: feedUrl,
      description: safeGet(feed, 'description', safeGet(feed, 'itunes.summary', null)),
      image_url: safeGet(feed, 'itunes.image.href', safeGet(feed, 'image.url', null)),
      author: safeGet(feed, 'itunes.author', safeGet(feed, 'author', safeGet(feed, 'itunes.owner.name', null))),
    };
    
    const episodes = (feed.items || []).map((item) => ({
      title: item.title || 'Untitled Episode',
      description: safeGet(item, 'itunes.summary', safeGet(item, 'contentSnippet', safeGet(item, 'content', null))),
      pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      audio_url: safeGet(item, 'enclosure.url', null),
      duration: String(safeGet(item, 'itunes.duration', '0')), 
      guid: item.guid || item.link || safeGet(item, 'enclosure.url', `unknown_guid_${Date.now()}_${Math.random()}`),
      image_url: typeof item['itunes.image'] === 'string' ? item['itunes.image'] : safeGet(item, 'itunes.image.href', feedDetails.image_url),
    })).filter((episode) => episode.audio_url);

    console.log(`Extracted ${episodes.length} episodes from ${feed.title}`);
    return { feedDetails, episodes };
  } catch (error) {
    console.error(`Error parsing RSS feed at ${feedUrl}:`, error);
    return { feedDetails: {}, episodes: [] };
  }
}

// Update podcast with feed details
async function updatePodcastWithFeedDetails(podcastId, feedDetails) {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .update({
        name: feedDetails.name,
        description: feedDetails.description,
        image_url: feedDetails.image_url,
        author: feedDetails.author,
        last_fetched_at: new Date().toISOString()
      })
      .eq('id', podcastId)
      .select();
      
    if (error) {
      console.error('Error updating podcast with feed details:', error);
    } else {
      console.log(`Updated podcast ${podcastId} with feed details`);
    }
  } catch (error) {
    console.error('Error updating podcast:', error);
  }
}

// Store episodes in database
async function storeEpisodes(podcastId, episodes) {
  try {
    if (episodes.length === 0) {
      console.log('No episodes to store');
      return;
    }
    
    // Prepare episodes data for insertion
    const episodesToStore = episodes.map(episode => ({
      ...episode,
      podcast_id: podcastId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      id: randomUUID() // Generate UUID for each episode
    }));
    
    console.log(`Storing ${episodesToStore.length} episodes for podcast ${podcastId}`);
    
    // Insert episodes in batches to avoid hitting size limits
    const batchSize = 20;
    for (let i = 0; i < episodesToStore.length; i += batchSize) {
      const batch = episodesToStore.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('episodes')
        .upsert(batch, { onConflict: 'guid' });
        
      if (error) {
        console.error(`Error storing episodes batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Successfully stored episodes batch ${i / batchSize + 1}`);
      }
    }
  } catch (error) {
    console.error('Error storing episodes:', error);
  }
}

// Main function to process all podcasts
async function processAllPodcasts() {
  try {
    console.log('Fetching all approved podcasts...');
    
    // Get all approved podcasts
    const { data: podcasts, error } = await supabase
      .from('podcasts')
      .select('id, name, feed_url, status')
      .eq('status', 'approved');
      
    if (error) {
      console.error('Error fetching podcasts:', error);
      return;
    }
    
    console.log(`Found ${podcasts.length} approved podcasts`);
    
    // Process each podcast
    for (const podcast of podcasts) {
      console.log(`Processing podcast: ${podcast.name} (${podcast.id})`);
      
      if (!podcast.feed_url) {
        console.log(`Skipping podcast ${podcast.id} - no feed URL`);
        continue;
      }
      
      // Parse RSS feed
      const { feedDetails, episodes } = await parseRssFeed(podcast.feed_url);
      
      // Update podcast with feed details
      if (Object.keys(feedDetails).length > 0) {
        await updatePodcastWithFeedDetails(podcast.id, feedDetails);
      }
      
      // Store episodes
      await storeEpisodes(podcast.id, episodes);
      
      console.log(`Finished processing podcast: ${podcast.name}`);
    }
    
    console.log('All podcasts processed successfully');
  } catch (error) {
    console.error('Error processing podcasts:', error);
  }
}

// Run the main function
processAllPodcasts()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Script failed:', error));
