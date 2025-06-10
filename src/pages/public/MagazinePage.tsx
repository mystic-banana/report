import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Search,
  Clock,
  Calendar,
  Bookmark,
  TrendingUp,
  Crown,
  Heart,
  Share,
  ChevronRight,
  Sparkles,
  Star,
  Moon,
  Sun,
  Zap,
  Filter,
  Grid,
  List as ListIcon,
  Eye,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { supabase } from "../../lib/supabaseClient";
import { format } from "date-fns";
import SEO from "../../components/SEO";
import AdBanner from "../../components/ads/AdBanner";

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description?: string;
  content?: string;
  featured_image_url?: string;
  is_premium?: boolean;
  published_at?: string;
  category_id?: string;
  categoryName?: string;
  readTime: number;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  author_name?: string;
  author_avatar?: string;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}

const MagazinePage: React.FC = () => {
  const { page = "1", category } = useParams<{
    page: string;
    category?: string;
  }>();
  const pageNumber = parseInt(page, 10);

  // State variables
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    category || null,
  );
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<{
    [key: string]: Article[];
  }>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "trending">(
    "latest",
  );
  const sliderInterval = useRef<number | null>(null);

  // Computed values
  const totalSlides = Math.min(3, featuredArticles.length);
  const articlesPerPage = 12;
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  // Memoized page title for SEO
  const pageTitle = useMemo(() => {
    if (activeCategory) {
      const cat = categoryList.find((c) => c.id === activeCategory);
      return `${cat?.name || "Category"} Articles | Mystic Banana Magazine`;
    }
    return "Mystic Banana Magazine | Spiritual Wisdom & Astrology Insights";
  }, [activeCategory, categoryList]);

  // Function to fetch articles with optimized queries
  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch articles with author info and stats
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select(
          `
          id,
          title,
          slug,
          meta_description,
          content,
          featured_image_url,
          is_premium,
          published_at,
          category_id,
          author_name,
          author_avatar,
          view_count,
          like_count,
          comment_count
        `,
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(100); // Limit for performance

      if (articlesError) {
        console.error("Error fetching articles:", articlesError);
        setError(articlesError.message);
        return;
      }

      // Fetch categories with colors
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, slug, description")
        .order("name");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
      }

      // Process articles
      const processedArticles = (articlesData || []).map((article) => {
        // Find category name
        let categoryName = "Uncategorized";
        if (article.category_id && categoriesData) {
          const category = categoriesData.find(
            (cat) => cat.id === article.category_id,
          );
          if (category) {
            categoryName = category.name;
          }
        }

        // Calculate read time (1 minute per 200 words, minimum 1 minute)
        const wordCount = article.content
          ? article.content.split(/\s+/).length
          : 0;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        return {
          ...article,
          categoryName,
          readTime,
          view_count: article.view_count || 0,
          like_count: article.like_count || 0,
          comment_count: article.comment_count || 0,
        };
      });

      // Set featured articles (top 5 most viewed or premium)
      const featured = processedArticles
        .filter(
          (article) =>
            article.is_premium ||
            (article.view_count && article.view_count > 100),
        )
        .slice(0, 5);

      // Set state
      setArticles(processedArticles);
      setFeaturedArticles(
        featured.length > 0 ? featured : processedArticles.slice(0, 3),
      );
      setFilteredArticles(processedArticles);

      if (categoriesData) {
        // Add mystical colors to categories
        const categoriesWithColors = categoriesData.map((cat, index) => ({
          ...cat,
          color: ["accent", "purple", "indigo", "emerald", "amber", "rose"][
            index % 6
          ],
        }));
        setCategoryList(categoriesWithColors);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch articles. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Setup auto-slide for hero section
  useEffect(() => {
    if (featuredArticles.length > 1) {
      sliderInterval.current = window.setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 6000);
    }

    return () => {
      if (sliderInterval.current) {
        clearInterval(sliderInterval.current);
      }
    };
  }, [totalSlides, featuredArticles.length]);

  // Filter and sort articles
  useEffect(() => {
    if (articles.length === 0) return;

    let filtered = [...articles];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          (article.meta_description &&
            article.meta_description.toLowerCase().includes(query)) ||
          (article.categoryName &&
            article.categoryName.toLowerCase().includes(query)),
      );
    }

    // Apply category filter
    if (activeCategory) {
      filtered = filtered.filter(
        (article) => article.category_id === activeCategory,
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case "trending":
        filtered.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
        break;
      case "latest":
      default:
        filtered.sort((a, b) => {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    setFilteredArticles(filtered);

    // Group articles by category for category sections
    if (categoryList.length > 0) {
      const articlesByCategory: { [key: string]: Article[] } = {};

      categoryList.forEach((category) => {
        const categoryArticles = articles.filter(
          (article) => article.category_id === category.id,
        );
        if (categoryArticles.length > 0) {
          articlesByCategory[category.id] = categoryArticles
            .sort((a, b) => {
              const dateA = a.published_at
                ? new Date(a.published_at).getTime()
                : 0;
              const dateB = b.published_at
                ? new Date(b.published_at).getTime()
                : 0;
              return dateB - dateA;
            })
            .slice(0, 4); // Show 4 articles per category
        }
      });

      setCategoryArticles(articlesByCategory);
    }
  }, [articles, searchQuery, activeCategory, categoryList, sortBy]);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <SEO title="Loading... | Mystic Banana Magazine" />
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-accent-500/30 border-t-accent-500 rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={32} className="text-accent-500 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-400 text-xl">Channeling cosmic wisdom...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <SEO title="Error | Mystic Banana Magazine" />
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="relative mb-8">
              <Zap size={64} className="text-red-500 mx-auto" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Cosmic Interference Detected
            </h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => fetchArticles()}
              className="px-8 py-3 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105"
            >
              Realign Connection
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title={pageTitle}
        description="Discover mystical wisdom through our curated collection of articles on astrology, spirituality, tarot, and cosmic insights. Your guide to the universe's secrets."
        ogType="website"
        ogImage="/images/magazine-cover.jpg"
        canonicalUrl={`https://mysticbanana.com/magazine${activeCategory ? `/category/${activeCategory}` : ""}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 text-white">
        {/* Mystical Hero Section */}
        <section className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-600/10 via-purple-600/5 to-indigo-600/10" />
            <div className="absolute top-20 left-10 animate-pulse">
              <Sparkles size={24} className="text-accent-400/30" />
            </div>
            <div className="absolute top-40 right-20 animate-pulse delay-1000">
              <Star size={20} className="text-purple-400/30" />
            </div>
            <div className="absolute bottom-32 left-1/4 animate-pulse delay-2000">
              <Moon size={28} className="text-indigo-400/30" />
            </div>
            <div className="absolute top-1/2 right-1/3 animate-pulse delay-500">
              <Sun size={16} className="text-yellow-400/30" />
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative container mx-auto px-4 pt-24 pb-16">
            {/* Hero Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-gradient-to-br from-accent-500 to-accent-600 p-4 rounded-full shadow-2xl">
                    <Sparkles size={32} className="text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-accent-200 to-purple-200 bg-clip-text text-transparent">
                Mystic Banana
                <br />
                <span className="relative text-3xl sm:text-4xl lg:text-5xl">
                  Magazine
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 to-purple-500 rounded-full" />
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Discover the universe's secrets through mystical wisdom,
                astrology insights, and spiritual guidance.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search the cosmic library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-dark-800/50 backdrop-blur-sm border border-accent-500/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-400"
                    size={20}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-4 border border-accent-500/20">
                  <div className="text-2xl font-bold text-accent-400 mb-1">
                    {articles.length}
                  </div>
                  <div className="text-sm text-gray-400">Sacred Articles</div>
                </div>
                <div className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {categoryList.length}
                  </div>
                  <div className="text-sm text-gray-400">Mystical Topics</div>
                </div>
                <div className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20">
                  <div className="text-2xl font-bold text-indigo-400 mb-1">
                    {featuredArticles.length}
                  </div>
                  <div className="text-sm text-gray-400">Featured Wisdom</div>
                </div>
                <div className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    24/7
                  </div>
                  <div className="text-sm text-gray-400">Cosmic Updates</div>
                </div>
              </div>
            </div>

            {/* Featured Articles Slider */}
            {featuredArticles.length > 0 && (
              <div className="relative max-w-6xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl">
                  {featuredArticles.slice(0, 3).map((article, index) => (
                    <div
                      key={article.id}
                      className={`transition-opacity duration-700 ${currentSlide === index ? "opacity-100" : "opacity-0 absolute inset-0"}`}
                    >
                      <div className="relative">
                        <div className="aspect-[21/9] overflow-hidden">
                          <img
                            src={
                              article.featured_image_url ||
                              `https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80`
                            }
                            alt={article.title}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <div className="max-w-2xl">
                            <div className="flex items-center space-x-3 mb-4">
                              <span className="bg-accent-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                                {article.categoryName}
                              </span>
                              <span className="flex items-center bg-dark-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                                <Clock className="w-3 h-3 mr-1" />{" "}
                                {article.readTime} min read
                              </span>
                              {article.is_premium && (
                                <span className="flex items-center bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                                  <Crown className="w-3 h-3 mr-1" /> Premium
                                </span>
                              )}
                            </div>

                            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
                              <Link
                                to={`/magazine/${article.slug}`}
                                className="hover:text-accent-400 transition-colors"
                              >
                                {article.title}
                              </Link>
                            </h2>

                            <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                              {article.meta_description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-300">
                                <div className="flex items-center space-x-1">
                                  <Eye size={16} />
                                  <span>{article.view_count || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Heart size={16} />
                                  <span>{article.like_count || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageCircle size={16} />
                                  <span>{article.comment_count || 0}</span>
                                </div>
                              </div>

                              <Link
                                to={`/magazine/${article.slug}`}
                                className="inline-flex items-center px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                              >
                                Read More{" "}
                                <ArrowRight size={16} className="ml-2" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slider controls */}
                {featuredArticles.length > 1 && (
                  <div className="absolute bottom-6 right-6 flex space-x-2">
                    {featuredArticles.slice(0, 3).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          currentSlide === index
                            ? "bg-accent-500 w-8"
                            : "bg-white/50 hover:bg-accent-400"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Controls Section */}
        <section className="py-8 bg-dark-800/30 backdrop-blur-sm border-y border-dark-700">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Category Filter */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    !activeCategory
                      ? "bg-accent-600 text-white"
                      : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                  }`}
                >
                  All Topics
                </button>
                {categoryList.slice(0, 6).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      activeCategory === category.id
                        ? "bg-accent-600 text-white"
                        : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-400">Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as "latest" | "popular" | "trending",
                      )
                    }
                    className="bg-dark-700 text-white px-3 py-1 rounded-md text-sm border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="latest">Latest</option>
                    <option value="popular">Popular</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-accent-600 text-white"
                        : "bg-dark-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-accent-600 text-white"
                        : "bg-dark-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {filteredArticles.length > 0 ? (
              <div
                className={`grid gap-8 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 max-w-4xl mx-auto"
                }`}
              >
                {filteredArticles.slice(0, articlesPerPage).map((article) => (
                  <article
                    key={article.id}
                    className={`group bg-dark-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-dark-700 hover:border-accent-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10 ${
                      viewMode === "list"
                        ? "flex items-center space-x-6 p-6"
                        : ""
                    }`}
                  >
                    <div
                      className={`relative ${viewMode === "list" ? "w-48 h-32 flex-shrink-0" : "aspect-[4/3]"} overflow-hidden`}
                    >
                      <Link
                        to={`/magazine/${article.slug}`}
                        className="block h-full"
                      >
                        <img
                          src={
                            article.featured_image_url ||
                            `https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80`
                          }
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </Link>

                      <div className="absolute top-3 left-3 flex space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            article.is_premium
                              ? "bg-amber-500/90 text-white"
                              : "bg-accent-500/90 text-white"
                          } backdrop-blur-sm`}
                        >
                          {article.is_premium
                            ? "Premium"
                            : article.categoryName}
                        </span>
                      </div>

                      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark-900/80 backdrop-blur-sm flex items-center justify-center text-white hover:text-accent-400 transition-colors opacity-0 group-hover:opacity-100">
                        <Bookmark size={16} />
                      </button>
                    </div>

                    <div className={viewMode === "list" ? "flex-1" : "p-6"}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{article.readTime} min</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye size={12} />
                            <span>{article.view_count || 0}</span>
                          </span>
                          <span>
                            {article.published_at
                              ? format(new Date(article.published_at), "MMM d")
                              : "Recent"}
                          </span>
                        </div>

                        {article.is_premium && (
                          <Crown size={16} className="text-amber-400" />
                        )}
                      </div>

                      <h3
                        className={`font-bold text-white group-hover:text-accent-400 transition-colors mb-3 ${
                          viewMode === "list" ? "text-xl" : "text-lg"
                        } line-clamp-2`}
                      >
                        <Link to={`/magazine/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>

                      <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {article.meta_description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Heart size={12} />
                            <span>{article.like_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle size={12} />
                            <span>{article.comment_count || 0}</span>
                          </div>
                        </div>

                        <Link
                          to={`/magazine/${article.slug}`}
                          className="text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <Search size={64} className="text-gray-600 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">0</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  The Cosmic Library is Silent
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `No mystical articles found matching "${searchQuery}". Perhaps the universe has other plans for your journey.`
                    : "No articles found in this category. The cosmic energies are still aligning."}
                </p>
                {(searchQuery || activeCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory(null);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Clear the Cosmic Dust
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Ad Unit */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="bg-dark-800/30 backdrop-blur-sm rounded-2xl border border-dark-700 p-6">
              <AdBanner zone="magazine-header" className="mx-auto" />
            </div>
          </div>
        </section>

        {/* Category Sections */}
        {Object.keys(categoryArticles).length > 0 && (
          <section className="py-16 bg-dark-800/20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-white mb-12 text-center">
                Explore Sacred Categories
              </h2>

              <div className="space-y-16">
                {Object.keys(categoryArticles).map((categoryId) => {
                  const category = categoryList.find(
                    (c) => c.id === categoryId,
                  );
                  const articles = categoryArticles[categoryId];

                  if (!category || articles.length === 0) return null;

                  return (
                    <div key={categoryId}>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full bg-${category.color || "accent"}-500/20 flex items-center justify-center`}
                          >
                            <Sparkles
                              size={24}
                              className={`text-${category.color || "accent"}-400`}
                            />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {category.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {category.description || "Mystical wisdom awaits"}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/magazine/category/${categoryId}`}
                          className="flex items-center text-accent-400 hover:text-accent-300 font-medium transition-colors"
                        >
                          View All <ChevronRight size={16} className="ml-1" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {articles.map((article) => (
                          <article
                            key={article.id}
                            className="group bg-dark-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-dark-700 hover:border-accent-500/30 transition-all duration-300"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <Link to={`/magazine/${article.slug}`}>
                                <img
                                  src={
                                    article.featured_image_url ||
                                    `https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&q=80`
                                  }
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                              </Link>

                              {article.is_premium && (
                                <div className="absolute top-3 right-3">
                                  <Crown size={16} className="text-amber-400" />
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <div className="flex items-center space-x-2 mb-2 text-xs text-gray-400">
                                <Clock size={12} />
                                <span>{article.readTime} min</span>
                                <span>&bull;</span>
                                <span>
                                  {article.published_at
                                    ? format(
                                        new Date(article.published_at),
                                        "MMM d",
                                      )
                                    : "Recent"}
                                </span>
                              </div>

                              <h4 className="font-semibold text-white group-hover:text-accent-400 transition-colors mb-2 line-clamp-2">
                                <Link to={`/magazine/${article.slug}`}>
                                  {article.title}
                                </Link>
                              </h4>

                              <p className="text-gray-400 text-sm line-clamp-2">
                                {article.meta_description}
                              </p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Section */}
        <section className="py-16 bg-gradient-to-r from-accent-600/10 to-purple-600/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-gradient-to-br from-accent-500 to-purple-600 p-3 rounded-full">
                    <Sparkles size={24} className="text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                Stay Connected to the Cosmos
              </h2>
              <p className="text-gray-300 mb-8">
                Receive weekly insights, mystical wisdom, and cosmic updates
                directly to your inbox.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-dark-800/50 backdrop-blur-sm border border-accent-500/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <button className="px-8 py-3 bg-gradient-to-r from-accent-600 to-purple-600 hover:from-accent-700 hover:to-purple-700 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default MagazinePage;
