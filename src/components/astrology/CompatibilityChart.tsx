import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Eye,
  Sparkles,
  Info,
  BarChart3,
  Zap,
  HelpCircle,
  Filter,
  SortAsc,
  Grid,
  List,
} from "lucide-react";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Link } from "react-router-dom";
import { FixedSizeList as VirtualList } from "react-window";

interface CompatibilityChartProps {
  className?: string;
  showHeader?: boolean;
  maxItems?: number;
  showDetailedAnalysis?: boolean;
  isPremiumUser?: boolean;
  enableVirtualization?: boolean;
  showTutorial?: boolean;
  theme?: "default" | "cosmic" | "elegant";
}

interface EnhancedCompatibilityAnalysis {
  elementalHarmony: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalityBalance: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  aspectPatterns: {
    harmonious: number;
    challenging: number;
    neutral: number;
  };
  compositeChart?: any;
  progressedCompatibility?: number;
}

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string;
}

const CompatibilityChart: React.FC<CompatibilityChartProps> = memo(
  ({
    className = "",
    showHeader = true,
    maxItems = 3,
    showDetailedAnalysis = false,
    isPremiumUser = false,
    enableVirtualization = false,
    showTutorial = false,
    theme = "default",
  }) => {
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
    const [isCreating, setIsCreating] = useState(false);
    const [sortBy, setSortBy] = useState<"date" | "score" | "name">("date");
    const [filterBy, setFilterBy] = useState<
      "all" | "excellent" | "good" | "fair"
    >("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [showTutorialModal, setShowTutorialModal] = useState(showTutorial);
    const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
    const [enhancedAnalysis, setEnhancedAnalysis] = useState<
      Map<string, EnhancedCompatibilityAnalysis>
    >(new Map());

    useEffect(() => {
      if (isAuthenticated && user) {
        fetchBirthCharts(user.id);
        fetchCompatibilityReports(user.id);
      }
    }, [isAuthenticated, user]);

    // Memoized compatibility analysis calculations
    const enhancedCompatibilityAnalysis = useMemo(() => {
      return compatibilityReports.map((report) => {
        const chart1 = birthCharts.find((c) => c.id === report.chart1_id);
        const chart2 = birthCharts.find((c) => c.id === report.chart2_id);

        if (!chart1 || !chart2) return report;

        // Enhanced analysis calculations
        const elementalHarmony = calculateElementalHarmony(
          chart1.chart_data,
          chart2.chart_data,
        );
        const modalityBalance = calculateModalityBalance(
          chart1.chart_data,
          chart2.chart_data,
        );
        const aspectPatterns = calculateAspectPatterns(
          chart1.chart_data,
          chart2.chart_data,
        );

        return {
          ...report,
          enhancedAnalysis: {
            elementalHarmony,
            modalityBalance,
            aspectPatterns,
            compositeChart: isPremiumUser
              ? calculateCompositeChart(chart1.chart_data, chart2.chart_data)
              : null,
            progressedCompatibility: isPremiumUser
              ? calculateProgressedCompatibility(
                  chart1.chart_data,
                  chart2.chart_data,
                )
              : null,
          },
        };
      });
    }, [compatibilityReports, birthCharts, isPremiumUser]);

    // Memoized filtered and sorted reports
    const filteredAndSortedReports = useMemo(() => {
      let filtered = enhancedCompatibilityAnalysis;

      // Apply filters
      if (filterBy !== "all") {
        filtered = filtered.filter((report) => {
          const score = report.compatibility_score;
          switch (filterBy) {
            case "excellent":
              return score >= 80;
            case "good":
              return score >= 60 && score < 80;
            case "fair":
              return score >= 40 && score < 60;
            default:
              return true;
          }
        });
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "score":
            return b.compatibility_score - a.compatibility_score;
          case "name":
            const nameA =
              birthCharts.find((c) => c.id === a.chart1_id)?.name || "";
            const nameB =
              birthCharts.find((c) => c.id === b.chart1_id)?.name || "";
            return nameA.localeCompare(nameB);
          case "date":
          default:
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
        }
      });

      return filtered;
    }, [enhancedCompatibilityAnalysis, sortBy, filterBy, birthCharts]);

    const handleCreateCompatibility = useCallback(async () => {
      if (
        !selectedChart1 ||
        !selectedChart2 ||
        selectedChart1 === selectedChart2
      ) {
        return;
      }

      setIsCreating(true);
      try {
        await createCompatibilityReport(selectedChart1, selectedChart2);
        setSelectedChart1("");
        setSelectedChart2("");
      } catch (error) {
        console.error("Error creating compatibility report:", error);
      } finally {
        setIsCreating(false);
      }
    }, [selectedChart1, selectedChart2, createCompatibilityReport]);

    // Memoized helper functions
    const getCompatibilityColor = useCallback((score: number) => {
      if (score >= 80) return "text-green-400";
      if (score >= 60) return "text-yellow-400";
      if (score >= 40) return "text-orange-400";
      return "text-red-400";
    }, []);

    const getCompatibilityLabel = useCallback((score: number) => {
      if (score >= 80) return "Excellent";
      if (score >= 60) return "Good";
      if (score >= 40) return "Fair";
      return "Challenging";
    }, []);

    const getDetailedCompatibilityAnalysis = (
      score: number,
      chart1Name: string,
      chart2Name: string,
    ) => {
      if (score >= 80) {
        return `${chart1Name} and ${chart2Name} share exceptional cosmic harmony. Your planetary energies complement each other beautifully, creating a relationship filled with mutual understanding, shared values, and natural flow. This connection supports both personal growth and partnership stability.`;
      } else if (score >= 60) {
        return `${chart1Name} and ${chart2Name} have strong compatibility with great potential for a fulfilling relationship. While there may be some areas that require understanding and compromise, your core energies align well and support each other's growth and happiness.`;
      } else if (score >= 40) {
        return `${chart1Name} and ${chart2Name} have moderate compatibility with both harmonious and challenging aspects. This relationship offers opportunities for growth through understanding differences. With conscious effort and communication, you can build a strong and meaningful connection.`;
      } else {
        return `${chart1Name} and ${chart2Name} face some astrological challenges that require extra understanding and patience. While this may seem difficult, these differences can actually lead to profound personal growth and a deeper appreciation of each other's unique qualities when approached with love and awareness.`;
      }
    };

    const getCompatibilityStrengths = (score: number) => {
      if (score >= 80) {
        return [
          "Natural understanding",
          "Shared values",
          "Emotional harmony",
          "Mutual support",
          "Easy communication",
        ];
      } else if (score >= 60) {
        return [
          "Good communication",
          "Shared interests",
          "Mutual respect",
          "Complementary strengths",
        ];
      } else if (score >= 40) {
        return [
          "Learning opportunities",
          "Growth potential",
          "Unique perspectives",
          "Balancing energies",
        ];
      } else {
        return [
          "Character building",
          "Deep learning",
          "Patience development",
          "Appreciation of differences",
        ];
      }
    };

    const getCompatibilityGrowthAreas = (score: number) => {
      if (score >= 80) {
        return [
          "Maintaining independence",
          "Avoiding complacency",
          "Continuing to grow together",
        ];
      } else if (score >= 60) {
        return [
          "Understanding differences",
          "Improving communication",
          "Building deeper trust",
        ];
      } else if (score >= 40) {
        return [
          "Patience and understanding",
          "Active listening",
          "Finding common ground",
          "Respecting boundaries",
        ];
      } else {
        return [
          "Open communication",
          "Patience and compassion",
          "Professional guidance",
          "Focus on personal growth",
        ];
      }
    };

    if (!isAuthenticated) {
      return (
        <div
          className={`bg-dark-800 rounded-2xl p-6 border border-dark-700 ${className}`}
        >
          <div className="text-center">
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Compatibility Analysis
            </h3>
            <p className="text-gray-400 mb-4">
              Sign in to explore relationship compatibility through astrology
            </p>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-pink-600 to-rose-600">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div
          className={`bg-dark-800 rounded-2xl p-6 border border-dark-700 ${className}`}
        >
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      );
    }

    return (
      <div
        className={`bg-dark-800 rounded-2xl p-6 border border-dark-700 ${className}`}
      >
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Heart
                className="w-6 h-6 text-pink-400 mr-3"
                aria-hidden="true"
              />
              <h3
                className="text-xl font-semibold text-white"
                id="compatibility-title"
              >
                Compatibility Analysis
              </h3>
            </div>
            <Link to="/astrology/compatibility">
              <Button variant="ghost" size="sm" icon={Eye}>
                View All
              </Button>
            </Link>
          </div>
        )}

        {/* Create New Compatibility Report */}
        {birthCharts.length >= 2 && (
          <div className="bg-dark-700/50 rounded-xl p-4 mb-6">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-pink-400" />
              Create New Report
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={selectedChart1}
                onChange={(e) => setSelectedChart1(e.target.value)}
                className="bg-dark-600 border border-dark-500 text-white rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Select first person</option>
                {birthCharts.map((chart) => (
                  <option key={chart.id} value={chart.id}>
                    {chart.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedChart2}
                onChange={(e) => setSelectedChart2(e.target.value)}
                className="bg-dark-600 border border-dark-500 text-white rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Select second person</option>
                {birthCharts
                  .filter((chart) => chart.id !== selectedChart1)
                  .map((chart) => (
                    <option key={chart.id} value={chart.id}>
                      {chart.name}
                    </option>
                  ))}
              </select>
            </div>
            <Button
              onClick={handleCreateCompatibility}
              disabled={!selectedChart1 || !selectedChart2 || isCreating}
              loading={isCreating}
              className="bg-gradient-to-r from-pink-600 to-rose-600 w-full"
            >
              Generate Compatibility Report
            </Button>
          </div>
        )}

        {/* Enhanced Controls */}
        {compatibilityReports.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-dark-700/30 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="bg-dark-600 border border-dark-500 text-white rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Reports</option>
                  <option value="excellent">Excellent (80%+)</option>
                  <option value="good">Good (60-79%)</option>
                  <option value="fair">Fair (40-59%)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-dark-600 border border-dark-500 text-white rounded px-3 py-1 text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-pink-600 text-white" : "bg-dark-600 text-gray-400"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-pink-600 text-white" : "bg-dark-600 text-gray-400"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              {showTutorial && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTutorialModal(true)}
                  icon={HelpCircle}
                >
                  Tutorial
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Existing Compatibility Reports */}
        {filteredAndSortedReports.length > 0 ? (
          <div
            className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}`}
          >
            {enableVirtualization && filteredAndSortedReports.length > 10 ? (
              <VirtualizedReportList
                reports={filteredAndSortedReports.slice(0, maxItems)}
                birthCharts={birthCharts}
                getCompatibilityColor={getCompatibilityColor}
                getCompatibilityLabel={getCompatibilityLabel}
                isPremiumUser={isPremiumUser}
                showDetailedAnalysis={showDetailedAnalysis}
                theme={theme}
              />
            ) : (
              filteredAndSortedReports.slice(0, maxItems).map((report) => {
                const chart1 = birthCharts.find(
                  (c) => c.id === report.chart1_id,
                );
                const chart2 = birthCharts.find(
                  (c) => c.id === report.chart2_id,
                );

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-pink-900/20 to-rose-900/20 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-pink-400 mr-2" />
                        <span className="text-white font-medium">
                          {chart1?.name} & {chart2?.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`text-2xl font-bold mr-2 ${getCompatibilityColor(
                            report.compatibility_score,
                          )}`}
                        >
                          {report.compatibility_score}%
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${getCompatibilityColor(
                            report.compatibility_score,
                          )} bg-current bg-opacity-20`}
                        >
                          {getCompatibilityLabel(report.compatibility_score)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {getDetailedCompatibilityAnalysis(
                        report.compatibility_score,
                        chart1?.name || "Person 1",
                        chart2?.name || "Person 2",
                      )}
                    </p>

                    {/* Enhanced Analysis for Premium Users */}
                    {isPremiumUser &&
                      showDetailedAnalysis &&
                      report.enhancedAnalysis && (
                        <div className="mt-4 space-y-3">
                          {/* Elemental Harmony */}
                          <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-3 border border-blue-500/20">
                            <h5 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                              <Zap className="w-4 h-4 mr-1" />
                              Elemental Harmony:
                            </h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(
                                report.enhancedAnalysis.elementalHarmony,
                              ).map(([element, score]) => (
                                <div
                                  key={element}
                                  className="flex justify-between"
                                >
                                  <span className="capitalize text-gray-300">
                                    {element}:
                                  </span>
                                  <span
                                    className={`font-medium ${score > 0.7 ? "text-green-400" : score > 0.4 ? "text-yellow-400" : "text-red-400"}`}
                                  >
                                    {(score * 100).toFixed(0)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Aspect Patterns */}
                          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-3 border border-purple-500/20">
                            <h5 className="text-sm font-medium text-purple-300 mb-2 flex items-center">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Aspect Analysis:
                            </h5>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-green-400 font-bold">
                                  {
                                    report.enhancedAnalysis.aspectPatterns
                                      .harmonious
                                  }
                                </div>
                                <div className="text-gray-400">Harmonious</div>
                              </div>
                              <div className="text-center">
                                <div className="text-red-400 font-bold">
                                  {
                                    report.enhancedAnalysis.aspectPatterns
                                      .challenging
                                  }
                                </div>
                                <div className="text-gray-400">Challenging</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-400 font-bold">
                                  {
                                    report.enhancedAnalysis.aspectPatterns
                                      .neutral
                                  }
                                </div>
                                <div className="text-gray-400">Neutral</div>
                              </div>
                            </div>
                          </div>

                          {/* Composite Chart Preview */}
                          {report.enhancedAnalysis.compositeChart && (
                            <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-3 border border-amber-500/20">
                              <h5 className="text-sm font-medium text-amber-300 mb-2">
                                Composite Chart Highlights:
                              </h5>
                              <p className="text-xs text-gray-300">
                                {report.enhancedAnalysis.compositeChart
                                  .summary ||
                                  "Advanced composite analysis available"}
                              </p>
                            </div>
                          )}

                          {/* Traditional Analysis */}
                          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-3 border border-green-500/20">
                            <h5 className="text-sm font-medium text-green-300 mb-2">
                              Relationship Strengths:
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {getCompatibilityStrengths(
                                report.compatibility_score,
                              ).map((strength, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full"
                                >
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-3 border border-amber-500/20">
                            <h5 className="text-sm font-medium text-amber-300 mb-2">
                              Growth Opportunities:
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {getCompatibilityGrowthAreas(
                                report.compatibility_score,
                              ).map((area, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        {isPremiumUser && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full flex items-center">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Premium
                          </span>
                        )}
                        <Button variant="ghost" size="sm" icon={ArrowRight}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">
              No Compatibility Reports Yet
            </h4>
            <p className="text-gray-500 mb-4">
              {birthCharts.length < 2
                ? "Create at least 2 birth charts to analyze compatibility"
                : "Generate your first compatibility report above"}
            </p>
            {birthCharts.length < 2 && (
              <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-4 border border-blue-500/20 mt-4">
                <h5 className="text-sm font-medium text-blue-300 mb-2">
                  How Compatibility Analysis Works:
                </h5>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>
                    • Compare planetary positions between two birth charts
                  </li>
                  <li>• Analyze aspects and elemental harmony</li>
                  <li>• Evaluate relationship dynamics and potential</li>
                  <li>• Provide personalized insights and guidance</li>
                </ul>
              </div>
            )}
            <Link to="/astrology/birth-chart">
              <Button variant="outline" icon={Plus}>
                Create Birth Chart
              </Button>
            </Link>
          </div>
        )}

        {filteredAndSortedReports.length > maxItems && (
          <div className="mt-4 text-center">
            <Link to="/astrology/compatibility">
              <Button variant="ghost" icon={ArrowRight}>
                View All {filteredAndSortedReports.length} Reports
              </Button>
            </Link>
          </div>
        )}

        {/* Tutorial Modal */}
        <AnimatePresence>
          {showTutorialModal && (
            <TutorialModal
              onClose={() => setShowTutorialModal(false)}
              currentStep={currentTutorialStep}
              onStepChange={setCurrentTutorialStep}
            />
          )}
        </AnimatePresence>
      </div>
    );
  },
);

// Helper calculation functions
const calculateElementalHarmony = (chart1: any, chart2: any) => {
  // Enhanced elemental harmony calculation
  return {
    fire: Math.random() * 0.4 + 0.6, // Mock calculation
    earth: Math.random() * 0.4 + 0.6,
    air: Math.random() * 0.4 + 0.6,
    water: Math.random() * 0.4 + 0.6,
  };
};

const calculateModalityBalance = (chart1: any, chart2: any) => {
  return {
    cardinal: Math.random() * 0.4 + 0.6,
    fixed: Math.random() * 0.4 + 0.6,
    mutable: Math.random() * 0.4 + 0.6,
  };
};

const calculateAspectPatterns = (chart1: any, chart2: any) => {
  return {
    harmonious: Math.floor(Math.random() * 15) + 5,
    challenging: Math.floor(Math.random() * 10) + 2,
    neutral: Math.floor(Math.random() * 8) + 3,
  };
};

const calculateCompositeChart = (chart1: any, chart2: any) => {
  return {
    summary:
      "Strong composite Sun-Moon conjunction indicates deep emotional connection and shared life purpose.",
  };
};

const calculateProgressedCompatibility = (chart1: any, chart2: any) => {
  return Math.floor(Math.random() * 30) + 70;
};

// Virtualized Report List Component
const VirtualizedReportList: React.FC<{
  reports: any[];
  birthCharts: any[];
  getCompatibilityColor: (score: number) => string;
  getCompatibilityLabel: (score: number) => string;
  isPremiumUser: boolean;
  showDetailedAnalysis: boolean;
  theme: string;
}> = memo(
  ({
    reports,
    birthCharts,
    getCompatibilityColor,
    getCompatibilityLabel,
    isPremiumUser,
    showDetailedAnalysis,
    theme,
  }) => {
    const Row = ({
      index,
      style,
    }: {
      index: number;
      style: React.CSSProperties;
    }) => {
      const report = reports[index];
      const chart1 = birthCharts.find((c) => c.id === report.chart1_id);
      const chart2 = birthCharts.find((c) => c.id === report.chart2_id);

      return (
        <div style={style}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-pink-900/20 to-rose-900/20 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-pink-400 mr-2" />
                <span className="text-white font-medium">
                  {chart1?.name} & {chart2?.name}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`text-2xl font-bold mr-2 ${getCompatibilityColor(report.compatibility_score)}`}
                >
                  {report.compatibility_score}%
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${getCompatibilityColor(report.compatibility_score)} bg-current bg-opacity-20`}
                >
                  {getCompatibilityLabel(report.compatibility_score)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      );
    };

    return (
      <VirtualList
        height={400}
        itemCount={reports.length}
        itemSize={120}
        width="100%"
      >
        {Row}
      </VirtualList>
    );
  },
);

// Tutorial Modal Component
const TutorialModal: React.FC<{
  onClose: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
}> = memo(({ onClose, currentStep, onStepChange }) => {
  const tutorialSteps: TutorialStep[] = [
    {
      id: "intro",
      title: "Welcome to Compatibility Analysis",
      content:
        "Learn how to interpret astrological compatibility between two birth charts.",
      target: "compatibility-title",
    },
    {
      id: "scores",
      title: "Understanding Compatibility Scores",
      content:
        "Scores range from 0-100%. 80%+ is excellent, 60-79% is good, 40-59% is fair, and below 40% indicates challenges.",
      target: "compatibility-score",
    },
    {
      id: "analysis",
      title: "Enhanced Analysis Features",
      content:
        "Premium users get detailed elemental harmony, aspect patterns, and composite chart analysis.",
      target: "enhanced-analysis",
    },
  ];

  const currentStepData = tutorialSteps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-dark-800 rounded-2xl p-6 border border-dark-700 max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Info className="w-5 h-5 mr-2 text-pink-400" />
            {currentStepData.title}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <p className="text-gray-300 mb-6">{currentStepData.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-pink-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-2">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStepChange(currentStep - 1)}
              >
                Previous
              </Button>
            )}
            {currentStep < tutorialSteps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => onStepChange(currentStep + 1)}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Next
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onClose}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default CompatibilityChart;
