/**
 * Server-side function to process podcast RSS feeds
 * This would typically be deployed as a Supabase Edge Function
 * or a serverless function that doesn't have CORS limitations
 */
const processPodcastFeed = async (feedUrl) => {
  try {
    // Fetch the RSS feed directly (no CORS issues on the server)
    const response = await fetch(feedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    
    // Simple XML parsing - in a real implementation, you'd use a proper XML parser
    const podcastData = {
      name: extractTag(xmlText, 'title') || 'Unnamed Podcast',
      description: extractTag(xmlText, 'description') || '',
      author: extractTag(xmlText, 'itunes:author') || extractTag(xmlText, 'author') || '',
      image_url: extractImageUrl(xmlText),
      episodes: extractEpisodes(xmlText)
    };
    
    return {
      success: true,
      data: podcastData
    };
  } catch (error) {
    console.error('Error processing podcast feed:', error);
    return {
      success: false,
      error: error.message || 'Failed to process podcast feed'
    };
  }
};

// Helper functions to extract data from XML
function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractImageUrl(xml) {
  // Try to find the image URL in different tag formats
  const imageUrlMatch = xml.match(/<itunes:image href="(.*?)"/s) || 
                       xml.match(/<image>.*?<url>(.*?)<\/url>.*?<\/image>/s);
  return imageUrlMatch ? imageUrlMatch[1] : null;
}

function extractEpisodes(xml) {
  const episodes = [];
  
  // Find all item tags which represent episodes
  const itemMatches = xml.matchAll(/<item>(.*?)<\/item>/gs);
  
  if (itemMatches) {
    for (const match of itemMatches) {
      const itemContent = match[1];
      
      const episode = {
        title: extractTag(itemContent, 'title') || 'Unnamed Episode',
        description: extractTag(itemContent, 'description') || '',
        pubDate: extractTag(itemContent, 'pubDate') || new Date().toISOString(),
        duration: extractTag(itemContent, 'itunes:duration') || '0:00',
        guid: extractTag(itemContent, 'guid') || generateId(),
        audio_url: extractEnclosureUrl(itemContent)
      };
      
      if (episode.audio_url) {
        episodes.push(episode);
      }
    }
  }
  
  return episodes.slice(0, 10); // Return at most 10 episodes
}

function extractEnclosureUrl(xml) {
  const enclosureMatch = xml.match(/<enclosure url="(.*?)"/);
  return enclosureMatch ? enclosureMatch[1] : null;
}

function generateId() {
  return 'ep-' + Math.random().toString(36).substring(2, 9);
}

export default processPodcastFeed;
