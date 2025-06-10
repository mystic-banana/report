import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, X, Clock, TrendingUp, Tag } from "lucide-react";
import { usePodcastSearch } from "../../hooks/usePodcastSearch";
import type { SearchFilters } from "../../types/podcastTypes";

interface PodcastSearchBarProps {
  onResults?: (results: any[]) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

const PodcastSearchBar: React.FC<PodcastSearchBarProps> = ({
  onResults,
  onFiltersChange,
  placeholder = "Search podcasts and episodes...",
  showFilters = true,
  className = "",
}) => {
  const {
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
  } = usePodcastSearch();

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "relevance",
    sortOrder: "desc",
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSearchHistory();
    getPopularSearches().then(setPopularSearches);
  }, []);

  useEffect(() => {
    if (results && onResults) {
      onResults(results);
    }
  }, [results, onResults]);

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim()) {
      await search(searchQuery, filters);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 2) {
      getSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClearSearch = () => {
    setQuery("");
    clearSearch();
    inputRef.current?.focus();
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: "relevance",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof SearchFilters];
    if (key === "sortBy" && value === "relevance") return false;
    if (key === "sortOrder" && value === "desc") return false;
    return (
      value !== undefined &&
      value !== null &&
      (Array.isArray(value) ? value.length > 0 : true)
    );
  });

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-20 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
            {showFilters && (
              <button
                type="button"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`p-2 rounded-md transition-colors ${
                  hasActiveFilters || showFiltersPanel
                    ? "bg-accent-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-600"
                }`}
              >
                <Filter size={16} />
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions &&
        (query.length >= 2 ||
          searchHistory.length > 0 ||
          popularSearches.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            {/* Current Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-400 px-2 py-1 font-medium">
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-white hover:bg-dark-700 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <Search size={14} className="text-gray-400" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="p-2 border-t border-dark-700">
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="text-xs text-gray-400 font-medium flex items-center space-x-1">
                    <Clock size={12} />
                    <span>Recent Searches</span>
                  </div>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.slice(0, 5).map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(historyItem)}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:bg-dark-700 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <Clock size={14} className="text-gray-400" />
                    <span>{historyItem}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <div className="p-2 border-t border-dark-700">
                <div className="text-xs text-gray-400 px-2 py-1 font-medium flex items-center space-x-1">
                  <TrendingUp size={12} />
                  <span>Popular</span>
                </div>
                {popularSearches.slice(0, 5).map((popular, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(popular)}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:bg-dark-700 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <TrendingUp size={14} className="text-gray-400" />
                    <span>{popular}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Filters Panel */}
      {showFiltersPanel && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-40 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Search Filters</h3>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowFiltersPanel(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) =>
                  updateFilter("category", e.target.value || undefined)
                }
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || "relevance"}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                {filterOptions.sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <select
                value={
                  filters.duration
                    ? `${filters.duration.min}-${filters.duration.max}`
                    : ""
                }
                onChange={(e) => {
                  if (!e.target.value) {
                    updateFilter("duration", undefined);
                  } else {
                    const [min, max] = e.target.value
                      .split("-")
                      .map((v) => (v === "null" ? null : parseInt(v)));
                    updateFilter("duration", { min, max });
                  }
                }}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="">Any Duration</option>
                {filterOptions.durationRanges.map((range, index) => (
                  <option key={index} value={`${range.min}-${range.max}`}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder || "desc"}
                onChange={(e) => updateFilter("sortOrder", e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Tags Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              placeholder="Enter tags separated by commas"
              value={filters.tags?.join(", ") || ""}
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean);
                updateFilter("tags", tags.length > 0 ? tags : undefined);
              }}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          {/* Apply Filters Button */}
          <div className="mt-4 pt-4 border-t border-dark-700">
            <button
              onClick={() => {
                if (query) handleSearch(query);
                setShowFiltersPanel(false);
              }}
              className="w-full px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default PodcastSearchBar;
