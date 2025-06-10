import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { generatePdfReport } from "../utils/serverPdfExport";

// Helper functions for chart data and report generation
const getChineseZodiacSign = (birthDate: string): string => {
  const year = new Date(birthDate).getFullYear();
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  return animals[(year - 4) % 12];
};

const getChineseElement = (birthDate: string): string => {
  const year = new Date(birthDate).getFullYear();
  const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];
  return elements[Math.floor((year - 4) % 10 / 2)];
};

const generateReportContent = (
  template: { 
    name: string; 
    sections?: { name: string; content?: string; order: number }[]; 
    type: string;
    is_premium: boolean; 
  },
  birthChart: any, 
  options: { isPremium?: boolean }
): string => {
  // Mock implementation for report content generation
  let content = `# ${template.name}\n\n`;
  content += `Generated for ${birthChart.name} on ${new Date().toLocaleDateString()}\n\n`;
  
  if (template.sections && template.sections.length > 0) {
    template.sections.forEach(section => {
      content += `## ${section.name}\n\n`;
      
      // If section has predefined content, use it
      if (section.content) {
        content += `${section.content}\n\n`;
      } else {
        // Generate mock content
        content += `This is sample content for ${section.name}. This would be replaced with real astrological analysis based on birth chart data.\n\n`;
        
        // Add premium content if applicable
        if (options.isPremium && template.is_premium) {
          content += `**Premium Content**: More detailed ${section.name.toLowerCase()} analysis would appear here.\n\n`;
        }
      }
    });
  } else {
    content += "## Default Analysis\n\n";
    content += "This report contains a default analysis of your birth chart.\n\n";
  }
  
  return content;
};

// Helper function to generate mock chart data
const generateMockChartData = () => {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const planets = [
    "Sun", "Moon", "Mercury", "Venus", "Mars", 
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  ];

  const aspectTypes = [
    "conjunction", "opposition", "trine", "square", "sextile",
  ];

  // Generate random planetary positions
  const mockPlanets = planets.map((planet) => {
    const signIndex = Math.floor(Math.random() * 12);
    const degree = Math.random() * 30;
    const house = Math.floor(Math.random() * 12) + 1;

    return {
      name: planet,
      sign: signs[signIndex],
      degree,
      house,
      longitude: signIndex * 30 + degree,
    };
  });

  // Generate random aspects
  const mockAspects = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      // Only create some aspects, not all possible combinations
      if (Math.random() > 0.7) {
        const aspectType = aspectTypes[Math.floor(Math.random() * aspectTypes.length)];
        mockAspects.push({
          planet1: planets[i],
          planet2: planets[j],
          aspect: aspectType,
          orb: Math.random() * 5,
          exact: Math.random() > 0.8,
        });
      }
    }
  }

  // Generate houses
  const mockHouses = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    sign: signs[(i + Math.floor(Math.random() * 3)) % 12],
    degree: Math.random() * 30,
  }));

  // Generate elemental balance
  const mockElementalBalance = {
    fire: Math.random() * 30,
    earth: Math.random() * 30,
    air: Math.random() * 30,
    water: Math.random() * 30,
  };

  // Generate modal balance
  const mockModalBalance = {
    cardinal: Math.random() * 30,
    fixed: Math.random() * 30,
    mutable: Math.random() * 30,
  };

  return {
    planets: mockPlanets,
    aspects: mockAspects,
    houses: mockHouses,
    ascendant: {
      sign: signs[Math.floor(Math.random() * 12)],
      degree: Math.random() * 30,
    },
    midheaven: {
      sign: signs[Math.floor(Math.random() * 12)],
      degree: Math.random() * 30,
    },
    elementalBalance: mockElementalBalance,
    modalBalance: mockModalBalance,
  };
};

