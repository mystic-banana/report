import { useState, useEffect, useCallback } from "react";
import { templateManagementService } from "../services/templateManagementService";
import { useAuthStore } from "../store/authStore";
import type {
  ReportTemplate,
  TemplateTheme,
  TemplateCategory,
  TemplateCustomization,
  ReportType,
} from "../types/reportTypes";
import toast from "react-hot-toast";

interface UseTemplateManagementReturn {
  // Templates
  templates: ReportTemplate[];
  selectedTemplate: ReportTemplate | null;
  isLoadingTemplates: boolean;

  // Themes
  themes: TemplateTheme[];
  selectedTheme: TemplateTheme | null;
  isLoadingThemes: boolean;

  // Categories
  categories: TemplateCategory[];
  isLoadingCategories: boolean;

  // Customizations
  customizations: TemplateCustomization[];
  currentCustomization: TemplateCustomization | null;

  // Actions
  loadTemplates: (filters?: any) => Promise<void>;
  selectTemplate: (template: ReportTemplate) => void;
  createTemplate: (
    template: Omit<
      ReportTemplate,
      "id" | "createdAt" | "updatedAt" | "usageCount"
    >,
  ) => Promise<ReportTemplate | null>;
  updateTemplate: (
    templateId: string,
    updates: Partial<ReportTemplate>,
  ) => Promise<ReportTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  duplicateTemplate: (
    templateId: string,
    newName: string,
  ) => Promise<ReportTemplate | null>;

  // Themes
  loadThemes: () => Promise<void>;
  selectTheme: (theme: TemplateTheme) => void;
  createTheme: (
    theme: Omit<TemplateTheme, "id">,
  ) => Promise<TemplateTheme | null>;

  // Categories
  loadCategories: () => Promise<void>;

  // Customizations
  loadCustomizations: () => Promise<void>;
  saveCustomization: (
    customization: Omit<TemplateCustomization, "createdAt" | "updatedAt">,
  ) => Promise<TemplateCustomization | null>;

  // Search and filter
  searchTemplates: (query: string, filters?: any) => Promise<ReportTemplate[]>;
  filterTemplates: (filters: any) => ReportTemplate[];

  // Preview
  generatePreview: (
    template: ReportTemplate,
    sampleData?: any,
  ) => Promise<string>;

  // Import/Export
  exportTemplate: (templateId: string) => Promise<void>;
  importTemplate: (file: File) => Promise<ReportTemplate | null>;

  // Rating
  rateTemplate: (
    templateId: string,
    rating: number,
    review?: string,
  ) => Promise<boolean>;

  // Usage tracking
  trackUsage: (
    templateId: string,
    reportId: string,
    customizations?: TemplateCustomization,
  ) => Promise<void>;
}

