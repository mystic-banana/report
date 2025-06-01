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
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 rounded-2xl p-8 border border-pink-500/20">
                <Heart className="w-16 h-16 text-pink-400 mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-bold text-white mb-4">
                  Relationship Compatibility Analysis
                </h1>
                <p className="text-gray-300 mb-8">
                  Discover the cosmic connections between you and your loved
                  ones through detailed astrological compatibility reports.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate("/signup")}
                    className="bg-gradient-to-r from-pink-600 to-rose-600"
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
    <PageLayout title="Compatibility Analysis - Mystic Banana">
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
                  Compatibility Analysis
                </h1>
                <p className="text-gray-400">
                  Explore relationship dynamics through astrology
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {birthCharts.length}
              </p>
              <p className="text-gray-400 text-sm">Birth Charts</p>
            </div>
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center">
              <Users className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {compatibilityReports.length}
              </p>
              <p className="text-gray-400 text-sm">Compatibility Reports</p>
            </div>
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center">
              <Heart className="w-8 h-8 text-rose-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {
                  compatibilityReports.filter(
                    (r) => r.compatibility_score >= 70,
                  ).length
                }
              </p>
              <p className="text-gray-400 text-sm">High Compatibility</p>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Compatibility Generator */}
              {birthCharts.length >= 2 && (
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Calculator className="w-6 h-6 mr-3 text-purple-400" />
                    Generate New Compatibility Report
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select First Birth Chart
                      </label>
                      <select
                        value={selectedChart1}
                        onChange={(e) => setSelectedChart1(e.target.value)}
                        className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Choose a birth chart...</option>
                        {birthCharts.map((chart) => {
                          const zodiacSign = getZodiacSign(chart.birth_date);
                          return (
                            <option key={chart.id} value={chart.id}>
                              {zodiacSymbols[zodiacSign]} {chart.name} (
                              {new Date(chart.birth_date).toLocaleDateString()})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Second Birth Chart
                      </label>
                      <select
                        value={selectedChart2}
                        onChange={(e) => setSelectedChart2(e.target.value)}
                        className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Choose a birth chart...</option>
                        {birthCharts
                          .filter((chart) => chart.id !== selectedChart1)
                          .map((chart) => {
                            const zodiacSign = getZodiacSign(chart.birth_date);
                            return (
                              <option key={chart.id} value={chart.id}>
                                {zodiacSymbols[zodiacSign]} {chart.name} (
                                {new Date(
                                  chart.birth_date,
                                ).toLocaleDateString()}
                                )
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>

                  {/* Preview Selected Charts */}
                  {selectedChart1 && selectedChart2 && (
                    <div className="bg-dark-800/50 rounded-xl p-4 mb-6">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Compatibility Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[selectedChart1, selectedChart2].map(
                          (chartId, index) => {
                            const chart = birthCharts.find(
                              (c) => c.id === chartId,
                            );
                            if (!chart) return null;
                            const zodiacSign = getZodiacSign(chart.birth_date);
                            return (
                              <div
                                key={chartId}
                                className="bg-dark-700/50 rounded-lg p-3"
                              >
                                <div className="flex items-center">
                                  <span className="text-2xl mr-3">
                                    {zodiacSymbols[zodiacSign]}
                                  </span>
                                  <div>
                                    <p className="text-white font-medium">
                                      {chart.name}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                      {zodiacSign} •{" "}
                                      {new Date(
                                        chart.birth_date,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <Button
                      onClick={handleGenerateCompatibility}
                      disabled={
                        !selectedChart1 ||
                        !selectedChart2 ||
                        selectedChart1 === selectedChart2 ||
                        isGenerating
                      }
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 text-lg"
                      icon={isGenerating ? undefined : Heart}
                    >
                      {isGenerating ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">
                            Analyzing Cosmic Connection...
                          </span>
                        </div>
                      ) : (
                        "Generate Compatibility Report"
                      )}
                    </Button>
                    {selectedChart1 && selectedChart2 && (
                      <p className="text-gray-400 text-sm mt-2">
                        <Zap className="w-4 h-4 inline mr-1" />
                        Analysis includes planetary aspects, elemental harmony,
                        and relationship dynamics
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Compatibility Reports List */}
              {compatibilityReports.length > 0 && (
                <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <Users className="w-6 h-6 mr-3 text-pink-400" />
                      Your Compatibility Reports
                    </h3>
                    <div className="flex items-center space-x-2">
                      <select
                        value={filterByScore}
                        onChange={(e) =>
                          setFilterByScore(e.target.value as any)
                        }
                        className="bg-dark-700 border border-dark-600 text-white rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">All Reports</option>
                        <option value="high">High Compatibility (70%+)</option>
                        <option value="medium">
                          Medium Compatibility (50-69%)
                        </option>
                        <option value="low">Challenging (Below 50%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredReports.map((report) => {
                      const chart1 = birthCharts.find(
                        (c) => c.id === report.chart1_id,
                      );
                      const chart2 = birthCharts.find(
                        (c) => c.id === report.chart2_id,
                      );
                      if (!chart1 || !chart2) return null;

                      const sign1 = getZodiacSign(chart1.birth_date);
                      const sign2 = getZodiacSign(chart2.birth_date);
                      const compatibility = getCompatibilityLevel(
                        report.compatibility_score,
                      );

                      return (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                <span className="text-2xl">
                                  {zodiacSymbols[sign1]}
                                </span>
                                <Heart className="w-4 h-4 text-pink-400 mx-2" />
                                <span className="text-2xl">
                                  {zodiacSymbols[sign2]}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium ${compatibility.bgColor} ${compatibility.color}`}
                            >
                              {report.compatibility_score}% •{" "}
                              {compatibility.level}
                            </div>
                          </div>

                          {/* Names */}
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-white mb-1">
                              {chart1.name} & {chart2.name}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {sign1} + {sign2} • Generated{" "}
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Compatibility Score Visualization */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-300 text-sm">
                                Compatibility Score
                              </span>
                              <span
                                className={`font-bold ${compatibility.color}`}
                              >
                                {report.compatibility_score}%
                              </span>
                            </div>
                            <div className="w-full bg-dark-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  report.compatibility_score >= 70
                                    ? "bg-gradient-to-r from-green-500 to-blue-500"
                                    : report.compatibility_score >= 50
                                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                      : "bg-gradient-to-r from-red-500 to-pink-500"
                                }`}
                                style={{
                                  width: `${report.compatibility_score}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Quick Insights */}
                          <div className="mb-4">
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {report.report_content ||
                                "Detailed compatibility analysis based on planetary positions, aspects, and elemental harmony."}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setShowDetailedAnalysis(true);
                              }}
                              className="text-pink-400 hover:text-pink-300"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Compatibility Tips */}
              <div className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-2xl p-6 border border-pink-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Relationship Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">
                      Building Harmony
                    </h4>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Focus on complementary strengths</li>
                      <li>• Communicate during challenging transits</li>
                      <li>• Celebrate your unique differences</li>
                      <li>
                        • Plan important decisions during favorable aspects
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">
                      Growth Areas
                    </h4>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Work through square aspects together</li>
                      <li>• Balance individual needs with partnership</li>
                      <li>• Use opposition aspects for mutual growth</li>
                      <li>• Practice patience during Mercury retrograde</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Need More Charts? */}
              {birthCharts.length < 2 && (
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 border border-purple-500/20 text-center">
                  <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Create More Birth Charts
                  </h3>
                  <p className="text-gray-300 mb-6">
                    You need at least 2 birth charts to generate compatibility
                    reports. Create charts for yourself and your loved ones.
                  </p>
                  <Button
                    onClick={() => navigate("/astrology/birth-chart")}
                    icon={Plus}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    Create Birth Chart
                  </Button>
                </div>
              )}

              {/* Detailed Analysis Modal */}
              {showDetailedAnalysis && selectedReport && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">
                          Detailed Compatibility Analysis
                        </h3>
                        <Button
                          variant="ghost"
                          onClick={() => setShowDetailedAnalysis(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </Button>
                      </div>

                      {(() => {
                        const chart1 = birthCharts.find(
                          (c) => c.id === selectedReport.chart1_id,
                        );
                        const chart2 = birthCharts.find(
                          (c) => c.id === selectedReport.chart2_id,
                        );
                        if (!chart1 || !chart2) return null;

                        const sign1 = getZodiacSign(chart1.birth_date);
                        const sign2 = getZodiacSign(chart2.birth_date);
                        const compatibility = getCompatibilityLevel(
                          selectedReport.compatibility_score,
                        );

                        return (
                          <div className="space-y-6">
                            {/* Header */}
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-4 mb-4">
                                <div className="text-center">
                                  <span className="text-4xl block">
                                    {zodiacSymbols[sign1]}
                                  </span>
                                  <p className="text-white font-medium">
                                    {chart1.name}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    {sign1}
                                  </p>
                                </div>
                                <Heart className="w-8 h-8 text-pink-400" />
                                <div className="text-center">
                                  <span className="text-4xl block">
                                    {zodiacSymbols[sign2]}
                                  </span>
                                  <p className="text-white font-medium">
                                    {chart2.name}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    {sign2}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${compatibility.bgColor} ${compatibility.color}`}
                              >
                                {selectedReport.compatibility_score}%
                                Compatibility • {compatibility.level}
                              </div>
                            </div>

                            {/* Analysis Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-dark-700/50 rounded-xl p-4">
                                <h4 className="text-white font-semibold mb-3 flex items-center">
                                  <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                                  Strengths
                                </h4>
                                <ul className="text-gray-300 space-y-2 text-sm">
                                  <li>
                                    • Strong emotional connection and
                                    understanding
                                  </li>
                                  <li>• Complementary personality traits</li>
                                  <li>• Shared values and life goals</li>
                                  <li>• Natural communication flow</li>
                                </ul>
                              </div>

                              <div className="bg-dark-700/50 rounded-xl p-4">
                                <h4 className="text-white font-semibold mb-3 flex items-center">
                                  <Target className="w-5 h-5 mr-2 text-orange-400" />
                                  Growth Areas
                                </h4>
                                <ul className="text-gray-300 space-y-2 text-sm">
                                  <li>
                                    • Different approaches to decision-making
                                  </li>
                                  <li>• Need for patience during conflicts</li>
                                  <li>
                                    • Balancing independence and togetherness
                                  </li>
                                  <li>
                                    • Understanding different emotional needs
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Detailed Report Content */}
                            <div className="bg-dark-700/30 rounded-xl p-6">
                              <h4 className="text-white font-semibold mb-4">
                                Full Analysis
                              </h4>
                              <p className="text-gray-300 leading-relaxed">
                                {selectedReport.report_content ||
                                  `The compatibility between ${chart1.name} (${sign1}) and ${chart2.name} (${sign2}) shows a ${compatibility.level.toLowerCase()} connection with a score of ${selectedReport.compatibility_score}%. This analysis is based on the planetary positions, aspects, and elemental harmony between your birth charts. The cosmic energies suggest areas of natural harmony as well as opportunities for growth and understanding in your relationship.`}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-center space-x-4">
                              <Button className="bg-gradient-to-r from-pink-600 to-purple-600">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF Report
                              </Button>
                              <Button variant="outline">
                                <Users className="w-4 h-4 mr-2" />
                                Share Analysis
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* How It Works */}
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                <h3 className="text-xl font-semibold text-white mb-6">
                  How Compatibility Analysis Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">
                      Planetary Positions
                    </h4>
                    <p className="text-gray-400 text-sm">
                      We analyze the positions of planets in both birth charts
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">Aspects</h4>
                    <p className="text-gray-400 text-sm">
                      Calculate the angles between planets to find harmonious or
                      challenging connections
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">Synastry</h4>
                    <p className="text-gray-400 text-sm">
                      Compare how each person's planets interact with the
                      other's
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">Score</h4>
                    <p className="text-gray-400 text-sm">
                      Generate a compatibility percentage and detailed analysis
                    </p>
                  </div>
                </div>
              </div>

              {/* Premium Features */}
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/20">
                <div className="flex items-center mb-4">
                  <Crown className="w-6 h-6 text-amber-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">
                    Premium Compatibility Features
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      Advanced Analysis
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                        Composite chart generation
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                        Detailed aspect analysis
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                        Relationship timeline predictions
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                        Communication style analysis
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      Professional Reports
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li>• 20+ page detailed PDF reports</li>
                      <li>• Personalized relationship advice</li>
                      <li>• Conflict resolution strategies</li>
                      <li>• Long-term compatibility forecasts</li>
                      <li>• Custom relationship remedies</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => navigate("/plans")}
                    className="bg-gradient-to-r from-amber-600 to-orange-600"
                  >
                    Upgrade to Premium
                  </Button>
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