// Type definitions
interface BirthData {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

interface BirthChart {
  id: string;
  name: string;
  birth_date: string;
  birth_time?: string;
  birth_location?: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  chart_data: any;
  user_id: string;
  created_at: string;
}

export interface AstrologyReport {
  id: string;
  title: string;
  report_type: string;
  birth_chart_id: string;
  content: string;
  is_premium: boolean;
  template_id?: string;
  created_at: string;
  updated_at: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  is_premium: boolean;
  is_public: boolean;
  sections: TemplateSection[];
  category_id: string;
  created_at: string;
  updated_at: string;
}

interface TemplateSection {
  name: string;
  content?: string;
  order: number;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// Define state interface
interface AstrologyState {
  birthCharts: BirthChart[];
  reports: AstrologyReport[];
  compatibilityReports: any[];
  templates: ReportTemplate[];
  templateCategories: TemplateCategory[];
  currentChart: any | null;
  loading: boolean;
  error: string | null;
  dailyHoroscopes: any[];
  dailyHoroscopeLoading: boolean;
  dailyHoroscopeError: string | null;
  chartsLoading: boolean;
  chartsError: string | null;
  reportsLoading: boolean;
  reportsError: string | null;
  templatesLoading: boolean;
  templatesError: string | null;
  pdfExporting: boolean;
  pdfError: string | null;
  birthChartsLoading?: boolean;

