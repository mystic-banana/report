import React, { useState, useEffect } from "react";
import { useTemplateManagement } from "../../hooks/useTemplateManagement";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import TemplateCustomizer from "./TemplateCustomizer";
import TemplatePreview from "./TemplatePreview";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Download,
  Upload,
  Copy,
  Edit3,
  Trash2,
  Eye,
  Heart,
  Share2,
  Settings,
  Crown,
  X,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import type { ReportTemplate, ReportType } from "../../types/reportTypes";
import toast from "react-hot-toast";

interface ReportTemplateManagerProps {
  onClose?: () => void;
  onSelectTemplate?: (template: ReportTemplate) => void;
  mode?: "select" | "manage";
  reportType?: ReportType;
}

const ReportTemplateManager: React.FC<ReportTemplateManagerProps> = ({
  onClose,
  onSelectTemplate,
  mode = "manage",
  reportType,
}) => {
  const { user } = useAuthStore();
  const {
    templates,
    selectedTemplate,
    themes,
    categories,
    isLoadingTemplates,
    isLoadingThemes,
    isLoadingCategories,
    loadTemplates,
    selectTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    searchTemplates,
    filterTemplates,
    exportTemplate,
    importTemplate,
    rateTemplate,
  } = useTemplateManagement();

  // State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ReportTemplate[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: reportType || "",
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
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(
    null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Load data on mount
  useEffect(() => {
    loadTemplates({ type: reportType });
  }, [loadTemplates, reportType]);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim()) {
        const results = await searchTemplates(searchTerm, {
          type: filters.type || undefined,
          category: filters.category || undefined,
          tags: filters.tags.length > 0 ? filters.tags : undefined,
        });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters, searchTemplates]);

  // Get filtered and sorted templates
  const getDisplayTemplates = () => {
    let displayTemplates = searchTerm ? searchResults : templates;

    // Apply filters
    displayTemplates = displayTemplates.filter((template) => {
      if (filters.type && template.type !== filters.type) return false;
      if (filters.category && template.category !== filters.category)
        return false;
      if (filters.theme && template.theme.id !== filters.theme) return false;
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

  const handleTemplateSelect = (template: ReportTemplate) => {
    selectTemplate(template);
    if (mode === "select" && onSelectTemplate) {
      onSelectTemplate(template);
      onClose?.();
    }
  };

  const handlePreview = (template: ReportTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleEdit = (template: ReportTemplate) => {
    selectTemplate(template);
    setShowCustomizer(true);
  };

  const handleDuplicate = async (template: ReportTemplate) => {
    const newName = prompt(
      "Enter name for duplicated template:",
      `${template.name} (Copy)`,
    );
    if (newName) {
      await duplicateTemplate(template.id, newName);
    }
  };

  const handleDelete = async (template: ReportTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      await deleteTemplate(template.id);
    }
  };

  const handleExport = async (template: ReportTemplate) => {
    await exportTemplate(template.id);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importTemplate(file);
      event.target.value = ""; // Reset input
    }
  };

  const handleRate = async (template: ReportTemplate, rating: number) => {
    await rateTemplate(template.id, rating);
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-2xl max-w-7xl w-full h-[90vh] flex flex-col border border-dark-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {mode === "select" ? "Select Template" : "Template Manager"}
            </h2>
            <p className="text-gray-400 mt-1">
              {mode === "select"
                ? "Choose a template for your report"
                : "Manage and customize your report templates"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {mode === "manage" && (
              <>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-template"
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  onClick={() =>
                    document.getElementById("import-template")?.click()
                  }
                >
                  Import
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Template
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" icon={X} onClick={onClose} />
          </div>
        </div>

        {/* Filters and Search */}
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
                <SlidersHorizontal size={16} />
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
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-dark-700/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Report Type
                  </label>
                  <select
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        type: e.target.value as ReportType,
                      }))
                    }
                  >
                    <option value="">All Types</option>
                    <option value="western">Western</option>
                    <option value="vedic">Vedic</option>
                    <option value="chinese">Chinese</option>
                    <option value="hellenistic">Hellenistic</option>
                    <option value="transit">Transit</option>
                    <option value="compatibility">Compatibility</option>
                  </select>
                </div>

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
                    Theme
                  </label>
                  <select
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={filters.theme}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, theme: e.target.value }))
                    }
                  >
                    <option value="">All Themes</option>
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
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
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={filters.isPublic === true}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          isPublic: e.target.checked ? true : undefined,
                        }))
                      }
                      className="w-4 h-4 text-amber-600 bg-dark-700 border-dark-600 rounded focus:ring-amber-500"
                    />
                    <span>Public templates only</span>
                  </label>
                </div>
                <button
                  onClick={() =>
                    setFilters({
                      type: reportType || "",
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
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : displayTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ||
                  Object.values(filters).some(
                    (f) => f && (Array.isArray(f) ? f.length > 0 : true),
                  )
                    ? "No templates found"
                    : "No templates yet"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ||
                  Object.values(filters).some(
                    (f) => f && (Array.isArray(f) ? f.length > 0 : true),
                  )
                    ? "Try adjusting your search or filters"
                    : "Create your first template to get started"}
                </p>
                {mode === "manage" && (
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setShowCreateForm(true)}
                  >
                    Create Template
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`bg-dark-700/50 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 p-6 ${
                        selectedTemplate?.id === template.id
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-dark-600 hover:border-amber-500/30"
                      }`}
                    >
                      {/* Template Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {getCategoryIcon(template.category)}
                          </span>
                          {template.category === "premium" && (
                            <Crown className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {template.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-amber-400 fill-current" />
                              <span className="text-sm text-gray-400">
                                {template.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Template Info */}
                      <h3 className="font-bold text-white mb-2 line-clamp-2">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex items-center space-x-2 mb-4">
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

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePreview(template)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {mode === "manage" && (
                            <>
                              <button
                                onClick={() => handleEdit(template)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(template)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                                title="Duplicate"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleExport(template)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                                title="Export"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {template.createdBy === user?.id && (
                                <button
                                  onClick={() => handleDelete(template)}
                                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        <Button
                          variant={
                            selectedTemplate?.id === template.id
                              ? "primary"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          {mode === "select"
                            ? "Select"
                            : selectedTemplate?.id === template.id
                              ? "Selected"
                              : "Use"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`bg-dark-700/50 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 p-6 ${
                        selectedTemplate?.id === template.id
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-dark-600 hover:border-amber-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">
                            {getCategoryIcon(template.category)}
                          </span>
                          <div>
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
                              <span className="text-xs text-gray-500">
                                Updated{" "}
                                {new Date(
                                  template.updatedAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePreview(template)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {mode === "manage" && (
                            <>
                              <button
                                onClick={() => handleEdit(template)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(template)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                                title="Duplicate"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleExport(template)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                                title="Export"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {template.createdBy === user?.id && (
                                <button
                                  onClick={() => handleDelete(template)}
                                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                          <Button
                            variant={
                              selectedTemplate?.id === template.id
                                ? "primary"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            {mode === "select"
                              ? "Select"
                              : selectedTemplate?.id === template.id
                                ? "Selected"
                                : "Use"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Template Customizer Modal */}
      {showCustomizer && selectedTemplate && (
        <TemplateCustomizer
          template={selectedTemplate}
          onClose={() => setShowCustomizer(false)}
          onSave={(updatedTemplate) => {
            updateTemplate(selectedTemplate.id, updatedTemplate);
            setShowCustomizer(false);
          }}
        />
      )}

      {/* Template Preview Modal */}
      {showPreview && previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
          onSelect={() => {
            handleTemplateSelect(previewTemplate);
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
          onRate={(rating) => handleRate(previewTemplate, rating)}
        />
      )}
    </div>
  );
};

export default ReportTemplateManager;
