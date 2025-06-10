/**
 * Simple in-memory cache for RSS feeds to improve performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class RSSFeedCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes default

  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if the item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Set an item in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param ttlMs Time to live in milliseconds (defaults to 10 minutes)
   */
  set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL_MS): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttlMs
    });
  }

  /**
   * Clear the entire cache or a specific item
   * @param key Optional key to clear specific item
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryEstimate: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

// Export a singleton instance
export const rssFeedCache = new RSSFeedCache();
