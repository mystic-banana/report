import React, { useState } from "react";
import { Calendar, Filter, X, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import Button from "../ui/Button";

export interface ReportFilterValues {
  reportTypes: string[];
  isPremium: boolean | null;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  searchTerm: string;
}

interface ReportFilterProps {
  reportTypes: string[];
  initialFilters: ReportFilterValues;
  onFilterChange: (filters: ReportFilterValues) => void;
  className?: string;
  onClose?: () => void;
}

const ReportFilter: React.FC<ReportFilterProps> = ({
  reportTypes,
  initialFilters,
  onFilterChange,
  className = "",
  onClose,
}) => {
  const [filters, setFilters] = useState<ReportFilterValues>(initialFilters);
  const [expanded, setExpanded] = useState({
    types: true,
    premium: true,
    dateRange: true,
  });

  const formatReportType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toggleReportTypeFilter = (type: string) => {
    const updatedTypes = filters.reportTypes.includes(type)
      ? filters.reportTypes.filter((t) => t !== type)
      : [...filters.reportTypes, type];
      
    const updatedFilters = {
      ...filters,
      reportTypes: updatedTypes,
    };
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const togglePremiumFilter = (isPremium: boolean | null) => {
    const updatedFilters = {
      ...filters,
      isPremium: filters.isPremium === isPremium ? null : isPremium,
    };
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const setDateRange = (startOrEnd: "startDate" | "endDate", date: string) => {
    // Convert empty string to null, otherwise to Date
    const dateValue = date === "" ? null : new Date(date);
    
    const updatedFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [startOrEnd]: dateValue,
      },
    };
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const updateSearchTerm = (term: string) => {
    const updatedFilters = {
      ...filters,
      searchTerm: term,
    };
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      reportTypes: [],
      isPremium: null,
      dateRange: { startDate: null, endDate: null },
      searchTerm: "",
    };
    
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = 
    filters.reportTypes.length > 0 || 
    filters.isPremium !== null || 
    filters.dateRange.startDate !== null || 
    filters.dateRange.endDate !== null ||
    filters.searchTerm !== "";

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="text-amber-500 mr-2" size={18} />
          <h3 className="text-white font-medium">Filter Reports</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear All
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              aria-label="Close filters"
            />
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search reports..."
            value={filters.searchTerm}
            onChange={(e) => updateSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-dark-900 border border-dark-700 pl-4 pr-8 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500"
          />
          {filters.searchTerm && (
            <button
              onClick={() => updateSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Report type filter */}
        <div>
          <button
            onClick={() => toggleSection("types")}
            className="flex items-center justify-between w-full text-left text-white font-medium mb-2"
          >
            <span>Report Types</span>
            <ChevronDown
              className={`transition-transform ${expanded.types ? "rotate-180" : ""}`}
              size={16}
            />
          </button>
          
          {expanded.types && (
            <div className="flex flex-wrap gap-2 mt-2">
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
              {reportTypes.length === 0 && (
                <p className="text-gray-400 text-sm">No report types available</p>
              )}
            </div>
          )}
        </div>

        {/* Premium filter */}
        <div>
          <button
            onClick={() => toggleSection("premium")}
            className="flex items-center justify-between w-full text-left text-white font-medium mb-2"
          >
            <span>Premium Status</span>
            <ChevronDown
              className={`transition-transform ${expanded.premium ? "rotate-180" : ""}`}
              size={16}
            />
          </button>
          
          {expanded.premium && (
            <div className="flex gap-2 mt-2">
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
          )}
        </div>

        {/* Date range filter */}
        <div>
          <button
            onClick={() => toggleSection("dateRange")}
            className="flex items-center justify-between w-full text-left text-white font-medium mb-2"
          >
            <span>Date Range</span>
            <ChevronDown
              className={`transition-transform ${expanded.dateRange ? "rotate-180" : ""}`}
              size={16}
            />
          </button>
          
          {expanded.dateRange && (
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-sm text-gray-400 mb-1">From</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="date"
                    value={formatDate(filters.dateRange.startDate)}
                    onChange={(e) => setDateRange("startDate", e.target.value)}
                    className="w-full rounded-lg bg-dark-900 border border-dark-700 pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">To</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="date"
                    value={formatDate(filters.dateRange.endDate)}
                    onChange={(e) => setDateRange("endDate", e.target.value)}
                    className="w-full rounded-lg bg-dark-900 border border-dark-700 pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-5 pt-4 border-t border-dark-700">
          <h4 className="text-sm text-gray-400 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <div className="bg-dark-700 text-white text-sm px-2 py-1 rounded-full flex items-center">
                <span>Search: "{filters.searchTerm}"</span>
                <button 
                  className="ml-1 text-gray-400 hover:text-white" 
                  onClick={() => updateSearchTerm("")}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {filters.reportTypes.map((type) => (
              <div key={type} className="bg-dark-700 text-white text-sm px-2 py-1 rounded-full flex items-center">
                <span>{formatReportType(type)}</span>
                <button 
                  className="ml-1 text-gray-400 hover:text-white" 
                  onClick={() => toggleReportTypeFilter(type)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {filters.isPremium !== null && (
              <div className="bg-dark-700 text-white text-sm px-2 py-1 rounded-full flex items-center">
                <span>{filters.isPremium ? "Premium Only" : "Standard Only"}</span>
                <button 
                  className="ml-1 text-gray-400 hover:text-white" 
                  onClick={() => togglePremiumFilter(filters.isPremium)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {filters.dateRange.startDate && (
              <div className="bg-dark-700 text-white text-sm px-2 py-1 rounded-full flex items-center">
                <span>From: {formatDate(filters.dateRange.startDate)}</span>
                <button 
                  className="ml-1 text-gray-400 hover:text-white" 
                  onClick={() => setDateRange("startDate", "")}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {filters.dateRange.endDate && (
              <div className="bg-dark-700 text-white text-sm px-2 py-1 rounded-full flex items-center">
                <span>To: {formatDate(filters.dateRange.endDate)}</span>
                <button 
                  className="ml-1 text-gray-400 hover:text-white" 
                  onClick={() => setDateRange("endDate", "")}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilter;
