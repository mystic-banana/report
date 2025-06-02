import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Eye,
  Sparkles,
} from "lucide-react";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Link } from "react-router-dom";

interface CompatibilityChartProps {
  className?: string;
  showHeader?: boolean;
  maxItems?: number;
  showDetailedAnalysis?: boolean;
  isPremiumUser?: boolean;
}

const CompatibilityChart: React.FC<CompatibilityChartProps> = ({
  className = "",
  showHeader = true,
  maxItems = 3,
  showDetailedAnalysis = false,
  isPremiumUser = false,
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

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBirthCharts(user.id);
      fetchCompatibilityReports(user.id);
    }
  }, [isAuthenticated, user]);

  const handleCreateCompatibility = async () => {
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
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Challenging";
  };

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
            <Heart className="w-6 h-6 text-pink-400 mr-3" aria-hidden="true" />
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

      {/* Existing Compatibility Reports */}
      {compatibilityReports.length > 0 ? (
        <div className="space-y-4">
          {compatibilityReports.slice(0, maxItems).map((report) => {
            const chart1 = birthCharts.find((c) => c.id === report.chart1_id);
            const chart2 = birthCharts.find((c) => c.id === report.chart2_id);

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
                {isPremiumUser && showDetailedAnalysis && (
                  <div className="mt-4 space-y-3">
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
          })}
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
                <li>• Compare planetary positions between two birth charts</li>
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

      {compatibilityReports.length > maxItems && (
        <div className="mt-4 text-center">
          <Link to="/astrology/compatibility">
            <Button variant="ghost" icon={ArrowRight}>
              View All {compatibilityReports.length} Reports
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CompatibilityChart;
