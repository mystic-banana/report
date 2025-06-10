import React, { useState, useEffect } from "react";
import { useTemplateManagement } from "../../hooks/useTemplateManagement";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Eye,
  Crown,
  X,
  ChevronDown,
  Check,
  Sparkles,
} from "lucide-react";
import type { ReportTemplate, ReportType } from "../../types/reportTypes";

interface ReportTemplateSelectorProps {
  reportType?: ReportType;
  onSelectTemplate: (template: ReportTemplate) => void;
  onClose?: () => void;
  selectedTemplateId?: string;
  showPreview?: boolean;
}

const ReportTemplateSelector: React.FC<ReportTemplateSelectorProps> = ({
  reportType,
  onSelectTemplate,
  onClose,
  selectedTemplateId,
  showPreview = true,
}) => {
  const { user } = useAuthStore();
  const { templates, isLoadingTemplates, loadTemplates, generatePreview } =
    useTemplateManagement();

  // State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    theme: "",
    tags: [] as string[],
    rating: 0,
    isPublic: undefined as boolean | undefined,
  });
  const [sortBy, setSortBy] = useState<"name" | "rating" | "usage" | "date">(
    "usage",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(
    null,
  );
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Load templates on mount
  useEffect(() => {
    loadTemplates({ type: reportType });
  }, [loadTemplates, reportType]);

  // Get filtered and sorted templates
  const getDisplayTemplates = () => {
    let displayTemplates = templates.filter((template) => {
      // Filter by search term
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          template.name.toLowerCase().includes(searchLower) ||
          template.description?.toLowerCase().includes(searchLower) ||
          template.tags.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Filter by report type
      if (reportType && template.type !== reportType) return false;

      // Apply other filters
      if (filters.category && template.category !== filters.category)
        return false;
      if (filters.rating && (template.rating || 0) < filters.rating)
        return false;
      if (
        filters.isPublic !== undefined &&
        template.isPublic !== filters.isPublic
      )
        return false;
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) =>
          template.tags.includes(tag),
        );
        if (!hasMatchingTag) return false;
      }
      return true;
    });

    // Apply sorting
    displayTemplates.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case "usage":
          comparison = a.usageCount - b.usageCount;
          break;
        case "date":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return displayTemplates;
  };

  const handlePreview = async (template: ReportTemplate) => {
    if (!showPreview) return;

    setPreviewTemplate(template);
    setIsLoadingPreview(true);
    try {
      const html = await generatePreview(template, {
        userName: user?.name || "Sample User",
        birthDate: "1990-01-15",
        birthTime: "14:30",
        birthLocation: "New York, NY",
        reportType: template.type,
      });
      setPreviewHtml(html);
    } catch (error) {
      console.error("Error generating preview:", error);
      setPreviewHtml("<div>Preview not available</div>");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSelectTemplate = (template: ReportTemplate) => {
    onSelectTemplate(template);
  };

  const getTemplateTypeColor = (type: ReportType) => {
    const colors = {
      western: "bg-blue-500/20 text-blue-300",
      vedic: "bg-orange-500/20 text-orange-300",
      chinese: "bg-red-500/20 text-red-300",
      hellenistic: "bg-purple-500/20 text-purple-300",
      transit: "bg-green-500/20 text-green-300",
      compatibility: "bg-pink-500/20 text-pink-300",
    };
    return colors[type] || "bg-gray-500/20 text-gray-300";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      personal: "👤",
      professional: "💼",
      premium: "👑",
      system: "⚙️",
    };
    return icons[category as keyof typeof icons] || "📄";
  };

  const displayTemplates = getDisplayTemplates();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-amber-400" />
              Select Report Template
            </h2>
            <p className="text-gray-400 mt-1">
              Choose a template for your {reportType || "astrology"} report
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" icon={X} onClick={onClose} />
          )}
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters
                    ? "bg-amber-600 text-white"
                    : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                }`}
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-dark-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-amber-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-amber-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Sort */}
              <select
                className="bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy as any);
                  setSortOrder(newSortOrder as any);
                }}
              >
                <option value="usage-desc">Most Used</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="date-desc">Recently Updated</option>
                <option value="name-asc">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-dark-700/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <option value="">All Categories</option>
                    <option value="personal">Personal</option>
                    <option value="professional">Professional</option>
                    <option value="premium">Premium</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Rating
                  </label>
                  <select
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={filters.rating}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: parseInt(e.target.value),
                      }))
                    }
                  >
                    <option value={0}>Any Rating</option>
                    <option value={1}>1+ Stars</option>
                    <option value={2}>2+ Stars</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() =>
                      setFilters({
                        category: "",
                        theme: "",
                        tags: [],
                        rating: 0,
                        isPublic: undefined,
                      })
                    }
                    className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Templates List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoadingTemplates ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : displayTemplates.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No templates found
                  </h3>
                  <p className="text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                }`}
              >
                {displayTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`bg-dark-700/50 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer ${
                      selectedTemplateId === template.id
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-dark-600 hover:border-amber-500/30"
                    } ${
                      viewMode === "grid"
                        ? "p-4"
                        : "p-4 flex items-center space-x-4"
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    {viewMode === "grid" ? (
                      <>
                        {/* Grid View */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">
                              {getCategoryIcon(template.category)}
                            </span>
                            {template.category === "premium" && (
                              <Crown className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {template.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                <span className="text-sm text-gray-400">
                                  {template.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                            {selectedTemplateId === template.id && (
                              <Check className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-white mb-2 line-clamp-2">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {template.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(template.type)}`}
                            >
                              {template.type.charAt(0).toUpperCase() +
                                template.type.slice(1)}
                            </span>
                            <span className="px-2 py-1 bg-dark-600 text-gray-300 rounded-full text-xs">
                              {template.usageCount} uses
                            </span>
                          </div>
                          {showPreview && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(template);
                              }}
                              className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* List View */}
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getCategoryIcon(template.category)}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-white">
                                {template.name}
                              </h3>
                              {template.category === "premium" && (
                                <Crown className="w-4 h-4 text-amber-400" />
                              )}
                              {template.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                                  <span className="text-sm text-gray-400">
                                    {template.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                              {selectedTemplateId === template.id && (
                                <Check className="w-4 h-4 text-amber-400" />
                              )}
                            </div>
                            {template.description && (
                              <p className="text-sm text-gray-400 mt-1">
                                {template.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(template.type)}`}
                              >
                                {template.type.charAt(0).toUpperCase() +
                                  template.type.slice(1)}
                              </span>
                              <span className="px-2 py-1 bg-dark-600 text-gray-300 rounded-full text-xs">
                                {template.usageCount} uses
                              </span>
                            </div>
                          </div>
                        </div>
                        {showPreview && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(template);
                            }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {showPreview && previewTemplate && (
            <div className="w-96 border-l border-dark-700 bg-dark-900 flex flex-col">
              <div className="p-4 border-b border-dark-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    {previewTemplate.name}
                  </h3>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center h-32">
                    <LoadingSpinner size="md" />
                  </div>
                ) : (
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-full border-0"
                    title="Template Preview"
                    sandbox="allow-same-origin"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportTemplateSelector;
