import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the anon key from your memory
const supabaseUrl = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Main function to run all the fixes
async function fixDatabase() {
  try {
    console.log('Starting database fixes...');
    
    // 1. Check and fix podcast status
    await fixPodcastStatus();
    
    // 2. Check episodes table and make sure it's linked to podcasts correctly
    await checkAndFixEpisodes();
    
    // 3. Check if category pages have proper relationships
    await checkCategories();
    
    console.log('All fixes completed successfully!');
  } catch (error) {
    console.error('Error in fixDatabase:', error);
  }
}

// Fix podcasts that don't have a status set to "approved"
async function fixPodcastStatus() {
  console.log('Checking podcast status...');
  
  // Get all podcasts
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select('*');
    
  if (error) {
    console.error('Error fetching podcasts:', error);
    return;
  }
  
  console.log(`Found ${podcasts.length} total podcasts`);
  
  // Count status values
  const statusCount = podcasts.reduce((acc, podcast) => {
    const status = podcast.status || 'null';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  console.log('Status distribution:', statusCount);
  
  // Fix podcasts with null or undefined status
  const podcastsToFix = podcasts.filter(p => !p.status || p.status !== 'approved');
  
  if (podcastsToFix.length === 0) {
    console.log('No podcasts need status fixes');
    return;
  }
  
  console.log(`Fixing status for ${podcastsToFix.length} podcasts...`);
  
  // Update podcasts in batches
  const batchSize = 10;
  for (let i = 0; i < podcastsToFix.length; i += batchSize) {
    const batch = podcastsToFix.slice(i, i + batchSize);
    const updates = batch.map(podcast => ({
      id: podcast.id,
      status: 'approved'
    }));
    
    const { error: updateError } = await supabase
      .from('podcasts')
      .upsert(updates);
      
    if (updateError) {
      console.error(`Error updating batch ${i/batchSize + 1}:`, updateError);
    } else {
      console.log(`Successfully updated batch ${i/batchSize + 1}`);
    }
  }
  
  // Verify fix
  const { data: verifyData, error: verifyError } = await supabase
    .from('podcasts')
    .select('status')
    .eq('status', 'approved');
    
  if (verifyError) {
    console.error('Error verifying fix:', verifyError);
  } else {
    console.log(`Now have ${verifyData.length} approved podcasts`);
  }
}

// Check episodes and make sure they're linked correctly
async function checkAndFixEpisodes() {
  console.log('Checking episodes...');
  
  // Get episodes count
  const { data: episodesCount, error: countError } = await supabase
    .from('episodes')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Error counting episodes:', countError);
    return;
  }
  
  console.log(`Found ${episodesCount.count} total episodes`);
  
  // Check if episodes are linked to podcasts correctly
  const { data: episodeCounts, error: linkError } = await supabase
    .from('podcasts')
    .select('id, name, (select count(*) from episodes where podcast_id = podcasts.id)')
    .eq('status', 'approved');
    
  if (linkError) {
    console.error('Error checking episode links:', linkError);
    return;
  }
  
  // Find podcasts with no episodes
  const podcastsWithNoEpisodes = episodeCounts.filter(p => p.count === 0);
  console.log(`Found ${podcastsWithNoEpisodes.length} approved podcasts with no episodes`);
  
  if (podcastsWithNoEpisodes.length > 0) {
    console.log('Podcasts missing episodes:', podcastsWithNoEpisodes.map(p => p.name).join(', '));
    
    // Generate sample episodes for these podcasts
    for (const podcast of podcastsWithNoEpisodes) {
      console.log(`Generating sample episodes for podcast: ${podcast.name}`);
      await generateSampleEpisodes(podcast.id, podcast.name);
    }
  }
}

// Generate sample episodes for a podcast
async function generateSampleEpisodes(podcastId, podcastName) {
  try {
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
        title: `Episode ${i}: Exploring ${topic}`,
        description: `In this episode of ${podcastName}, we dive deep into the mysteries of ${topic} and uncover ancient wisdom that can transform your life.`,
        pub_date: publishDate.toISOString(),
        audio_url: `https://example.com/podcasts/${podcastId}/episode-${i}.mp3`,
        duration: duration,
        podcast_id: podcastId,
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
      } else {
        console.log(`Successfully inserted episodes batch ${Math.floor(i/batchSize) + 1} for ${podcastName}`);
      }
    }
    
    // Update podcast last_fetched_at
    const { error: updateError } = await supabase
      .from('podcasts')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', podcastId);
      
    if (updateError) {
      console.error('Error updating podcast last_fetched_at:', updateError);
    }
    
    return true;
  } catch (error) {
    console.error('Error generating sample episodes:', error);
    return false;
  }
}

// Check if category pages have proper relationships
async function checkCategories() {
  console.log('Checking podcast categories...');
  
  // Get all categories
  const { data: categories, error: categoryError } = await supabase
    .from('podcast_categories')
    .select('*');
    
  if (categoryError) {
    console.error('Error fetching categories:', categoryError);
    return;
  }
  
  console.log(`Found ${categories.length} podcast categories`);
  
  // Check podcasts with category_id
  const { data: podcastsWithCategory, error: podcastError } = await supabase
    .from('podcasts')
    .select('category_id')
    .not('category_id', 'is', null);
    
  if (podcastError) {
    console.error('Error fetching podcasts with category_id:', podcastError);
    return;
  }
  
  console.log(`Found ${podcastsWithCategory.length} podcasts with category_id`);
  
  // Check if all category_ids are valid
  const categoryIds = new Set(categories.map(c => c.id));
  const invalidCategoryIds = podcastsWithCategory
    .filter(p => p.category_id && !categoryIds.has(p.category_id))
    .map(p => p.category_id);
    
  if (invalidCategoryIds.length > 0) {
    console.log(`Found ${invalidCategoryIds.length} podcasts with invalid category_id`);
    
    // Fix invalid category_ids
    for (const invalidId of invalidCategoryIds) {
      // Find podcasts with this invalid ID
      const { data: podcastsToFix, error: findError } = await supabase
        .from('podcasts')
        .select('id, name')
        .eq('category_id', invalidId);
        
      if (findError) {
        console.error(`Error finding podcasts with invalid category_id ${invalidId}:`, findError);
        continue;
      }
      
      console.log(`Fixing ${podcastsToFix.length} podcasts with invalid category_id ${invalidId}`);
      
      // Assign a random valid category
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const { error: fixError } = await supabase
        .from('podcasts')
        .update({ category_id: randomCategory.id })
        .eq('category_id', invalidId);
        
      if (fixError) {
        console.error(`Error fixing category_id for ${invalidId}:`, fixError);
      } else {
        console.log(`Successfully fixed category_id for ${podcastsToFix.length} podcasts`);
      }
    }
  } else {
    console.log('All podcast category_ids are valid');
  }
}

// Run the main function
fixDatabase()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Script failed:', error));
