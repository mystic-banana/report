import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client with the anon key from your memory
const supabaseUrl = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample podcast feeds to test
const testFeeds = [
  {
    name: 'The Joe Rogan Experience',
    feed_url: 'https://feeds.megaphone.fm/GLT1552844538',
    category: 'Entertainment',
    category_id: 'f4a9e1d3-bd56-4174-b5c6-32e4b4d9c040'
  },
  {
    name: 'Science Vs',
    feed_url: 'https://feeds.megaphone.fm/sciencevs',
    category: 'Science',
    category_id: '9a6b23d5-4c81-4fc0-adbc-54112c7d68c6'
  },
  {
    name: 'Stuff You Should Know',
    feed_url: 'https://feeds.megaphone.fm/stuffyoushouldknow',
    category: 'Education',
    category_id: '670bc144-7e9c-45cd-adbd-64ba179b13fe'
  }
];

// Function to fetch and parse RSS feed directly
async function fetchRssFeed(feedUrl) {
  try {
    console.log(`Fetching RSS feed from: ${feedUrl}`);
    
    // Use the cors-anywhere proxy to avoid CORS issues
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`RSS feed error: ${data.message || 'Unknown error'}`);
    }
    
    console.log(`Successfully fetched RSS feed with ${data.items.length} items`);
    
    return {
      feed: {
        title: data.feed.title,
        description: data.feed.description,
        image: data.feed.image,
        link: data.feed.link,
        author: data.feed.author
      },
      items: data.items.map(item => ({
        title: item.title,
        description: item.description,
        content: item.content,
        link: item.link,
        pubDate: item.pubDate,
        guid: item.guid,
        author: item.author,
        thumbnail: item.thumbnail,
        enclosure: {
          url: item.enclosure?.link || '',
          length: '',
          type: item.enclosure?.type || ''
        }
      }))
    };
  } catch (error) {
    console.error(`Error fetching RSS feed:`, error);
    throw error;
  }
}

// Process a podcast and store its episodes
async function processPodcast(podcast) {
  try {
    console.log(`Processing podcast: ${podcast.name}`);
    
    // First, check if podcast exists, if not create it
    let podcastId = null;
    
    const { data: existingPodcast, error: findError } = await supabase
      .from('podcasts')
      .select('id')
      .eq('feed_url', podcast.feed_url)
      .eq('status', 'approved')
      .single();
    
    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding podcast:', findError);
    }
    
    if (existingPodcast) {
      podcastId = existingPodcast.id;
      console.log(`Found existing podcast with ID: ${podcastId}`);
    } else {
      // Create a new podcast
      const { data: newPodcast, error: createError } = await supabase
        .from('podcasts')
        .insert([{
          name: podcast.name,
          feed_url: podcast.feed_url,
          category: podcast.category,
          category_id: podcast.category_id,
          status: 'approved'
        }])
        .select();
      
      if (createError) {
        console.error('Error creating podcast:', createError);
        return;
      }
      
      podcastId = newPodcast[0].id;
      console.log(`Created new podcast with ID: ${podcastId}`);
    }
    
    // Fetch RSS feed
    const rssFeed = await fetchRssFeed(podcast.feed_url);
    
    // Update podcast with metadata
    const { error: updateError } = await supabase
      .from('podcasts')
      .update({
        name: rssFeed.feed.title || podcast.name,
        description: rssFeed.feed.description || null,
        image_url: rssFeed.feed.image || null,
        author: rssFeed.feed.author || null,
        last_fetched_at: new Date().toISOString()
      })
      .eq('id', podcastId);
    
    if (updateError) {
      console.error('Error updating podcast metadata:', updateError);
    }
    
    // Process episodes - limit to 20 to avoid database limits
    const episodes = rssFeed.items.slice(0, 20).map(item => ({
      id: uuidv4(),
      title: item.title || 'Untitled Episode',
      description: item.description || item.content || null,
      audio_url: item.enclosure.url || null,
      duration: '0', // Usually not provided in rss2json
      pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      image_url: item.thumbnail || rssFeed.feed.image || null,
      podcast_id: podcastId,
      guid: item.guid || item.link || `${podcastId}-${Math.random()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })).filter(episode => episode.audio_url);
    
    if (episodes.length === 0) {
      console.log('No valid episodes found with audio URLs');
      return;
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
        console.error(`Error inserting episodes batch ${i/batchSize + 1}:`, insertError);
      } else {
        console.log(`Successfully inserted episodes batch ${i/batchSize + 1}`);
      }
    }
    
    console.log(`Finished processing podcast: ${podcast.name}`);
  } catch (error) {
    console.error(`Error processing podcast:`, error);
  }
}

// Main function to process all test feeds
async function main() {
  try {
    console.log('Starting podcast test processing');
    
    for (const feed of testFeeds) {
      await processPodcast(feed);
    }
    
    console.log('All podcasts processed successfully');
    
    // Check if episodes were successfully stored
    const { data: episodesCount, error: countError } = await supabase
      .from('episodes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting episodes:', countError);
    } else {
      console.log(`Total episodes in database: ${episodesCount.count}`);
    }
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Script failed:', error));
