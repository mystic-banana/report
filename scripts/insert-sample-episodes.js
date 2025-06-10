import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client with the anon key from your memory
const supabaseUrl = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all approved podcasts
async function getApprovedPodcasts() {
  const { data, error } = await supabase
    .from('podcasts')
    .select('*')
    .eq('status', 'approved');
  
  if (error) {
    console.error('Error fetching podcasts:', error);
    return [];
  }
  
  return data || [];
}

// Sample episode data generator
function generateSampleEpisodes(podcastId, podcastName, count = 10) {
  const episodes = [];
  const topics = [
    'Meditation', 'Consciousness', 'Ancient Wisdom', 'Healing', 
    'Energy Work', 'Shamanism', 'Spiritual Growth', 'Sacred Geometry',
    'Astrology', 'Dream Analysis', 'Past Lives', 'Crystal Healing',
    'Sound Therapy', 'Plant Medicine', 'Quantum Physics', 'Mysticism'
  ];
  
  for (let i = 1; i <= count; i++) {
    const publishDate = new Date();
    publishDate.setDate(publishDate.getDate() - (i * 3)); // Episodes every 3 days
    
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const duration = `${Math.floor(Math.random() * 60) + 30}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    
    episodes.push({
      id: uuidv4(),
      podcast_id: podcastId,
      title: `Episode ${i}: Exploring ${topic}`,
      description: `In this episode of ${podcastName}, we dive deep into the mysteries of ${topic} and uncover ancient wisdom that can transform your life.`,
      pub_date: publishDate.toISOString(),
      audio_url: `https://example.com/podcasts/${podcastId}/episode-${i}.mp3`,
      duration: duration,
      guid: `${podcastId}-episode-${i}`,
      image_url: `https://source.unsplash.com/random/300x300?${topic.toLowerCase().replace(' ', '+')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return episodes;
}

// Insert episodes for a podcast
async function insertEpisodesForPodcast(podcastId, podcastName) {
  console.log(`Generating sample episodes for podcast: ${podcastName}`);
  
  // Check if podcast already has episodes
  const { count, error: countError } = await supabase
    .from('episodes')
    .select('*', { count: 'exact', head: true })
    .eq('podcast_id', podcastId);
  
  if (countError) {
    console.error('Error counting episodes:', countError);
    return false;
  }
  
  if (count && count > 0) {
    console.log(`Podcast already has ${count} episodes, skipping...`);
    return true;
  }
  
  // Generate sample episodes
  const episodes = generateSampleEpisodes(podcastId, podcastName);
  
  console.log(`Inserting ${episodes.length} sample episodes`);
  
  // Insert episodes in batches
  const batchSize = 5;
  for (let i = 0; i < episodes.length; i += batchSize) {
    const batch = episodes.slice(i, i + batchSize);
    
    const { error: insertError } = await supabase
      .from('episodes')
      .insert(batch);
    
    if (insertError) {
      console.error(`Error inserting episodes batch ${Math.floor(i/batchSize) + 1}:`, insertError);
    } else {
      console.log(`Successfully inserted episodes batch ${Math.floor(i/batchSize) + 1}`);
    }
  }
  
  return true;
}

// Main function
async function main() {
  try {
    console.log('Starting sample episode insertion');
    
    // Get all approved podcasts
    const podcasts = await getApprovedPodcasts();
    console.log(`Found ${podcasts.length} approved podcasts`);
    
    if (podcasts.length === 0) {
      console.log('No approved podcasts found, creating a new podcast...');
      
      // Create a new sample podcast
      const { data: newPodcast, error: createError } = await supabase
        .from('podcasts')
        .insert([{
          name: 'Mystic Wisdom Podcast',
          feed_url: 'https://example.com/feeds/mystic-wisdom.xml',
          category: 'Spiritual',
          category_id: 'fd9d8199-87a3-4c7c-9e8a-81c577d3749f',
          description: 'Exploring the depths of spiritual wisdom and mystical practices from around the world.',
          image_url: 'https://source.unsplash.com/random/400x400?spiritual',
          author: 'Sarah Moonstone',
          status: 'approved',
          last_fetched_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (createError) {
        console.error('Error creating podcast:', createError);
        return;
      }
      
      const newPodcastId = newPodcast[0].id;
      console.log(`Created new podcast with ID: ${newPodcastId}`);
      
      // Insert episodes for the new podcast
      await insertEpisodesForPodcast(newPodcastId, newPodcast[0].name);
    } else {
      // Insert episodes for each podcast
      for (const podcast of podcasts) {
        await insertEpisodesForPodcast(podcast.id, podcast.name);
      }
    }
    
    // Check total episodes count
    const { count, error: finalCountError } = await supabase
      .from('episodes')
      .select('*', { count: 'exact', head: true });
    
    if (finalCountError) {
      console.error('Error counting episodes:', finalCountError);
    } else {
      console.log(`Total episodes in database: ${count}`);
    }
    
    console.log('All done!');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Script failed:', error));
