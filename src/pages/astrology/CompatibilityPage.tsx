import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ArrowLeft,
  Plus,
  Users,
  Star,
  Calculator,
  Download,
  Eye,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Crown,
  Info,
  Smartphone,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import CompatibilityChart from "../../components/astrology/CompatibilityChart";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getZodiacSign } from "../../utils/astronomicalCalculations";

const CompatibilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    birthCharts,
    compatibilityReports,
    loading,
    fetchBirthCharts,
    fetchCompatibilityReports,
    createCompatibilityReport,
  } = useAstrologyStore();

  const [selectedChart1, setSelectedChart1] = useState<string>("");
  const [selectedChart2, setSelectedChart2] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [filterByScore, setFilterByScore] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [isMobile, setIsMobile] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check premium status
  useEffect(() => {
    // TODO: Implement actual premium check from user subscription
    setIsPremiumUser(user?.subscription_plan !== "free");
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const loadData = async () => {
        try {
          await Promise.all([
            fetchBirthCharts(user.id),
            fetchCompatibilityReports(user.id),
          ]);
        } catch (error) {
          console.error("Error loading compatibility data:", error);
        }
      };
      loadData();
    }
  }, [isAuthenticated, user]);

  const handleGenerateCompatibility = async () => {
    if (
      !selectedChart1 ||
      !selectedChart2 ||
      selectedChart1 === selectedChart2
    ) {
      return;
    }

    setIsGenerating(true);
    try {
      const newReport = await createCompatibilityReport(
        selectedChart1,
        selectedChart2,
      );
      // Refresh compatibility reports
      if (user) {
        await fetchCompatibilityReports(user.id);
      }
      // Reset selections
      setSelectedChart1("");
      setSelectedChart2("");
      // Show the new report
      if (newReport) {
        setSelectedReport(newReport);
        setShowDetailedAnalysis(true);
      }
    } catch (error) {
      console.error("Error generating compatibility report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCompatibilityLevel = (score: number) => {
    if (score >= 80)
      return {
        level: "Excellent",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
      };
    if (score >= 70)
      return {
        level: "Very Good",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
      };
    if (score >= 60)
      return {
        level: "Good",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
      };
    if (score >= 50)
      return {
        level: "Fair",
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
      };
    return {
      level: "Challenging",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    };
  };

  const filteredReports = compatibilityReports.filter((report) => {
    if (filterByScore === "all") return true;
    if (filterByScore === "high") return report.compatibility_score >= 70;
    if (filterByScore === "medium")
      return (
        report.compatibility_score >= 50 && report.compatibility_score < 70
      );
    if (filterByScore === "low") return report.compatibility_score < 50;
    return true;
  });

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
      <PageLayout title="Compatibility Analysis - Mystic Banana">
        <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Heart className="w-16 h-16 text-pink-400 mr-4" />
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white">
                  Relationship Compatibility
                </h1>
              </div>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Discover the cosmic connections between you and your loved ones
                through detailed astrological compatibility analysis. Understand
                your relationship dynamics, strengths, and growth opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-3 text-lg"
                >
                  Sign Up to Get Started
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 text-lg"
                >
                  Sign In
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 rounded-2xl p-6 border border-pink-500/20 text-center">
                <Calculator className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Detailed Analysis
                </h3>
                <p className="text-gray-300">
                  Comprehensive compatibility scoring based on planetary
                  positions, aspects, and elemental harmony.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-500/20 text-center">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Relationship Insights
                </h3>
                <p className="text-gray-300">
                  Understand your relationship dynamics, communication styles,
                  and areas for growth.
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/20 text-center">
                <Download className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Professional Reports
                </h3>
                <p className="text-gray-300">
                  Download detailed PDF reports with personalized guidance and
                  recommendations.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 mb-12">
              <h2 className="text-2xl font-serif font-bold text-white text-center mb-8">
                How Compatibility Analysis Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-white font-medium mb-2">
                    Create Birth Charts
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Generate accurate birth charts for both individuals with
                    precise birth data
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-white font-medium mb-2">
                    Analyze Aspects
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Calculate planetary aspects and angles between both charts
                    for compatibility insights
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-white font-medium mb-2">
                    Synastry Analysis
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Compare how each person's planets interact with their
                    partner's chart
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">4</span>
                  </div>
                  <h3 className="text-white font-medium mb-2">
                    Generate Report
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Receive detailed compatibility score and personalized
                    relationship guidance
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-2xl p-8 border border-pink-500/20 text-center">
              <h2 className="text-2xl font-serif font-bold text-white mb-4">
                Ready to Explore Your Cosmic Connection?
              </h2>
              <p className="text-gray-300 mb-6">
                Join thousands of couples who have discovered deeper
                understanding through astrological compatibility analysis.
              </p>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-3 text-lg"
                icon={Heart}
              >
                Start Your Compatibility Journey
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Compatibility Analysis - Mystic Banana">
      <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div
            className={`flex ${isMobile ? "flex-col space-y-4" : "items-center justify-between"} mb-8`}
          >
            <div className="flex items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1
                  className={`${isMobile ? "text-2xl" : "text-3xl md:text-4xl"} font-serif font-bold text-white mb-2`}
                >
                  Compatibility Analysis
                </h1>
                <p className="text-gray-400">
                  Explore relationship dynamics through astrology
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isMobile && <Smartphone className="w-6 h-6 text-blue-400" />}
              {isPremiumUser && <Crown className="w-6 h-6 text-yellow-400" />}
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Enhanced Compatibility Features */}
              {isPremiumUser && (
                <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-2xl p-6 border border-yellow-500/20">
                  <div className="flex items-center mb-4">
                    <Crown className="w-6 h-6 text-yellow-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">
                      Premium Features Active
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-yellow-300">
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span>Detailed Analysis</span>
                    </div>
                    <div className="flex items-center text-yellow-300">
                      <Target className="w-4 h-4 mr-2" />
                      <span>Relationship Strengths</span>
                    </div>
                    <div className="flex items-center text-yellow-300">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span>Growth Opportunities</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Controls */}
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Filter Reports
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={filterByScore}
                      onChange={(e) => setFilterByScore(e.target.value as any)}
                      className="bg-dark-600 border border-dark-500 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">All Scores</option>
                      <option value="high">High (70%+)</option>
                      <option value="medium">Medium (50-69%)</option>
                      <option value="low">Low (Below 50%)</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Showing {filteredReports.length} of{" "}
                  {compatibilityReports.length} reports
                </div>
              </div>

              {/* Full Compatibility Chart Component */}
              <CompatibilityChart
                showHeader={false}
                maxItems={10}
                showDetailedAnalysis={isPremiumUser}
                isPremiumUser={isPremiumUser}
              />

              {/* Compatibility Tips */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Info className="w-6 h-6 mr-3 text-purple-400" />
                  Understanding Compatibility Scores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">
                      Score Ranges:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">80-100%</span>
                        <span className="text-green-400 font-medium">
                          Excellent Match
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">60-79%</span>
                        <span className="text-yellow-400 font-medium">
                          Good Compatibility
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">40-59%</span>
                        <span className="text-orange-400 font-medium">
                          Fair Match
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Below 40%</span>
                        <span className="text-red-400 font-medium">
                          Challenging
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">
                      What We Analyze:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Sun, Moon, and Rising sign compatibility</li>
                      <li>• Venus and Mars relationship dynamics</li>
                      <li>• Elemental harmony (Fire, Earth, Air, Water)</li>
                      <li>• Planetary aspects between charts</li>
                      <li>• Communication and emotional compatibility</li>
                      {isPremiumUser && (
                        <>
                          <li className="text-yellow-300">
                            • Detailed synastry analysis
                          </li>
                          <li className="text-yellow-300">
                            • Composite chart insights
                          </li>
                          <li className="text-yellow-300">
                            • Relationship timing
                          </li>
                        </>
                      )}
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

export default CompatibilityPage;
