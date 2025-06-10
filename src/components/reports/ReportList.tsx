import React, { useState } from "react";
import {
  Filter,
  Search,
  Grid,
  List as ListIcon,
  X,
  ChevronDown,
} from "lucide-react";
import { AstrologyReport } from "../../store/astrologyStore";
import ReportCard from "./ReportCard";
import Button from "../ui/Button";
import BatchPDFExport from "./BatchPDFExport";

interface ReportListProps {
  reports: AstrologyReport[];
  onViewReport: (report: AstrologyReport) => void;
  onShareReport?: (report: AstrologyReport) => void;
  onExportReport?: (report: AstrologyReport) => void;
  onDeleteReport?: (report: AstrologyReport) => void;
  onBookmarkReport?: (report: AstrologyReport) => void;
  className?: string;
}

type SortOption = {
  label: string;
  value: keyof AstrologyReport | "word_count";
  direction: "asc" | "desc";
};

const ReportList: React.FC<ReportListProps> = ({
  reports,
  onViewReport,
  onShareReport,
  onExportReport,
  onDeleteReport,
  onBookmarkReport,
  className = "",
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>({
    label: "Newest First",
    value: "created_at",
    direction: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  const handleSortToggle = () => {
    setShowSortOptions(!showSortOptions);
  };
  const [filters, setFilters] = useState({
    reportTypes: [] as string[],
    isPremium: null as boolean | null,
  });


  // Extract unique report types
  const reportTypes = Array.from(
    new Set(reports.map((report) => report.report_type))
  );

  // Filter and sort reports
  const filteredReports = reports.filter((report) => {
    // Search term filter
    const matchesSearch = 
      searchTerm === "" ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase());

    // Report type filter
    const matchesType =
      filters.reportTypes.length === 0 ||
      filters.reportTypes.includes(report.report_type);

    // Premium filter
    const matchesPremium =
      filters.isPremium === null || report.is_premium === filters.isPremium;

    return matchesSearch && matchesType && matchesPremium;
  });

  // Sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    // Special case for word count which isn't directly in the report object
    if (sortBy.value === "word_count") {
      const aWords = a.content.split(/\s+/).length;
      const bWords = b.content.split(/\s+/).length;
      return sortBy.direction === "asc" ? aWords - bWords : bWords - aWords;
    }

    // For date fields
    if (sortBy.value === "created_at" || sortBy.value === "updated_at") {
      const aDate = new Date(a[sortBy.value]).getTime();
      const bDate = new Date(b[sortBy.value]).getTime();
      return sortBy.direction === "asc" ? aDate - bDate : bDate - aDate;
    }

    // For string fields
    if (typeof a[sortBy.value] === "string" && typeof b[sortBy.value] === "string") {
      const aValue = (a[sortBy.value] as string).toLowerCase();
      const bValue = (b[sortBy.value] as string).toLowerCase();
      return sortBy.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // For boolean fields
    if (typeof a[sortBy.value] === "boolean" && typeof b[sortBy.value] === "boolean") {
      const aValue = a[sortBy.value] as boolean;
      const bValue = b[sortBy.value] as boolean;
      return sortBy.direction === "asc"
        ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
        : (bValue ? 1 : 0) - (aValue ? 1 : 0);
    }

    return 0;
  });

  const sortOptions: SortOption[] = [
    { label: "Newest First", value: "created_at", direction: "desc" },
    { label: "Oldest First", value: "created_at", direction: "asc" },
    { label: "Title (A-Z)", value: "title", direction: "asc" },
    { label: "Title (Z-A)", value: "title", direction: "desc" },
    { label: "Longest First", value: "word_count", direction: "desc" },
    { label: "Shortest First", value: "word_count", direction: "asc" },
  ];

  const toggleReportTypeFilter = (type: string) => {
    setFilters((prev) => {
      const reportTypes = prev.reportTypes.includes(type)
        ? prev.reportTypes.filter((t) => t !== type)
        : [...prev.reportTypes, type];
      return { ...prev, reportTypes };
    });
  };

  const togglePremiumFilter = (isPremium: boolean | null) => {
    setFilters((prev) => ({
      ...prev,
      isPremium: prev.isPremium === isPremium ? null : isPremium,
    }));
  };

  const clearFilters = () => {
    setFilters({
      reportTypes: [],
      isPremium: null,
    });
    setSearchTerm("");
  };

  const formatReportType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className={className}>
      {/* Batch PDF Export Component */}
      <BatchPDFExport 
        reports={reports}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-dark-800 border border-dark-700 pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Layout toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={layout === "grid" ? "primary" : "ghost"}
            size="sm"
            icon={Grid}
            onClick={() => setLayout("grid")}
            aria-label="Grid view"
          />
          <Button
            variant={layout === "list" ? "primary" : "ghost"}
            size="sm"
            icon={ListIcon}
            onClick={() => setLayout("list")}
            aria-label="List view"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <div className="group flex items-center">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSortToggle}
            >
              <div className="flex items-center gap-1">
                <span>Sort by:</span>
                <span className="font-medium">{sortBy.label}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </Button>
            <div className={`absolute right-0 top-full mt-1 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-10 ${showSortOptions ? 'visible' : 'invisible group-hover:visible'}`}>
              <div className="py-1">
                {sortOptions.map((option) => (
                  <Button
                    key={`${option.value}-${option.direction}`}
                    variant="ghost"
                    size="sm"
                    className={`w-full text-left px-4 py-2 hover:bg-dark-700 transition-colors ${
                      sortBy.value === option.value && sortBy.direction === option.direction
                        ? "text-amber-500"
                        : "text-white"
                    }`}
                    onClick={() => setSortBy(option)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filter button */}
        <Button
          variant={showFilters || Object.values(filters).some((f) => Array.isArray(f) ? f.length > 0 : f !== null) ? "primary" : "outline"}
          size="sm"
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
          {(filters.reportTypes.length > 0 || filters.isPremium !== null) && (
            <span className="ml-1 bg-amber-500 text-black text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
              {filters.reportTypes.length + (filters.isPremium !== null ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Filter Reports</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={clearFilters}
              disabled={!filters.reportTypes.length && filters.isPremium === null}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-4">
            {/* Report type filter */}
            <div>
              <h4 className="text-sm text-gray-400 mb-2">Report Type</h4>
              <div className="flex flex-wrap gap-2">
                {reportTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleReportTypeFilter(type)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.reportTypes.includes(type)
                        ? "bg-amber-500 text-black"
                        : "bg-dark-700 text-white hover:bg-dark-600"
                    }`}
                  >
                    {formatReportType(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium filter */}
            <div>
              <h4 className="text-sm text-gray-400 mb-2">Premium Status</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePremiumFilter(true)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.isPremium === true
                      ? "bg-amber-500 text-black"
                      : "bg-dark-700 text-white hover:bg-dark-600"
                  }`}
                >
                  Premium Only
                </button>
                <button
                  onClick={() => togglePremiumFilter(false)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.isPremium === false
                      ? "bg-amber-500 text-black"
                      : "bg-dark-700 text-white hover:bg-dark-600"
                  }`}
                >
                  Standard Only
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="mb-4">
        <p className="text-gray-400">
          {sortedReports.length === 0 && searchTerm
            ? "No reports match your search"
            : sortedReports.length === 0
            ? "No reports found"
            : `Showing ${sortedReports.length} ${
                sortedReports.length === 1 ? "report" : "reports"
              }`}
        </p>
      </div>

      {/* Reports grid/list */}
      {sortedReports.length > 0 && (
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {sortedReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              layout={layout}
              onView={onViewReport}
              onShare={onShareReport}
              onExport={onExportReport}
              onDelete={onDeleteReport}
              onBookmark={onBookmarkReport}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {sortedReports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-dark-800 p-5 rounded-full mb-4">
            <Filter className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-white text-lg font-medium mb-2">No reports found</h3>
          <p className="text-gray-400 max-w-md mb-6">
            {searchTerm
              ? `No reports match "${searchTerm}". Try adjusting your search or filters.`
              : "No reports match your current filters. Try changing or clearing your filters."}
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReportList;
