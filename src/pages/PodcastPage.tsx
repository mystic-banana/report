import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { supabase } from "../lib/supabaseClient";
import SEO from "../components/SEO";
import AdUnit from "../components/ads/AdUnit";
import PodcastList from "../components/podcasts/PodcastList";
import PodcastSearchBar from "../components/podcasts/PodcastSearchBar";
import PodcastDownloadManager from "../components/podcasts/PodcastDownloadManager";
import {
  Headphones,
  Search,
  Music,
  TrendingUp,
  Clock,
  Download,
  Sparkles,
  Star,
  Play,
  Filter,
  Grid,
  List as ListIcon,
  Zap,
  Moon,
  Sun,
} from "lucide-react";
import type { SearchResult } from "../types/podcastTypes";

const PodcastPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryId || "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDownloads, setShowDownloads] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = { all: "All Podcasts" };
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  const pageTitle = useMemo(() => {
    if (selectedCategory === "all")
      return "Podcasts | Mystic Banana - Discover Amazing Shows";
    return `${categoryMap[selectedCategory] || "Podcasts"} | Mystic Banana`;
  }, [selectedCategory, categoryMap]);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching podcast categories");

      const { data, error } = await supabase
        .from("podcast_categories")
        .select("*")
        .order("name");

      if (data && data.length > 0) {
        console.log(
          `Found ${data.length} categories:`,
          data.map((c) => c.name).join(", "),
        );
      } else {
        console.log("No categories found");
      }

      if (error) throw error;

      console.log("Successfully fetched categories:", data?.length || 0);
      setCategories(data || []);

      if (categoryId && categoryId !== "all" && data) {
        const categoryExists = data.some((cat) => cat.id === categoryId);
        if (!categoryExists) {
          navigate("/podcasts", { replace: true });
          setSelectedCategory("all");
        }
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, navigate]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(
      categoryId === "all" ? "/podcasts" : `/podcasts/category/${categoryId}`,
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      console.log("Searching for:", searchQuery);

      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`,
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log(
        `Found ${data?.length || 0} podcasts matching "${searchQuery}"`,
      );
      setSearchResults(data || []);

      if (data?.length === 0) {
        console.log("No podcasts found matching the search criteria");
      }
    } catch (err: any) {
      console.error("Error searching podcasts:", err);
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <PageLayout>
      <SEO
        title={pageTitle}
        description="Discover and listen to your favorite podcasts on Mystic Banana. Stream the latest episodes from popular shows across different categories including spirituality, meditation, philosophy, and more."
        ogType="website"
        ogImage="/images/podcast-page-cover.jpg"
        canonicalUrl={`https://mysticbanana.com/podcasts${selectedCategory !== "all" ? `/category/${selectedCategory}` : ""}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 text-white">
        {/* Mystical Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-600/20 via-purple-600/10 to-indigo-600/20" />
            <div className="absolute top-10 left-10 animate-pulse">
              <Sparkles size={32} className="text-accent-400/30" />
            </div>
            <div className="absolute top-32 right-20 animate-pulse delay-1000">
              <Star size={24} className="text-purple-400/30" />
            </div>
            <div className="absolute bottom-20 left-1/4 animate-pulse delay-2000">
              <Moon size={28} className="text-indigo-400/30" />
            </div>
            <div className="absolute top-1/2 right-1/3 animate-pulse delay-500">
              <Sun size={20} className="text-yellow-400/30" />
            </div>
          </div>

          <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Hero Icon */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-gradient-to-br from-accent-500 to-accent-600 p-6 rounded-full shadow-2xl">
                    <Headphones size={48} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Hero Text */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-accent-200 to-purple-200 bg-clip-text text-transparent">
                Discover Your
                <br />
                <span className="relative">
                  Cosmic Journey
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 to-purple-500 rounded-full" />
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Explore thousands of mystical podcasts across spirituality,
                astrology, meditation, and ancient wisdom. Let the universe
                guide your listening.
              </p>

              {/* Enhanced Search Bar */}
              <div className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                  <PodcastSearchBar
                    onResults={setSearchResults}
                    placeholder="Search the cosmic library..."
                    showFilters={true}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 border border-accent-500/20">
                  <div className="text-3xl font-bold text-accent-400 mb-1">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-400">Sacred Categories</div>
                </div>
                <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    1000+
                  </div>
                  <div className="text-sm text-gray-400">Mystical Episodes</div>
                </div>
                <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20">
                  <div className="text-3xl font-bold text-indigo-400 mb-1">
                    24/7
                  </div>
                  <div className="text-sm text-gray-400">Cosmic Streaming</div>
                </div>
                <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
                  <button
                    onClick={() => setShowDownloads(!showDownloads)}
                    className="flex flex-col items-center space-y-2 text-green-400 hover:text-green-300 transition-colors w-full"
                  >
                    <Download size={24} />
                    <span className="text-sm text-gray-400">Downloads</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Error State */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-white p-6 rounded-xl mb-8 max-w-2xl mx-auto backdrop-blur-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <Zap size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-lg">
                  Cosmic Interference Detected
                </h3>
              </div>
              <p className="text-red-200 mb-4">{error}</p>
              <button
                onClick={() => fetchCategories()}
                className="px-6 py-3 bg-accent-600 hover:bg-accent-700 rounded-lg text-white font-medium transition-colors"
              >
                Realign Connection
              </button>
            </div>
          )}

          {/* Downloads Manager */}
          {showDownloads && (
            <div className="mb-12">
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-accent-500/20 p-6">
                <PodcastDownloadManager showFullManager={true} />
              </div>
            </div>
          )}

          {/* Search Results Section */}
          {searchResults.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <Search className="text-accent-500" size={28} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-ping" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      Cosmic Search Results
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchResults.length} mystical discoveries found
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSearchResults([])}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm border border-dark-600"
                >
                  Clear Vision
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={
                      result.type === "podcast"
                        ? `/podcasts/${result.id}`
                        : `/podcasts/${result.id}`
                    }
                    className="group bg-dark-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-dark-700/50 transition-all duration-300 p-6 border border-dark-700 hover:border-accent-500/30"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {result.image_url ? (
                          <img
                            src={result.image_url}
                            alt={result.title}
                            className="w-16 h-16 rounded-lg object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-accent-600 to-accent-800 rounded-lg">
                            <Headphones size={24} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              result.type === "podcast"
                                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                : "bg-green-600/20 text-green-400 border border-green-500/30"
                            }`}
                          >
                            {result.type === "podcast" ? "Podcast" : "Episode"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white line-clamp-2 group-hover:text-accent-400 transition-colors mb-2">
                          {result.title}
                        </h3>
                        {result.podcast_name && result.type === "episode" && (
                          <p className="text-accent-400 text-sm mb-2">
                            {result.podcast_name}
                          </p>
                        )}
                        {result.description && (
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {result.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {result.duration && (
                            <div className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{result.duration}</span>
                            </div>
                          )}
                          {result.published_at && (
                            <span>
                              {new Date(
                                result.published_at,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="mb-12 bg-dark-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-dark-700">
              <div className="relative mb-6">
                <Search size={64} className="text-gray-600 mx-auto" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">0</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                The Cosmic Library is Silent
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                No mystical podcasts found matching "{searchQuery}". Perhaps the
                universe has other plans for your journey.
              </p>
              <button
                onClick={clearSearch}
                className="px-8 py-3 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105"
              >
                Clear the Cosmic Dust
              </button>
            </div>
          )}

          {/* View Controls */}
          {(!searchQuery || searchResults.length === 0) && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    showFilters
                      ? "bg-accent-600 text-white"
                      : "bg-dark-800 text-gray-300 hover:text-white hover:bg-dark-700"
                  }`}
                >
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-accent-600 text-white"
                      : "bg-dark-800 text-gray-400 hover:text-white"
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-accent-600 text-white"
                      : "bg-dark-800 text-gray-400 hover:text-white"
                  }`}
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Featured Section */}
          {(!searchQuery || searchResults.length === 0) && (
            <div className="mb-12">
              <div className="flex items-center mb-8">
                <div className="relative mr-4">
                  <TrendingUp className="text-accent-500" size={28} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Featured Cosmic Journeys
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Handpicked by the universe for your spiritual awakening
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-16">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-accent-500/30 border-t-accent-500 rounded-full animate-spin mx-auto" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles
                        size={24}
                        className="text-accent-500 animate-pulse"
                      />
                    </div>
                  </div>
                  <p className="text-gray-400 text-lg">
                    Channeling cosmic wisdom...
                  </p>
                </div>
              ) : (
                <div className="bg-dark-800/30 backdrop-blur-sm rounded-2xl border border-accent-500/20 p-6">
                  <PodcastList />
                </div>
              )}
            </div>
          )}

          {/* Ad Unit */}
          <div className="mb-12">
            <div className="bg-dark-800/30 backdrop-blur-sm rounded-2xl border border-dark-700 p-6">
              <AdUnit placement="podcast" className="mx-auto" />
            </div>
          </div>

          {/* Browse Categories */}
          {!isLoading && categories.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center mb-8">
                <div className="relative mr-4">
                  <Music className="text-accent-500" size={28} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Explore Sacred Categories
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Journey through different realms of consciousness
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.slice(0, 8).map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className="group bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-sm hover:from-dark-700/50 hover:to-dark-800/50 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10 border border-dark-700 hover:border-accent-500/30 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white group-hover:text-accent-400 transition-colors">
                        {category.name}
                      </h3>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          index % 4 === 0
                            ? "bg-accent-500/20 text-accent-400"
                            : index % 4 === 1
                              ? "bg-purple-500/20 text-purple-400"
                              : index % 4 === 2
                                ? "bg-indigo-500/20 text-indigo-400"
                                : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {index % 4 === 0 ? (
                          <Star size={20} />
                        ) : index % 4 === 1 ? (
                          <Moon size={20} />
                        ) : index % 4 === 2 ? (
                          <Sun size={20} />
                        ) : (
                          <Sparkles size={20} />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {category.description ||
                        "Explore the mystical podcasts in this sacred category"}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-2" />
                      <span>Latest cosmic episodes available</span>
                    </div>
                  </button>
                ))}
              </div>

              {categories.length > 8 && (
                <div className="text-center mt-8">
                  <button className="px-8 py-3 bg-gradient-to-r from-accent-600 to-purple-600 hover:from-accent-700 hover:to-purple-700 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105">
                    Explore All Sacred Realms
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recent Episodes Section */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <div className="relative mr-4">
                <Clock className="text-accent-500" size={28} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Latest Cosmic Transmissions
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Fresh wisdom from the astral plane
                </p>
              </div>
            </div>

            <div className="bg-dark-800/30 backdrop-blur-sm rounded-2xl border border-dark-700 p-8">
              <div className="text-center py-12">
                <div className="relative mb-6">
                  <Play size={64} className="text-gray-600 mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-accent-500/30 rounded-full animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-400 text-lg mb-2">
                  Cosmic episodes are being channeled...
                </p>
                <p className="text-gray-500 text-sm">
                  Latest episodes will manifest here once RSS feeds are
                  processed by the universe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PodcastPage;
