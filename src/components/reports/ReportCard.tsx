import React, { useState } from "react";
import ExportPdfDialog from "./ExportPdfDialog";
import {
  FileText,
  Calendar,
  Eye,
  Share2,
  Download,
  Trash2,
  Crown,
  Clock,
  MoreVertical,
  BookmarkPlus,
  Copy,
  BarChart3,
} from "lucide-react";
import { AstrologyReport } from "../../store/astrologyStore";
import Button from "../ui/Button";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface ReportCardProps {
  report: AstrologyReport;
  layout?: "grid" | "list";
  showActions?: boolean;
  onView?: (report: AstrologyReport) => void;
  onShare?: (report: AstrologyReport) => void;
  onExport?: (report: AstrologyReport) => void;
  onDelete?: (report: AstrologyReport) => void;
  onBookmark?: (report: AstrologyReport) => void;
  className?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  layout = "grid",
  showActions = true,
  onView,
  onShare,
  onExport,
  onDelete,
  onBookmark,
  className = "",
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  const formatReportType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleAction = (action: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMenu(false);

    switch (action) {
      case "view":
        onView?.(report);
        break;
      case "share":
        onShare?.(report);
        break;
      case "export":
        onExport?.(report);
        break;
      case "bookmark":
        setIsBookmarked(!isBookmarked);
        onBookmark?.(report);
        toast.success(isBookmarked ? "Bookmark removed" : "Report bookmarked");
        break;
      case "copy":
        navigator.clipboard.writeText(report.content);
        toast.success("Report content copied to clipboard");
        break;
      case "delete":
        if (window.confirm("Are you sure you want to delete this report?")) {
          onDelete?.(report);
        }
        break;
    }
  };

  const handleCardClick = () => {
    onView?.(report);
  };

  if (layout === "list") {
    return (
      <div
        className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-all duration-200 cursor-pointer group ${className}`}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Report Icon */}
            <div
              className={`w-12 h-12 bg-gradient-to-br ${getReportTypeColor(report.report_type)} rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg`}
            >
              {getReportTypeIcon(report.report_type)}
            </div>

            {/* Report Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                  {report.title}
                </h3>
                {report.is_premium && (
                  <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>{formatReportType(report.report_type)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {Math.ceil(report.content.split(" ").length / 200)} min read
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={(e) => handleAction("view", e)}
                variant="ghost"
                size="sm"
                icon={Eye}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View
              </Button>
              <Button
                onClick={(e) => handleAction("share", e)}
                variant="ghost"
                size="sm"
                icon={Share2}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <ExportPdfDialog 
                report={report}
                trigger={(
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Download}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              />
              <div className="relative">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  variant="ghost"
                  size="sm"
                  icon={MoreVertical}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={(e) => handleAction("bookmark", e)}
                        className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center space-x-2"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        <span>Bookmark</span>
                      </button>
                      <button
                        onClick={(e) => handleAction("copy", e)}
                        className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Content</span>
                      </button>
                      <button
                        onClick={(e) => handleAction("delete", e)}
                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 transition-colors flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid layout
  return (
    <div
      className={`bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-200 cursor-pointer group hover:shadow-xl hover:shadow-amber-500/10 ${className}`}
      onClick={handleCardClick}
    >
      {/* Header with gradient */}
      <div
        className={`h-24 bg-gradient-to-br ${getReportTypeColor(report.report_type)} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-3 left-4 text-white">
          <div className="text-2xl mb-1">
            {getReportTypeIcon(report.report_type)}
          </div>
          <div className="text-xs font-medium opacity-90">
            {formatReportType(report.report_type)}
          </div>
        </div>
        {report.is_premium && (
          <div className="absolute top-3 right-4">
            <Crown className="w-5 h-5 text-amber-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
          {report.title}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {report.content.substring(0, 120)}...
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>
                {formatDistanceToNow(new Date(report.created_at), {
                  addSuffix: true,
                })}
              </span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>
                {Math.ceil(report.content.split(" ").length / 200)} min
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart3 className="w-3 h-3" />
            <span>{report.content.split(" ").length} words</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={(e) => handleAction("view", e)}
                variant="primary"
                size="sm"
                icon={Eye}
                className="flex-1"
              >
                View
              </Button>
              <Button
                onClick={(e) => handleAction("share", e)}
                variant="ghost"
                size="sm"
                icon={Share2}
              />
              <ExportPdfDialog 
                report={report}
                trigger={(
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Download}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              />
            </div>
            <div className="relative">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                variant="ghost"
                size="sm"
                icon={MoreVertical}
              />
              {showMenu && (
                <div className="absolute right-0 bottom-full mb-1 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={(e) => handleAction("bookmark", e)}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>
                        {isBookmarked ? "Remove Bookmark" : "Bookmark"}
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleAction("copy", e)}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Content</span>
                    </button>
                    <button
                      onClick={(e) => handleAction("delete", e)}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
