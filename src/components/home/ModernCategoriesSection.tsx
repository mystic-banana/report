import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Moon,
  Sparkles,
  Heart,
  BrainCircuit,
  Lotus,
  ChefHat,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  article_count: number;
  latest_article?: {
    title: string;
    slug: string;
    published_at: string;
  };
}

const categoryIcons: Record<string, React.ReactNode> = {
  Astrology: <Star className="w-8 h-8" />,
  Tarot: <Moon className="w-8 h-8" />,
  Spirituality: <Sparkles className="w-8 h-8" />,
  Relationships: <Heart className="w-8 h-8" />,
  Mindfulness: <BrainCircuit className="w-8 h-8" />,
  Meditation: <Lotus className="w-8 h-8" />,
  "Sacred Kitchen": <ChefHat className="w-8 h-8" />,
};

const categoryGradients: Record<string, string> = {
  Astrology: "from-purple-600 to-indigo-600",
  Tarot: "from-indigo-600 to-purple-700",
  Spirituality: "from-accent-500 to-amber-500",
  Relationships: "from-pink-500 to-rose-600",
  Mindfulness: "from-teal-500 to-cyan-600",
  Meditation: "from-blue-500 to-indigo-600",
  "Sacred Kitchen": "from-orange-500 to-red-600",
};

const ModernCategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories with article counts
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select(
            `
            id,
            name,
            slug,
            description,
            articles!inner(id, title, slug, published_at)
          `,
          )
          .order("name");

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          // Use fallback data
          setCategories([
            {
              id: "1",
              name: "Astrology",
              slug: "astrology",
              description:
                "Explore the cosmic influences of celestial bodies on your life",
              article_count: 12,
            },
            {
              id: "2",
              name: "Meditation",
              slug: "meditation",
              description: "Discover inner peace through mindful practices",
              article_count: 8,
            },
            {
              id: "3",
              name: "Sacred Kitchen",
              slug: "sacred-kitchen",
              description: "Nourish your body and soul with spiritual recipes",
              article_count: 15,
            },
          ]);
          return;
        }

        if (categoriesData) {
          const processedCategories = categoriesData.map((category) => {
            const articles = category.articles || [];
            const latestArticle = articles.sort(
              (a, b) =>
                new Date(b.published_at).getTime() -
                new Date(a.published_at).getTime(),
            )[0];

            return {
              id: category.id,
              name: category.name,
              slug: category.slug,
              description:
                category.description ||
                `Explore ${category.name.toLowerCase()} content`,
              article_count: articles.length,
              latest_article: latestArticle
                ? {
                    title: latestArticle.title,
                    slug: latestArticle.slug,
                    published_at: latestArticle.published_at,
                  }
                : undefined,
            };
          });

          setCategories(processedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-dark-900 to-dark-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-dark-700 rounded-2xl p-8 animate-pulse"
              >
                <div className="w-12 h-12 bg-dark-600 rounded-xl mb-6"></div>
                <div className="h-6 bg-dark-600 rounded mb-4"></div>
                <div className="h-4 bg-dark-600 rounded mb-2"></div>
                <div className="h-4 bg-dark-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-dark-900 to-dark-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Explore Sacred Knowledge
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Dive into our diverse categories of spiritual wisdom and find the
            path that resonates with your soul.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((category, index) => {
            const gradient =
              categoryGradients[category.name] ||
              "from-accent-500 to-accent-600";
            const icon = categoryIcons[category.name] || (
              <Sparkles className="w-8 h-8" />
            );

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                <Link to={`/magazine/categories/${category.id}`}>
                  <div className="relative bg-dark-800 rounded-2xl p-8 border border-dark-700 hover:border-dark-600 transition-all duration-300 overflow-hidden">
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    ></div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl mb-6 text-white transform group-hover:scale-110 transition-transform duration-300`}
                      >
                        {icon}
                      </div>

                      {/* Category Info */}
                      <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-accent-400 transition-colors">
                        {category.name}
                      </h3>

                      <p className="text-gray-400 mb-6 leading-relaxed">
                        {category.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="flex items-center text-sm text-gray-500">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {category.article_count} articles
                        </span>
                        {category.latest_article && (
                          <span className="text-xs text-accent-400 font-medium">
                            Latest:{" "}
                            {new Date(
                              category.latest_article.published_at,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Latest Article Preview */}
                      {category.latest_article && (
                        <div className="bg-dark-700/50 rounded-lg p-4 mb-4">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            Latest: {category.latest_article.title}
                          </p>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center text-accent-400 font-medium group-hover:text-accent-300 transition-colors">
                        <span>Explore {category.name}</span>
                        <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Categories CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <Link
            to="/magazine"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            View All Categories
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernCategoriesSection;
