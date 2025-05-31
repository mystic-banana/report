import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  Plus,
  Eye,
  Sparkles,
  Moon,
  Sun,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import { getZodiacSign } from "../../utils/astronomicalCalculations";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import CompatibilityChart from "../astrology/CompatibilityChart";

const AstrologyDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    birthCharts,
    dailyHoroscopes,
    compatibilityReports,
    reports,
    loading,
    fetchBirthCharts,
    fetchDailyHoroscope,
    fetchCompatibilityReports,
    fetchReports,
  } = useAstrologyStore();

  const [todayHoroscope, setTodayHoroscope] = useState(null);
  const [userZodiacSign, setUserZodiacSign] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBirthCharts(user.id);
      fetchCompatibilityReports(user.id);
      fetchReports(user.id);

      // Get user's zodiac sign from their first birth chart
      if (birthCharts.length > 0) {
        const sign = getZodiacSign(birthCharts[0].birth_date);
        setUserZodiacSign(sign);

        // Fetch today's horoscope
        const today = new Date().toISOString().split("T")[0];
        fetchDailyHoroscope(sign, today).then(setTodayHoroscope);
      }
    }
  }, [isAuthenticated, user, birthCharts.length]);

  const zodiacSymbols: { [key: string]: string } = {
    Aries: "♈",
    Taurus: "♉",
    Gemini: "♊",
    Cancer: "♋",
    Leo: "♌",
    Virgo: "♍",
    Libra: "♎",
    Scorpio: "♏",
    Sagittarius: "♐",
    Capricorn: "♑",
    Aquarius: "♒",
    Pisces: "♓",
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 border border-purple-500/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Unlock Your Cosmic Destiny
          </h2>
          <p className="text-gray-300 mb-6">
            Sign in to access personalized birth charts, compatibility reports,
            and daily horoscopes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                Sign In
              </Button>
            </Link>
            <Link to="/astrology">
              <Button variant="outline">Explore Astrology</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Astrology Overview Header */}
      <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">
                Your Astrological Journey
              </h2>
              <p className="text-purple-200">
                Discover the cosmic influences shaping your life
              </p>
            </div>
          </div>
          <Link to="/astrology">
            <Button variant="outline" icon={ArrowRight}>
              Explore All
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {birthCharts.length}
            </p>
            <p className="text-gray-400 text-sm">Birth Charts</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-pink-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {compatibilityReports.length}
            </p>
            <p className="text-gray-400 text-sm">Compatibility</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            <BookOpen className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{reports.length}</p>
            <p className="text-gray-400 text-sm">Reports</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            {userZodiacSign ? (
              <>
                <span className="text-2xl mb-2 block">
                  {zodiacSymbols[userZodiacSign]}
                </span>
                <p className="text-lg font-bold text-white">{userZodiacSign}</p>
                <p className="text-gray-400 text-sm">Your Sign</p>
              </>
            ) : (
              <>
                <Calendar className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  Create chart to see sign
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Today's Horoscope */}
      {userZodiacSign && (
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Sun className="w-6 h-6 text-amber-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">
                Today's Horoscope
              </h3>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {zodiacSymbols[userZodiacSign]}
              </span>
              <span className="text-amber-400 font-medium">
                {userZodiacSign}
              </span>
            </div>
          </div>
          {todayHoroscope ? (
            <div>
              <p className="text-gray-300 mb-4">{todayHoroscope.content}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-pink-400 font-bold text-lg">
                    {todayHoroscope.love_score}%
                  </p>
                  <p className="text-gray-400 text-sm">Love</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-400 font-bold text-lg">
                    {todayHoroscope.career_score}%
                  </p>
                  <p className="text-gray-400 text-sm">Career</p>
                </div>
                <div className="text-center">
                  <p className="text-green-400 font-bold text-lg">
                    {todayHoroscope.health_score}%
                  </p>
                  <p className="text-gray-400 text-sm">Health</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 mb-4">
                Loading today's cosmic guidance...
              </p>
              <LoadingSpinner size="sm" />
            </div>
          )}
          <div className="mt-4 text-right">
            <Link to="/astrology/horoscopes">
              <Button variant="ghost" size="sm" icon={ArrowRight}>
                View All Horoscopes
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Birth Charts Section */}
      <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Star className="w-6 h-6 text-purple-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Birth Charts</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/astrology/birth-chart">
              <Button size="sm" icon={Plus}>
                Create New
              </Button>
            </Link>
            {birthCharts.length > 0 && (
              <Link to="/astrology/charts">
                <Button variant="ghost" size="sm" icon={Eye}>
                  View All
                </Button>
              </Link>
            )}
          </div>
        </div>

        {birthCharts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {birthCharts.slice(0, 3).map((chart) => {
              const zodiacSign = getZodiacSign(chart.birth_date);
              return (
                <motion.div
                  key={chart.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-white">
                      {chart.name}
                    </h4>
                    <span className="text-2xl">
                      {zodiacSymbols[zodiacSign]}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    {new Date(chart.birth_date).toLocaleDateString()}
                  </p>
                  <p className="text-purple-400 text-sm mb-3">{zodiacSign}</p>
                  <Button variant="ghost" size="sm" className="w-full">
                    View Chart
                  </Button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">
              No Birth Charts Yet
            </h4>
            <p className="text-gray-500 mb-4">
              Create your first birth chart to unlock personalized insights
            </p>
            <Link to="/astrology/birth-chart">
              <Button icon={Plus}>Create Your Birth Chart</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Compatibility Chart Component */}
      <CompatibilityChart maxItems={2} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/astrology/birth-chart">
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 text-center">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-1">Birth Chart</h4>
            <p className="text-gray-400 text-sm">Generate natal chart</p>
          </div>
        </Link>
        <Link to="/astrology/compatibility">
          <div className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 text-center">
            <Users className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-1">Compatibility</h4>
            <p className="text-gray-400 text-sm">Relationship analysis</p>
          </div>
        </Link>
        <Link to="/astrology/horoscopes">
          <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl p-4 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 text-center">
            <Calendar className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-1">Horoscopes</h4>
            <p className="text-gray-400 text-sm">Daily guidance</p>
          </div>
        </Link>
        <Link to="/astrology/reports">
          <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-xl p-4 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 text-center">
            <BookOpen className="w-8 h-8 text-teal-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-1">Reports</h4>
            <p className="text-gray-400 text-sm">Detailed analysis</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AstrologyDashboard;
