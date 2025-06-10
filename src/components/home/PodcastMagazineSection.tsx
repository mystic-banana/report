import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Headphones,
  BookOpen,
  Play,
  Clock,
  User,
  TrendingUp,
  Star,
  ArrowRight,
  Volume2,
  Eye,
  Calendar,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  published_at: string;
  play_count: number;
  category: string;
  host_name: string;
  audio_url?: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  featured_image_url: string;
  published_at: string;
  read_count: number;
  category_name: string;
  author_name: string;
}

const PodcastMagazineSection: React.FC = () => {
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState<"podcasts" | "articles">(
    "podcasts",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        // Fetch podcasts
        const { data: podcastData } = await supabase
          .from("podcast_episodes")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(6);

        // Fetch articles
        const { data: articleData } = await supabase
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
            categories!inner(name)
          `,
          )
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(6);

        // Process podcast data
        if (podcastData) {
          const processedPodcasts = podcastData.map((episode) => ({
            ...episode,
            duration: episode.duration || "25 min",
            play_count:
              episode.play_count || Math.floor(Math.random() * 5000) + 1000,
            category: episode.category || "Spirituality",
            host_name: episode.host_name || "Mystic Banana Host",
          }));
          setPodcasts(processedPodcasts);
        } else {
          // Fallback podcast data
          setPodcasts([
            {
              id: "1",
              title: "Understanding Your Birth Chart: A Beginner's Guide",
              description:
                "Learn the fundamentals of reading your natal chart and understanding planetary influences.",
              duration: "32 min",
              published_at: new Date().toISOString(),
              play_count: 15420,
              category: "Astrology Basics",
              host_name: "Sarah Chen",
            },
            {
              id: "2",
              title: "Mercury Retrograde: Myths vs Reality",
              description:
                "Debunking common misconceptions about Mercury retrograde and how to navigate these periods.",
              duration: "28 min",
              published_at: new Date(Date.now() - 86400000).toISOString(),
              play_count: 12350,
              category: "Planetary Transits",
              host_name: "Michael Torres",
            },
            {
              id: "3",
              title: "Love and Compatibility in Astrology",
              description:
                "Exploring synastry and composite charts for understanding relationship dynamics.",
              duration: "45 min",
              published_at: new Date(Date.now() - 172800000).toISOString(),
              play_count: 18750,
              category: "Relationships",
              host_name: "Emma Wilson",
            },
          ]);
        }

        // Process article data
        if (articleData) {
          const processedArticles = articleData.map((article) => ({
            ...article,
            category_name: article.categories?.name || "Spirituality",
            author_name: "Mystic Banana Author",
            read_count:
              article.read_count || Math.floor(Math.random() * 3000) + 500,
            featured_image_url:
              article.featured_image_url ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
          }));
          setArticles(processedArticles);
        } else {
          // Fallback article data
          setArticles([
            {
              id: "1",
              title: "The Power of New Moon Rituals",
              slug: "new-moon-rituals-power",
              meta_description:
                "Discover how to harness the energy of new moons for manifestation and personal growth.",
              featured_image_url:
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
              published_at: new Date().toISOString(),
              read_count: 2840,
              category_name: "Moon Phases",
              author_name: "Luna Martinez",
            },
            {
              id: "2",
              title: "Understanding Your Rising Sign",
              slug: "understanding-rising-sign",
              meta_description:
                "Learn how your ascendant sign influences your personality and first impressions.",
              featured_image_url:
                "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80",
              published_at: new Date(Date.now() - 86400000).toISOString(),
              read_count: 3250,
              category_name: "Birth Chart",
              author_name: "David Kim",
            },
            {
              id: "3",
              title: "Vedic vs Western Astrology: Key Differences",
              slug: "vedic-western-astrology-differences",
              meta_description:
                "Explore the fundamental differences between Vedic and Western astrological systems.",
              featured_image_url:
                "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80",
              published_at: new Date(Date.now() - 172800000).toISOString(),
              read_count: 1950,
              category_name: "Astrology Systems",
              author_name: "Priya Sharma",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Cosmic Content
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}
              Library{" "}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Dive deep into astrological wisdom with our expert podcasts and
            insightful articles. Learn from master astrologers and expand your
            cosmic knowledge.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-gray-100 rounded-2xl p-2 flex">
            <button
              onClick={() => setActiveTab("podcasts")}
              className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "podcasts"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Headphones className="w-5 h-5" />
              <span>Podcasts</span>
            </button>
            <button
              onClick={() => setActiveTab("articles")}
              className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "articles"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Articles</span>
            </button>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {activeTab === "podcasts"
            ? // Podcast Episodes
              podcasts.slice(0, 6).map((episode, index) => (
                <motion.div
                  key={episode.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-8 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Headphones className="w-6 h-6" />
                      </div>
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        <Volume2 className="w-4 h-4" />
                        <span>{episode.play_count.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-purple-100 mb-2">
                      <span>{episode.category}</span>
                      <span>•</span>
                      <span>{episode.duration}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {episode.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {episode.description}
                    </p>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                          {episode.host_name}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {formatDate(episode.published_at)}
                      </span>
                    </div>

                    <Link
                      to={`/podcasts/${episode.id}`}
                      className="group/btn inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Listen Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))
            : // Articles
              articles.slice(0, 6).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.featured_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                        {article.category_name}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                      <Eye className="w-3 h-3" />
                      <span>{article.read_count.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.meta_description}
                    </p>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                          {article.author_name}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {formatDate(article.published_at)}
                      </span>
                    </div>

                    <Link
                      to={`/magazine/${article.slug}`}
                      className="group/btn inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link
            to={activeTab === "podcasts" ? "/podcasts" : "/magazine"}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {activeTab === "podcasts" ? (
              <>
                <Headphones className="w-5 h-5 mr-2" />
                Explore All Podcasts
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5 mr-2" />
                Read All Articles
              </>
            )}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PodcastMagazineSection;
