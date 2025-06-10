import React, { useState } from "react";
import {
  FileText,
  Download,
  Share2,
  Settings,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";
import { useReportGeneration } from "../../hooks/useReportGeneration";
import type {
  BirthData,
  ReportType,
  ReportConfig,
} from "../../types/reportTypes";

interface ReportGenerationPanelProps {
  birthData?: BirthData;
  onReportGenerated?: (reportId: string) => void;
  className?: string;
}

const ReportGenerationPanel: React.FC<ReportGenerationPanelProps> = ({
  birthData,
  onReportGenerated,
  className = "",
}) => {
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType>("western");
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    detailLevel: "detailed",
    includeCharts: true,
    includePDF: false,
    saveToDatabase: true,
    theme: "mystical",
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const {
    isGenerating,
    progress,
    currentReport,
    error,
    generateReport,
    generateCompatibilityReport,
    generateTransitReport,
    cancelGeneration,
    clearError,
    getProgressPercentage,
    getProgressMessage,
    canCancel,
  } = useReportGeneration({
    autoSave: true,
    onComplete: (report) => {
      if (onReportGenerated) {
        onReportGenerated(report.id);
      }
    },
  });

  const reportTypes = [
    {
      id: "western" as ReportType,
      name: "Western Astrology",
      description: "Traditional Western astrological analysis",
      icon: Star,
      color: "accent",
    },
    {
      id: "vedic" as ReportType,
      name: "Vedic Astrology",
      description: "Ancient Indian astrological system",
      icon: Star,
      color: "purple",
    },
    {
      id: "chinese" as ReportType,
      name: "Chinese Astrology",
      description: "Four Pillars of Destiny analysis",
      icon: Star,
      color: "emerald",
    },
    {
      id: "hellenistic" as ReportType,
      name: "Hellenistic",
      description: "Classical Hellenistic techniques",
      icon: Star,
      color: "amber",
    },
  ];

  const handleGenerateReport = async () => {
    if (!birthData) return;

    clearError();
    await generateReport(birthData, selectedReportType, reportConfig);
  };

  const handleGenerateCompatibility = async () => {
    // This would need two birth data sets - placeholder for now
    console.log("Compatibility report generation not implemented in this demo");
  };

  const handleGenerateTransit = async () => {
    if (!birthData) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // 3 months ahead

    await generateTransitReport(birthData, startDate, endDate, reportConfig);
  };

  const downloadReport = () => {
    if (!currentReport) return;

    const blob = new Blob([currentReport.formats.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentReport.type}-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-500/20 rounded-full flex items-center justify-center">
            <FileText size={20} className="text-accent-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Report Generation
            </h3>
            <p className="text-sm text-gray-400">
              Create detailed astrological reports
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Report Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Report Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReportType(type.id)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedReportType === type.id
                    ? `border-${type.color}-500 bg-${type.color}-500/10`
                    : "border-dark-600 hover:border-dark-500 bg-dark-700/50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon
                    size={20}
                    className={`mt-0.5 ${
                      selectedReportType === type.id
                        ? `text-${type.color}-400`
                        : "text-gray-400"
                    }`}
                  />
                  <div>
                    <h4
                      className={`font-medium ${
                        selectedReportType === type.id
                          ? `text-${type.color}-300`
                          : "text-white"
                      }`}
                    >
                      {type.name}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <div className="mb-6 p-4 bg-dark-700/30 rounded-lg border border-dark-600">
          <h4 className="text-sm font-medium text-white mb-4">
            Advanced Options
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Detail Level
              </label>
              <select
                value={reportConfig.detailLevel}
                onChange={(e) =>
                  setReportConfig({
                    ...reportConfig,
                    detailLevel: e.target.value as
                      | "basic"
                      | "detailed"
                      | "comprehensive",
                  })
                }
                className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Theme</label>
              <select
                value={reportConfig.theme}
                onChange={(e) =>
                  setReportConfig({
                    ...reportConfig,
                    theme: e.target.value as "light" | "dark" | "mystical",
                  })
                }
                className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="mystical">Mystical</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={reportConfig.includeCharts}
                onChange={(e) =>
                  setReportConfig({
                    ...reportConfig,
                    includeCharts: e.target.checked,
                  })
                }
                className="w-4 h-4 text-accent-600 bg-dark-600 border-dark-500 rounded focus:ring-accent-500"
              />
              <span className="text-sm text-gray-300">Include Charts</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={reportConfig.includePDF}
                onChange={(e) =>
                  setReportConfig({
                    ...reportConfig,
                    includePDF: e.target.checked,
                  })
                }
                className="w-4 h-4 text-accent-600 bg-dark-600 border-dark-500 rounded focus:ring-accent-500"
              />
              <span className="text-sm text-gray-300">Generate PDF</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={reportConfig.saveToDatabase}
                onChange={(e) =>
                  setReportConfig({
                    ...reportConfig,
                    saveToDatabase: e.target.checked,
                  })
                }
                className="w-4 h-4 text-accent-600 bg-dark-600 border-dark-500 rounded focus:ring-accent-500"
              />
              <span className="text-sm text-gray-300">Save to Account</span>
            </label>
          </div>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="mb-6 p-4 bg-accent-500/10 border border-accent-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Loader2 size={16} className="text-accent-400 animate-spin" />
              <span className="text-sm font-medium text-accent-300">
                Generating Report
              </span>
            </div>
            {canCancel && (
              <button
                onClick={cancelGeneration}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <Square size={16} />
              </button>
            )}
          </div>

          <div className="w-full bg-dark-700 rounded-full h-2 mb-2">
            <div
              className="bg-accent-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>

          <p className="text-xs text-gray-400">{getProgressMessage()}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle
              size={20}
              className="text-red-400 mt-0.5 flex-shrink-0"
            />
            <div>
              <h4 className="text-sm font-medium text-red-300 mb-1">
                Generation Failed
              </h4>
              <p className="text-sm text-red-200">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {currentReport && !isGenerating && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle
              size={20}
              className="text-green-400 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-300 mb-1">
                Report Generated Successfully
              </h4>
              <p className="text-sm text-green-200 mb-3">
                Your {currentReport.type} report is ready for viewing.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadReport}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-1 bg-dark-600 hover:bg-dark-500 text-gray-300 rounded-md text-sm transition-colors">
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generation Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleGenerateReport}
          disabled={!birthData || isGenerating}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          <Play size={16} />
          <span>
            {isGenerating
              ? "Generating..."
              : `Generate ${selectedReportType} Report`}
          </span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleGenerateCompatibility}
            disabled={!birthData || isGenerating}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <Users size={16} />
            <span>Compatibility</span>
          </button>

          <button
            onClick={handleGenerateTransit}
            disabled={!birthData || isGenerating}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <Calendar size={16} />
            <span>Transits</span>
          </button>
        </div>
      </div>

      {/* Birth Data Required Notice */}
      {!birthData && (
        <div className="mt-4 p-3 bg-amber-900/30 border border-amber-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-amber-400" />
            <span className="text-sm text-amber-200">
              Complete birth data is required to generate reports
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerationPanel;
