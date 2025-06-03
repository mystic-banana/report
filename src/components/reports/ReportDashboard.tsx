import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAstrologyStore } from "../../store/astrologyStore";
import { supabase } from "../../lib/supabaseClient";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import HTMLReportViewer from "./HTMLReportViewer";
import ReportWizard from "./ReportWizard";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  Download,
  Eye,
  Trash2,
  Crown,
} from "lucide-react";

const ReportDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { reports, birthCharts, setReports, removeReport } =
    useAstrologyStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("astrology_reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    // Check if we should open a specific report from URL params
    const viewReportId = searchParams.get("view");
    if (viewReportId) {
      setSelectedReport(viewReportId);
    }
  }, [setReports, searchParams]);

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const { error } = await supabase
        .from("astrology_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;
      removeReport(reportId);
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const filteredReports = reports
    .filter((report) => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!report.title.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Apply type filter
      if (filterType && report.report_type !== filterType) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.created_at || "").getTime();
        const dateB = new Date(b.created_at || "").getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

  const reportTypes = Array.from(new Set(reports.map((r) => r.report_type)));

  const getBirthChartName = (birthChartId: string) => {
    const chart = birthCharts.find((c) => c.id === birthChartId);
    return chart ? chart.name : "Unknown";
  };

  const getReportTypeLabel = (type: string) => {
    return type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getReportTypeColor = (type: string) => {
    if (type.includes("vedic")) return "bg-orange-500/20 text-orange-300";
    if (type.includes("hellenistic")) return "bg-purple-500/20 text-purple-300";
    if (type.includes("chinese")) return "bg-red-500/20 text-red-300";
    if (type.includes("transit")) return "bg-blue-500/20 text-blue-300";
    return "bg-green-500/20 text-green-300";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Astrological Reports
          </h1>
          <p className="text-gray-400">
            View, manage, and create personalized astrological reports
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={() => setShowWizard(true)}
          >
            Create New Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <select
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={filterType || ""}
                onChange={(e) => setFilterType(e.target.value || null)}
              >
                <option value="">All Report Types</option>
                {reportTypes.map((type) => (
                  <option key={type} value={type}>
                    {getReportTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy as "date" | "name");
                  setSortOrder(newSortOrder as "asc" | "desc");
                }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              {searchTerm || filterType
                ? "No matching reports found"
                : "No reports yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterType
                ? "Try adjusting your search or filters"
                : "Create your first astrological report to get started"}
            </p>
            {!searchTerm && !filterType && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowWizard(true)}
              >
                Create New Report
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">
                    Report Name
                  </th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">
                    Birth Chart
                  </th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">
                    Created
                  </th>
                  <th className="text-right py-4 px-6 text-gray-300 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center">
                            {report.title}
                            {report.is_premium && (
                              <Crown className="w-4 h-4 text-amber-400 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {report.status === "pending" ? (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Processing
                              </span>
                            ) : (
                              "Ready"
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.report_type)}`}
                      >
                        {getReportTypeLabel(report.report_type)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {getBirthChartName(report.birth_chart_id)}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {formatDate(report.created_at || "")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          onClick={() => setSelectedReport(report.id)}
                          title="View Report"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          onClick={() => handleDeleteReport(report.id)}
                          title="Delete Report"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Templates Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Natal Chart Template */}
          <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-colors">
            <div className="h-40 bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative">
              <img
                src="https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=500&q=80"
                alt="Natal Chart"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white text-center px-4 drop-shadow-lg">
                  Basic Natal Chart
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Essential planetary positions and their meanings in your birth
                chart.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowWizard(true);
                }}
              >
                Use Template
              </Button>
            </div>
          </div>

          {/* Vedic Astrology Template */}
          <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-colors">
            <div className="h-40 bg-gradient-to-br from-orange-600/20 to-red-600/20 relative">
              <img
                src="https://images.unsplash.com/photo-1545922421-5ec0bc0f0ef8?w=500&q=80"
                alt="Vedic Astrology"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white text-center px-4 drop-shadow-lg">
                  Vedic Astrology
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Traditional Jyotish analysis with Nakshatras and Vedic house
                interpretations.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowWizard(true);
                }}
              >
                Use Template
              </Button>
            </div>
          </div>

          {/* Transit Report Template */}
          <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-colors">
            <div className="h-40 bg-gradient-to-br from-green-600/20 to-teal-600/20 relative">
              <img
                src="https://images.unsplash.com/photo-1517976487492-5750f3195933?w=500&q=80"
                alt="Transit Report"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white text-center px-4 drop-shadow-lg">
                  Transit Report
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Current planetary influences on your chart and upcoming
                transits.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowWizard(true);
                }}
              >
                Use Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Wizard Modal */}
      {showWizard && <ReportWizard onClose={() => setShowWizard(false)} />}

      {/* Report Viewer Modal */}
      {selectedReport && (
        <HTMLReportViewer
          report={reports.find((r) => r.id === selectedReport)!}
          onClose={() => {
            setSelectedReport(null);
            // Remove the view parameter from URL
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("view");
            setSearchParams(newParams);
          }}
        />
      )}
    </div>
  );
};

export default ReportDashboard;
