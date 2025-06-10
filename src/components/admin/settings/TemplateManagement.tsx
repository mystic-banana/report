import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  Star,
  BarChart3,
  Settings,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Palette,
  Layout,
  Zap,
  Brain,
  PieChart,
  TrendingUp,
  Calendar,
  Users,
  Crown,
  Check,
  AlertTriangle,
  RefreshCw,
  Code,
  Layers,
  Target,
  Sparkles,
} from "lucide-react";
import { templateManagementService } from "../../../services/templateManagementService";
import { useAuthStore } from "../../../store/authStore";
import Button from "../../ui/Button";
import LoadingSpinner from "../../ui/LoadingSpinner";
import type {
  ReportTemplate,
  TemplateTheme,
  TemplateCategory,
  ReportType,
  TemplateSection,
} from "../../../types/reportTypes";
import toast from "react-hot-toast";

interface TemplateManagementProps {
  className?: string;
}

interface TemplateFormData {
  name: string;
  description: string;
  type: ReportType;
  category: string;
  isPublic: boolean;
  isPremium: boolean;
  sections: TemplateSection[];
  theme: string;
  tags: string[];
  customStyles: string;
  layout: "single-column" | "two-column" | "grid" | "magazine";
}

const TemplateManagement: React.FC<TemplateManagementProps> = ({
  className = "",
}) => {
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [themes, setThemes] = useState<TemplateTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<ReportType | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "created" | "usage" | "rating">(
    "created",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<ReportTemplate | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [activeView, setActiveView] = useState<"grid" | "list">("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Template form state
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    description: "",
    type: "western",
    category: "personal",
    isPublic: false,
    isPremium: false,
    sections: [],
    theme: "classic",
    tags: [],
    customStyles: "",
    layout: "single-column",
  });

  // Available template modules
  const availableModules = [
    {
      id: "header",
      name: "Report Header",
      description: "Title, user info, and report metadata",
      icon: FileText,
      category: "structure",
      required: true,
    },
    {
      id: "birth-info",
      name: "Birth Information",
      description: "Birth date, time, and location details",
      icon: Calendar,
      category: "structure",
      required: true,
    },
    {
      id: "natal-chart",
      name: "Natal Chart",
      description: "Visual birth chart representation",
      icon: Target,
      category: "charts",
      required: false,
    },
    {
      id: "planetary-positions",
      name: "Planetary Positions",
      description: "Table of planetary positions and degrees",
      icon: BarChart3,
      category: "data",
      required: false,
    },
    {
      id: "house-analysis",
      name: "House Analysis",
      description: "Detailed analysis of astrological houses",
      icon: Brain,
      category: "interpretation",
      required: false,
    },
    {
      id: "aspect-analysis",
      name: "Aspect Analysis",
      description: "Planetary aspects and their meanings",
      icon: Sparkles,
      category: "interpretation",
      required: false,
    },
    {
      id: "ai-interpretation",
      name: "AI Interpretation",
      description: "AI-generated personalized insights",
      icon: Zap,
      category: "ai",
      required: false,
    },
    {
      id: "transit-forecast",
      name: "Transit Forecast",
      description: "Upcoming planetary transits",
      icon: TrendingUp,
      category: "forecasting",
      required: false,
    },
    {
      id: "compatibility",
      name: "Compatibility Analysis",
      description: "Relationship compatibility insights",
      icon: Users,
      category: "relationships",
      required: false,
    },
    {
      id: "vedic-chart",
      name: "Vedic Chart",
      description: "Traditional Vedic astrology chart",
      icon: Star,
      category: "charts",
      required: false,
    },
    {
      id: "chinese-elements",
      name: "Chinese Elements",
      description: "Five elements analysis",
      icon: PieChart,
      category: "systems",
      required: false,
    },
    {
      id: "footer",
      name: "Report Footer",
      description: "Credits, disclaimers, and additional info",
      icon: Layers,
      category: "structure",
      required: true,
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, categoriesData, themesData] = await Promise.all([
        templateManagementService.getTemplates(),
        templateManagementService.getTemplateCategories(),
        templateManagementService.getThemes(),
      ]);

      setTemplates(templatesData);
      setCategories(categoriesData);
      setThemes(themesData);
    } catch (error) {
      console.error("Error loading template data:", error);
      toast.error("Failed to load template data");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === "all" || template.category === selectedCategory;

      const matchesType =
        selectedType === "all" || template.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });

    // Sort templates
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "created":
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "usage":
          comparison = (a.usageCount || 0) - (b.usageCount || 0);
          break;
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    templates,
    searchTerm,
    selectedCategory,
    selectedType,
    sortBy,
    sortOrder,
  ]);

  const handleCreateTemplate = async () => {
    try {
      if (!user) return;

      const templateData = {
        ...formData,
        createdBy: user.id,
        sections: formData.sections.map((section) => ({
          ...section,
          id: section.id || `section-${Date.now()}-${Math.random()}`,
        })),
        styles: {
          css: formData.customStyles,
          customProperties: {},
          responsive: { mobile: "", tablet: "", desktop: "" },
        },
        theme: themes.find((t) => t.id === formData.theme) || themes[0],
      };

      const newTemplate =
        await templateManagementService.createTemplate(templateData);

      if (newTemplate) {
        setTemplates((prev) => [newTemplate, ...prev]);
        setShowCreateModal(false);
        resetForm();
        toast.success("Template created successfully");
      } else {
        toast.error("Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    }
  };

  const handleEditTemplate = async () => {
    try {
      if (!selectedTemplate) return;

      const updates = {
        ...formData,
        sections: formData.sections.map((section) => ({
          ...section,
          id: section.id || `section-${Date.now()}-${Math.random()}`,
        })),
        styles: {
          css: formData.customStyles,
          customProperties: {},
          responsive: { mobile: "", tablet: "", desktop: "" },
        },
        theme: themes.find((t) => t.id === formData.theme) || themes[0],
      };

      const updatedTemplate = await templateManagementService.updateTemplate(
        selectedTemplate.id,
        updates,
      );

      if (updatedTemplate) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === selectedTemplate.id ? updatedTemplate : t)),
        );
        setShowEditModal(false);
        setSelectedTemplate(null);
        resetForm();
        toast.success("Template updated successfully");
      } else {
        toast.error("Failed to update template");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      if (!templateToDelete || !user) return;

      const success = await templateManagementService.deleteTemplate(
        templateToDelete.id,
        user.id,
      );

      if (success) {
        setTemplates((prev) =>
          prev.filter((t) => t.id !== templateToDelete.id),
        );
        setShowDeleteConfirm(false);
        setTemplateToDelete(null);
        toast.success("Template deleted successfully");
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleDuplicateTemplate = async (template: ReportTemplate) => {
    try {
      if (!user) return;

      const duplicated = await templateManagementService.duplicateTemplate(
        template.id,
        `${template.name} (Copy)`,
        user.id,
      );

      if (duplicated) {
        setTemplates((prev) => [duplicated, ...prev]);
        toast.success("Template duplicated successfully");
      } else {
        toast.error("Failed to duplicate template");
      }
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("Failed to duplicate template");
    }
  };

  const handlePreviewTemplate = async (template: ReportTemplate) => {
    try {
      const html =
        await templateManagementService.generateTemplatePreview(template);
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate preview");
    }
  };

  const handleExportTemplate = async (template: ReportTemplate) => {
    try {
      const blob = await templateManagementService.exportTemplate(template.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${template.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Template exported successfully");
      }
    } catch (error) {
      console.error("Error exporting template:", error);
      toast.error("Failed to export template");
    }
  };

  const handleImportTemplate = async () => {
    try {
      if (!importFile || !user) return;

      const imported = await templateManagementService.importTemplate(
        importFile,
        user.id,
      );

      if (imported) {
        setTemplates((prev) => [imported, ...prev]);
        setShowImportModal(false);
        setImportFile(null);
        toast.success("Template imported successfully");
      } else {
        toast.error("Failed to import template");
      }
    } catch (error) {
      console.error("Error importing template:", error);
      toast.error("Failed to import template");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "western",
      category: "personal",
      isPublic: false,
      isPremium: false,
      sections: [],
      theme: "classic",
      tags: [],
      customStyles: "",
      layout: "single-column",
    });
  };

  const openEditModal = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      isPublic: template.isPublic,
      isPremium: false, // Add this field to template type if needed
      sections: template.sections,
      theme: template.theme.id,
      tags: template.tags,
      customStyles: template.styles.css,
      layout: template.layout,
    });
    setShowEditModal(true);
  };

  const addModuleToTemplate = (moduleId: string) => {
    const module = availableModules.find((m) => m.id === moduleId);
    if (!module) return;

    const newSection: TemplateSection = {
      id: `section-${Date.now()}-${Math.random()}`,
      type: moduleId,
      name: module.name,
      content: "",
      order: formData.sections.length,
      isRequired: module.required,
      settings: {},
    };

    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const removeModuleFromTemplate = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const index = sections.findIndex((s) => s.id === sectionId);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sections.length) return prev;

      [sections[index], sections[newIndex]] = [
        sections[newIndex],
        sections[index],
      ];
      sections.forEach((section, i) => {
        section.order = i;
      });

      return { ...prev, sections };
    });
  };

  const handleBulkAction = async (
    action: "delete" | "export" | "duplicate",
  ) => {
    try {
      const selectedTemplates = templates.filter((t) =>
        bulkSelection.has(t.id),
      );

      switch (action) {
        case "delete":
          if (!user) return;
          for (const template of selectedTemplates) {
            await templateManagementService.deleteTemplate(
              template.id,
              user.id,
            );
          }
          setTemplates((prev) => prev.filter((t) => !bulkSelection.has(t.id)));
          toast.success(`${selectedTemplates.length} templates deleted`);
          break;

        case "export":
          for (const template of selectedTemplates) {
            await handleExportTemplate(template);
          }
          break;

        case "duplicate":
          if (!user) return;
          for (const template of selectedTemplates) {
            await templateManagementService.duplicateTemplate(
              template.id,
              `${template.name} (Copy)`,
              user.id,
            );
          }
          await loadData();
          toast.success(`${selectedTemplates.length} templates duplicated`);
          break;
      }

      setBulkSelection(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error("Failed to perform bulk action");
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <LoadingSpinner size="lg" />
        <span className="text-white ml-4">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Template Management
          </h2>
          <p className="text-gray-400">
            Create and manage astrology report templates with advanced modules
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            icon={Upload}
          >
            Import
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            icon={Plus}
          >
            Create Template
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Types</option>
              <option value="western">Western</option>
              <option value="vedic">Vedic</option>
              <option value="chinese">Chinese</option>
              <option value="hellenistic">Hellenistic</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split("-");
                setSortBy(sort as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="usage-desc">Most Used</option>
              <option value="rating-desc">Highest Rated</option>
            </select>

            <div className="flex items-center space-x-2 bg-dark-700 rounded-lg p-1">
              <button
                onClick={() => setActiveView("grid")}
                className={`p-2 rounded transition-colors ${
                  activeView === "grid"
                    ? "bg-amber-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Layout className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`p-2 rounded transition-colors ${
                  activeView === "list"
                    ? "bg-amber-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {bulkSelection.size > 0 && (
          <div className="mt-4 p-3 bg-amber-600/10 border border-amber-600/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-amber-400">
                {bulkSelection.size} template(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleBulkAction("duplicate")}
                  variant="ghost"
                  size="sm"
                  icon={Copy}
                >
                  Duplicate
                </Button>
                <Button
                  onClick={() => handleBulkAction("export")}
                  variant="ghost"
                  size="sm"
                  icon={Download}
                >
                  Export
                </Button>
                <Button
                  onClick={() => handleBulkAction("delete")}
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setBulkSelection(new Set())}
                  variant="ghost"
                  size="sm"
                  icon={X}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Templates Grid/List */}
      <div className="bg-dark-800 rounded-xl border border-dark-700">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Templates Found
            </h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ||
              selectedCategory !== "all" ||
              selectedType !== "all"
                ? "Try adjusting your filters or search terms."
                : "Create your first template to get started."}
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              icon={Plus}
            >
              Create Template
            </Button>
          </div>
        ) : activeView === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-dark-700 rounded-lg border border-dark-600 hover:border-amber-500/50 transition-all duration-200 group"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={bulkSelection.has(template.id)}
                        onChange={(e) => {
                          const newSelection = new Set(bulkSelection);
                          if (e.target.checked) {
                            newSelection.add(template.id);
                          } else {
                            newSelection.delete(template.id);
                          }
                          setBulkSelection(newSelection);
                        }}
                        className="w-4 h-4 text-amber-600 bg-dark-600 border-dark-500 rounded focus:ring-amber-500"
                      />
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {template.isPublic && (
                        <div
                          className="w-2 h-2 bg-green-400 rounded-full"
                          title="Public"
                        />
                      )}
                      {template.isDefault && (
                        <Crown
                          className="w-4 h-4 text-amber-400"
                          title="Default"
                        />
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="capitalize">{template.type}</span>
                    <span>{template.sections.length} modules</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-dark-600 text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 bg-dark-600 text-gray-300 text-xs rounded">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>{template.usageCount || 0}</span>
                      </span>
                      {template.rating && (
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          <span>{template.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>
                    <span>{template.createdAt.toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handlePreviewTemplate(template)}
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      className="flex-1"
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={() => openEditModal(template)}
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                    />
                    <Button
                      onClick={() => handleDuplicateTemplate(template)}
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                    />
                    <Button
                      onClick={() => handleExportTemplate(template)}
                      variant="ghost"
                      size="sm"
                      icon={Download}
                    />
                    <Button
                      onClick={() => {
                        setTemplateToDelete(template);
                        setShowDeleteConfirm(true);
                      }}
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-red-400 hover:text-red-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-6 hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={bulkSelection.has(template.id)}
                      onChange={(e) => {
                        const newSelection = new Set(bulkSelection);
                        if (e.target.checked) {
                          newSelection.add(template.id);
                        } else {
                          newSelection.delete(template.id);
                        }
                        setBulkSelection(newSelection);
                      }}
                      className="w-4 h-4 text-amber-600 bg-dark-600 border-dark-500 rounded focus:ring-amber-500"
                    />
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-white">
                          {template.name}
                        </h3>
                        {template.isPublic && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                            Public
                          </span>
                        )}
                        {template.isDefault && (
                          <Crown className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="capitalize">{template.type}</span>
                        <span>{template.sections.length} modules</span>
                        <span>{template.usageCount || 0} uses</span>
                        {template.rating && (
                          <span className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-amber-400" />
                            <span>{template.rating.toFixed(1)}</span>
                          </span>
                        )}
                        <span>{template.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handlePreviewTemplate(template)}
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={() => openEditModal(template)}
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDuplicateTemplate(template)}
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                    >
                      Duplicate
                    </Button>
                    <Button
                      onClick={() => handleExportTemplate(template)}
                      variant="ghost"
                      size="sm"
                      icon={Download}
                    >
                      Export
                    </Button>
                    <Button
                      onClick={() => {
                        setTemplateToDelete(template);
                        setShowDeleteConfirm(true);
                      }}
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {showCreateModal ? "Create Template" : "Edit Template"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedTemplate(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Template Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as ReportType,
                      }))
                    }
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="western">Western Astrology</option>
                    <option value="vedic">Vedic Astrology</option>
                    <option value="chinese">Chinese Astrology</option>
                    <option value="hellenistic">Hellenistic Astrology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Describe this template..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={formData.theme}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        theme: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Layout
                  </label>
                  <select
                    value={formData.layout}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        layout: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="single-column">Single Column</option>
                    <option value="two-column">Two Column</option>
                    <option value="grid">Grid Layout</option>
                    <option value="magazine">Magazine Style</option>
                  </select>
                </div>
              </div>

              {/* Template Options */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublic: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-amber-600 bg-dark-700 border-dark-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-gray-300">Make Public</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPremium: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-amber-600 bg-dark-700 border-dark-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-gray-300">Premium Only</span>
                </label>
              </div>

              {/* Template Modules */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Template Modules
                </h4>

                {/* Available Modules */}
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-300 mb-3">
                    Available Modules
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableModules
                      .filter(
                        (module) =>
                          !formData.sections.some((s) => s.type === module.id),
                      )
                      .map((module) => {
                        const Icon = module.icon;
                        return (
                          <button
                            key={module.id}
                            onClick={() => addModuleToTemplate(module.id)}
                            className="p-3 bg-dark-700 border border-dark-600 rounded-lg hover:border-amber-500/50 transition-colors text-left group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <h6 className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                                  {module.name}
                                  {module.required && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </h6>
                                <p className="text-xs text-gray-400">
                                  {module.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Selected Modules */}
                {formData.sections.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-3">
                      Selected Modules ({formData.sections.length})
                    </h5>
                    <div className="space-y-2">
                      {formData.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section, index) => {
                          const module = availableModules.find(
                            (m) => m.id === section.type,
                          );
                          if (!module) return null;
                          const Icon = module.icon;

                          return (
                            <div
                              key={section.id}
                              className="flex items-center justify-between p-3 bg-dark-700 border border-dark-600 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h6 className="text-sm font-medium text-white">
                                    {module.name}
                                    {module.required && (
                                      <span className="text-red-400 ml-1">
                                        *
                                      </span>
                                    )}
                                  </h6>
                                  <p className="text-xs text-gray-400">
                                    Position: {index + 1}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => moveSection(section.id, "up")}
                                  disabled={index === 0}
                                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    moveSection(section.id, "down")
                                  }
                                  disabled={
                                    index === formData.sections.length - 1
                                  }
                                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                {!module.required && (
                                  <button
                                    onClick={() =>
                                      removeModuleFromTemplate(section.id)
                                    }
                                    className="p-1 text-red-400 hover:text-red-300"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Styles */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom CSS (Optional)
                </label>
                <textarea
                  value={formData.customStyles}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customStyles: e.target.value,
                    }))
                  }
                  rows={6}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="/* Add custom CSS styles here */"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="western, natal, professional"
                />
              </div>
            </div>

            <div className="p-6 border-t border-dark-700 flex items-center justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedTemplate(null);
                  resetForm();
                }}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  showCreateModal ? handleCreateTemplate : handleEditTemplate
                }
                variant="primary"
                icon={Save}
                disabled={
                  !formData.name.trim() || formData.sections.length === 0
                }
              >
                {showCreateModal ? "Create Template" : "Update Template"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Template Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="h-[calc(90vh-80px)] overflow-y-auto">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Template Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && templateToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Delete Template
                  </h3>
                  <p className="text-gray-400 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "
                <strong>{templateToDelete.name}</strong>"? This will permanently
                remove the template and all its configurations.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTemplateToDelete(null);
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteTemplate}
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700"
                  icon={Trash2}
                >
                  Delete Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Import Template
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Template File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Only JSON template files are supported
                </p>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportTemplate}
                  variant="primary"
                  icon={Upload}
                  disabled={!importFile}
                >
                  Import Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;
