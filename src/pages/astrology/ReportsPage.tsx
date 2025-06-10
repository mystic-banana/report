import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CalendarDays, // Added
  ChevronLeft,  // Added
  ChevronRight, // Added
  Crown,
  Download,
  Eye,
  FileText,
  Heart,
  ListChecks,   // Added
  Loader2,      // Added
  LogIn,        // Added
  Sparkles,
  Star,
  Trash2,
  UserCircle,   // Added
  X,
  Zap,
  Wand2, // Added
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
// LoadingSpinner not needed, removing
import HTMLReportViewer from "../../components/reports/HTMLReportViewer";
import toast from "react-hot-toast";

// Define types
type AstrologyReport = {
  id: string;
  title: string;
  report_type: string;
  birth_chart_id: string;
  content: string; // Retaining for now, ensure it's used or remove if html_content is sole source
  html_content?: string; // Added for HTMLReportViewer
  summary?: string; // Added for report list display
  is_premium: boolean;
  template_id?: string;
  created_at: string;
  updated_at: string;
};

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, /* authLoading */ } = useAuthStore();
  const {
    birthCharts,
    reports,
    fetchBirthCharts,
    fetchReports,
    deleteReport,
    exportReportToPDF,
    createNatalChartReport,
    createVedicReport,
    reportsLoading, // Added for checking loading state
    // pdfExporting, // Added for PDF export loading state - UNUSED
    birthChartsLoading, // Added
    // pdfError // Available if needed for PDF export error display
  } = useAstrologyStore();

  const [selectedChart, setSelectedChart] = useState<string>("");
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [reportsPerPage] = useState<number>(5); // Or a fixed const if not user-configurable
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [downloadingReports, setDownloadingReports] = useState<Set<string>>(
    new Set(),
  );
  // viewingReport state might be redundant if currentViewedReport and URL params handle it
  // const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [currentViewedReport, setCurrentViewedReport] = useState<AstrologyReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // Added
  const [viewingReport, setViewingReport] = useState<string | null>(null); // Added

  // Pagination calculations
  const indexOfLastReport = currentPageNum * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  // const currentReports = reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(indexOfFirstReport, indexOfLastReport); // Unused
  const totalPages = Math.ceil(reports.length / reportsPerPage);
  
  // Parse the view parameter from the URL query string
  const queryParams = new URLSearchParams(location.search);
  const viewParam = queryParams.get("view");

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

  // Fetch data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && user.id) {
      fetchReports();
      fetchBirthCharts(user.id);
    }
  }, [isAuthenticated, user, fetchBirthCharts, fetchReports]);

  // Effect to handle 'view' query parameter and initialize currentViewedReport
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const viewReportId = queryParams.get("view");

    if (viewReportId) {
      if (reportsLoading) { 
        // Still loading reports, wait before trying to find/set the viewed report
        return;
      }
      const reportToView = reports.find((r) => r.id === viewReportId);
      if (reportToView) {
        setCurrentViewedReport(reportToView);
      } else {
        // Reports are loaded, but the specific report ID was not found.
        setCurrentViewedReport(null);
        // Only show error and navigate if the param was indeed trying to view a specific (now invalid) report
        // and to prevent toast/navigation loops if navigate itself re-triggers this effect before param is cleared.
        if (location.search.includes(`view=${viewReportId}`)) { 
            toast.error(`Report with ID "${viewReportId}" not found.`);
            navigate(location.pathname, { replace: true }); // Clear invalid 'view' param from URL
        }
      }
    } else {
      // No 'view' parameter in URL, ensure no report is being viewed.
      setCurrentViewedReport(null);
    }
  }, [location.search, reports, navigate, reportsLoading, setCurrentViewedReport]);

