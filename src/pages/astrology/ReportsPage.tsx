import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  ArrowLeft,
  Download,
  Star,
  Plus,
  Eye,
  FileText,
  Crown,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    birthCharts,
    reports,
    loading,
    fetchBirthCharts,
    fetchReports,
    createReport,
    exportReportToPDF,
  } = useAstrologyStore();

  const [selectedChart, setSelectedChart] = useState<string>("");
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [reportTitle, setReportTitle] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const reportTypes = [
    {
      id: "natal",
      name: "Complete Natal Report",
      description: "Comprehensive analysis of your birth chart",
      premium: false,
      icon: Star,
    },
    {
      id: "personality",
      name: "Personality Profile",
      description: "Deep dive into your character traits and motivations",
      premium: false,
      icon: FileText,
    },
    {
      id: "career",
      name: "Career & Life Purpose",
      description: "Discover your professional path and calling",
      premium: true,
      icon: Crown,
    },
    {
      id: "relationships",
      name: "Love & Relationships",
      description: "Understanding your romantic patterns and compatibility",
      premium: true,
      icon: Crown,
    },
    {
      id: "yearly",
      name: "Yearly Forecast",
      description: "12-month ahead predictions and guidance",
      premium: true,
      icon: Crown,
    },
    {
      id: "spiritual",
      name: "Spiritual Path Report",
      description: "Your soul's journey and spiritual lessons",
      premium: true,
      icon: Crown,
    },
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBirthCharts(user.id);
      fetchReports(user.id);

      // Check for chartId in URL params
      const urlParams = new URLSearchParams(window.location.search);
      const chartIdFromUrl = urlParams.get("chartId");

      if (chartIdFromUrl) {
        setSelectedChart(chartIdFromUrl);
      } else if (birthCharts.length > 0 && !selectedChart) {
        setSelectedChart(birthCharts[0].id);
      }
    }
  }, [isAuthenticated, user, birthCharts.length]);

  const handleCreateReport = async () => {
    if (!selectedChart || !selectedReportType || !reportTitle.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      await createReport(selectedChart, selectedReportType, reportTitle);
      setReportTitle("");
      setSelectedReportType("");
    } catch (error) {
      console.error("Error creating report:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportPDF = async (reportId: string) => {
    const pdfUrl = await exportReportToPDF(reportId);
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout title="Astrology Reports - Mystic Banana">
        <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-8 border border-indigo-500/20">
                <BookOpen className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-bold text-white mb-4">
                  Professional Astrology Reports
                </h1>
                <p className="text-gray-300 mb-8">
                  Get comprehensive, AI-powered astrological reports that
                  provide deep insights into your personality, relationships,
                  career, and spiritual path.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate("/signup")}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
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
    <PageLayout title="Astrology Reports - Mystic Banana">
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
                  Astrology Reports
                </h1>
                <p className="text-gray-400">
                  Professional insights and comprehensive analysis
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          {birthCharts.length === 0 ? (
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 border border-purple-500/20 text-center">
              <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Create Your Birth Chart First
              </h3>
              <p className="text-gray-300 mb-6">
                To generate personalized reports, you need to create your birth
                chart first.
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
              {/* Report Generator */}
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-indigo-400" />
                  Create New Report
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Birth Chart
                    </label>
                    <select
                      value={selectedChart}
                      onChange={(e) => setSelectedChart(e.target.value)}
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      placeholder="Enter a title for your report"
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Report Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Choose Report Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedReportType(type.id)}
                          className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                            selectedReportType === type.id
                              ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-500 text-white"
                              : "bg-dark-700 border-dark-600 text-gray-300 hover:border-indigo-500 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Icon className="w-5 h-5" />
                            {type.premium && (
                              <span className="text-xs px-2 py-1 bg-amber-600 text-white rounded-full">
                                Premium
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium mb-1">{type.name}</h4>
                          <p className="text-sm opacity-75">
                            {type.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  onClick={handleCreateReport}
                  loading={isCreating}
                  disabled={
                    !selectedChart || !selectedReportType || !reportTitle.trim()
                  }
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  Generate Report
                </Button>
              </div>

              {/* Existing Reports */}
              {reports.length > 0 ? (
                <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Your Reports
                  </h3>
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const chart = birthCharts.find(
                        (c) => c.id === report.birth_chart_id,
                      );
                      return (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/20"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <BookOpen className="w-6 h-6 text-indigo-400 mr-3" />
                              <div>
                                <h4 className="text-lg font-medium text-white">
                                  {report.title}
                                </h4>
                                <p className="text-gray-400 text-sm">
                                  {chart?.name} • {report.report_type} •{" "}
                                  {new Date(
                                    report.created_at,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {report.is_premium && (
                                <span className="text-xs px-2 py-1 bg-amber-600 text-white rounded-full">
                                  Premium
                                </span>
                              )}
                              <Button variant="ghost" size="sm" icon={Eye}>
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Download}
                                onClick={() => handleExportPDF(report.id)}
                              >
                                PDF
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm line-clamp-3">
                            {report.content}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 text-center">
                  <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-400 mb-2">
                    No Reports Yet
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Create your first astrology report to get detailed insights
                    about your cosmic profile.
                  </p>
                </div>
              )}

              {/* Premium Features */}
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/20">
                <div className="flex items-center mb-4">
                  <Crown className="w-6 h-6 text-amber-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">
                    Premium Report Features
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      What's Included
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                        AI-powered detailed interpretations
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                        Professional-grade analysis
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                        PDF export with charts
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                        Personalized recommendations
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      Premium Report Types
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li>• Career & Life Purpose Analysis</li>
                      <li>• Love & Relationship Compatibility</li>
                      <li>• 12-Month Yearly Forecasts</li>
                      <li>• Spiritual Path & Soul Purpose</li>
                      <li>• Health & Wellness Guidance</li>
                      <li>• Financial Astrology Insights</li>
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

export default ReportsPage;