  // Method signatures
  fetchDailyHoroscope: (sign: string, date: string) => Promise<any>;
  generateDailyHoroscopes: (date: string) => Promise<any[]>;
  createBirthChart: (birthData: BirthData) => Promise<BirthChart>;
  fetchBirthCharts: (userId: string) => Promise<BirthChart[]>;
  fetchReports: (userId: string) => Promise<AstrologyReport[]>;
  addBirthChart: (chart: BirthChart) => Promise<BirthChart>;
  addReport: (report: AstrologyReport) => Promise<AstrologyReport>;
  deleteReport: (reportId: string) => Promise<void>;
  fetchReportTemplates: (options?: { isPublic?: boolean }) => Promise<ReportTemplate[]>;
  fetchTemplateCategories: () => Promise<TemplateCategory[]>;
  createReportFromTemplate: (templateId: string, birthChartId: string, userId: string, options?: any) => Promise<AstrologyReport>;
  createNatalChartReport: (birthChartId: string, isPremium?: boolean) => Promise<AstrologyReport>;
  createVedicReport: (birthChartId: string, isPremium?: boolean) => Promise<AstrologyReport>;
  exportReportToPDF: (reportId: string) => Promise<string>;
}

// Creating store with defined state and actions
export const useAstrologyStore = create<AstrologyState>((set) => ({
  // Initialize state
  birthCharts: [],
  reports: [],
  compatibilityReports: [],
  templates: [],
  templateCategories: [],
  currentChart: null,
  loading: false,
  error: null,
  dailyHoroscopes: [],
  dailyHoroscopeLoading: false,
  dailyHoroscopeError: null,
  chartsLoading: false,
  chartsError: null,
  reportsLoading: false,
  reportsError: null,
  templatesLoading: false,
  templatesError: null,
  pdfExporting: false,
  pdfError: null,
  birthChartsLoading: false,

  // Method implementations
  fetchDailyHoroscope: async (sign, date) => {
    try {
      set({ dailyHoroscopeLoading: true, dailyHoroscopeError: null });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const horoscope = {
        sign,
        date,
        prediction: `This is a daily horoscope prediction for ${sign} on ${date}. Expect an interesting day with potential for growth and change.`,
        rating: Math.floor(Math.random() * 5) + 1,
      };
      set(state => ({
        dailyHoroscopes: [...state.dailyHoroscopes.filter(h => h.sign !== sign || h.date !== date), horoscope],
        dailyHoroscopeLoading: false,
      }));
      return horoscope;
    } catch (error) {
      console.error("Error fetching daily horoscope:", error);
      set({ 
        dailyHoroscopeLoading: false, 
        dailyHoroscopeError: error instanceof Error ? error.message : "Unknown error" 
      });
      return null;
    }
  },
  
  generateDailyHoroscopes: async (date) => {
    try {
      set({ dailyHoroscopeLoading: true, dailyHoroscopeError: null });
      const signs = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
      ];
      const horoscopes = signs.map(sign => ({
        sign,
        date,
        prediction: `This is a daily horoscope prediction for ${sign} on ${date}. Expect an interesting day with potential for growth and change.`,
        rating: Math.floor(Math.random() * 5) + 1,
      }));
      set({ dailyHoroscopes: horoscopes, dailyHoroscopeLoading: false });
      return horoscopes;
    } catch (error) {
      console.error("Error generating daily horoscopes:", error);
      set({ 
        dailyHoroscopeLoading: false, 
        dailyHoroscopeError: error instanceof Error ? error.message : "Unknown error" 
      });
      return [];
    }
  },

  createBirthChart: async (birthData) => {
    try {
      set({ chartsLoading: true, chartsError: null });
      const chartData = generateMockChartData();
      const { data, error } = await supabase
        .from("birth_charts")
        .insert([
          {
            name: birthData.name,
            birth_date: birthData.birthDate,
            birth_time: birthData.birthTime,
            birth_location: birthData.birthLocation,
            latitude: birthData.latitude,
            longitude: birthData.longitude,
            city: birthData.city,
            country: birthData.country,
            chart_data: chartData,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error("Failed to create birth chart");
      set((state) => ({
        birthCharts: [data, ...state.birthCharts],
        chartsLoading: false,
        currentChart: data,
      }));
      return data;
    } catch (error) {
      console.error("Error creating birth chart:", error);
      set({ 
        chartsLoading: false, 
        chartsError: error instanceof Error ? error.message : "Unknown error" 
      });
      throw error;
    }
  },

  fetchBirthCharts: async (userId: string) => {
    set({ birthChartsLoading: true, chartsError: null });
    try {
      if (!userId) {
        set({ birthCharts: [], birthChartsLoading: false });
        return [];
      }
      const { data, error } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({
        birthCharts: data || [],
        birthChartsLoading: false,
      });
      return data || [];
    } catch (error: any) {
      set({
        chartsError: error.message,
        birthChartsLoading: false,
      });
      console.error("Error fetching birth charts:", error);
      throw error;
    }
  },

  fetchCompatibilityReports: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      if (!userId) {
        set({ compatibilityReports: [], loading: false });
        return [];
      }
      
      console.log(`[AstrologyStore] Fetching compatibility reports for user: ${userId}`);
      
      const { data, error } = await supabase
        .from("compatibility_reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[AstrologyStore] Error fetching compatibility reports:", error);
        throw error;
      }

      console.log(`[AstrologyStore] Found ${data?.length || 0} compatibility reports`);
      
      set({
        compatibilityReports: data || [],
        loading: false,
      });
      return data || [];
    } catch (error: any) {
      console.error("[AstrologyStore] Error in fetchCompatibilityReports:", error);
      set({
        error: error.message,
        loading: false,
      });
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },
  
  fetchReports: async (userId: string) => {
    set({ reportsLoading: true, reportsError: null });
    try {
      if (!userId) {
        set({ reports: [], reportsLoading: false });
        return [];
      }
      const { data, error } = await supabase
        .from("astrology_reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({
        reports: data || [],
        reportsLoading: false,
      });
      return data || [];
    } catch (error: any) {
      set({
        reportsError: error.message,
        reportsLoading: false,
      });
      console.error("Error fetching reports:", error);
      throw error;
    }
  },

  addBirthChart: async (chart) => {
    try {
      const { data, error } = await supabase
        .from("birth_charts")
        .insert(chart)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("Failed to add birth chart");
      
      set((state) => ({
        birthCharts: [data, ...state.birthCharts],
      }));
      
      return data;
    } catch (error) {
      console.error("Error adding birth chart:", error);
      throw error;
    }
  },

  addReport: async (report) => {
    try {
      const { data, error } = await supabase
        .from("astrology_reports")
        .insert(report)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("Failed to add report");
      
      set((state) => ({
        reports: [data, ...state.reports],
      }));
      
      return data;
    } catch (error) {
      console.error("Error adding report:", error);
      throw error;
    }
  },

  deleteReport: async (reportId) => {
    try {
      const { error } = await supabase
        .from("astrology_reports")
        .delete()
        .eq("id", reportId);
      
      if (error) throw error;
      
      set((state) => ({
        reports: state.reports.filter((r) => r.id !== reportId),
      }));
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  },

  fetchReportTemplates: async (options: { isPublic?: boolean } = {}) => {
    set({ templatesLoading: true, templatesError: null });
    try {
      // First try with a simpler query that doesn't rely on foreign key relationships
      let query = supabase.from("report_templates").select('*');

      if (options.isPublic) {
        query = query.eq("is_public", true);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      set({
        templates: data || [],
        templatesLoading: false,
      });
      return data || [];
    } catch (error: any) {
      set({
        templatesError: error.message,
        templatesLoading: false,
      });
      console.error("Error fetching report templates:", error);
      throw error;
    }
  },

  fetchTemplateCategories: async () => {
    set({ templatesLoading: true, templatesError: null });
    try {
      // Direct query to template_categories table
      const { data, error } = await supabase
        .from("template_categories")
        .select("*");

      if (error) {
        console.error("Error fetching template categories:", error);
        // Don't throw, just set empty data
        set({
          templateCategories: [],
          templatesLoading: false,
          templatesError: error.message
        });
        return [];
      }

      set({
        templateCategories: data || [],
        templatesLoading: false,
      });
      return data || [];
    } catch (error: any) {
      set({
        templatesError: error.message,
        templatesLoading: false,
      });
      console.error("Error fetching template categories:", error);
      throw error;
    }
  },

  createReportFromTemplate: async (templateId, birthChartId, userId, options = {}) => {
    try {
      console.log("Creating report from template", { templateId, birthChartId, options });
      set({ loading: true, error: null });
      
      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      
      if (templateError) throw templateError;
      if (!template) throw new Error("Template not found");
      
      console.log("Found template:", template.name);
      
      const { data: birthChart, error: birthChartError } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("id", birthChartId)
        .single();
      
      if (birthChartError) throw birthChartError;
      if (!birthChart) throw new Error("Birth chart not found");
      
      console.log("Found birth chart for:", birthChart.name);
      
      const reportTitle = `${template.name} for ${birthChart.name}`;
      
      // Make sure we have a userId to associate the report with
      if (!userId) {
        throw new Error("Cannot create a report without a user ID");
      }

      const { data: reportData, error: reportError } = await supabase
        .from("astrology_reports")
        .insert([
          {
            title: reportTitle,
            report_type: template.type,
            birth_chart_id: birthChartId,
            template_id: templateId,
            user_id: userId,
            is_premium: 'isPremium' in options ? options.isPremium : false,
            content: "Generating report content...", // Placeholder
          },
        ])
        .select()
        .single();
      
      if (reportError) {
        console.error("Report creation error:", reportError);
        throw new Error(`Failed to create report: ${reportError.message}`);
      }
      
      if (!reportData) {
        throw new Error("Failed to create report");
      }
      
      console.log("Created report record:", reportData.id);
      
      const content = generateReportContent(template, birthChart, options);
      
      const { data: updatedReport, error: updateError } = await supabase
        .from("astrology_reports")
        .update({ content })
        .eq("id", reportData.id)
        .select()
        .single();
      
      if (updateError) {
        console.error("Failed to update report with content:", updateError);
        throw updateError;
      }
      
      if (!updatedReport) {
        throw new Error("Failed to update report with content");
      }
      
      set((state) => ({
        reports: [updatedReport, ...state.reports.filter(r => r.id !== updatedReport.id)],
        loading: false,
      }));
      
      return updatedReport;
    } catch (error) {
      console.error("Error creating report from template:", error);
      set({ loading: false, error: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  },

  createNatalChartReport: async (birthChartId, isPremium = false) => {
    try {
      console.log("Creating natal chart report", { birthChartId, isPremium });
      set({ loading: true, error: null });
      
      const { data: birthChart, error: birthChartError } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("id", birthChartId)
        .single();
      
      if (birthChartError) throw birthChartError;
      if (!birthChart) throw new Error("Birth chart not found");
      
      console.log("Found birth chart for:", birthChart.name);
      
      const title = `Natal Chart Reading for ${birthChart.name}`;
      
      const content = `# Natal Chart Reading for ${birthChart.name}

` +
        `## Sun Sign: ${birthChart.chart_data.planets.find((p: any) => p.name === "Sun")?.sign || "Unknown"}

` +
        `Your Sun is in ${birthChart.chart_data.planets.find((p: any) => p.name === "Sun")?.sign || "Unknown"}, indicating your core identity and life purpose. ` +
        `This placement suggests ${isPremium ? "detailed premium analysis" : "general analysis"}.

` +
        `## Moon Sign: ${birthChart.chart_data.planets.find((p: any) => p.name === "Moon")?.sign || "Unknown"}

` +
        `Your Moon in ${birthChart.chart_data.planets.find((p: any) => p.name === "Moon")?.sign || "Unknown"} reveals your emotional nature. ` +
        `This suggests ${isPremium ? "advanced emotional insights" : "basic emotional tendencies"}.

` +
        `## Rising Sign: ${birthChart.chart_data.ascendant?.sign || "Unknown"}

` +
        `With ${birthChart.chart_data.ascendant?.sign || "Unknown"} rising, you present yourself to the world as ${isPremium ? "detailed personal impression analysis" : "general impression"}.

` +
        `## Chinese Zodiac

` +
        `Your Chinese zodiac sign is ${getChineseZodiacSign(birthChart.birth_date)} with the element of ${getChineseElement(birthChart.birth_date)}.

` +
        `Generated on ${new Date().toLocaleDateString()}`;
      
      const { data: report, error: reportError } = await supabase
        .from("astrology_reports")
        .insert([
          {
            title,
            report_type: "natal",
            birth_chart_id: birthChartId,
            is_premium: isPremium,
            content,
          },
        ])
        .select()
        .single();
      
      if (reportError) throw reportError;
      if (!report) throw new Error("Failed to create natal chart report");
      
      set((state) => ({
        reports: [report, ...state.reports],
        loading: false,
      }));
      
      return report;
    } catch (error) {
      console.error("Error creating natal chart report:", error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
  
  createVedicReport: async (birthChartId, isPremium = false) => {
    try {
      console.log("Creating vedic report", { birthChartId, isPremium });
      
      const { data: birthChart, error: birthChartError } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("id", birthChartId)
        .single();
        
      if (birthChartError) throw birthChartError;
      if (!birthChart) throw new Error("Birth chart not found");
      
      const title = `Vedic Astrology Report for ${birthChart.name}`;
      let content = `# ${title}\n\n`;
      content += `Generated on ${new Date().toLocaleDateString()}\n\n`;
      content += `## Vedic Sun Sign\n\n`;
      content += `In Vedic astrology, your Sun may be in a different sign than in Western astrology.\n\n`;
      content += `## Nakshatra Positions\n\n`;
      content += `Nakshatras are lunar mansions used in Vedic astrology.\n\n`;
      
      if (isPremium) {
        content += `## Dasha Periods\n\n`;
        content += `Your current major dasha period and its significance.\n\n`;
        content += `## Remedial Measures\n\n`;
        content += `Specific remedies to balance planetary energies.\n\n`;
      }
      
      const { data: report, error: reportError } = await supabase
        .from("astrology_reports")
        .insert([
          {
            title,
            report_type: "vedic",
            birth_chart_id: birthChartId,
            is_premium: isPremium,
            content,
          },
        ])
        .select()
        .single();
      
      if (reportError) throw reportError;
      if (!report) throw new Error("Failed to create Vedic report");
      
      set((state) => ({
        reports: [report, ...state.reports],
      }));
      
      return report;
    } catch (error) {
      console.error("Error creating Vedic report:", error);
      throw new Error(`Failed to generate Vedic report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
  
  exportReportToPDF: async (reportId) => {
    try {
      set({ pdfExporting: true, pdfError: null });
      
      const { data: report, error: reportError } = await supabase
        .from("astrology_reports")
        .select("*")
        .eq("id", reportId)
        .single();
        
      if (reportError) throw reportError;
      if (!report) throw new Error("Report not found");
      
      const { data: birthChart, error: birthChartError } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("id", report.birth_chart_id)
        .single();
        
      if (birthChartError) throw birthChartError;
      if (!birthChart) throw new Error("Birth chart not found");
      
      console.log("Exporting report to PDF", { report, birthChart });
      
      await generatePdfReport(
        report.id, 
        undefined, 
        {
          landscape: false,
          printBackground: true
        },
        undefined,
        {
          mockData: {
            reportData: report,
            userProfile: {
              name: birthChart.name,
              birthDate: birthChart.birth_date,
              location: birthChart.city && birthChart.country ? {
                city: birthChart.city,
                country: birthChart.country
              } : null
            },
            isMockReport: false
          }
        }
      );
      
      set({ pdfExporting: false });
      return "pdf-downloaded";
    } catch (error) {
      console.error("Error exporting report to PDF:", error);
      set({ 
        pdfExporting: false, 
        pdfError: error instanceof Error ? error.message : "Unknown error" 
      });
      throw error;
    }
  }
}));