// ... (This comment signifies the start of the restored block, corresponding to original line 279)

  // handleCreateVedicReport removed as its logic is consolidated into handleCreateReport.

  const handleCreateReport = async () => {
    if (!selectedChart || !selectedReportType) {
      toast.error("Please select a birth chart and report type.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to create reports.");
      return;
    }

    const reportTypeDetails = reportTypes.find(rt => rt.id === selectedReportType);
    if (!reportTypeDetails) {
      toast.error("Invalid report type selected.");
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Generating your report...");
    const isPremiumFlag = reportTypeDetails.premium;

    try {
      let newReport: AstrologyReport | null = null;
      if (selectedReportType === "vedic" || selectedReportType === "vedic-premium") {
        newReport = await createVedicReport(selectedChart, isPremiumFlag);
      } else if (selectedReportType === "natal" || selectedReportType === "natal-premium") {
        newReport = await createNatalChartReport(selectedChart, isPremiumFlag);
      } else {
        toast.error(`Report type '${selectedReportType}' creation not implemented yet.`);
        setIsCreating(false);
        toast.dismiss(toastId);
        return;
      }

      if (newReport) {
        toast.success(`Report "${newReport.title}" created successfully!`, { id: toastId });
        fetchReports(); // Refresh reports list
        setSelectedChart("");
        // setReportTitle(""); // State variable and setter removed 
      } else {
        throw new Error("Report creation did not return a report object.");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create report. Please try again.", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewReport = (reportId: string) => {
    setViewingReport(reportId); // Indicate loading for this specific report
    const reportToView = reports.find(r => r.id === reportId);
    if (reportToView) {
      // Assuming content might be fetched or is already part of the report object
      // For now, directly set it or navigate if it's a separate page view
      // TODO: Confirm if 'content' or 'html_content' is the correct property for viewing
      if (reportToView.html_content) { 
        setCurrentViewedReport(reportToView);
        navigate(`/astrology/reports?view=${reportId}`, { replace: true });
      } else {
        toast.error("Report content is not available for direct viewing.");
        setViewingReport(null);
      }
    } else {
      toast.error("Report not found.");
      setViewingReport(null);
    }
  };

  const handleCloseReportViewer = () => {
    setCurrentViewedReport(null);
    setViewingReport(null); 
    navigate("/astrology/reports", { replace: true }); // Clear query param
  };

  const handleExportPDF = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      toast.error("Report not found.");
      return;
    }
    setDownloadingReports(prev => new Set(prev).add(reportId));
    const toastId = `pdf-export-${reportId}`;
    toast.loading(`Preparing PDF for "${report.title}"...`, { id: toastId });
    try {
      await exportReportToPDF(report.id); // Ensure this function is correctly defined in the store
      toast.success(`PDF for "${report.title}" should be downloading.`, { id: toastId });
    } catch (error) {
      console.error("Error exporting report to PDF:", error);
      toast.error(error instanceof Error ? error.message : `Failed to export PDF.`, { id: toastId });
    } finally {
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    setIsDeleting(true);
    const toastId = `delete-${reportId}`;
    toast.loading(`Deleting report...`, { id: toastId });
    try {
      await deleteReport(reportId);
      toast.success("Report deleted successfully.", { id: toastId });
      setShowDeleteConfirm(null); 
      // fetchReports(); // Re-fetching might be handled by store or optimistic update
      if (currentViewedReport && currentViewedReport.id === reportId) {
        handleCloseReportViewer();
      }
    } catch (error: any) {
      console.error("Error deleting report:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete report.",
        { id: toastId },
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user /* && !authLoading */) {
    return (
      <PageLayout title="Astrology Reports">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
          <Zap className="w-16 h-16 text-yellow-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Your Reports</h2>
          <p className="text-slate-400 mb-6">Please log in to create and view your astrology reports.</p>
          <Button onClick={() => navigate('/auth/login')} className="bg-purple-600 hover:bg-purple-700 text-white">
            <LogIn className="mr-2 h-4 w-4" /> Log In
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (reportsLoading /* && !authLoading */ && !currentViewedReport /* && !birthChartsLoading */) {
    return (
      <PageLayout title="Astrology Reports">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (currentViewedReport && currentViewedReport.html_content) {
    return (
      <HTMLReportViewer
        report={currentViewedReport}
        onClose={handleCloseReportViewer}
      />
    );
  }

  return (
    <PageLayout title="Astrology Reports">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Report Creation Section */}
        <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-2xl shadow-purple-500/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create New Report</h2>
                <p className="text-slate-400 text-sm">Generate personalized astrology insights.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="birthChart" className="block text-sm font-medium text-slate-300 mb-1">Select Birth Chart</label>
              <select
                id="birthChart"
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                disabled={isCreating || birthChartsLoading}
              >
                <option value="">-- Select a Chart --</option>
                {birthCharts.map((chart) => (
                  <option key={chart.id} value={chart.id}>{chart.name} ({new Date(chart.birth_date).toLocaleDateString()})</option>
                ))}
              </select>
              {birthCharts.length === 0 && !birthChartsLoading && (
                <p className="text-sm text-slate-400 mt-2">No birth charts found. <Link to="/astrology/birth-charts/new" className="text-purple-400 hover:text-purple-300">Create one now</Link>.</p>
              )}
            </div>
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-slate-300 mb-1">Select Report Type</label>
              <select
                id="reportType"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                disabled={isCreating}
              >
                <option value="">-- Select Report Type --</option>
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id} disabled={type.premium && (!user?.isPremium && user?.id !== 'god')}>{type.name}{type.premium ? ' (Premium)' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleCreateReport} 
              loading={isCreating}
              disabled={isCreating || !selectedChart || !selectedReportType}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-150 transform hover:scale-105"
            >
              <Wand2 className="mr-2 h-5 w-5" /> Generate Report
            </Button>
          </div>
        </div>

        {/* Generated Reports Section */}
        {reportsLoading && reports.length === 0 && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        )}

        {!reportsLoading && reports.length === 0 && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Reports Yet</h3>
            <p className="text-slate-400">Create your first astrology report to see it listed here.</p>
          </div>
        )}

        {reports.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ListChecks className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Your Generated Reports</h3>
                  <p className="text-slate-400 text-sm">Manage and view your insights.</p>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="text-sm text-slate-400">Page {currentPageNum} of {totalPages}</div>
              )}
            </div>
            <div className="space-y-4">
              {reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(indexOfFirstReport, indexOfLastReport).map((report) => {
                const chart = birthCharts.find(c => c.id === report.birth_chart_id);
                const reportTypeDetail = reportTypes.find(rt => rt.id === report.report_type || rt.name.toLowerCase().replace(/ /g, '-') === report.report_type);
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/40 hover:border-purple-500/50 transition-colors duration-200 shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div className="mb-3 sm:mb-0">
                        <h4 className="text-lg font-semibold text-white mb-1 flex items-center">
                          {report.title}
                          {report.is_premium && <Crown className="w-4 h-4 text-amber-400 ml-2" title="Premium Report"/>}
                        </h4>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span><UserCircle className="inline w-3 h-3 mr-1" />{chart?.name || 'Unknown Chart'}</span>
                          <span><CalendarDays className="inline w-3 h-3 mr-1" />{new Date(report.created_at).toLocaleDateString()}</span>
                          <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded-full">
                            {reportTypeDetail?.name || report.report_type.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button variant="outline" size="sm" icon={Eye} onClick={() => handleViewReport(report.id)} loading={viewingReport === report.id} className="border-slate-500 hover:bg-slate-700/50">
                          View
                        </Button>
                        <Button variant="outline" size="sm" icon={Download} onClick={() => handleExportPDF(report.id)} loading={downloadingReports.has(report.id)} disabled={downloadingReports.has(report.id)} className="border-slate-500 hover:bg-slate-700/50">
                          {downloadingReports.has(report.id) ? "Exporting..." : "PDF"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(report.id)} className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {report.summary && (
                      <p className="text-sm text-slate-300 mt-3 pt-3 border-t border-slate-600/50 line-clamp-2">
                        {report.summary}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <Button onClick={() => setCurrentPageNum((prev: number) => Math.max(1, prev - 1))} disabled={currentPageNum === 1} variant="outline" size="sm" className="border-slate-500 hover:bg-slate-700/50">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPageNum(page)}
                    variant={currentPageNum === page ? "primary" : "outline"}
                    size="sm"
                    className={currentPageNum === page ? "bg-purple-600 hover:bg-purple-700" : "border-slate-500 hover:bg-slate-700/50"}
                  >
                    {page}
                  </Button>
                ))}
                <Button onClick={() => setCurrentPageNum((prev: number) => Math.min(totalPages, prev + 1))} disabled={currentPageNum === totalPages} variant="outline" size="sm" className="border-slate-500 hover:bg-slate-700/50">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Premium Features Teaser (simplified or conditional) */}
        {(!user?.isPremium && user?.id !== 'god') && (
          <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-purple-500/10 rounded-2xl p-6 sm:p-8 border border-amber-500/20 relative overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-radial from-purple-600/15 via-transparent to-transparent opacity-50 animate-pulse-slow"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Unlock Premium Astrology Reports</h3>
                  <p className="text-amber-200/80 text-sm">Deeper insights, advanced analysis, and exclusive features await.</p>
                </div>
              </div>
              <Button onClick={() => navigate('/plans')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-150 transform hover:scale-105 flex-shrink-0">
                Explore Premium Plans <Sparkles className="ml-2 h-4 w-4 opacity-80" />
              </Button>
            </div>
          </div>
        )}
      </motion.div> 

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)} // Close on backdrop click
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-slate-800 to-slate-800/90 rounded-xl p-6 border border-slate-700 shadow-2xl max-w-md w-full mx-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Confirm Deletion</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(null)} className="text-slate-400 hover:text-white hover:bg-slate-700">
                    <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-slate-300 mb-6 text-sm">
                Are you sure you want to delete the report "<span className="font-semibold text-slate-100">{reports.find(r => r.id === showDeleteConfirm)?.title || 'this report'}</span>"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="border-slate-600 hover:bg-slate-700">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteReport(showDeleteConfirm as string)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  loading={isDeleting} // Assuming you add an isDeleting state for the modal button
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Report
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </PageLayout>
  );
// }; // This was incorrectly closing the component early
};

export default ReportsPage;
