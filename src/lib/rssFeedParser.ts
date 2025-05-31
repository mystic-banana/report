import Parser from 'https://esm.sh/rss-parser';
// Attempt to import Item type, Deno might resolve this via esm.sh's X-TypeScript-Types header
// If your IDE still complains, it's an IDE limitation with Deno-style URL imports.
import type { Item as RSSParserItem } from 'https://esm.sh/rss-parser';
import { PodcastFeed, PodcastEpisode } from '../types/index.ts';

interface ParsedRSSFeed {
  feedDetails: Partial<PodcastFeed>;
  episodes: Partial<PodcastEpisode>[];
}

// Define a minimal structure for what we expect from rss-parser's item if direct import fails
// This is more for local type checking; Deno's runtime will use actual types from esm.sh
type ExpectedRSSItem = RSSParserItem & {
  title?: string;
  description?: string;
  'itunes.summary'?: string | { _: string }; // Handle cases where summary is nested
  contentSnippet?: string;
  content?: string;
  pubDate?: string;
  enclosure?: { url: string; [key: string]: any };
  'itunes.duration'?: string | number;
  guid?: string;
  link?: string;
  'itunes.image'?: { href: string } | string; // Can be an object or a direct string
  [key: string]: any; // Allow other properties
};

// Generic safeGet helper
const safeGet = <T = any>(obj: any, path: string, defaultValue: T | null = null): T | null => {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  return current as T;
};


// Simple in-memory cache for RSS feeds
const rssCache: Record<string, {data: ParsedRSSFeed, timestamp: number}> = {};
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds

export const parseRssFeed = async (feedUrl: string): Promise<ParsedRSSFeed> => {
  // Check cache first (CACHE TEMPORARILY DISABLED FOR DEBUGGING)
  const now = Date.now();
  // if (rssCache[feedUrl] && (now - rssCache[feedUrl].timestamp < CACHE_EXPIRY)) {
  //   console.log(`[rssFeedParser] Using cached data for ${feedUrl}`);
  //   return rssCache[feedUrl].data;
  // }
  
  const parser = new Parser({
    customFields: {
      feed: ['author', 'itunes:author', 'itunes:image', 'itunes:summary', 'itunes:owner'],
      item: ['itunes:duration', 'itunes:image', 'itunes:summary', 'pubDate', 'enclosure'],
    },
    timeout: 30000, // Increase timeout to 30 seconds
    maxRedirects: 5, // Allow up to 5 redirects
  });

  try {
    console.log(`[rssFeedParser] Fetching feed content from: ${feedUrl}`);
    
    // Use AbortController to set a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'MysticBananaApp/1.0 (compatible; FetchBot/1.0; +http://example.com/bot.html)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[rssFeedParser] Failed to fetch RSS feed: ${response.status} ${response.statusText}. Body: ${errorText}`);
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }

    // Stream and parse the XML response rather than loading it all into memory at once
    const xmlString = await response.text();
    console.log(`[rssFeedParser] Successfully fetched feed content. Length: ${xmlString.length}. Parsing...`);
    
    const feed = await parser.parseString(xmlString);
    console.log(`[rssFeedParser] Successfully parsed feed: ${feed.title}`);

    const feedDetails: Partial<PodcastFeed> = {
      name: feed.title || 'Untitled Podcast',
      feed_url: feedUrl,
      description: safeGet<string>(feed, 'description', safeGet<string>(feed, 'itunes.summary', safeGet<string>(feed, 'itunes.summary._', null))),
      image_url: safeGet<string>(feed, 'itunes.image.href', safeGet<string>(feed, 'image.url', null)),
      author: safeGet<string>(feed, 'itunes.author', safeGet<string>(feed, 'author', safeGet<string>(feed, 'itunes.owner.name', null))),
    };
    
    // Process only the most recent episodes (limit to 20 for performance)
    const recentItems = (feed.items || []).slice(0, 20);
    
    const episodes: Partial<PodcastEpisode>[] = recentItems.map((item: ExpectedRSSItem) => ({
      title: item.title || 'Untitled Episode',
      description: safeGet<string>(item, 'itunes.summary', safeGet<string>(item, 'contentSnippet', safeGet<string>(item, 'content', null))),
      pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
      audio_url: safeGet<string>(item, 'enclosure.url', null),
      duration: String(safeGet<string | number>(item, 'itunes.duration', null)), 
      guid: item.guid || item.link || safeGet<string>(item, 'enclosure.url', `unknown_guid_${Date.now()}_${Math.random()}`),
      image_url: typeof item['itunes.image'] === 'string' ? item['itunes.image'] : safeGet<string>(item, 'itunes.image.href', feedDetails.image_url),
    })).filter((episode: Partial<PodcastEpisode>) => episode.audio_url); 

    console.log(`[rssFeedParser] Extracted ${episodes.length} episodes from ${feed.title}`);
    
    // Store in cache (CACHE TEMPORARILY DISABLED FOR DEBUGGING)
    const result = { feedDetails, episodes };
    // rssCache[feedUrl] = {
    //   data: result,
    //   timestamp: now
    // };
    
    return result;

  } catch (error) {
    console.error(`[rssFeedParser] Error parsing RSS feed at ${feedUrl}:`, error);
    throw new Error(`Failed to parse RSS feed at ${feedUrl}. Please ensure it's a valid RSS feed URL. Details: ${(error as Error).message}`);
  }
};
