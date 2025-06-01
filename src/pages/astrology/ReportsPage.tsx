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
  Sparkles,
  Calendar,
  Heart,
  Briefcase,
  Zap,
  CheckCircle,
  AlertCircle,
  Trash2,
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
    createVedicReport,
    exportReportToPDF,
    deleteReport,
  } = useAstrologyStore();

  const [selectedChart, setSelectedChart] = useState<string>("");
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [reportTitle, setReportTitle] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const reportsPerPage = 10;

  const reportTypes = [
    {
      id: "natal",
      name: "Complete Natal Report",
      description:
        "Comprehensive analysis of your birth chart with planetary positions, aspects, and life insights",
      premium: false,
      icon: Star,
      features: [
        "Birth chart essentials",
        "Personality analysis",
        "Strengths & challenges",
        "Basic recommendations",
      ],
      estimatedPages: "8-12 pages",
      color: "from-purple-600 to-indigo-600",
    },
    {
      id: "natal-premium",
      name: "Premium Natal Report",
      description:
        "Enhanced natal analysis with detailed interpretations, aspect table, and elemental balance",
      premium: true,
      icon: Crown,
      features: [
        "Everything in basic",
        "Detailed aspect analysis",
        "Elemental & modal balance",
        "Retrograde planets",
        "Lunar phase analysis",
        "Premium guidance",
      ],
      estimatedPages: "15-20 pages",
      color: "from-amber-600 to-orange-600",
    },
    {
      id: "personality",
      name: "Personality Profile",
      description:
        "Deep dive into your character traits, motivations, and behavioral patterns",
      premium: false,
      icon: FileText,
      features: [
        "Core personality traits",
        "Emotional patterns",
        "Communication style",
        "Relationship approach",
      ],
      estimatedPages: "6-8 pages",
      color: "from-blue-600 to-cyan-600",
    },
    {
      id: "career",
      name: "Career & Life Purpose",
      description:
        "Discover your professional path, talents, and life calling through astrological insights",
      premium: true,
      icon: Briefcase,
      features: [
        "Career strengths",
        "Professional challenges",
        "Ideal work environments",
        "Leadership style",
        "Financial patterns",
      ],
      estimatedPages: "10-12 pages",
      color: "from-green-600 to-emerald-600",
    },
    {
      id: "relationships",
      name: "Love & Relationships",
      description:
        "Understanding your romantic patterns, compatibility factors, and relationship dynamics",
      premium: true,
      icon: Heart,
      features: [
        "Love language",
        "Relationship patterns",
        "Compatibility insights",
        "Communication in love",
        "Emotional needs",
      ],
      estimatedPages: "8-10 pages",
      color: "from-pink-600 to-rose-600",
    },
    {
      id: "yearly",
      name: "Yearly Forecast",
      description:
        "12-month ahead predictions and guidance based on planetary transits",
      premium: true,
      icon: Calendar,
      features: [
        "Monthly highlights",
        "Key opportunities",
        "Challenges to watch",
        "Best timing for decisions",
        "Personal growth themes",
      ],
      estimatedPages: "12-15 pages",
      color: "from-violet-600 to-purple-600",
    },
    {
      id: "spiritual",
      name: "Spiritual Path Report",
      description:
        "Your soul's journey, spiritual lessons, and path to higher consciousness",
      premium: true,
      icon: Sparkles,
      features: [
        "Soul purpose",
        "Karmic lessons",
        "Spiritual gifts",
        "Meditation guidance",
        "Higher consciousness path",
      ],
      estimatedPages: "10-14 pages",
      color: "from-indigo-600 to-blue-600",
    },
    {
      id: "vedic",
      name: "Vedic Astrology Report",
      description:
        "Ancient Indian astrology with Janma Kundali, Dasha periods, Nakshatra analysis, and spiritual remedies",
      premium: false,
      icon: Star,
      features: [
        "Janma Kundali (Birth Chart)",
        "Nakshatra analysis",
        "Basic Dasha periods",
        "House analysis (Bhava)",
        "Spiritual guidance",
      ],
      estimatedPages: "12-16 pages",
      color: "from-orange-600 to-red-600",
    },
    {
      id: "vedic-premium",
      name: "Premium Vedic Report",
      description:
        "Comprehensive Vedic analysis with detailed Dasha, Yogas, Doshas, Ashtakavarga, and personalized remedies",
      premium: true,
      icon: Crown,
      features: [
        "Complete Janma Kundali + Navamsa",
        "Detailed Vimshottari Dasha",
        "Yogas and Doshas analysis",
        "Planetary strengths (Shadbala)",
        "Ashtakavarga system",
        "Sade Sati analysis",
        "Personalized remedies",
        "Spiritual practices",
      ],
      estimatedPages: "20-25 pages",
      color: "from-amber-600 to-orange-600",
    },
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBirthCharts(user.id);
      fetchReports(user.id);

      // Check for chartId and type in URL params
      const urlParams = new URLSearchParams(window.location.search);
      const chartIdFromUrl = urlParams.get("chartId");
      const typeFromUrl = urlParams.get("type");

      if (chartIdFromUrl) {
        setSelectedChart(chartIdFromUrl);

        // Auto-trigger report generation if type is specified
        if (
          typeFromUrl &&
          (typeFromUrl === "vedic" || typeFromUrl === "vedic-premium")
        ) {
          setSelectedReportType(typeFromUrl);
          setReportTitle(`${user.name || "User"}'s Vedic Astrology Report`);

          // Auto-generate the report
          setTimeout(() => {
            handleCreateVedicReport(
              chartIdFromUrl,
              typeFromUrl === "vedic-premium",
            );
          }, 1000);
        }
      } else if (birthCharts.length > 0 && !selectedChart) {
        setSelectedChart(birthCharts[0].id);
      }
    }
  }, [isAuthenticated, user, birthCharts.length]);

  const handleCreateVedicReport = async (
    chartId: string,
    isPremium: boolean,
  ) => {
    setIsCreating(true);
    try {
      await createVedicReport(chartId, isPremium);
      // Clear URL params after successful creation
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Error creating Vedic report:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateReport = async () => {
    if (!selectedChart || !selectedReportType || !reportTitle.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      if (
        selectedReportType === "vedic" ||
        selectedReportType === "vedic-premium"
      ) {
        const isPremium = selectedReportType === "vedic-premium";
        await createVedicReport(selectedChart, isPremium);
      } else {
        await createReport(selectedChart, selectedReportType, reportTitle);
      }
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

  const handleDeleteReport = async (reportId: string) => {
    if (deleteReport) {
      await deleteReport(reportId);
      setShowDeleteConfirm(null);
      // Refresh reports
      if (user) {
        fetchReports(user.id);
      }
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(reports.length / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedReportType === type.id;
                      return (
                        <motion.button
                          key={type.id}
                          onClick={() => setSelectedReportType(type.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                            isSelected
                              ? `bg-gradient-to-br ${type.color} border-transparent text-white shadow-2xl`
                              : "bg-dark-700 border-dark-600 text-gray-300 hover:border-indigo-500 hover:bg-dark-650"
                          }`}
                        >
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/20"></div>
                            <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-white/10"></div>
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <div
                                className={`p-3 rounded-xl ${
                                  isSelected
                                    ? "bg-white/20"
                                    : "bg-indigo-600/20"
                                }`}
                              >
                                <Icon
                                  className={`w-6 h-6 ${
                                    isSelected
                                      ? "text-white"
                                      : "text-indigo-400"
                                  }`}
                                />
                              </div>
                              {type.premium && (
                                <div className="flex items-center space-x-2">
                                  <Crown className="w-4 h-4 text-amber-400" />
                                  <span className="text-xs px-3 py-1 bg-amber-600 text-white rounded-full font-medium">
                                    Premium
                                  </span>
                                </div>
                              )}
                            </div>

                            <h4
                              className={`text-lg font-bold mb-2 ${
                                isSelected ? "text-white" : "text-white"
                              }`}
                            >
                              {type.name}
                            </h4>

                            <p
                              className={`text-sm mb-4 leading-relaxed ${
                                isSelected ? "text-white/90" : "text-gray-400"
                              }`}
                            >
                              {type.description}
                            </p>

                            <div className="space-y-3">
                              <div
                                className={`text-xs font-medium ${
                                  isSelected ? "text-white/80" : "text-gray-500"
                                }`}
                              >
                                {type.estimatedPages}
                              </div>

                              <div className="space-y-1">
                                {type.features
                                  .slice(0, 3)
                                  .map((feature, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2"
                                    >
                                      <CheckCircle
                                        className={`w-3 h-3 ${
                                          isSelected
                                            ? "text-white/70"
                                            : "text-green-400"
                                        }`}
                                      />
                                      <span
                                        className={`text-xs ${
                                          isSelected
                                            ? "text-white/80"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {feature}
                                      </span>
                                    </div>
                                  ))}
                                {type.features.length > 3 && (
                                  <div
                                    className={`text-xs ${
                                      isSelected
                                        ? "text-white/60"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    +{type.features.length - 3} more features
                                  </div>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <div className="absolute top-4 right-4">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {selectedReportType && (
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Estimated generation time: 30-60 seconds</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleCreateReport}
                    loading={isCreating}
                    disabled={
                      !selectedChart ||
                      !selectedReportType ||
                      !reportTitle.trim()
                    }
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-lg font-semibold"
                  >
                    {isCreating ? "Generating Report..." : "Generate Report"}
                  </Button>
                </div>
              </div>

              {/* Existing Reports */}
              {reports.length > 0 ? (
                <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Your Reports ({reports.length})
                    </h3>
                    {totalPages > 1 && (
                      <div className="text-sm text-gray-400">
                        Page {currentPage} of {totalPages}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {currentReports.map((report) => {
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
                              <button
                                onClick={() => setShowDeleteConfirm(report.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete Report"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Delete Report
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this report? This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-end space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteReport(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ReportsPage;
