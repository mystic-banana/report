import React, { useState } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Eye,
  Download,
  Share2,
  Crown,
  Star,
  User,
  MapPin,
  ChevronRight,
  X,
  Maximize2,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import type { AstrologyReport, BirthChart } from "../../store/astrologyStore";

interface ReportPreviewProps {
  report: AstrologyReport;
  birthChart?: BirthChart;
  onViewFull?: (reportId: string) => void;
  onDownload?: (reportId: string) => void;
  onShare?: (reportId: string) => void;
  onClose?: () => void;
  className?: string;
  variant?: "card" | "modal" | "inline";
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
  report,
  birthChart,
  onViewFull,
  onDownload,
  onShare,
  onClose,
  className = "",
  variant = "card",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract key information from report content
  const getReportSummary = (content: string): string => {
    if (!content) return "No preview available";

    // Remove markdown formatting and get first paragraph
    const cleanContent = content
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold markdown
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic markdown
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\n\n+/g, " ") // Replace multiple newlines with space
      .trim();

    // Get first 200 characters
    return cleanContent.length > 200
      ? cleanContent.substring(0, 200) + "..."
      : cleanContent;
  };

  const getReportTypeInfo = (type: string) => {
    const typeMap = {
      natal: { label: "Natal Chart", icon: Star, color: "blue" },
      vedic: { label: "Vedic Astrology", icon: Sparkles, color: "orange" },
      transit: { label: "Transit Report", icon: Clock, color: "green" },
      compatibility: { label: "Compatibility", icon: User, color: "pink" },
      yearly: { label: "Yearly Forecast", icon: Calendar, color: "purple" },
      career: { label: "Career Analysis", icon: BookOpen, color: "indigo" },
      relationships: { label: "Relationships", icon: User, color: "rose" },
    };

    return (
      typeMap[type] || {
        label: type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        icon: FileText,
        color: "gray",
      }
    );
  };

  const typeInfo = getReportTypeInfo(report.report_type);
  const TypeIcon = typeInfo.icon;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Unknown date";
    }
  };

  const getWordCount = (content: string): number => {
    return content
      ? content.split(/\s+/).filter((word) => word.length > 0).length
      : 0;
  };

  const getReadingTime = (content: string): number => {
    const wordCount = getWordCount(content);
    return Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 words per minute
  };

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-dark-700">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 bg-${typeInfo.color}-500/20 rounded-xl flex items-center justify-center`}
              >
                <TypeIcon size={24} className={`text-${typeInfo.color}-400`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{report.title}</h2>
                <p className="text-sm text-gray-400">{typeInfo.label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <ReportPreviewContent
              report={report}
              birthChart={birthChart}
              typeInfo={typeInfo}
              formatDate={formatDate}
              getReportSummary={getReportSummary}
              getWordCount={getWordCount}
              getReadingTime={getReadingTime}
              isExpanded={true}
              onViewFull={onViewFull}
              onDownload={onDownload}
              onShare={onShare}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`bg-dark-800/50 rounded-xl border border-dark-700 p-6 ${className}`}
      >
        <ReportPreviewContent
          report={report}
          birthChart={birthChart}
          typeInfo={typeInfo}
          formatDate={formatDate}
          getReportSummary={getReportSummary}
          getWordCount={getWordCount}
          getReadingTime={getReadingTime}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          onViewFull={onViewFull}
          onDownload={onDownload}
          onShare={onShare}
        />
      </div>
    );
  }

  // Default card variant
  return (
    <div
      className={`bg-dark-800/50 rounded-xl border border-dark-700 hover:border-accent-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10 ${className}`}
    >
      <div className="p-6">
        <ReportPreviewContent
          report={report}
          birthChart={birthChart}
          typeInfo={typeInfo}
          formatDate={formatDate}
          getReportSummary={getReportSummary}
          getWordCount={getWordCount}
          getReadingTime={getReadingTime}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          onViewFull={onViewFull}
          onDownload={onDownload}
          onShare={onShare}
        />
      </div>
    </div>
  );
};

// Separate component for the actual content to avoid duplication
interface ReportPreviewContentProps {
  report: AstrologyReport;
  birthChart?: BirthChart;
  typeInfo: { label: string; icon: any; color: string };
  formatDate: (date: string) => string;
  getReportSummary: (content: string) => string;
  getWordCount: (content: string) => number;
  getReadingTime: (content: string) => number;
  isExpanded: boolean;
  onToggleExpanded?: () => void;
  onViewFull?: (reportId: string) => void;
  onDownload?: (reportId: string) => void;
  onShare?: (reportId: string) => void;
}

const ReportPreviewContent: React.FC<ReportPreviewContentProps> = ({
  report,
  birthChart,
  typeInfo,
  formatDate,
  getReportSummary,
  getWordCount,
  getReadingTime,
  isExpanded,
  onToggleExpanded,
  onViewFull,
  onDownload,
  onShare,
}) => {
  const TypeIcon = typeInfo.icon;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 bg-${typeInfo.color}-500/20 rounded-xl flex items-center justify-center flex-shrink-0`}
          >
            <TypeIcon size={24} className={`text-${typeInfo.color}-400`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-white line-clamp-2">
                {report.title}
              </h3>
              {report.is_premium && (
                <Crown size={16} className="text-amber-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span
                className={`px-2 py-1 bg-${typeInfo.color}-500/20 text-${typeInfo.color}-300 rounded-full text-xs font-medium`}
              >
                {typeInfo.label}
              </span>
              <span>•</span>
              <span>{formatDate(report.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Birth Chart Info */}
      {birthChart && (
        <div className="bg-dark-700/30 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <User size={16} className="text-accent-400" />
            <div>
              <p className="text-white font-medium">{birthChart.name}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>
                    {format(new Date(birthChart.birth_date), "MMM d, yyyy")}
                  </span>
                </div>
                {birthChart.birth_time && (
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{birthChart.birth_time}</span>
                  </div>
                )}
                {birthChart.birth_location && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>
                      {birthChart.birth_location.city},{" "}
                      {birthChart.birth_location.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-dark-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">
            {getWordCount(report.content).toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Words</div>
        </div>
        <div className="bg-dark-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">
            {getReadingTime(report.content)}
          </div>
          <div className="text-xs text-gray-400">Min Read</div>
        </div>
        <div className="bg-dark-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">
            {report.is_premium ? "Premium" : "Standard"}
          </div>
          <div className="text-xs text-gray-400">Type</div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          Report Preview
        </h4>
        <div className="bg-dark-700/30 rounded-lg p-4">
          <p className="text-gray-300 leading-relaxed">
            {isExpanded ? report.content : getReportSummary(report.content)}
          </p>
          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className="mt-3 text-accent-400 hover:text-accent-300 text-sm font-medium flex items-center space-x-1 transition-colors"
            >
              <span>{isExpanded ? "Show Less" : "Show More"}</span>
              <ChevronRight
                size={14}
                className={`transform transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
        <div className="flex items-center space-x-2">
          {onViewFull && (
            <button
              onClick={() => onViewFull(report.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors"
            >
              <Eye size={16} />
              <span>View Full Report</span>
            </button>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload(report.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg font-medium transition-colors"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          )}
        </div>

        {onShare && (
          <button
            onClick={() => onShare(report.id)}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Share Report"
          >
            <Share2 size={16} />
          </button>
        )}
      </div>
    </>
  );
};

export default ReportPreview;
