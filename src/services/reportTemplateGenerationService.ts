import { supabase } from "../lib/supabaseClient";
import { ReportTemplate, ReportSection } from "../types/reportTypes";

export interface GenerateTemplateContentParams {
  templateType: string;
  reportType: string;
  prompt?: string;
  sections?: string[];
}

export interface GenerateTemplateContentResponse {
  content: string;
  sections?: ReportSection[];
  error?: string;
}

export const reportTemplateGenerationService = {
  /**
   * Generate content for a report template using AI
   */
  generateTemplateContent: async (
    params: GenerateTemplateContentParams,
  ): Promise<GenerateTemplateContentResponse> => {
    try {
      const { templateType, reportType, prompt, sections } = params;

      // Prepare the messages for the AI
      const messages = [
        {
          role: "user",
          content:
            prompt ||
            `Generate content for a ${templateType} ${reportType} astrology report template. Include sections for planetary positions, aspects, and interpretations.`,
        },
      ];

      // Call the edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-generate-report-template",
        {
          body: {
            messages,
            templateType,
            reportType,
            model: "gpt-4o",
          },
        },
      );

      if (error) throw new Error(error.message);

      // Extract the content from the response
      const generatedContent = data.choices[0].message.content;

      // Parse sections if needed
      let parsedSections: ReportSection[] = [];
      if (sections && sections.length > 0) {
        parsedSections = sections.map((section, index) => ({
          id: `section-${index}`,
          type: "text",
          name: section,
          content: "", // Will be filled later
          order: index,
        }));
      }

      return {
        content: generatedContent,
        sections: parsedSections,
      };
    } catch (error) {
      console.error("Error generating template content:", error);
      return {
        content: "",
        error: error.message,
      };
    }
  },

  /**
   * Generate content for a specific section of a report template
   */
  generateSectionContent: async (
    sectionName: string,
    templateType: string,
    reportType: string,
  ): Promise<string> => {
    try {
      const messages = [
        {
          role: "user",
          content: `Generate content for the "${sectionName}" section of a ${templateType} ${reportType} astrology report template.`,
        },
      ];

      // Call the edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-generate-report-template",
        {
          body: {
            messages,
            templateType,
            reportType,
            model: "gpt-4o",
          },
        },
      );

      if (error) throw new Error(error.message);

      return data.choices[0].message.content;
    } catch (error) {
      console.error(
        `Error generating content for section ${sectionName}:`,
        error,
      );
      return "";
    }
  },

  /**
   * Generate a complete template with all sections
   */
  generateCompleteTemplate: async (
    templateName: string,
    templateType: string,
    reportType: string,
    sections: string[],
  ): Promise<Partial<ReportTemplate>> => {
    try {
      // First generate the overall template structure
      const { content } =
        await reportTemplateGenerationService.generateTemplateContent({
          templateType,
          reportType,
          sections,
        });

      // Generate content for each section in parallel
      const sectionPromises = sections.map(async (section, index) => {
        const sectionContent =
          await reportTemplateGenerationService.generateSectionContent(
            section,
            templateType,
            reportType,
          );

        return {
          id: `section-${index}`,
          type: "text",
          name: section,
          content: sectionContent,
          order: index,
          isRequired: index < 2, // Make first two sections required
          isVisible: true,
        };
      });

      const generatedSections = await Promise.all(sectionPromises);

      // Create the template object
      return {
        name: templateName,
        description: content.split("\n\n")[0], // Use first paragraph as description
        type: reportType,
        category: templateType,
        sections: generatedSections,
        isPublic: true,
        tags: [templateType, reportType],
      };
    } catch (error) {
      console.error("Error generating complete template:", error);
      throw error;
    }
  },
};
