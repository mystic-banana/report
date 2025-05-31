import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Star,
  Moon,
  Sun,
  Calendar,
  BookOpen,
  Eye,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const VedicPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { birthCharts, loading, fetchBirthCharts } = useAstrologyStore();
  const [selectedChart, setSelectedChart] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBirthCharts(user.id);
      if (birthCharts.length > 0 && !selectedChart) {
        setSelectedChart(birthCharts[0].id);
      }
    }
  }, [isAuthenticated, user, birthCharts.length]);

  const vedicFeatures = [
    {
      icon: Star,
      title: "Nakshatra Analysis",
      description:
        "Discover your birth star and its profound influence on your destiny",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: Moon,
      title: "Dasha Periods",
      description: "Understand planetary periods and their timing in your life",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Sun,
      title: "Karma & Dharma",
      description: "Explore your soul's purpose and karmic lessons",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: Calendar,
      title: "Muhurta Selection",
      description: "Find auspicious timing for important life events",
      color: "from-green-500 to-teal-600",
    },
    {
      icon: BookOpen,
      title: "Remedial Measures",
      description:
        "Personalized remedies to enhance positive planetary influences",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Sparkles,
      title: "Spiritual Guidance",
      description: "Vedic wisdom for spiritual growth and self-realization",
      color: "from-indigo-500 to-purple-600",
    },
  ];

  return (
    <PageLayout title="Vedic Astrology - Karma & Destiny - Mystic Banana">
      <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/astrology")}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                  Vedic Astrology
                </h1>
                <p className="text-gray-400">
                  Ancient wisdom for understanding karma and destiny
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-2xl p-8 mb-8 border border-orange-500/20">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold text-white mb-4">
                Discover Your Soul's Journey
              </h2>
              <p className="text-gray-300 text-lg mb-6 max-w-3xl mx-auto">
                Vedic astrology, also known as Jyotish, is the ancient Indian
                system of astrology that reveals the deeper karmic patterns and
                spiritual purpose of your life.
              </p>
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate("/signup")}
                    className="bg-gradient-to-r from-orange-600 to-red-600"
                  >
                    Sign Up to Explore
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                </div>
              ) : birthCharts.length === 0 ? (
                <Button
                  onClick={() => navigate("/astrology/birth-chart")}
                  className="bg-gradient-to-r from-orange-600 to-red-600"
                >
                  Create Birth Chart First
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Birth Chart for Vedic Analysis
                    </label>
                    <select
                      value={selectedChart}
                      onChange={(e) => setSelectedChart(e.target.value)}
                      className="bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {birthCharts.map((chart) => (
                        <option key={chart.id} value={chart.id}>
                          {chart.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-orange-600 to-red-600"
                    disabled={!selectedChart}
                  >
                    Generate Vedic Analysis
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-12">
            <h3 className="text-2xl font-serif font-bold text-white mb-8 text-center">
              Vedic Astrology Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vedicFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-800 rounded-2xl p-6 border border-dark-700 hover:border-orange-500/40 transition-all duration-300"
                  >
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${feature.color}`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Vedic Chart Preview */}
          {isAuthenticated && birthCharts.length > 0 && (
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-2xl p-8 border border-orange-500/20 mb-8">
              <h3 className="text-2xl font-serif font-bold text-white mb-6">
                Your Vedic Chart Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-medium text-white mb-3">
                    Birth Nakshatra
                  </h4>
                  <div className="flex items-center">
                    <Star className="w-6 h-6 text-orange-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Ashwini</p>
                      <p className="text-gray-400 text-sm">
                        The Horsemen - Healing & Swift Action
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-medium text-white mb-3">
                    Current Dasha
                  </h4>
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 text-orange-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Venus Mahadasha</p>
                      <p className="text-gray-400 text-sm">
                        Focus on relationships & creativity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coming Soon Notice */}
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 border border-purple-500/20 text-center">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-white mb-4">
              Advanced Vedic Features Coming Soon
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              We're working on bringing you comprehensive Vedic astrology
              features including detailed Nakshatra analysis, Dasha
              calculations, and personalized karmic insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/astrology/birth-chart")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                Create Birth Chart
              </Button>
              <Button variant="outline" onClick={() => navigate("/astrology")}>
                Explore Western Astrology
              </Button>
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-12 bg-dark-800 rounded-2xl p-8 border border-dark-700">
            <h3 className="text-2xl font-serif font-bold text-white mb-6">
              Understanding Vedic Astrology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Key Differences from Western Astrology
                </h4>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• Uses sidereal zodiac (fixed to stars)</li>
                  <li>• Focuses on Moon sign and Nakshatra</li>
                  <li>• Emphasizes karma and spiritual evolution</li>
                  <li>• Includes detailed timing systems (Dashas)</li>
                  <li>• Provides remedial measures</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  What You'll Discover
                </h4>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• Your birth Nakshatra and its meaning</li>
                  <li>• Current and upcoming Dasha periods</li>
                  <li>• Karmic lessons and soul purpose</li>
                  <li>• Auspicious timing for major decisions</li>
                  <li>• Personalized remedies and mantras</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default VedicPage;
