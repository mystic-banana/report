import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import {
  Bookmark,
  FileText,
  Eye,
  Download,
  ArrowRight,
  Star,
  Crown,
  Calendar,
} from "lucide-react";
import Button from "../ui/Button";

const SavedContentSection: React.FC = () => {
  const { user } = useAuthStore();
  const { reports, fetchReports, exportReportToPDF } = useAstrologyStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadReports = async () => {
        setLoading(true);
        try {
          await fetchReports(user.id);
        } catch (error) {
          console.error("Error loading saved reports:", error);
        } finally {
          setLoading(false);
        }
      };
      loadReports();
    }
  }, [user, fetchReports]);

  const handleExportPDF = async (reportId: string) => {
    try {
      await exportReportToPDF(reportId);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const getReportTypeColor = (reportType: string) => {
    const colors = {
      natal: "text-purple-400 bg-purple-500/20",
      vedic: "text-amber-400 bg-amber-500/20",
      compatibility: "text-pink-400 bg-pink-500/20",
      transit: "text-blue-400 bg-blue-500/20",
      yearly: "text-green-400 bg-green-500/20",
      career: "text-orange-400 bg-orange-500/20",
    };
    return colors[reportType] || "text-gray-400 bg-gray-500/20";
  };

  const getReportTypeIcon = (reportType: string) => {
    const icons = {
      natal: Star,
      vedic: Star,
      compatibility: FileText,
      transit: Calendar,
      yearly: Calendar,
      career: FileText,
    };
    return icons[reportType] || FileText;
  };

  if (loading) {
    return (
      <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
        <div className="flex items-center mb-6">
          <Bookmark className="w-6 h-6 text-amber-400 mr-3" />
          <h3 className="text-xl font-semibold text-white">Saved Reports</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-dark-600 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-dark-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-dark-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const savedReports = reports.slice(0, 6); // Show top 6 most recent

  return (
    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bookmark className="w-6 h-6 text-amber-400 mr-3" />
          <h3 className="text-xl font-semibold text-white">Saved Reports</h3>
          <span className="ml-2 bg-amber-500/20 text-amber-400 text-sm px-2 py-1 rounded-full">
            {reports.length}
          </span>
        </div>
        <Link to="/astrology/reports">
          <Button variant="ghost" size="sm" icon={ArrowRight}>
            View All
          </Button>
        </Link>
      </div>

      {savedReports.length > 0 ? (
        <div className="space-y-4">
          {savedReports.map((report) => {
            const ReportIcon = getReportTypeIcon(report.report_type);
            const colorClasses = getReportTypeColor(report.report_type);

            return (
              <div
                key={report.id}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-700/50 transition-colors group"
              >
                <div
                  className={`w-10 h-10 ${colorClasses.split(" ")[1]} rounded-lg flex items-center justify-center`}
                >
                  <ReportIcon
                    className={`w-5 h-5 ${colorClasses.split(" ")[0]}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-white font-medium text-sm truncate group-hover:text-amber-300 transition-colors">
                      {report.title}
                    </h4>
                    {report.is_premium && (
                      <Crown className="w-3 h-3 text-amber-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${colorClasses}`}
                    >
                      {report.report_type
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleExportPDF(report.id)}
                    variant="ghost"
                    size="sm"
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Link to={`/astrology/reports`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">
            No Saved Reports Yet
          </h4>
          <p className="text-gray-500 mb-4">
            Generate your first astrological report to save it here
          </p>
          <Link to="/astrology/birth-chart">
            <Button
              className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-600 hover:to-orange-600"
              icon={Star}
            >
              Create Birth Chart
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      {reports.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dark-600">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-amber-400">
                {reports.filter((r) => r.is_premium).length}
              </div>
              <div className="text-xs text-gray-400">Premium Reports</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-400">
                {reports.filter((r) => !r.is_premium).length}
              </div>
              <div className="text-xs text-gray-400">Free Reports</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedContentSection;
