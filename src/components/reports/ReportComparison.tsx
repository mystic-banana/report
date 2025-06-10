import React, { useState, useEffect, useRef } from "react";
import { reportComparisonService } from "../../services/reportComparisonService";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import {
  X,
  Plus,
  Minus,
  RotateCcw,
  Download,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ArrowLeftRight,
  BarChart3,
  Filter,
  Search,
  Palette,
  Link,
  Unlink,
} from "lucide-react";
import type {
  ReportComparison,
  ComparisonResult,
  ComparisonSettings,
  GeneratedReport,
} from "../../types/reportTypes";
import { AstrologyReport } from "../../store/astrologyStore";
import toast from "react-hot-toast";

interface ReportComparisonProps {
  reports: AstrologyReport[];
  onClose: () => void;
  initialComparison?: ReportComparison;
}

const ReportComparison: React.FC<ReportComparisonProps> = ({
  reports,
  onClose,
  initialComparison,
}) => {
  const { user } = useAuthStore();
  const [comparison, setComparison] = useState<ReportComparison | null>(
    initialComparison || null,
  );
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);
  const [selectedReports, setSelectedReports] = useState<string[]>(
    initialComparison?.reports.map((r) => r.id) || [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [viewMode, setViewMode] = useState<
    "side-by-side" | "overlay" | "tabbed"
  >("side-by-side");
  const [syncScrolling, setSyncScrolling] = useState(true);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [showSimilarities, setShowSimilarities] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [colorScheme, setColorScheme] = useState<
    "default" | "high-contrast" | "colorblind-friendly"
  >("default");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (initialComparison) {
      performComparison(initialComparison);
    }
  }, [initialComparison]);

  const createComparison = async () => {
    if (selectedReports.length < 2) {
      toast.error("Please select at least 2 reports to compare");
      return;
    }

    setIsLoading(true);
    try {
      const comparisonName = `Comparison ${new Date().toLocaleDateString()}`;
      const newComparison = await reportComparisonService.createComparison(
        comparisonName,
        selectedReports,
        {
          highlightDifferences,
          showSimilarities,
          syncScrolling,
          colorScheme,
        },
      );

      if (newComparison) {
        setComparison(newComparison);
        await performComparison(newComparison);
        toast.success("Comparison created successfully");
      } else {
        toast.error("Failed to create comparison");
      }
    } catch (error) {
      console.error("Error creating comparison:", error);
      toast.error("Failed to create comparison");
    } finally {
      setIsLoading(false);
    }
  };

  const performComparison = async (comp: ReportComparison) => {
    setIsLoading(true);
    try {
      const result = await reportComparisonService.compareReports(
        comp.reports,
        comp.settings,
      );
      setComparisonResult(result);
    } catch (error) {
      console.error("Error performing comparison:", error);
      toast.error("Failed to perform comparison");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<ComparisonSettings>) => {
    if (!comparison) return;

    const updatedComparison = await reportComparisonService.updateComparison(
      comparison.id,
      {
        settings: { ...comparison.settings, ...newSettings },
      },
    );

    if (updatedComparison) {
      setComparison(updatedComparison);
      await performComparison(updatedComparison);
    }
  };

  const handleScroll = (
    index: number,
    event: React.UIEvent<HTMLDivElement>,
  ) => {
    if (!syncScrolling) return;

    const scrollTop = event.currentTarget.scrollTop;
    scrollRefs.current.forEach((ref, i) => {
      if (i !== index && ref) {
        ref.scrollTop = scrollTop;
      }
    });
  };

  const exportComparison = async (format: "json" | "csv" | "html") => {
    if (!comparison || !comparisonResult) return;

    try {
      const blob = await reportComparisonService.exportComparison(
        comparison,
        comparisonResult,
        format,
      );

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `comparison_${comparison.name.replace(/\s+/g, "_").toLowerCase()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Comparison exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export comparison");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getColorForSimilarity = (similarity: number): string => {
    if (colorScheme === "high-contrast") {
      return similarity > 0.8
        ? "#000000"
        : similarity > 0.5
          ? "#666666"
          : "#ffffff";
    } else if (colorScheme === "colorblind-friendly") {
      return similarity > 0.8
        ? "#0173B2"
        : similarity > 0.5
          ? "#DE8F05"
          : "#CC78BC";
    } else {
      return similarity > 0.8
        ? "#10B981"
        : similarity > 0.5
          ? "#F59E0B"
          : "#EF4444";
    }
  };

  const filteredReports = reports.filter((report) =>
    searchTerm
      ? report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col ${
        isFullscreen ? "bg-dark-900" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-dark-900 border-b border-dark-700">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {comparison ? comparison.name : "Report Comparison"}
            </h2>
            <p className="text-sm text-gray-400">
              {comparison
                ? `Comparing ${comparison.reports.length} reports`
                : "Select reports to compare"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-dark-700 rounded-lg p-1">
            {["side-by-side", "overlay", "tabbed"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === mode
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Sync Scrolling Toggle */}
          <Button
            onClick={() => setSyncScrolling(!syncScrolling)}
            variant="ghost"
            size="sm"
            icon={syncScrolling ? Link : Unlink}
            title={
              syncScrolling ? "Disable Sync Scrolling" : "Enable Sync Scrolling"
            }
          />

          {/* Settings */}
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="sm"
            icon={Settings}
            title="Comparison Settings"
          />

          {/* Statistics */}
          <Button
            onClick={() => setShowStatistics(!showStatistics)}
            variant="ghost"
            size="sm"
            icon={BarChart3}
            title="Show Statistics"
          />

          {/* Export Menu */}
          <div className="relative group">
            <Button variant="ghost" size="sm" icon={Download} title="Export" />
            <div className="absolute right-0 top-full mt-1 w-48 bg-dark-700 border border-dark-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => exportComparison("json")}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => exportComparison("csv")}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => exportComparison("html")}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors"
                >
                  Export as HTML
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            icon={isFullscreen ? Minimize2 : Maximize2}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          />

          <Button onClick={onClose} variant="ghost" size="sm" icon={X} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Report Selection Sidebar */}
        {!comparison && (
          <div className="w-80 bg-dark-800 border-r border-dark-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Select Reports to Compare
              </h3>
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReports.includes(report.id)
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-dark-600 hover:border-blue-500/50"
                    }`}
                    onClick={() => {
                      setSelectedReports((prev) =>
                        prev.includes(report.id)
                          ? prev.filter((id) => id !== report.id)
                          : [...prev, report.id],
                      );
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">
                          {report.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {report.report_type} •{" "}
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-2">
                        {selectedReports.includes(report.id) ? (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Plus className="w-3 h-3 text-white rotate-45" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button
                  onClick={createComparison}
                  disabled={selectedReports.length < 2 || isLoading}
                  className="w-full"
                  variant="primary"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    `Compare ${selectedReports.length} Reports`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comparison View */}
        {comparison && (
          <div className="flex-1 flex flex-col">
            {/* Statistics Panel */}
            {showStatistics && comparisonResult && (
              <div className="bg-dark-800 border-b border-dark-700 p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {(comparisonResult.overallSimilarity * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">
                      Overall Similarity
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {comparisonResult.similarities.length}
                    </div>
                    <div className="text-sm text-gray-400">Similarities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {comparisonResult.differences.length}
                    </div>
                    <div className="text-sm text-gray-400">Differences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {comparisonResult.fieldComparisons.length}
                    </div>
                    <div className="text-sm text-gray-400">Fields Compared</div>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Content */}
            <div className="flex-1 overflow-hidden">
              {viewMode === "side-by-side" && (
                <div className="flex h-full">
                  {comparison.reports.map((report, index) => (
                    <div
                      key={report.id}
                      className="flex-1 flex flex-col border-r border-dark-700 last:border-r-0"
                    >
                      <div className="p-3 bg-dark-800 border-b border-dark-700">
                        <h4 className="font-medium text-white text-sm truncate">
                          {reports.find((r) => r.id === report.id)?.title ||
                            "Report"}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {report.type} •{" "}
                          {new Date(
                            report.metadata.generatedAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        ref={(el) => {
                          if (el) scrollRefs.current[index] = el;
                        }}
                        className="flex-1 overflow-y-auto p-4 bg-white text-black"
                        onScroll={(e) => handleScroll(index, e)}
                        dangerouslySetInnerHTML={{
                          __html: report.formats.html,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {viewMode === "tabbed" && (
                <div className="flex flex-col h-full">
                  <div className="flex bg-dark-800 border-b border-dark-700">
                    {comparison.reports.map((report, index) => (
                      <button
                        key={report.id}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-3 text-sm font-medium transition-colors ${
                          activeTab === index
                            ? "text-blue-400 border-b-2 border-blue-400"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {reports.find((r) => r.id === report.id)?.title ||
                          `Report ${index + 1}`}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-white text-black">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          comparison.reports[activeTab]?.formats.html || "",
                      }}
                    />
                  </div>
                </div>
              )}

              {viewMode === "overlay" && (
                <div className="relative h-full">
                  {comparison.reports.map((report, index) => (
                    <div
                      key={report.id}
                      className={`absolute inset-0 overflow-y-auto p-4 bg-white text-black transition-opacity ${
                        index === activeTab ? "opacity-100" : "opacity-30"
                      }`}
                      style={{ zIndex: index === activeTab ? 10 : index }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: report.formats.html,
                        }}
                      />
                    </div>
                  ))}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex space-x-2">
                      {comparison.reports.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveTab(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            activeTab === index ? "bg-blue-500" : "bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 bg-dark-800 border-l border-dark-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Comparison Settings
              </h3>

              <div className="space-y-6">
                {/* Highlight Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Display Options
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={highlightDifferences}
                        onChange={(e) => {
                          setHighlightDifferences(e.target.checked);
                          updateSettings({
                            highlightDifferences: e.target.checked,
                          });
                        }}
                        className="w-4 h-4 text-blue-600 bg-dark-700 border-dark-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-300">
                        Highlight Differences
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showSimilarities}
                        onChange={(e) => {
                          setShowSimilarities(e.target.checked);
                          updateSettings({
                            showSimilarities: e.target.checked,
                          });
                        }}
                        className="w-4 h-4 text-blue-600 bg-dark-700 border-dark-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-300">Show Similarities</span>
                    </label>
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Color Scheme
                  </h4>
                  <div className="space-y-2">
                    {["default", "high-contrast", "colorblind-friendly"].map(
                      (scheme) => (
                        <button
                          key={scheme}
                          onClick={() => {
                            setColorScheme(scheme as any);
                            updateSettings({ colorScheme: scheme as any });
                          }}
                          className={`w-full px-3 py-2 text-left rounded transition-colors ${
                            colorScheme === scheme
                              ? "bg-blue-600 text-white"
                              : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                          }`}
                        >
                          {scheme.charAt(0).toUpperCase() +
                            scheme.slice(1).replace("-", " ")}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Field Comparisons */}
                {comparisonResult && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      Field Similarities
                    </h4>
                    <div className="space-y-2">
                      {comparisonResult.fieldComparisons.map((field) => (
                        <div
                          key={field.field}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-400 capitalize">
                            {field.field.replace("_", " ")}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-12 h-2 rounded-full"
                              style={{
                                backgroundColor: getColorForSimilarity(
                                  field.similarity,
                                ),
                              }}
                            />
                            <span className="text-xs text-gray-400">
                              {(field.similarity * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl p-6 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-white mt-4">Comparing reports...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportComparison;
