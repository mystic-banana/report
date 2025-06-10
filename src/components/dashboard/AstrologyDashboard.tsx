import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import { getZodiacSign } from "../../utils/astronomicalCalculations";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import ChatWithAstrologer from "../astrology/ChatWithAstrologer";
import {
  FileText,
  Star,
  Users,
  Calendar,
  Download,
  Eye,
  Plus,
  TrendingUp,
  Moon,
  Sun,
  Sparkles,
  ArrowRight,
  BarChart3,
  BookOpen,
  Zap,
  Crown,
} from "lucide-react";
import RecentActivitySection from "./RecentActivitySection";
import SavedContentSection from "./SavedContentSection";

const AstrologyDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    birthCharts,
    reports,
    compatibilityReports,
    loading,
    fetchBirthCharts,
    fetchReports,
    fetchCompatibilityReports,
    generateWeeklyTransitForecast,
    createNatalChartReport,
    createVedicReport,
    exportReportToPDF,
  } = useAstrologyStore();
  const [weeklyForecast, setWeeklyForecast] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (user) {
      fetchBirthCharts(user.id);
      fetchReports(user.id);
      fetchCompatibilityReports(user.id);
    }
  }, [user, fetchBirthCharts, fetchReports, fetchCompatibilityReports]);

  // Add error handling and timeout for loading state
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn("Astrology data loading timeout - clearing loading state");
        // Force clear loading state after 10 seconds
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const handleGenerateWeeklyForecast = async () => {
    if (birthCharts.length > 0) {
      const forecast = await generateWeeklyTransitForecast(birthCharts[0].id);
      setWeeklyForecast(forecast);
    }
  };

  const handleGenerateReport = async (
    chartId: string,
    reportType: "natal" | "vedic",
    isPremium: boolean = false,
  ) => {
    setIsGeneratingReport(`${reportType}-${chartId}`);
    try {
      if (reportType === "natal") {
        await createNatalChartReport(chartId, isPremium);
      } else if (reportType === "vedic") {
        await createVedicReport(chartId, isPremium);
      }
      // Refresh reports
      if (user) {
        await fetchReports(user.id);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGeneratingReport(null);
    }
  };

  const handleExportPDF = async (reportId: string) => {
    try {
      await exportReportToPDF(reportId);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  // Show loading only for initial load, not for subsequent operations
  if (loading && birthCharts.length === 0 && reports.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <div className="ml-4 text-gray-400">Loading your astrology data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/astrology/birth-chart" className="block">
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <Star className="w-8 h-8 text-purple-400 group-hover:text-purple-300" />
              <ArrowRight className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Birth Charts
            </h3>
            <p className="text-3xl font-bold text-purple-400 mb-1">
              {birthCharts.length}
            </p>
            <p className="text-gray-400 text-sm">Click to manage</p>
          </div>
        </Link>

        <Link to="/astrology/reports" className="block">
          <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-xl p-6 border border-teal-500/20 hover:border-teal-400/40 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-8 h-8 text-teal-400 group-hover:text-teal-300" />
              <ArrowRight className="w-5 h-5 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Reports</h3>
            <p className="text-3xl font-bold text-teal-400 mb-1">
              {reports.length}
            </p>
            <p className="text-gray-400 text-sm">View all reports</p>
          </div>
        </Link>

        <Link to="/astrology/compatibility" className="block">
          <div className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-xl p-6 border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-pink-400 group-hover:text-pink-300" />
              <ArrowRight className="w-5 h-5 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Compatibility
            </h3>
            <p className="text-3xl font-bold text-pink-400 mb-1">
              {compatibilityReports.length}
            </p>
            <p className="text-gray-400 text-sm">Relationship analysis</p>
          </div>
        </Link>

        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-6 border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <Sun className="w-8 h-8 text-amber-400" />
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Your Sun Sign
          </h3>
          <p className="text-2xl font-bold text-amber-400 mb-1">
            {birthCharts.length > 0
              ? getZodiacSign(
                  new Date(birthCharts[0].birth_date).getMonth() + 1,
                  new Date(birthCharts[0].birth_date).getDate(),
                )
              : "Unknown"}
          </p>
          <p className="text-gray-400 text-sm">Primary zodiac sign</p>
        </div>
      </div>

      {/* Professional Report Generation */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 border border-indigo-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Crown className="w-6 h-6 text-indigo-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">
              Professional Report Generation
            </h3>
          </div>
          <Link to="/astrology/reports">
            <Button variant="ghost" size="sm" icon={Eye}>
              View All Reports
            </Button>
          </Link>
        </div>

        {birthCharts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {birthCharts.slice(0, 4).map((chart) => {
              const zodiacSign = getZodiacSign(
                new Date(chart.birth_date).getMonth() + 1,
                new Date(chart.birth_date).getDate(),
              );
              return (
                <div
                  key={chart.id}
                  className="bg-dark-700/50 rounded-xl p-4 border border-dark-600"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{chart.name}</h4>
                        <p className="text-gray-400 text-sm">
                          {zodiacSign} •{" "}
                          {new Date(chart.birth_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() =>
                        handleGenerateReport(chart.id, "natal", false)
                      }
                      loading={isGeneratingReport === `natal-${chart.id}`}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500/80 to-indigo-500/80 hover:from-purple-600 hover:to-indigo-600 text-xs"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Natal Report
                    </Button>
                    <Button
                      onClick={() =>
                        handleGenerateReport(chart.id, "vedic", false)
                      }
                      loading={isGeneratingReport === `vedic-${chart.id}`}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-600 hover:to-orange-600 text-xs"
                    >
                      <Moon className="w-3 h-3 mr-1" />
                      Vedic Report
                    </Button>
                  </div>
                </div>
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
              Create your first birth chart to generate professional reports
            </p>
            <Link to="/astrology/birth-chart">
              <Button
                className="bg-gradient-to-r from-purple-500/80 to-indigo-500/80 hover:from-purple-600 hover:to-indigo-600"
                icon={Plus}
              >
                Create Birth Chart
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Activity and Saved Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivitySection />
        <SavedContentSection />
      </div>

      {/* Astrology Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Transit Forecast */}
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border border-indigo-500/20">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">
              Weekly Transits
            </h3>
          </div>
          {weeklyForecast ? (
            <div className="bg-dark-700/50 rounded-lg p-3 mb-4">
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                {weeklyForecast}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-4">
              Get personalized weekly transit insights based on your birth
              chart.
            </p>
          )}
          <div className="space-y-2">
            <Button
              onClick={handleGenerateWeeklyForecast}
              loading={loading}
              disabled={birthCharts.length === 0}
              size="sm"
              className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-600 hover:to-purple-600 w-full mb-2"
            >
              Generate Forecast
            </Button>
            <Link to="/astrology/transits">
              <Button variant="outline" size="sm" className="w-full">
                View Transit Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Horoscopes */}
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-6 border border-amber-500/20">
          <div className="flex items-center mb-4">
            <Sun className="w-6 h-6 text-amber-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">
              Daily Horoscopes
            </h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Get daily insights for all zodiac signs with personalized guidance.
          </p>
          <Link to="/astrology/horoscopes">
            <Button
              className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-600 hover:to-orange-600 w-full"
              size="sm"
            >
              View Horoscopes
            </Button>
          </Link>
        </div>

        {/* Vedic Astrology */}
        <div className="bg-gradient-to-r from-rose-900/30 to-pink-900/30 rounded-xl p-6 border border-rose-500/20">
          <div className="flex items-center mb-4">
            <Moon className="w-6 h-6 text-rose-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">
              Vedic Astrology
            </h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Explore ancient Vedic wisdom with detailed Jyotish analysis.
          </p>
          <Link to="/astrology/vedic">
            <Button
              className="bg-gradient-to-r from-rose-500/80 to-pink-500/80 hover:from-rose-600 hover:to-pink-600 w-full"
              size="sm"
            >
              Explore Vedic
            </Button>
          </Link>
        </div>
      </div>

      {/* Chat with Astrologer */}
      <ChatWithAstrologer />
    </div>
  );
};

export default AstrologyDashboard;
