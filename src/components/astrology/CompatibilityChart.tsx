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
}

const CompatibilityChart: React.FC<CompatibilityChartProps> = ({
  className = "",
  showHeader = true,
  maxItems = 3,
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
            <Heart className="w-6 h-6 text-pink-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">
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
                  {report.report_content}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm" icon={ArrowRight}>
                    View Details
                  </Button>
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
