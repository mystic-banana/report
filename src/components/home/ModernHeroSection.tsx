import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  User,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { format } from "date-fns";

interface HeroArticle {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  featured_image_url: string;
  category_name: string;
  published_at: string;
  read_count: number;
  is_premium: boolean;
}

const ModernHeroSection: React.FC = () => {
  const [articles, setArticles] = useState<HeroArticle[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroArticles = async () => {
      try {
        setLoading(true);

        // Fetch top articles with category names
        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select(
            `
            id,
            title,
            slug,
            meta_description,
            featured_image_url,
            published_at,
            read_count,
            is_premium,
            categories!inner(name)
          `,
          )
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(5);

        if (articlesError) {
          console.error("Error fetching hero articles:", articlesError);
          setError("Failed to load featured articles");
          return;
        }

        if (articlesData && articlesData.length > 0) {
          const transformedArticles = articlesData.map((article) => ({
            ...article,
            category_name: article.categories?.name || "Uncategorized",
            featured_image_url:
              article.featured_image_url ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
          }));
          setArticles(transformedArticles);
        } else {
          // Fallback content
          setArticles([
            {
              id: "1",
              title: "Discover Your Inner Light Through Meditation",
              slug: "discover-inner-light-meditation",
              meta_description:
                "Explore powerful meditation techniques to unlock your spiritual potential and find inner peace.",
              featured_image_url:
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
              category_name: "Meditation",
              published_at: new Date().toISOString(),
              read_count: 1250,
              is_premium: false,
            },
          ]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchHeroArticles();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (articles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % articles.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [articles.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
  };

  if (loading) {
    return (
      <section className="relative h-[70vh] bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-16 h-16 bg-accent-500 rounded-full mx-auto animate-spin flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-300">Loading featured content...</p>
        </div>
      </section>
    );
  }

  if (error || articles.length === 0) {
    return (
      <section className="relative h-[70vh] bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Welcome to Mystic Banana
          </h2>
          <p className="text-gray-300 mb-6">
            Your journey to spiritual enlightenment begins here
          </p>
          <Link
            to="/magazine"
            className="inline-flex items-center px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
          >
            Explore Articles
          </Link>
        </div>
      </section>
    );
  }

  const currentArticle = articles[currentSlide];

  return (
    <section className="relative h-[80vh] overflow-hidden bg-dark-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={currentArticle.featured_image_url}
              alt={currentArticle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Category Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-4"
                >
                  <span className="inline-flex items-center px-4 py-2 bg-accent-600/90 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {currentArticle.category_name}
                  </span>
                  {currentArticle.is_premium && (
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full">
                      PREMIUM
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {currentArticle.read_count || 0} reads
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight"
                >
                  {currentArticle.title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-3xl"
                >
                  {currentArticle.meta_description}
                </motion.p>

                {/* Meta Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center space-x-6 text-gray-300"
                >
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {format(
                      new Date(currentArticle.published_at),
                      "MMM d, yyyy",
                    )}
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Mystic Banana
                  </span>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Link
                    to={`/magazine/${currentArticle.slug}`}
                    className="group inline-flex items-center px-8 py-4 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <Play className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                    Read Full Article
                  </Link>
                  <Link
                    to="/magazine"
                    className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40"
                  >
                    Explore More
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {articles.length > 1 && (
        <>
          {/* Arrow Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-accent-500 w-8"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/60 text-sm"
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernHeroSection;
