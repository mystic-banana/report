import { supabase } from "../lib/supabaseClient";
import type {
  ReportTemplate,
  TemplateTheme,
  TemplateCustomization,
  TemplateCategory,
  TemplateUsage,
  TemplateRating,
  ReportType,
} from "../types/reportTypes";

// Template Management Service
export class TemplateManagementService {
  private static instance: TemplateManagementService;
  private templateCache = new Map<string, ReportTemplate>();
  private themeCache = new Map<string, TemplateTheme>();

  private constructor() {}

  public static getInstance(): TemplateManagementService {
    if (!TemplateManagementService.instance) {
      TemplateManagementService.instance = new TemplateManagementService();
    }
    return TemplateManagementService.instance;
  }

  /**
   * Get all available templates
   */
  public async getTemplates(filters?: {
    type?: ReportType;
    category?: string;
    theme?: string;
    isPublic?: boolean;
    userId?: string;
    includePrivate?: boolean;
  }): Promise<ReportTemplate[]> {
    try {
      let query = supabase.from("report_templates").select(`
          *,
          template_ratings(rating),
          template_usage(id)
        `);

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.isPublic !== undefined) {
        query = query.eq("is_public", filters.isPublic);
      }
      if (filters?.userId) {
        if (filters.includePrivate) {
          // Admin can see all templates
          // No additional filtering needed
        } else {
          query = query.or(`created_by.eq.${filters.userId},is_public.eq.true`);
        }
      }

      const { data, error } = await query.order("usage_count", {
        ascending: false,
      });

      if (error) throw error;

      const templates = data?.map(this.deserializeTemplate) || [];

      // Cache templates
      templates.forEach((template) => {
        this.templateCache.set(template.id, template);
      });

      return templates;
    } catch (error) {
      console.error("Error fetching templates:", error);
      return this.getDefaultTemplates();
    }
  }

  /**
   * Get template by ID
   */
  public async getTemplate(templateId: string): Promise<ReportTemplate | null> {
    // Check cache first
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId)!;
    }

    try {
      const { data, error } = await supabase
        .from("report_templates")
        .select(
          `
          *,
          template_ratings(rating, review, created_at),
          template_usage(id)
        `,
        )
        .eq("id", templateId)
        .single();

      if (error) throw error;

      const template = this.deserializeTemplate(data);
      this.templateCache.set(templateId, template);
      return template;
    } catch (error) {
      console.error("Error fetching template:", error);
      return null;
    }
  }

  /**
   * Create a new template
   */
  public async createTemplate(
    template: Omit<
      ReportTemplate,
      "id" | "createdAt" | "updatedAt" | "usageCount"
    >,
  ): Promise<ReportTemplate | null> {
    try {
      // First check if report_templates table exists, if not create a mock template
      const { data: tableCheck } = await supabase
        .from("report_templates")
        .select("id")
        .limit(1);

      // If table doesn't exist, return a mock template for now
      if (!tableCheck) {
        const mockTemplate: ReportTemplate = {
          id: `mock-${Date.now()}`,
          name: template.name,
          description: template.description,
          type: template.type,
          category: template.category,
          sections: template.sections,
          styles: template.styles,
          layout: template.layout,
          theme: template.theme,
          isPublic: template.isPublic,
          isDefault: template.isDefault || false,
          createdBy: template.createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
          tags: template.tags,
          preview: template.preview,
        };

        this.templateCache.set(mockTemplate.id, mockTemplate);
        return mockTemplate;
      }

      const templateData = {
        name: template.name,
        description: template.description,
        type: template.type,
        category: template.category,
        sections: template.sections,
        styles: template.styles,
        layout: template.layout,
        theme: template.theme,
        is_public: template.isPublic,
        is_default: template.isDefault,
        created_by: template.createdBy,
        tags: template.tags,
        preview: template.preview,
      };

      const { data, error } = await supabase
        .from("report_templates")
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;

      const newTemplate = this.deserializeTemplate(data);
      this.templateCache.set(newTemplate.id, newTemplate);
      return newTemplate;
    } catch (error) {
      console.error("Error creating template:", error);
      return null;
    }
  }

  /**
   * Update an existing template
   */
  public async updateTemplate(
    templateId: string,
    updates: Partial<ReportTemplate>,
  ): Promise<ReportTemplate | null> {
    try {
      const updateData: any = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.sections) updateData.sections = updates.sections;
      if (updates.styles) updateData.styles = updates.styles;
      if (updates.layout) updateData.layout = updates.layout;
      if (updates.theme) updateData.theme = updates.theme;
      if (updates.isPublic !== undefined)
        updateData.is_public = updates.isPublic;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.preview) updateData.preview = updates.preview;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("report_templates")
        .update(updateData)
        .eq("id", templateId)
        .select()
        .single();

      if (error) throw error;

      const updatedTemplate = this.deserializeTemplate(data);
      this.templateCache.set(templateId, updatedTemplate);
      return updatedTemplate;
    } catch (error) {
      console.error("Error updating template:", error);
      return null;
    }
  }

  /**
   * Delete a template
   */
  public async deleteTemplate(
    templateId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<boolean> {
    try {
      let query = supabase
        .from("report_templates")
        .delete()
        .eq("id", templateId);

      // Only restrict to created_by if not admin
      if (!isAdmin) {
        query = query.eq("created_by", userId);
      }

      const { error } = await query;

      if (error) throw error;

      this.templateCache.delete(templateId);
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  }

  /**
   * Duplicate a template
   */
  public async duplicateTemplate(
    templateId: string,
    newName: string,
    userId: string,
  ): Promise<ReportTemplate | null> {
    try {
      const originalTemplate = await this.getTemplate(templateId);
      if (!originalTemplate) return null;

      const duplicatedTemplate = {
        ...originalTemplate,
        name: newName,
        isPublic: false,
        isDefault: false,
        createdBy: userId,
        tags: [...originalTemplate.tags, "duplicated"],
      };

      return await this.createTemplate(duplicatedTemplate);
    } catch (error) {
      console.error("Error duplicating template:", error);
      return null;
    }
  }

  /**
   * Get template categories
   */
  public async getTemplateCategories(): Promise<TemplateCategory[]> {
    try {
      // First try to get from database
      const { data, error } = await supabase.from("template_categories")
        .select(`
          *,
          report_templates(*)
        `);

      if (error) {
        console.warn(
          "Template categories table not found, using defaults:",
          error,
        );
        return this.getDefaultCategories();
      }

      if (!data || data.length === 0) {
        return this.getDefaultCategories();
      }

      return (
        data?.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          templates:
            category.report_templates?.map(this.deserializeTemplate) || [],
        })) || []
      );
    } catch (error) {
      console.error("Error fetching template categories:", error);
      return this.getDefaultCategories();
    }
  }

  /**
   * Get available themes
   */
  public async getThemes(): Promise<TemplateTheme[]> {
    try {
      // First try to get from database
      const { data, error } = await supabase
        .from("template_themes")
        .select("*")
        .order("name");

      if (error) {
        console.warn("Template themes table not found, using defaults:", error);
        return this.getDefaultThemes();
      }

      if (!data || data.length === 0) {
        return this.getDefaultThemes();
      }

      const themes = data?.map(this.deserializeTheme) || [];

      // Cache themes
      themes.forEach((theme) => {
        this.themeCache.set(theme.id, theme);
      });

      return themes;
    } catch (error) {
      console.error("Error fetching themes:", error);
      return this.getDefaultThemes();
    }
  }

  /**
   * Create custom theme
   */
  public async createTheme(
    theme: Omit<TemplateTheme, "id">,
  ): Promise<TemplateTheme | null> {
    try {
      const { data, error } = await supabase
        .from("template_themes")
        .insert(theme)
        .select()
        .single();

      if (error) throw error;

      const newTheme = this.deserializeTheme(data);
      this.themeCache.set(newTheme.id, newTheme);
      return newTheme;
    } catch (error) {
      console.error("Error creating theme:", error);
      return null;
    }
  }

  /**
   * Save template customization
   */
  public async saveCustomization(
    customization: Omit<TemplateCustomization, "createdAt" | "updatedAt">,
  ): Promise<TemplateCustomization | null> {
    try {
      const { data, error } = await supabase
        .from("template_customizations")
        .upsert({
          ...customization,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        templateId: data.template_id,
        userId: data.user_id,
        customizations: data.customizations,
        name: data.name,
        isPrivate: data.is_private,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error("Error saving customization:", error);
      return null;
    }
  }

  /**
   * Get user customizations
   */
  public async getUserCustomizations(
    userId: string,
  ): Promise<TemplateCustomization[]> {
    try {
      const { data, error } = await supabase
        .from("template_customizations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return (
        data?.map((item) => ({
          templateId: item.template_id,
          userId: item.user_id,
          customizations: item.customizations,
          name: item.name,
          isPrivate: item.is_private,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        })) || []
      );
    } catch (error) {
      console.error("Error fetching user customizations:", error);
      return [];
    }
  }

  /**
   * Track template usage
   */
  public async trackTemplateUsage(
    templateId: string,
    userId: string,
    reportId: string,
    customizations?: TemplateCustomization,
  ): Promise<void> {
    try {
      // Record usage
      await supabase.from("template_usage").insert({
        template_id: templateId,
        user_id: userId,
        report_id: reportId,
        customizations: customizations,
      });

      // Update usage count
      await supabase.rpc("increment_template_usage", {
        template_id: templateId,
      });
    } catch (error) {
      console.error("Error tracking template usage:", error);
    }
  }

  /**
   * Rate a template
   */
  public async rateTemplate(
    templateId: string,
    userId: string,
    rating: number,
    review?: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("template_ratings").upsert({
        template_id: templateId,
        user_id: userId,
        rating,
        review,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update average rating
      await supabase.rpc("update_template_rating", {
        template_id: templateId,
      });

      return true;
    } catch (error) {
      console.error("Error rating template:", error);
      return false;
    }
  }

  /**
   * Search templates
   */
  public async searchTemplates(
    query: string,
    filters?: {
      type?: ReportType;
      category?: string;
      tags?: string[];
    },
  ): Promise<ReportTemplate[]> {
    try {
      let dbQuery = supabase
        .from("report_templates")
        .select("*")
        .or(
          `name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`,
        );

      if (filters?.type) {
        dbQuery = dbQuery.eq("type", filters.type);
      }
      if (filters?.category) {
        dbQuery = dbQuery.eq("category", filters.category);
      }
      if (filters?.tags && filters.tags.length > 0) {
        dbQuery = dbQuery.overlaps("tags", filters.tags);
      }

      const { data, error } = await dbQuery.limit(50);

      if (error) throw error;

      return data?.map(this.deserializeTemplate) || [];
    } catch (error) {
      console.error("Error searching templates:", error);
      return [];
    }
  }

  /**
   * Generate template preview
   */
  public async generateTemplatePreview(
    template: ReportTemplate,
    sampleData?: any,
  ): Promise<string> {
    try {
      // Generate HTML preview using the template
      const previewHtml = this.renderTemplatePreview(template, sampleData);
      return previewHtml;
    } catch (error) {
      console.error("Error generating template preview:", error);
      return "<div>Preview not available</div>";
    }
  }

  /**
   * Export template
   */
  public async exportTemplate(templateId: string): Promise<Blob | null> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) return null;

      const exportData = {
        template,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      return blob;
    } catch (error) {
      console.error("Error exporting template:", error);
      return null;
    }
  }

  /**
   * Import template
   */
  public async importTemplate(
    templateFile: File,
    userId: string,
  ): Promise<ReportTemplate | null> {
    try {
      const fileContent = await templateFile.text();
      const importData = JSON.parse(fileContent);

      if (!importData.template) {
        throw new Error("Invalid template file format");
      }

      const template = {
        ...importData.template,
        id: undefined, // Let database generate new ID
        createdBy: userId,
        isPublic: false,
        isDefault: false,
        name: `${importData.template.name} (Imported)`,
      };

      return await this.createTemplate(template);
    } catch (error) {
      console.error("Error importing template:", error);
      return null;
    }
  }

  // Private helper methods

  private deserializeTemplate(data: any): ReportTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      sections: data.sections || [],
      styles: data.styles || {
        css: "",
        customProperties: {},
        responsive: { mobile: "", tablet: "", desktop: "" },
      },
      layout: data.layout || "single-column",
      theme: data.theme || this.getDefaultTheme(),
      isPublic: data.is_public || false,
      isDefault: data.is_default || false,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      usageCount: data.usage_count || 0,
      rating: data.average_rating,
      tags: data.tags || [],
      preview: data.preview,
    };
  }

  private deserializeTheme(data: any): TemplateTheme {
    return {
      id: data.id,
      name: data.name,
      colors: data.colors,
      fonts: data.fonts,
      spacing: data.spacing,
      borderRadius: data.border_radius,
      shadows: data.shadows,
    };
  }

  private renderTemplatePreview(
    template: ReportTemplate,
    sampleData?: any,
  ): string {
    // Generate a preview HTML based on the template
    const { theme, styles, sections } = template;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Template Preview</title>
        <style>
          :root {
            --primary-color: ${theme.colors.primary};
            --secondary-color: ${theme.colors.secondary};
            --accent-color: ${theme.colors.accent};
            --background-color: ${theme.colors.background};
            --text-color: ${theme.colors.text};
            --muted-color: ${theme.colors.muted};
            --heading-font: ${theme.fonts.heading};
            --body-font: ${theme.fonts.body};
            --accent-font: ${theme.fonts.accent};
          }
          body {
            font-family: var(--body-font);
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          h1, h2, h3 {
            font-family: var(--heading-font);
            color: var(--primary-color);
          }
          .template-preview {
            max-width: 800px;
            margin: 0 auto;
          }
          ${styles.css}
        </style>
      </head>
      <body>
        <div class="template-preview">
    `;

    // Render sections
    sections.forEach((section) => {
      html += `<div class="section section-${section.type}">`;
      html += this.renderSectionPreview(section, sampleData);
      html += `</div>`;
    });

    html += `
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private renderSectionPreview(section: any, sampleData?: any): string {
    switch (section.type) {
      case "header":
        return `<h1>Sample Report Title</h1><p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>`;
      case "content":
        return `<h2>Sample Section</h2><p>This is a preview of how your content will appear in this template. The actual content will be generated based on your astrological data.</p>`;
      case "chart":
        return `<div class="chart-placeholder" style="width: 300px; height: 300px; border: 2px dashed var(--muted-color); display: flex; align-items: center; justify-content: center; margin: 20px auto;">Chart Visualization</div>`;
      case "table":
        return `<table style="width: 100%; border-collapse: collapse;"><tr><th style="border: 1px solid var(--muted-color); padding: 8px;">Planet</th><th style="border: 1px solid var(--muted-color); padding: 8px;">Sign</th><th style="border: 1px solid var(--muted-color); padding: 8px;">Degree</th></tr><tr><td style="border: 1px solid var(--muted-color); padding: 8px;">Sun</td><td style="border: 1px solid var(--muted-color); padding: 8px;">Leo</td><td style="border: 1px solid var(--muted-color); padding: 8px;">15°</td></tr></table>`;
      case "footer":
        return `<footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--muted-color); text-align: center; color: var(--muted-color);">Generated by Mystic Banana Astrology</footer>`;
      default:
        return `<div class="custom-section">Custom Section: ${section.name}</div>`;
    }
  }

  private getDefaultTemplates(): ReportTemplate[] {
    return [
      {
        id: "default-western",
        name: "Classic Western",
        description: "Traditional Western astrology template",
        type: "western",
        category: "system",
        sections: [],
        styles: {
          css: "",
          customProperties: {},
          responsive: { mobile: "", tablet: "", desktop: "" },
        },
        layout: "single-column",
        theme: this.getDefaultTheme(),
        isPublic: true,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        tags: ["western", "classic"],
      },
    ];
  }

  private getDefaultCategories(): TemplateCategory[] {
    return [
      {
        id: "personal",
        name: "Personal",
        description: "Templates for personal use",
        icon: "user",
        templates: [],
      },
      {
        id: "professional",
        name: "Professional",
        description: "Templates for professional astrologers",
        icon: "briefcase",
        templates: [],
      },
      {
        id: "system",
        name: "System",
        description: "Built-in system templates",
        icon: "settings",
        templates: [],
      },
      {
        id: "premium",
        name: "Premium",
        description: "Premium templates for subscribers",
        icon: "crown",
        templates: [],
      },
    ];
  }

  private getDefaultThemes(): TemplateTheme[] {
    return [
      {
        id: "classic",
        name: "Classic",
        colors: {
          primary: "#2c3e50",
          secondary: "#34495e",
          accent: "#f39c12",
          background: "#ffffff",
          text: "#2c3e50",
          muted: "#7f8c8d",
        },
        fonts: {
          heading: "Georgia, serif",
          body: "Arial, sans-serif",
          accent: "Georgia, serif",
        },
        spacing: {
          small: "8px",
          medium: "16px",
          large: "32px",
        },
        borderRadius: "4px",
        shadows: {
          small: "0 1px 3px rgba(0,0,0,0.1)",
          medium: "0 4px 6px rgba(0,0,0,0.1)",
          large: "0 10px 25px rgba(0,0,0,0.1)",
        },
      },
      {
        id: "modern",
        name: "Modern",
        colors: {
          primary: "#667eea",
          secondary: "#764ba2",
          accent: "#f093fb",
          background: "#f8fafc",
          text: "#1a202c",
          muted: "#718096",
        },
        fonts: {
          heading: "Inter, sans-serif",
          body: "Inter, sans-serif",
          accent: "Inter, sans-serif",
        },
        spacing: {
          small: "12px",
          medium: "24px",
          large: "48px",
        },
        borderRadius: "12px",
        shadows: {
          small: "0 1px 3px rgba(0,0,0,0.05)",
          medium: "0 4px 12px rgba(0,0,0,0.1)",
          large: "0 20px 40px rgba(0,0,0,0.1)",
        },
      },
      {
        id: "dark",
        name: "Dark",
        colors: {
          primary: "#f59e0b",
          secondary: "#d97706",
          accent: "#fbbf24",
          background: "#0f0f23",
          text: "#e5e5e5",
          muted: "#9ca3af",
        },
        fonts: {
          heading: "Inter, sans-serif",
          body: "Inter, sans-serif",
          accent: "Inter, sans-serif",
        },
        spacing: {
          small: "8px",
          medium: "16px",
          large: "32px",
        },
        borderRadius: "8px",
        shadows: {
          small: "0 1px 3px rgba(0,0,0,0.3)",
          medium: "0 4px 12px rgba(0,0,0,0.4)",
          large: "0 20px 40px rgba(0,0,0,0.5)",
        },
      },
      {
        id: "mystical",
        name: "Mystical",
        colors: {
          primary: "#8b5cf6",
          secondary: "#7c3aed",
          accent: "#a78bfa",
          background: "#1e1b4b",
          text: "#e0e7ff",
          muted: "#a5b4fc",
        },
        fonts: {
          heading: "Playfair Display, serif",
          body: "Inter, sans-serif",
          accent: "Playfair Display, serif",
        },
        spacing: {
          small: "10px",
          medium: "20px",
          large: "40px",
        },
        borderRadius: "16px",
        shadows: {
          small: "0 2px 4px rgba(139, 92, 246, 0.1)",
          medium: "0 8px 16px rgba(139, 92, 246, 0.2)",
          large: "0 24px 48px rgba(139, 92, 246, 0.3)",
        },
      },
    ];
  }

  private getDefaultTheme(): TemplateTheme {
    return this.getDefaultThemes()[0];
  }
}

// Export singleton instance
export const templateManagementService =
  TemplateManagementService.getInstance();

// Export convenience functions
export const getTemplates = (filters?: any) =>
  templateManagementService.getTemplates(filters);
export const getTemplate = (id: string) =>
  templateManagementService.getTemplate(id);
export const createTemplate = (template: any) =>
  templateManagementService.createTemplate(template);
export const updateTemplate = (id: string, updates: any) =>
  templateManagementService.updateTemplate(id, updates);
export const deleteTemplate = (id: string, userId: string) =>
  templateManagementService.deleteTemplate(id, userId);
