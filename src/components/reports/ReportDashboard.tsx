import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import type { AstrologyReport } from "../../store/astrologyStore";
import ReportCard from "./ReportCard";
import ReportWizard from "./ReportWizard";
import HTMLReportViewer from "./HTMLReportViewer";
import Button from "../ui/Button";
import { toast } from "react-hot-toast";
import {
  Plus,
  Filter,
  Search,
  Grid,
  List as ListIcon,
  SlidersHorizontal,
  X,
  Download,
  Trash2,
  Share2,
  Eye,
} from "lucide-react";

const ReportDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    reports,
    birthCharts,
    fetchReports,
    fetchBirthCharts,
    fetchReportTemplates,
    fetchTemplateCategories,
    deleteReport,
  } = useAstrologyStore();

  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [premiumFilter, setPremiumFilter] = useState<
    "all" | "premium" | "free"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Effect for fetching initial data based on user
  useEffect(() => {
    if (user?.id) {
      const loadData = async () => {
        setLoading(true);
        try {
          const userId = user.id;
          // Fetch essential data
          await Promise.all([
            fetchReports(userId),
            fetchBirthCharts(userId),
          ]);

          // Fetch non-essential data separately, without blocking UI for errors
          fetchReportTemplates({ isPublic: true }).catch(err => 
            console.error("Failed to fetch report templates", err)
          );
          fetchTemplateCategories().catch(err => 
            console.error("Failed to fetch template categories", err)
          );

        } catch (error) {
          console.error("Error loading essential dashboard data:", error);
          toast.error("Failed to load your reports and charts.");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [user?.id, fetchReports, fetchBirthCharts, fetchReportTemplates, fetchTemplateCategories]);

  // Effect for handling URL search parameters once data is loaded
  useEffect(() => {
    // Handle ?view=<report_id>
    const viewReportId = searchParams.get("view");
    if (viewReportId) {
      if (reports.length > 0) {
        const reportToView = reports.find((r) => r.id === viewReportId);
        if (reportToView) {
          setSelectedReport(viewReportId);
        } else {
          toast.error("The requested report was not found.");
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('view');
          setSearchParams(newSearchParams, { replace: true });
        }
      }
    } else {
      // Close viewer if `view` param is removed
      if (selectedReport) {
        setSelectedReport(null);
      }
    }

    // Handle ?chart=<chart_id> to open the wizard
    const chartIdParam = searchParams.get("chart");
    if (chartIdParam) {
      if (birthCharts.length > 0) {
        if (birthCharts.some(c => c.id === chartIdParam)) {
          setShowWizard(true);
        } else {
          toast.error("The selected birth chart was not found.");
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('chart');
          setSearchParams(newSearchParams, { replace: true });
        }
      }
    }

    // Handle filters from URL
    const templateType = searchParams.get("template");
    if (templateType) setFilterType(templateType);

    const premiumParam = searchParams.get("premium");
    if (premiumParam === "true") setPremiumFilter("premium");

  }, [searchParams, reports, birthCharts, setSearchParams]);

  const handleCreateReport = () => {
    setShowWizard(true);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    // Clear the chart parameter from URL if it exists
    if (searchParams.has("chart")) {
      searchParams.delete("chart");
      setSearchParams(searchParams);
    }
  };

  const handleViewReport = (report: AstrologyReport) => {
    console.log(`Viewing report: ${report.id}`, {
      reportTitle: report.title,
      reportType: report.report_type,
      birthChartId: report.birth_chart_id
    });
    
    setSelectedReport(report.id);
    // Update URL to include the report ID
    searchParams.set("view", report.id);
    setSearchParams(searchParams);
    
    // Pre-fetch report data to ensure it's loaded
    try {
      const birthChart = birthCharts.find(chart => chart.id === report.birth_chart_id);
      if (!birthChart) {
        console.warn(`Birth chart with ID ${report.birth_chart_id} not found for report ${report.id}`);
        // We can still proceed, the HTMLReportViewer will handle missing chart data gracefully
      } else {
        console.log(`Found associated birth chart: ${birthChart.name}`);
      }
    } catch (error) {
      console.error("Error preparing report view:", error);
      toast.error("There was an error preparing your report. Please try again.");
    }
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
    // Remove the report ID from URL
    searchParams.delete("view");
    setSearchParams(searchParams);
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      if (selectedReport === reportId) {
        handleCloseReport();
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleExportReport = async (report: AstrologyReport) => {
    try {
      // Import the robust server-side PDF generation service
      const { generateAstrologyReport } = await import(
        "../../utils/serverPDFService"
      );

      // Find the associated birth chart
      const birthChart = birthCharts.find(
        (chart) => chart.id === report.birth_chart_id,
      );

      if (!birthChart) {
        throw new Error("Birth chart not found");
      }
      
      // Get SVG data of the birth chart if available
      let chartSvg = '';
      try {
        // Try to get chart SVG from the DOM if it exists
        const chartElement = document.querySelector('.chart-container svg');
        if (chartElement) {
          chartSvg = chartElement.outerHTML;
        } else {
          console.log('Chart SVG element not found, will generate in server');
        }
      } catch (svgError) {
        console.warn('Error capturing chart SVG:', svgError);
      }

      // Prepare comprehensive report data
      const reportData = {
        id: report.id,
        title: report.title,
        content: report.content,
        reportType: report.report_type
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        userName: birthChart.name,
        birthDate: birthChart.birth_date,
        birthTime: birthChart.birth_time,
        birthLocation: birthChart.birth_location,
        chartData: birthChart.chart_data,
        isPremium: report.is_premium,
        planetaryPositions: birthChart.chart_data?.planets || [],
        aspectTable: birthChart.chart_data?.aspects || [],
        elementalBalance: birthChart.chart_data?.elementalBalance || {},
        modalBalance: birthChart.chart_data?.modalBalance || {},
        houses: birthChart.chart_data?.houses || [],
        ascendant: birthChart.chart_data?.ascendant,
        midheaven: birthChart.chart_data?.midheaven,
        // Add any additional data needed for complete report
      };
      
      // Generate the professional PDF report server-side
      await generateAstrologyReport(
        report.id,
        chartSvg,
        reportData,
        report.is_premium
      );
    } catch (error) {
      console.error("Error exporting report to PDF:", error);
      // Show error toast or notification
      alert("Failed to export report to PDF. Please try again.");
    }
  };

  const handleShareReport = (report: AstrologyReport) => {
    // Implement share functionality
    const shareUrl = `${window.location.origin}/astrology/reports?view=${report.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: report.title,
          text: "Check out this astrological report!",
          url: shareUrl,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Report link copied to clipboard!");
    }
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type === filterType ? null : type);
  };

  const handlePremiumFilterChange = (value: "all" | "premium" | "free") => {
    setPremiumFilter(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredReports = reports
    .filter((report) => {
      // Filter by search query
      if (
        searchQuery &&
        !report.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by report type
      if (filterType && report.report_type !== filterType) {
        return false;
      }

      // Filter by premium status
      if (premiumFilter === "premium" && !report.is_premium) {
        return false;
      }

      if (premiumFilter === "free" && report.is_premium) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by creation date (newest first)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  // Get unique report types for filter
  const reportTypes = Array.from(
    new Set(reports.map((report) => report.report_type)),
  );

  // Find the selected report
  const reportToView = reports.find((r) => r.id === selectedReport);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (selectedReport && reportToView) {
    return (
      <div className="bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleCloseReport}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5 mr-2" />
              Close Report
            </button>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => handleShareReport(reportToView)}
                title="Share Report"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => handleExportReport(reportToView)}
                title="Export as PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this report?",
                    )
                  ) {
                    handleDeleteReport(reportToView.id);
                  }
                }}
                title="Delete Report"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <HTMLReportViewer report={reportToView} />
        </div>
      </div>
    );
  }

  if (showWizard) {
    // Get the chart ID from URL params if it exists
    const chartId = searchParams.get("chart");

    return (
      <ReportWizard
        onClose={handleCloseWizard}
        selectedChartId={chartId || undefined}
      />
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Reports</h1>
            <p className="text-gray-400">
              View and manage your astrological reports
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleCreateReport} icon={Plus}>
              Create Report
            </Button>
            <Button
              variant="outline"
              icon={SlidersHorizontal}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>
        </div>

        {/* Birth Charts Section */}
        {birthCharts.length > 0 && (
          <div className="mb-8 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">
              Your Birth Charts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {birthCharts.slice(0, 4).map((chart) => (
                <div
                  key={chart.id}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50 hover:border-purple-500/50 transition-all duration-200"
                >
                  <h3 className="font-medium text-white mb-1">{chart.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {new Date(chart.birth_date).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <Link
                      to={`/astrology/birth-chart?id=${chart.id}`}
                      className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors flex-1 text-center"
                    >
                      View Chart
                    </Link>
                    <button
                      onClick={() => {
                        setShowWizard(true);
                        searchParams.set("chart", chart.id);
                        setSearchParams(searchParams);
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded transition-colors flex-1"
                    >
                      Generate Report
                    </button>
                  </div>
                </div>
              ))}

              {birthCharts.length > 4 && (
                <Link
                  to="/astrology/birth-chart"
                  className="bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-4 border border-gray-600/30 transition-colors flex items-center justify-center"
                >
                  <span className="text-gray-400">
                    View all {birthCharts.length} charts
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Type:</span>
                  {reportTypes.map((type) => (
                    <button
                      key={type}
                      className={`px-3 py-1 rounded-full text-sm ${filterType === type ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"} transition-colors`}
                      onClick={() => handleFilterChange(type)}
                    >
                      {type
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Premium:</span>
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${premiumFilter === "all" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"} transition-colors`}
                    onClick={() => handlePremiumFilterChange("all")}
                  >
                    All
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${premiumFilter === "premium" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"} transition-colors`}
                    onClick={() => handlePremiumFilterChange("premium")}
                  >
                    Premium
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${premiumFilter === "free" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"} transition-colors`}
                    onClick={() => handlePremiumFilterChange("free")}
                  >
                    Free
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-gray-400">View:</span>
                <button
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"} transition-colors`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded ${viewMode === "list" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"} transition-colors`}
                  onClick={() => setViewMode("list")}
                >
                  <ListIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        {filteredReports.length > 0 ? (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                layout={viewMode}
                onView={() => handleViewReport(report)}
                onShare={() => handleShareReport(report)}
                onExport={(report) => handleExportReport(report)}
                onDelete={() => handleDeleteReport(report.id)}
              />
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700/50">
            <Filter className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No matching reports
            </h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterType(null);
                setPremiumFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700/50">
            <Eye className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No reports yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first astrological report to get insights into your
              birth chart
            </p>
            <Button onClick={handleCreateReport} icon={Plus}>
              Create Your First Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDashboard;
