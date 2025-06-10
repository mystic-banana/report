import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Share2,
  User,
  ArrowLeft,
  Edit,
  Bookmark,
  Trash2,
  BarChart3,
  Crown,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { AstrologyReport } from "../../store/astrologyStore";
import Button from "../ui/Button";
import HTMLReportViewer from "./HTMLReportViewer";
import toast from "react-hot-toast";
import PDFExportButton from "./PDFExportButton";

interface ReportDetailsProps {
  report: AstrologyReport;
  birthChartName?: string;
  onDelete?: (report: AstrologyReport) => void;
  onShare?: (report: AstrologyReport) => void;
  onEdit?: (report: AstrologyReport) => void;
  onBack?: () => void;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({
  report,
  birthChartName = "Unknown",
  onDelete,
  onShare,
  onEdit,
  onBack,
}) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "metadata">("content");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatReportType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "natal":
      case "birth-chart":
        return "⭐";
      case "vedic":
        return "🕉️";
      case "chinese":
        return "☯️";
      case "hellenistic":
        return "🏛️";
      case "transit":
        return "🌙";
      case "compatibility":
        return "💕";
      default:
        return "📊";
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "natal":
      case "birth-chart":
        return "from-blue-600 to-purple-600";
      case "vedic":
        return "from-orange-600 to-red-600";
      case "chinese":
        return "from-green-600 to-teal-600";
      case "hellenistic":
        return "from-purple-600 to-pink-600";
      case "transit":
        return "from-indigo-600 to-blue-600";
      case "compatibility":
        return "from-pink-600 to-rose-600";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Bookmark removed" : "Report bookmarked");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const wordCount = report.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-dark-900" : ""} flex flex-col h-full`}>
      {/* Header */}
      <div 
        className={`${isFullscreen ? "p-4" : "pb-6"} border-b border-dark-700 print:hidden`}
        style={{ display: isFullscreen ? "flex" : undefined }}
      >
        {isFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(false)}
            className="mr-auto"
          >
            Exit Fullscreen
          </Button>
        )}

        {!isFullscreen && (
          <>
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                onClick={handleBack}
              >
                Back to Reports
              </Button>

              <div className="flex space-x-2">
                <PDFExportButton
                  reportId={report.id}
                  reportTitle={report.title}
                  reportType={formatReportType(report.report_type)}
                  variant="outline"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  icon={Bookmark}
                  onClick={handleBookmark}
                  className={isBookmarked ? "text-amber-500" : ""}
                >
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
                {onEdit && (
                  <Button variant="ghost" size="sm" icon={Edit} onClick={() => onEdit(report)}>
                    Edit
                  </Button>
                )}
                {onShare && (
                  <Button variant="ghost" size="sm" icon={Share2} onClick={() => onShare(report)}>
                    Share
                  </Button>
                )}
                <Button variant="ghost" size="sm" icon={Printer} onClick={handlePrint}>
                  Print
                </Button>
                {onDelete && (
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onDelete(report)}>
                    Delete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(true)}
                >
                  Enter Fullscreen
                </Button>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">{report.title}</h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 mr-2 rounded-md flex items-center justify-center bg-gradient-to-br ${getReportTypeColor(
                    report.report_type
                  )}`}
                >
                  {getReportTypeIcon(report.report_type)}
                </div>
                <span>{formatReportType(report.report_type)} Report</span>
                {report.is_premium && (
                  <span className="ml-2 bg-amber-500/20 text-amber-300 px-2 py-0.5 text-xs rounded-full flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{birthChartName}</span>
              </div>

              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{format(new Date(report.created_at), "MMM d, yyyy")}</span>
              </div>

              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{readingTime} min read</span>
              </div>

              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-1" />
                <span>{wordCount.toLocaleString()} words</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!isFullscreen && (
          <div className="flex border-b border-dark-700 print:hidden">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "content"
                  ? "text-white border-b-2 border-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("content")}
            >
              Report Content
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "metadata"
                  ? "text-white border-b-2 border-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("metadata")}
            >
              Details & Metadata
            </button>
          </div>
        )}

        {activeTab === "content" && (
          <div className="p-4 sm:p-6">
            <HTMLReportViewer reportContent={report.content} />
          </div>
        )}

        {activeTab === "metadata" && (
          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Report Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Report Type</h4>
                  <p className="text-white">{formatReportType(report.report_type)}</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Creation Date</h4>
                  <p className="text-white">{format(new Date(report.created_at), "PPP")}</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Last Updated</h4>
                  <p className="text-white">{format(new Date(report.updated_at), "PPP")}</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Report ID</h4>
                  <p className="text-white font-mono text-sm">{report.id}</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Birth Chart ID</h4>
                  <p className="text-white font-mono text-sm">{report.birth_chart_id}</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Template ID</h4>
                  <p className="text-white font-mono text-sm">{report.template_id || "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Content Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Word Count</h4>
                  <p className="text-white text-xl font-semibold">{wordCount.toLocaleString()}</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Reading Time</h4>
                  <p className="text-white text-xl font-semibold">{readingTime} minutes</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-1">Premium Content</h4>
                  <p className="text-white text-xl font-semibold">
                    {report.is_premium ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetails;
