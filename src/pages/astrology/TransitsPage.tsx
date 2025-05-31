import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ArrowLeft,
  Calendar,
  Star,
  AlertCircle,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const TransitsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    birthCharts,
    transitForecasts,
    loading,
    fetchBirthCharts,
    fetchTransitForecasts,
    generateTransitForecast,
  } = useAstrologyStore();

  const [selectedChart, setSelectedChart] = useState<string>("");
  const [forecastPeriod, setForecastPeriod] = useState<string>("week");
  const [forecastDate, setForecastDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBirthCharts(user.id);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (birthCharts.length > 0 && !selectedChart) {
      setSelectedChart(birthCharts[0].id);
    }
  }, [birthCharts.length, selectedChart]);

  useEffect(() => {
    if (selectedChart) {
      fetchTransitForecasts(selectedChart);
    }
  }, [selectedChart]);

  const handleGenerateForecast = async () => {
    if (selectedChart) {
      await generateTransitForecast(
        selectedChart,
        forecastDate,
        forecastPeriod,
      );
    }
  };

  const getSignificanceColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-400 bg-red-900/20 border-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-500/20";
      case "low":
        return "text-green-400 bg-green-900/20 border-green-500/20";
      default:
        return "text-gray-400 bg-gray-900/20 border-gray-500/20";
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout title="Transit Forecasts - Mystic Banana">
        <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-2xl p-8 border border-teal-500/20">
                <TrendingUp className="w-16 h-16 text-teal-400 mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-bold text-white mb-4">
                  Planetary Transit Forecasts
                </h1>
                <p className="text-gray-300 mb-8">
                  Track how current planetary movements influence your personal
                  birth chart and discover upcoming cosmic events that will
                  impact your life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate("/signup")}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600"
                  >
                    Sign Up to Get Started
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Transit Forecasts - Mystic Banana">
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
                  Transit Forecasts
                </h1>
                <p className="text-gray-400">
                  Track planetary movements and their personal impact
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-teal-400" />
            </div>
          </div>

          {birthCharts.length === 0 ? (
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 border border-purple-500/20 text-center">
              <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Create Your Birth Chart First
              </h3>
              <p className="text-gray-300 mb-6">
                To generate personalized transit forecasts, you need to create
                your birth chart first.
              </p>
              <Button
                onClick={() => navigate("/astrology/birth-chart")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                Create Birth Chart
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Forecast Generator */}
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Generate Transit Forecast
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Birth Chart
                    </label>
                    <select
                      value={selectedChart}
                      onChange={(e) => setSelectedChart(e.target.value)}
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {birthCharts.map((chart) => (
                        <option key={chart.id} value={chart.id}>
                          {chart.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Forecast Period
                    </label>
                    <select
                      value={forecastPeriod}
                      onChange={(e) => setForecastPeriod(e.target.value)}
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">Next 3 Months</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={forecastDate}
                      onChange={(e) => setForecastDate(e.target.value)}
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleGenerateForecast}
                  loading={loading}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600"
                >
                  Generate Forecast
                </Button>
              </div>

              {/* Current Transits */}
              <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-2xl p-6 border border-teal-500/20">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-teal-400" />
                  Current Major Transits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-dark-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">
                        Jupiter Transit
                      </h4>
                      <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">
                        Beneficial
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      Jupiter in Taurus - 5th House
                    </p>
                    <p className="text-gray-300 text-sm">
                      Expansion in creativity and romance. Great time for
                      artistic pursuits.
                    </p>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Saturn Transit</h4>
                      <span className="text-xs px-2 py-1 bg-yellow-600 text-white rounded-full">
                        Challenging
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      Saturn in Pisces - 12th House
                    </p>
                    <p className="text-gray-300 text-sm">
                      Time for spiritual growth and releasing old patterns.
                    </p>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Mars Transit</h4>
                      <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full">
                        Intense
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      Mars in Scorpio - 8th House
                    </p>
                    <p className="text-gray-300 text-sm">
                      Deep transformation and powerful insights coming your way.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transit Forecasts */}
              {transitForecasts.length > 0 ? (
                <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Your Transit Forecasts
                  </h3>
                  <div className="space-y-4">
                    {transitForecasts.map((forecast) => (
                      <motion.div
                        key={forecast.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl p-4 border ${getSignificanceColor(
                          forecast.significance_level,
                        )}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            <h4 className="font-medium">
                              {forecast.forecast_period} Forecast
                            </h4>
                          </div>
                          <span className="text-sm">
                            {new Date(
                              forecast.forecast_date,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mb-3">
                          {forecast.forecast_content}
                        </p>
                        <div className="text-xs opacity-75">
                          Significance: {forecast.significance_level}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-400 mb-2">
                    No Forecasts Yet
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Generate your first transit forecast to see how current
                    planetary movements affect you.
                  </p>
                </div>
              )}

              {/* How Transits Work */}
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Understanding Planetary Transits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      What are Transits?
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Transits occur when current planetary positions form
                      aspects (angles) to the planets in your birth chart. These
                      cosmic interactions influence different areas of your
                      life.
                    </p>
                    <h4 className="text-white font-medium mb-3">
                      Major Transit Planets
                    </h4>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>• Jupiter: Growth, expansion, opportunities</li>
                      <li>• Saturn: Lessons, structure, challenges</li>
                      <li>• Uranus: Change, innovation, surprises</li>
                      <li>• Neptune: Spirituality, dreams, illusions</li>
                      <li>• Pluto: Transformation, power, rebirth</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      Transit Timing
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Different planets move at different speeds, creating
                      various types of influences:
                    </p>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>
                        • Fast planets (Sun, Moon, Mercury): Daily influences
                      </li>
                      <li>• Medium planets (Venus, Mars): Weekly to monthly</li>
                      <li>
                        • Slow planets (Jupiter, Saturn): Yearly influences
                      </li>
                      <li>
                        • Outer planets (Uranus, Neptune, Pluto): Generational
                        changes
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default TransitsPage;