export const useTemplateManagement = (): UseTemplateManagementReturn => {
  const { user } = useAuthStore();

  // State
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const [themes, setThemes] = useState<TemplateTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<TemplateTheme | null>(
    null,
  );
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);

  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [customizations, setCustomizations] = useState<TemplateCustomization[]>(
    [],
  );
  const [currentCustomization, setCurrentCustomization] =
    useState<TemplateCustomization | null>(null);

  // Load templates
  const loadTemplates = useCallback(
    async (filters?: any) => {
      setIsLoadingTemplates(true);
      try {
        const templateList = await templateManagementService.getTemplates({
          ...filters,
          userId: user?.id,
        });
        setTemplates(templateList);
      } catch (error) {
        console.error("Error loading templates:", error);
        toast.error("Failed to load templates");
      } finally {
        setIsLoadingTemplates(false);
      }
    },
    [user?.id],
  );

  // Select template
  const selectTemplate = useCallback((template: ReportTemplate) => {
    setSelectedTemplate(template);
    setSelectedTheme(template.theme);
  }, []);

  // Create template
  const createTemplate = useCallback(
    async (
      template: Omit<
        ReportTemplate,
        "id" | "createdAt" | "updatedAt" | "usageCount"
      >,
    ) => {
      if (!user) {
        toast.error("Please log in to create templates");
        return null;
      }

      try {
        const newTemplate = await templateManagementService.createTemplate({
          ...template,
          createdBy: user.id,
        });

        if (newTemplate) {
          setTemplates((prev) => [newTemplate, ...prev]);
          toast.success("Template created successfully");
          return newTemplate;
        } else {
          toast.error("Failed to create template");
          return null;
        }
      } catch (error) {
        console.error("Error creating template:", error);
        toast.error("Failed to create template");
        return null;
      }
    },
    [user],
  );

  // Update template
  const updateTemplate = useCallback(
    async (templateId: string, updates: Partial<ReportTemplate>) => {
      try {
        const updatedTemplate = await templateManagementService.updateTemplate(
          templateId,
          updates,
        );

        if (updatedTemplate) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === templateId ? updatedTemplate : t)),
          );
          if (selectedTemplate?.id === templateId) {
            setSelectedTemplate(updatedTemplate);
          }
          toast.success("Template updated successfully");
          return updatedTemplate;
        } else {
          toast.error("Failed to update template");
          return null;
        }
      } catch (error) {
        console.error("Error updating template:", error);
        toast.error("Failed to update template");
        return null;
      }
    },
    [selectedTemplate],
  );

  // Delete template
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      if (!user) {
        toast.error("Please log in to delete templates");
        return false;
      }

      try {
        const success = await templateManagementService.deleteTemplate(
          templateId,
          user.id,
        );

        if (success) {
          setTemplates((prev) => prev.filter((t) => t.id !== templateId));
          if (selectedTemplate?.id === templateId) {
            setSelectedTemplate(null);
          }
          toast.success("Template deleted successfully");
          return true;
        } else {
          toast.error("Failed to delete template");
          return false;
        }
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template");
        return false;
      }
    },
    [user, selectedTemplate],
  );

  // Duplicate template
  const duplicateTemplate = useCallback(
    async (templateId: string, newName: string) => {
      if (!user) {
        toast.error("Please log in to duplicate templates");
        return null;
      }

      try {
        const duplicatedTemplate =
          await templateManagementService.duplicateTemplate(
            templateId,
            newName,
            user.id,
          );

        if (duplicatedTemplate) {
          setTemplates((prev) => [duplicatedTemplate, ...prev]);
          toast.success("Template duplicated successfully");
          return duplicatedTemplate;
        } else {
          toast.error("Failed to duplicate template");
          return null;
        }
      } catch (error) {
        console.error("Error duplicating template:", error);
        toast.error("Failed to duplicate template");
        return null;
      }
    },
    [user],
  );

  // Load themes
  const loadThemes = useCallback(async () => {
    setIsLoadingThemes(true);
    try {
      const themeList = await templateManagementService.getThemes();
      setThemes(themeList);
    } catch (error) {
      console.error("Error loading themes:", error);
      toast.error("Failed to load themes");
    } finally {
      setIsLoadingThemes(false);
    }
  }, []);

  // Select theme
  const selectTheme = useCallback((theme: TemplateTheme) => {
    setSelectedTheme(theme);
  }, []);

  // Create theme
  const createTheme = useCallback(async (theme: Omit<TemplateTheme, "id">) => {
    try {
      const newTheme = await templateManagementService.createTheme(theme);

      if (newTheme) {
        setThemes((prev) => [newTheme, ...prev]);
        toast.success("Theme created successfully");
        return newTheme;
      } else {
        toast.error("Failed to create theme");
        return null;
      }
    } catch (error) {
      console.error("Error creating theme:", error);
      toast.error("Failed to create theme");
      return null;
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const categoryList =
        await templateManagementService.getTemplateCategories();
      setCategories(categoryList);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Load customizations
  const loadCustomizations = useCallback(async () => {
    if (!user) return;

    try {
      const customizationList =
        await templateManagementService.getUserCustomizations(user.id);
      setCustomizations(customizationList);
    } catch (error) {
      console.error("Error loading customizations:", error);
      toast.error("Failed to load customizations");
    }
  }, [user]);

  // Save customization
  const saveCustomization = useCallback(
    async (
      customization: Omit<TemplateCustomization, "createdAt" | "updatedAt">,
    ) => {
      try {
        const savedCustomization =
          await templateManagementService.saveCustomization(customization);

        if (savedCustomization) {
          setCustomizations((prev) => {
            const existing = prev.find(
              (c) =>
                c.templateId === customization.templateId &&
                c.userId === customization.userId,
            );
            if (existing) {
              return prev.map((c) => (c === existing ? savedCustomization : c));
            } else {
              return [savedCustomization, ...prev];
            }
          });
          setCurrentCustomization(savedCustomization);
          toast.success("Customization saved successfully");
          return savedCustomization;
        } else {
          toast.error("Failed to save customization");
          return null;
        }
      } catch (error) {
        console.error("Error saving customization:", error);
        toast.error("Failed to save customization");
        return null;
      }
    },
    [],
  );

  // Search templates
  const searchTemplates = useCallback(async (query: string, filters?: any) => {
    try {
      return await templateManagementService.searchTemplates(query, filters);
    } catch (error) {
      console.error("Error searching templates:", error);
      toast.error("Failed to search templates");
      return [];
    }
  }, []);

  // Filter templates
  const filterTemplates = useCallback(
    (filters: any) => {
      return templates.filter((template) => {
        if (filters.type && template.type !== filters.type) return false;
        if (filters.category && template.category !== filters.category)
          return false;
        if (filters.theme && template.theme.id !== filters.theme) return false;
        if (filters.tags && filters.tags.length > 0) {
          const hasMatchingTag = filters.tags.some((tag: string) =>
            template.tags.includes(tag),
          );
          if (!hasMatchingTag) return false;
        }
        return true;
      });
    },
    [templates],
  );

  // Generate preview
  const generatePreview = useCallback(
    async (template: ReportTemplate, sampleData?: any) => {
      try {
        return await templateManagementService.generateTemplatePreview(
          template,
          sampleData,
        );
      } catch (error) {
        console.error("Error generating preview:", error);
        toast.error("Failed to generate preview");
        return "<div>Preview not available</div>";
      }
    },
    [],
  );

  // Export template
  const exportTemplate = useCallback(async (templateId: string) => {
    try {
      const blob = await templateManagementService.exportTemplate(templateId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `template-${templateId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Template exported successfully");
      } else {
        toast.error("Failed to export template");
      }
    } catch (error) {
      console.error("Error exporting template:", error);
      toast.error("Failed to export template");
    }
  }, []);

  // Import template
  const importTemplate = useCallback(
    async (file: File) => {
      if (!user) {
        toast.error("Please log in to import templates");
        return null;
      }

      try {
        const importedTemplate = await templateManagementService.importTemplate(
          file,
          user.id,
        );

        if (importedTemplate) {
          setTemplates((prev) => [importedTemplate, ...prev]);
          toast.success("Template imported successfully");
          return importedTemplate;
        } else {
          toast.error("Failed to import template");
          return null;
        }
      } catch (error) {
        console.error("Error importing template:", error);
        toast.error("Failed to import template");
        return null;
      }
    },
    [user],
  );

  // Rate template
  const rateTemplate = useCallback(
    async (templateId: string, rating: number, review?: string) => {
      if (!user) {
        toast.error("Please log in to rate templates");
        return false;
      }

      try {
        const success = await templateManagementService.rateTemplate(
          templateId,
          user.id,
          rating,
          review,
        );

        if (success) {
          toast.success("Rating submitted successfully");
          // Reload templates to get updated rating
          await loadTemplates();
          return true;
        } else {
          toast.error("Failed to submit rating");
          return false;
        }
      } catch (error) {
        console.error("Error rating template:", error);
        toast.error("Failed to submit rating");
        return false;
      }
    },
    [user, loadTemplates],
  );

  // Track usage
  const trackUsage = useCallback(
    async (
      templateId: string,
      reportId: string,
      customizations?: TemplateCustomization,
    ) => {
      if (!user) return;

      try {
        await templateManagementService.trackTemplateUsage(
          templateId,
          user.id,
          reportId,
          customizations,
        );
      } catch (error) {
        console.error("Error tracking template usage:", error);
      }
    },
    [user],
  );

  // Load initial data
  useEffect(() => {
    loadTemplates();
    loadThemes();
    loadCategories();
    if (user) {
      loadCustomizations();
    }
  }, [loadTemplates, loadThemes, loadCategories, loadCustomizations, user]);

  return {
    // Templates
    templates,
    selectedTemplate,
    isLoadingTemplates,

    // Themes
    themes,
    selectedTheme,
    isLoadingThemes,

    // Categories
    categories,
    isLoadingCategories,

    // Customizations
    customizations,
    currentCustomization,

    // Actions
    loadTemplates,
    selectTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,

    // Themes
    loadThemes,
    selectTheme,
    createTheme,

    // Categories
    loadCategories,

    // Customizations
    loadCustomizations,
    saveCustomization,

    // Search and filter
    searchTemplates,
    filterTemplates,

    // Preview
    generatePreview,

    // Import/Export
    exportTemplate,
    importTemplate,

    // Rating
    rateTemplate,

    // Usage tracking
    trackUsage,
  };
};
