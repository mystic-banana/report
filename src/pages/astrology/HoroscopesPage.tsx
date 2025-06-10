import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, ArrowLeft, Calendar, Star, Sparkles } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getZodiacSign } from "../../utils/astronomicalCalculations";

const HoroscopesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    birthCharts,
    dailyHoroscopes,
    loading,
    fetchBirthCharts,
    fetchDailyHoroscope,
    generateDailyHoroscopes,
  } = useAstrologyStore();

  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [todayHoroscope, setTodayHoroscope] = useState(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [horoscopeHistory, setHoroscopeHistory] = useState([]);

  const zodiacSigns = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

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

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBirthCharts(user.id);

      // Set user's zodiac sign if they have a birth chart
      if (birthCharts.length > 0 && !selectedSign) {
        const userSign = getZodiacSign(birthCharts[0].birth_date);
        setSelectedSign(userSign);
      }
    }

    // Set default sign if none selected
    if (!selectedSign) {
      setSelectedSign("Aries");
    }

    // Generate today's horoscopes if not available
    if (selectedDate && generateDailyHoroscopes) {
      generateDailyHoroscopes(selectedDate);
    }
  }, [isAuthenticated, user, birthCharts.length]);

  useEffect(() => {
    if (selectedSign) {
      if (isPersonalized && birthCharts.length > 0) {
        generatePersonalizedHoroscope();
      } else {
        loadCachedHoroscope();
      }
    }
  }, [selectedSign, selectedDate, isPersonalized]);

  const loadCachedHoroscope = async () => {
    try {
      // First try to get from cache
      const { data: cached, error } = await supabase
        .from("daily_horoscopes")
        .select("*")
        .eq("zodiac_sign", selectedSign)
        .eq("date", selectedDate)
        .single();

      if (!error && cached && new Date(cached.expires_at) > new Date()) {
        // Use cached horoscope
        setTodayHoroscope({
          content: cached.content,
          love_score: cached.love_score,
          career_score: cached.career_score,
          health_score: cached.health_score,
          lucky_numbers: cached.lucky_numbers,
          lucky_colors: cached.lucky_colors,
        });
        return;
      }

      // Fallback to API generation
      const horoscope = await fetchDailyHoroscope(selectedSign, selectedDate);
      setTodayHoroscope(horoscope);

      // Cache the result
      if (horoscope) {
        await supabase.from("daily_horoscopes").upsert({
          zodiac_sign: selectedSign,
          date: selectedDate,
          content: horoscope.content,
          love_score:
            horoscope.love_score || Math.floor(Math.random() * 30) + 70,
          career_score:
            horoscope.career_score || Math.floor(Math.random() * 30) + 70,
          health_score:
            horoscope.health_score || Math.floor(Math.random() * 30) + 70,
          lucky_numbers: horoscope.lucky_numbers || [7, 14, 21],
          lucky_colors: horoscope.lucky_colors || ["Purple", "Gold"],
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    } catch (error) {
      console.error("Error loading horoscope:", error);
      // Fallback to API
      const horoscope = await fetchDailyHoroscope(selectedSign, selectedDate);
      setTodayHoroscope(horoscope);
    }
  };

  const generatePersonalizedHoroscope = async () => {
    if (!selectedSign || !birthCharts.length) return;

    try {
      const response = await supabase.functions.invoke(
        "generate-daily-horoscope",
        {
          body: {
            zodiacSign: selectedSign,
            date: selectedDate,
            birthChart: birthCharts[0].chart_data,
            currentTransits: [], // TODO: Add current transit data
            isPremium: user?.subscription_plan !== "free",
          },
        },
      );

      if (response.data?.horoscope) {
        setTodayHoroscope({
          ...response.data.horoscope,
          content:
            response.data.horoscope.dailyOverview ||
            response.data.horoscope.fullContent,
          love_score: response.data.horoscope.loveScore,
          career_score: response.data.horoscope.careerScore,
          health_score: response.data.horoscope.healthScore,
          lucky_numbers: response.data.horoscope.luckyNumbers,
          lucky_colors: response.data.horoscope.luckyColors,
        });
      }
    } catch (error) {
      console.error("Failed to generate personalized horoscope:", error);
      // Fallback to regular horoscope
      fetchDailyHoroscope(selectedSign, selectedDate).then(setTodayHoroscope);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <PageLayout title="Daily Horoscopes - Mystic Banana">
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
                  Daily Horoscopes
                </h1>
                <p className="text-gray-400">
                  Your cosmic guidance for today and beyond
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Sun className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          {/* Date Selector & Personalization */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-amber-400" />
                Horoscope Settings
              </h3>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-dark-700 border border-dark-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Personalization Toggle */}
            {isAuthenticated && birthCharts.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/20">
                <div>
                  <h4 className="text-white font-medium mb-1">
                    Personalized Horoscope
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Use your birth chart for personalized insights based on
                    current transits
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPersonalized}
                    onChange={(e) => setIsPersonalized(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            )}
          </div>

          {/* Zodiac Sign Selector */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Choose Your Zodiac Sign
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {zodiacSigns.map((sign) => (
                <button
                  key={sign}
                  onClick={() => setSelectedSign(sign)}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    selectedSign === sign
                      ? "bg-gradient-to-br from-amber-600 to-orange-600 border-amber-500 text-white"
                      : "bg-dark-700 border-dark-600 text-gray-300 hover:border-amber-500 hover:text-white"
                  }`}
                >
                  <div className="text-2xl mb-2">{zodiacSymbols[sign]}</div>
                  <div className="text-sm font-medium">{sign}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Horoscope */}
          {selectedSign && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 border border-purple-500/20 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">
                    {zodiacSymbols[selectedSign]}
                  </span>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-white">
                      {selectedSign} Horoscope
                    </h2>
                    <p className="text-purple-200">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-400 mt-4">
                    Loading your cosmic guidance...
                  </p>
                </div>
              ) : todayHoroscope ? (
                <div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-200 text-lg leading-relaxed mb-8 font-medium">
                      {todayHoroscope.content}
                    </p>
                    {isPersonalized && (
                      <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl p-4 mb-6 border border-purple-500/20">
                        <div className="flex items-center mb-2">
                          <Star className="w-5 h-5 text-purple-400 mr-2" />
                          <span className="text-purple-200 font-semibold text-sm">
                            Personalized Insight
                          </span>
                        </div>
                        <p className="text-purple-100 text-sm">
                          This horoscope is tailored to your birth chart and
                          current planetary transits affecting your unique
                          astrological profile.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Meditation Practice */}
                  <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl p-6 mb-8 border border-purple-500/20">
                    <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-3 text-purple-400" />
                      Today's Meditation Practice
                    </h4>
                    <div className="space-y-4">
                      <p className="text-gray-300 text-base leading-relaxed">
                        Take 5 minutes to center yourself with deep breathing.
                        Focus on your intention for the day.
                      </p>
                      <p className="text-gray-300 text-base leading-relaxed">
                        Visualize golden light surrounding you, bringing clarity
                        and positive energy to your path.
                      </p>
                    </div>

                    {/* Affirmation */}
                    <div className="bg-purple-900/40 rounded-lg p-4 mt-6 border border-purple-500/30">
                      <h5 className="text-purple-200 font-semibold text-base mb-3">
                        Today's Affirmation
                      </h5>
                      <p className="text-purple-100 text-base italic leading-relaxed">
                        "I am aligned with the cosmic flow and open to the
                        opportunities this day brings."
                      </p>
                    </div>

                    {/* Birth Chart CTA */}
                    <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-6 mt-8 border border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-amber-200 font-semibold text-lg mb-2">
                            Want More Personal Insights?
                          </h5>
                          <p className="text-amber-100 text-sm leading-relaxed mb-4">
                            While daily horoscopes provide general guidance,
                            your personal birth chart reveals much deeper
                            insights tailored specifically to you. Create your
                            free birth chart to unlock personalized predictions,
                            compatibility analysis, and detailed life guidance.
                          </p>
                          <Button
                            onClick={() => navigate("/astrology/birth-chart")}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                            size="sm"
                          >
                            Get Your Free Birth Chart
                          </Button>
                        </div>
                        <div className="ml-6 hidden md:block">
                          <Star className="w-16 h-16 text-amber-400 opacity-50" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Scores */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="text-center bg-dark-800/50 rounded-xl p-4 border border-pink-500/20">
                      <div className="text-3xl font-bold text-pink-400 mb-2">
                        {todayHoroscope.love_score ||
                          Math.floor(Math.random() * 30) + 70}
                        %
                      </div>
                      <div className="text-sm font-medium text-gray-300">
                        Love & Romance
                      </div>
                    </div>
                    <div className="text-center bg-dark-800/50 rounded-xl p-4 border border-green-500/20">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {todayHoroscope.career_score ||
                          Math.floor(Math.random() * 30) + 70}
                        %
                      </div>
                      <div className="text-sm font-medium text-gray-300">
                        Career & Money
                      </div>
                    </div>
                    <div className="text-center bg-dark-800/50 rounded-xl p-4 border border-blue-500/20">
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {todayHoroscope.health_score ||
                          Math.floor(Math.random() * 30) + 70}
                        %
                      </div>
                      <div className="text-sm font-medium text-gray-300">
                        Health & Wellness
                      </div>
                    </div>
                  </div>

                  {/* Lucky Elements */}
                  <div className="bg-dark-800/30 rounded-xl p-4 mb-6">
                    <h5 className="text-white font-semibold text-base mb-4">
                      Lucky Elements
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-400 text-sm font-medium block mb-2">
                          Lucky Colors:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(
                            todayHoroscope.lucky_colors || ["Purple", "Gold"]
                          ).map((color, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-sm font-medium shadow-lg"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 text-sm font-medium block mb-2">
                          Lucky Numbers:
                        </span>
                        <div className="flex items-center gap-3">
                          {(todayHoroscope.lucky_numbers || [7, 14, 21]).map(
                            (number, index) => (
                              <span
                                key={index}
                                className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
                              >
                                {number}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    No horoscope available for this date.
                  </p>
                  <Button
                    onClick={async () => {
                      await generateDailyHoroscopes(selectedDate);
                      if (selectedSign) {
                        const horoscope = await fetchDailyHoroscope(
                          selectedSign,
                          selectedDate,
                        );
                        setTodayHoroscope(horoscope);
                      }
                    }}
                    variant="outline"
                  >
                    Generate Horoscope
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default HoroscopesPage;
