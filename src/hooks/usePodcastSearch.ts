import { useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import type { SearchFilters, SearchResult } from "../types/podcastTypes";

export const usePodcastSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Advanced search function
  const search = useCallback(
    async (query: string, filters: SearchFilters = {}) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Build search query
        let searchQuery = supabase.from("podcast_search_index").select(`
          *,
          podcasts(id, name, image_url, author, category_id),
          episodes(id, title, audio_url, image_url, duration, pub_date)
        `);

        // Full-text search
        if (query) {
          searchQuery = searchQuery.textSearch("search_vector", query, {
            type: "websearch",
            config: "english",
          });
        }

        // Apply filters
        if (filters.category) {
          searchQuery = searchQuery.eq(
            "podcasts.category_id",
            filters.category,
          );
        }

        if (filters.tags && filters.tags.length > 0) {
          searchQuery = searchQuery.overlaps("tags", filters.tags);
        }

        if (filters.topics && filters.topics.length > 0) {
          searchQuery = searchQuery.overlaps("topics", filters.topics);
        }

        if (filters.dateRange) {
          if (filters.dateRange.start) {
            searchQuery = searchQuery.gte(
              "created_at",
              filters.dateRange.start,
            );
          }
          if (filters.dateRange.end) {
            searchQuery = searchQuery.lte("created_at", filters.dateRange.end);
          }
        }

        // Apply sorting
        const sortBy = filters.sortBy || "relevance";
        const sortOrder = filters.sortOrder || "desc";

        if (sortBy === "date") {
          searchQuery = searchQuery.order("created_at", {
            ascending: sortOrder === "asc",
          });
        } else if (sortBy === "rating") {
          // Join with podcast stats for rating
          searchQuery = searchQuery.order("podcasts.average_rating", {
            ascending: sortOrder === "asc",
          });
        } else if (sortBy === "popularity") {
          searchQuery = searchQuery.order("podcasts.total_plays", {
            ascending: sortOrder === "asc",
          });
        }

        const { data, error: searchError } = await searchQuery.limit(50);

        if (searchError) throw searchError;

        // Transform results
        const searchResults: SearchResult[] = (data || []).map((item) => ({
          id: item.podcast_id || item.episode_id || "",
          type: item.content_type,
          title: item.title,
          description: item.description,
          image_url:
            item.content_type === "podcast"
              ? item.podcasts?.image_url
              : item.episodes?.image_url || item.podcasts?.image_url,
          podcast_name: item.podcasts?.name,
          duration: item.episodes?.duration,
          published_at: item.episodes?.pub_date,
        }));

        setResults(searchResults);

        // Add to search history
        setSearchHistory((prev) => {
          const newHistory = [query, ...prev.filter((h) => h !== query)].slice(
            0,
            10,
          );
          localStorage.setItem(
            "podcastSearchHistory",
            JSON.stringify(newHistory),
          );
          return newHistory;
        });
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Get search suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("podcast_search_index")
        .select("title")
        .ilike("title", `%${query}%`)
        .limit(5);

      if (error) throw error;

      const suggestionList = (data || [])
        .map((item) => item.title)
        .filter((title) => title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      setSuggestions(suggestionList);
    } catch (err) {
      console.error("Error getting suggestions:", err);
      setSuggestions([]);
    }
  }, []);

  // Get popular searches
  const getPopularSearches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("podcast_search_index")
        .select("tags")
        .not("tags", "is", null)
        .limit(100);

      if (error) throw error;

      // Extract and count tags
      const tagCounts: Record<string, number> = {};
      (data || []).forEach((item) => {
        if (item.tags) {
          item.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      // Return top 10 tags
      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);
    } catch (err) {
      console.error("Error getting popular searches:", err);
      return [];
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  // Load search history from localStorage
  const loadSearchHistory = useCallback(() => {
    try {
      const history = localStorage.getItem("podcastSearchHistory");
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (err) {
      console.error("Error loading search history:", err);
    }
  }, []);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem("podcastSearchHistory");
  }, []);

  // Memoized filter options
  const filterOptions = useMemo(
    () => ({
      categories: [
        { id: "spirituality", name: "Spirituality" },
        { id: "meditation", name: "Meditation" },
        { id: "astrology", name: "Astrology" },
        { id: "wellness", name: "Wellness" },
        { id: "philosophy", name: "Philosophy" },
      ],
      sortOptions: [
        { value: "relevance", label: "Relevance" },
        { value: "date", label: "Date" },
        { value: "rating", label: "Rating" },
        { value: "popularity", label: "Popularity" },
      ],
      durationRanges: [
        { min: 0, max: 15, label: "Under 15 min" },
        { min: 15, max: 30, label: "15-30 min" },
        { min: 30, max: 60, label: "30-60 min" },
        { min: 60, max: 120, label: "1-2 hours" },
        { min: 120, max: null, label: "Over 2 hours" },
      ],
    }),
    [],
  );

  return {
    results,
    isLoading,
    error,
    searchHistory,
    suggestions,
    filterOptions,
    search,
    getSuggestions,
    getPopularSearches,
    clearSearch,
    loadSearchHistory,
    clearSearchHistory,
  };
};
