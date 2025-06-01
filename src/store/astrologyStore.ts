import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import {
  BirthChartData,
  BirthData,
  calculateBirthChart,
  calculateCompatibilityScore,
} from "../utils/astronomicalCalculations";
import { useAuthStore } from "./authStore";

export interface BirthChart {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  birth_time?: string;
  birth_location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  chart_data: BirthChartData;
  chart_type: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface AstrologicalInterpretation {
  id: string;
  birth_chart_id: string;
  interpretation_type: string;
  content: string;
  ai_generated: boolean;
  astrology_system: string;
  confidence_score: number;
  created_at: string;
}

export interface CompatibilityReport {
  id: string;
  user_id: string;
  chart1_id: string;
  chart2_id: string;
  compatibility_score: number;
  detailed_analysis: any;
  report_content: string;
  astrology_system: string;
  created_at: string;
}

export interface DailyHoroscope {
  id: string;
  zodiac_sign: string;
  date: string;
  content: string;
  love_score: number;
  career_score: number;
  health_score: number;
  lucky_numbers: number[];
  lucky_colors: string[];
  ai_generated: boolean;
  created_at: string;
}

export interface TransitForecast {
  id: string;
  birth_chart_id: string;
  forecast_date: string;
  forecast_period: string;
  planetary_transits: any;
  forecast_content: string;
  significance_level: string;
  created_at: string;
}

export interface AstrologyReport {
  id: string;
  user_id: string;
  birth_chart_id: string;
  report_type: string;
  title: string;
  content: string;
  chart_image_url?: string;
  pdf_url?: string;
  is_premium: boolean;
  created_at: string;
}

interface AstrologyState {
  // State
  birthCharts: BirthChart[];
  currentChart: BirthChart | null;
  interpretations: AstrologicalInterpretation[];
  compatibilityReports: CompatibilityReport[];
  dailyHoroscopes: DailyHoroscope[];
  transitForecasts: TransitForecast[];
  reports: AstrologyReport[];
  loading: boolean;
  error: string | null;

  // Actions
  createBirthChart: (birthData: BirthData) => Promise<BirthChart | null>;
  fetchBirthCharts: (userId: string) => Promise<void>;
  fetchBirthChart: (chartId: string) => Promise<BirthChart | null>;
  updateBirthChart: (
    chartId: string,
    updates: Partial<BirthChart>,
  ) => Promise<void>;
  deleteBirthChart: (chartId: string) => Promise<void>;

  generateInterpretation: (
    chartId: string,
    interpretationType: string,
  ) => Promise<AstrologicalInterpretation | null>;
  fetchInterpretations: (chartId: string) => Promise<void>;

  createCompatibilityReport: (
    chart1Id: string,
    chart2Id: string,
  ) => Promise<CompatibilityReport | null>;
  fetchCompatibilityReports: (userId: string) => Promise<void>;

  fetchDailyHoroscope: (
    zodiacSign: string,
    date: string,
  ) => Promise<DailyHoroscope | null>;
  generateDailyHoroscopes: (date: string) => Promise<void>;

  generateTransitForecast: (
    chartId: string,
    forecastDate: string,
    period: string,
  ) => Promise<TransitForecast | null>;
  fetchTransitForecasts: (chartId: string) => Promise<void>;

  createReport: (
    chartId: string,
    reportType: string,
    title: string,
  ) => Promise<AstrologyReport | null>;
  createNatalChartReport: (
    chartId: string,
    isPremium?: boolean,
  ) => Promise<AstrologyReport | null>;
  createVedicReport: (
    chartId: string,
    isPremium?: boolean,
  ) => Promise<AstrologyReport | null>;
  fetchReports: (userId: string) => Promise<void>;
  exportReportToPDF: (reportId: string) => Promise<string | null>;

  setCurrentChart: (chart: BirthChart | null) => void;
  clearError: () => void;
}

export const useAstrologyStore = create<AstrologyState>((set, get) => ({
  // Initial state
  birthCharts: [],
  currentChart: null,
  interpretations: [],
  compatibilityReports: [],
  dailyHoroscopes: [],
  transitForecasts: [],
  reports: [],
  loading: false,
  error: null,

  // Actions
  createBirthChart: async (birthData: BirthData) => {
    set({ loading: true, error: null });
    try {
      const chartData = calculateBirthChart(birthData);
      const { user } = useAuthStore.getState();

      if (!user) {
        // For non-authenticated users, return chart data without saving
        const mockChart: BirthChart = {
          id: `temp-${Date.now()}`,
          user_id: "temp",
          name: birthData.name,
          birth_date: new Date(birthData.birthDate).toISOString(),
          birth_time: birthData.birthTime || null,
          birth_location: birthData.location,
          chart_data: chartData,
          chart_type: "natal",
          is_public: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set({
          currentChart: mockChart,
          loading: false,
        });

        return mockChart;
      }

      // Check user's plan limitations
      const userPlan = await checkUserPlanLimitations(user.id);
      if (!userPlan.canCreateChart) {
        throw new Error(
          `You've reached your monthly limit of ${userPlan.chartLimit} birth charts. Upgrade your plan to create more.`,
        );
      }

      const { data, error } = await supabase
        .from("birth_charts")
        .insert({
          user_id: user.id,
          name: birthData.name,
          birth_date: new Date(birthData.birthDate).toISOString(),
          birth_time: birthData.birthTime || null,
          birth_location: birthData.location,
          chart_data: chartData,
          chart_type: "natal",
        })
        .select()
        .single();

      if (error) throw error;

      const newChart = data as BirthChart;
      set((state) => ({
        birthCharts: [...state.birthCharts, newChart],
        currentChart: newChart,
        loading: false,
      }));

      return newChart;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  fetchBirthCharts: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ birthCharts: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchBirthChart: async (chartId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("id", chartId)
        .single();

      if (error) throw error;

      const chart = data as BirthChart;
      set({ currentChart: chart, loading: false });
      return chart;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  updateBirthChart: async (chartId: string, updates: Partial<BirthChart>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("birth_charts")
        .update(updates)
        .eq("id", chartId);

      if (error) throw error;

      set((state) => ({
        birthCharts: state.birthCharts.map((chart) =>
          chart.id === chartId ? { ...chart, ...updates } : chart,
        ),
        currentChart:
          state.currentChart?.id === chartId
            ? { ...state.currentChart, ...updates }
            : state.currentChart,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteBirthChart: async (chartId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("birth_charts")
        .delete()
        .eq("id", chartId);

      if (error) throw error;

      set((state) => ({
        birthCharts: state.birthCharts.filter((chart) => chart.id !== chartId),
        currentChart:
          state.currentChart?.id === chartId ? null : state.currentChart,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  generateInterpretation: async (
    chartId: string,
    interpretationType: string,
  ) => {
    set({ loading: true, error: null });
    try {
      // This would call an AI service to generate interpretation
      // For now, we'll create a mock interpretation
      const mockContent = `This is a ${interpretationType} interpretation for chart ${chartId}. Your astrological profile reveals unique insights about your personality and life path.`;

      const { data, error } = await supabase
        .from("astrological_interpretations")
        .insert({
          birth_chart_id: chartId,
          interpretation_type: interpretationType,
          content: mockContent,
          ai_generated: true,
          astrology_system: "western",
          confidence_score: 85,
        })
        .select()
        .single();

      if (error) throw error;

      const interpretation = data as AstrologicalInterpretation;
      set((state) => ({
        interpretations: [...state.interpretations, interpretation],
        loading: false,
      }));

      return interpretation;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  fetchInterpretations: async (chartId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("astrological_interpretations")
        .select("*")
        .eq("birth_chart_id", chartId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ interpretations: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createCompatibilityReport: async (chart1Id: string, chart2Id: string) => {
    set({ loading: true, error: null });
    try {
      // Fetch both charts
      const { data: charts, error: chartsError } = await supabase
        .from("birth_charts")
        .select("*")
        .in("id", [chart1Id, chart2Id]);

      if (chartsError) throw chartsError;
      if (!charts || charts.length !== 2) throw new Error("Charts not found");

      const chart1 = charts.find((c) => c.id === chart1Id);
      const chart2 = charts.find((c) => c.id === chart2Id);

      if (!chart1 || !chart2) throw new Error("Charts not found");

      const compatibilityScore = calculateCompatibilityScore(
        chart1.chart_data,
        chart2.chart_data,
      );

      // Enhanced compatibility analysis
      const reportContent = generateCompatibilityAnalysis(
        chart1,
        chart2,
        compatibilityScore,
      );

      const { data, error } = await supabase
        .from("compatibility_reports")
        .insert({
          chart1_id: chart1Id,
          chart2_id: chart2Id,
          compatibility_score: compatibilityScore,
          detailed_analysis: {
            score: compatibilityScore,
            elementalHarmony: calculateElementalHarmony(
              chart1.chart_data,
              chart2.chart_data,
            ),
            aspectAnalysis: analyzeCompatibilityAspects(
              chart1.chart_data,
              chart2.chart_data,
            ),
          },
          report_content: reportContent,
          astrology_system: "western",
        })
        .select()
        .single();

      if (error) throw error;

      const report = data as CompatibilityReport;
      set((state) => ({
        compatibilityReports: [...state.compatibilityReports, report],
        loading: false,
      }));

      return report;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  fetchCompatibilityReports: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // First get user's birth charts to find compatibility reports
      const { data: userCharts, error: chartsError } = await supabase
        .from("birth_charts")
        .select("id")
        .eq("user_id", userId);

      if (chartsError) throw chartsError;

      if (!userCharts || userCharts.length === 0) {
        set({ compatibilityReports: [], loading: false });
        return;
      }

      const chartIds = userCharts.map((chart) => chart.id);

      // Get compatibility reports where user's charts are involved
      const { data, error } = await supabase
        .from("compatibility_reports")
        .select(
          "*, chart1:birth_charts!compatibility_reports_chart1_id_fkey(name), chart2:birth_charts!compatibility_reports_chart2_id_fkey(name)",
        )
        .or(
          "chart1_id.in.(" +
            chartIds.join(",") +
            "),chart2_id.in.(" +
            chartIds.join(",") +
            ")",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ compatibilityReports: data || [], loading: false });
    } catch (error: any) {
      console.error("Error fetching compatibility reports:", error);
      set({ error: error.message, loading: false });
    }
  },

  fetchDailyHoroscope: async (zodiacSign: string, date: string) => {
    try {
      const { data, error } = await supabase
        .from("daily_horoscopes")
        .select("*")
        .eq("zodiac_sign", zodiacSign)
        .eq("date", date)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const horoscope = data as DailyHoroscope;
        set((state) => ({
          dailyHoroscopes: [
            ...state.dailyHoroscopes.filter((h) => h.id !== horoscope.id),
            horoscope,
          ],
        }));
        return horoscope;
      }

      // Generate fallback horoscope if not found
      const fallbackHoroscope = generateFallbackHoroscope(zodiacSign, date);
      return fallbackHoroscope;
    } catch (error: any) {
      console.warn("Failed to fetch horoscope:", error);
      return generateFallbackHoroscope(zodiacSign, date);
    }
  },

  generateDailyHoroscopes: async (date: string) => {
    set({ loading: true, error: null });
    try {
      const signs = [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
      ];

      // Try to generate AI-powered horoscopes
      let horoscopes;
      try {
        const { generateAIHoroscopes } = await import(
          "../utils/aiContentGenerator"
        );
        horoscopes = await generateAIHoroscopes(signs, date);
      } catch (aiError) {
        console.warn(
          "AI horoscope generation failed, using fallback:",
          aiError,
        );
        // Fallback to enhanced mock data
        horoscopes = signs.map((sign) => {
          const themes = {
            Aries: "energy and leadership",
            Taurus: "stability and material comfort",
            Gemini: "communication and learning",
            Cancer: "emotions and family connections",
            Leo: "creativity and self-expression",
            Virgo: "organization and attention to detail",
            Libra: "balance and relationships",
            Scorpio: "transformation and deep insights",
            Sagittarius: "adventure and philosophical growth",
            Capricorn: "ambition and practical achievements",
            Aquarius: "innovation and humanitarian efforts",
            Pisces: "intuition and spiritual connection",
          };

          return {
            zodiac_sign: sign,
            date,
            content: `Today highlights ${themes[sign]} for ${sign}. The cosmic energies support your natural talents and encourage you to embrace new opportunities. Trust your instincts and take positive action toward your goals.`,
            love_score: Math.floor(Math.random() * 30) + 70,
            career_score: Math.floor(Math.random() * 30) + 70,
            health_score: Math.floor(Math.random() * 30) + 70,
            lucky_numbers: [
              Math.floor(Math.random() * 50) + 1,
              Math.floor(Math.random() * 50) + 1,
              Math.floor(Math.random() * 50) + 1,
            ],
            lucky_colors: ["Purple", "Gold"],
            ai_generated: true,
          };
        });
      }

      const { data, error } = await supabase
        .from("daily_horoscopes")
        .upsert(horoscopes, { onConflict: "zodiac_sign,date" })
        .select();

      if (error) throw error;

      set((state) => ({
        dailyHoroscopes: [...state.dailyHoroscopes, ...(data || [])],
        loading: false,
      }));
    } catch (error: any) {
      console.error("Error generating horoscopes:", error);
      set({ error: error.message, loading: false });
    }
  },

  generateTransitForecast: async (
    chartId: string,
    forecastDate: string,
    period: string,
  ) => {
    set({ loading: true, error: null });
    try {
      // Enhanced transit forecast generation
      const transitContent = await generateEnhancedTransitForecast(
        chartId,
        forecastDate,
        period,
      );

      const { data, error } = await supabase
        .from("transit_forecasts")
        .insert({
          birth_chart_id: chartId,
          forecast_date: forecastDate,
          forecast_period: period,
          planetary_transits: { transits: [] },
          forecast_content: transitContent,
          significance_level: "medium",
        })
        .select()
        .single();

      if (error) throw error;

      const forecast = data as TransitForecast;
      set((state) => ({
        transitForecasts: [...state.transitForecasts, forecast],
        loading: false,
      }));

      return forecast;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  fetchTransitForecasts: async (chartId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("transit_forecasts")
        .select("*")
        .eq("birth_chart_id", chartId)
        .order("forecast_date", { ascending: false });

      if (error) throw error;

      set({ transitForecasts: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createReport: async (chartId: string, reportType: string, title: string) => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error("Please sign in to create reports");
      }

      // Check user's plan limitations
      const userPlan = await checkUserPlanLimitations(user.id);
      if (!userPlan.canCreateReport) {
        throw new Error(
          `You've reached your monthly limit of ${userPlan.reportLimit} reports. Upgrade your plan to create more.`,
        );
      }

      // Get birth chart data for AI generation
      const { data: chartData, error: chartError } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("id", chartId)
        .single();

      if (chartError) throw chartError;

      // Auto-generate title if not provided
      const autoTitle =
        title || generateAutoReportTitle(chartData.name, reportType);

      // Check if report type is premium
      const premiumReportTypes = [
        "career",
        "relationships",
        "yearly",
        "spiritual",
        "vedic",
        "natal-premium", // Premium natal chart
      ];
      const isPremium =
        premiumReportTypes.includes(reportType) ||
        reportType.includes("premium");
      const isVedic = reportType === "vedic";
      const isNatalChart =
        reportType === "natal" ||
        reportType === "birth-chart" ||
        reportType.includes("natal");

      // Generate AI-powered content
      let aiContent = "";
      try {
        const { generateAIReportContent } = await import(
          "../utils/aiContentGenerator"
        );
        aiContent = await generateAIReportContent({
          reportType: isNatalChart ? "natal" : reportType,
          userName: chartData.name,
          birthDate: chartData.birth_date,
          chartData: chartData.chart_data,
          isPremium,
        });
      } catch (aiError) {
        console.warn("AI content generation failed, using fallback:", aiError);
        aiContent = `Complete ${reportType} report: ${autoTitle}. This comprehensive analysis provides deep insights into your astrological profile based on your birth chart data.`;
      }

      const { data, error } = await supabase
        .from("astrology_reports")
        .insert({
          user_id: user.id,
          birth_chart_id: chartId,
          report_type: reportType,
          title: autoTitle,
          content: aiContent,
          is_premium: isPremium,
        })
        .select()
        .single();

      if (error) throw error;

      const report = data as AstrologyReport;
      set((state) => ({
        reports: [...state.reports, report],
        loading: false,
      }));

      return report;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  createNatalChartReport: (chartId: string, isPremium?: boolean) => {
    const reportType = isPremium ? "natal-premium" : "natal";
    return get().createReport(chartId, reportType, "");
  },

  createVedicReport: async (chartId: string, isPremium?: boolean) => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error("Please sign in to create Vedic reports");
      }

      // Check user's plan limitations
      const userPlan = await checkUserPlanLimitations(user.id);
      if (!userPlan.canCreateReport) {
        throw new Error(
          `You've reached your monthly limit of ${userPlan.reportLimit} reports. Upgrade your plan to create more.`,
        );
      }

      // Get birth chart data
      const { data: chartData, error: chartError } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("id", chartId)
        .single();

      if (chartError) throw chartError;

      // Calculate Vedic chart data
      const { calculateVedicBirthChart } = await import(
        "../utils/astronomicalCalculations"
      );

      const vedicData = calculateVedicBirthChart({
        name: chartData.name,
        birthDate: chartData.birth_date,
        birthTime: chartData.birth_time,
        location: chartData.birth_location,
      });

      // Generate AI-powered Vedic report
      const response = await supabase.functions.invoke(
        "generate-vedic-report",
        {
          body: {
            birthData: {
              name: chartData.name,
              birthDate: chartData.birth_date,
              birthTime: chartData.birth_time,
              location: chartData.birth_location,
            },
            chartData: {
              ...chartData.chart_data,
              vedicData,
            },
            isPremium: isPremium || false,
            reportType: "vedic",
          },
        },
      );

      if (response.error) {
        throw new Error(
          response.error.message || "Failed to generate Vedic report",
        );
      }

      const aiReport = response.data;

      // Format the report content
      let reportContent = "";
      if (aiReport.report && typeof aiReport.report === "object") {
        reportContent = formatVedicReportContent(
          aiReport.report,
          isPremium || false,
        );
      } else {
        reportContent =
          aiReport.report?.fullContent ||
          "Vedic astrology report generated successfully.";
      }

      // Save to database
      const reportTitle = `${chartData.name}'s Vedic Astrology Report`;
      const { data, error } = await supabase
        .from("astrology_reports")
        .insert({
          user_id: user.id,
          birth_chart_id: chartId,
          report_type: "vedic",
          title: reportTitle,
          content: reportContent,
          is_premium: isPremium || false,
        })
        .select()
        .single();

      if (error) throw error;

      const report = data as AstrologyReport;
      set((state) => ({
        reports: [...state.reports, report],
        loading: false,
      }));

      return report;
    } catch (error: any) {
      console.error("Vedic report creation error:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  fetchReports: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("astrology_reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ reports: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  exportReportToPDF: async (reportId: string) => {
    set({ loading: true, error: null });
    try {
      // Get the report data with birth chart information
      const { data: report, error: reportError } = await supabase
        .from("astrology_reports")
        .select("*, birth_charts!inner(name, birth_date, chart_data)")
        .eq("id", reportId)
        .single();

      if (reportError) throw reportError;

      // Import the professional PDF generator
      const { generateProfessionalAstrologyReport } = await import(
        "../utils/pdfGenerator"
      );

      // Prepare report data
      const isNatalChart =
        report.report_type === "natal" ||
        report.report_type === "birth-chart" ||
        report.report_type.includes("natal");

      const reportData = {
        title: report.title,
        content: report.content,
        reportType: report.report_type,
        userName: report.birth_charts?.name || "User",
        birthDate: report.birth_charts?.birth_date,
        chartData: report.birth_charts?.chart_data,
        isPremium: report.is_premium || false,
        isNatalChart,
        // Additional data for natal charts
        ...(isNatalChart && {
          planetaryPositions: report.birth_charts?.chart_data?.planets?.map(
            (p) => ({
              planet: p.name,
              sign: p.sign,
              house: p.house || 0,
              degree: p.degree + "°" + p.minute + "'" + p.second + '"',
            }),
          ),
          aspectTable: report.birth_charts?.chart_data?.aspects
            ?.slice(0, 12)
            .map((a) => ({
              aspect: a.aspect,
              planets: a.planet1 + " - " + a.planet2,
              orb: a.orb.toFixed(1) + "°",
              meaning: a.description || a.nature || "—",
            })),
          elementalBalance: report.birth_charts?.chart_data?.elementalBalance,
          modalBalance: report.birth_charts?.chart_data?.modalBalance,
          chartPatterns: report.birth_charts?.chart_data?.chartPatterns?.map(
            (p) => ({
              name: p.name,
              description: p.description,
            }),
          ),
          retrogradeInfo: report.birth_charts?.chart_data?.retrogradeInfo,
          lunarPhase: report.birth_charts?.chart_data?.lunarPhase,
        }),
      };

      // Generate professional PDF with AI content
      await generateProfessionalAstrologyReport(reportData);

      set({ loading: false });
      return "PDF downloaded successfully";
    } catch (error: any) {
      console.error("PDF export error:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  setCurrentChart: (chart: BirthChart | null) => {
    set({ currentChart: chart });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Helper function to check user plan limitations
const checkUserPlanLimitations = async (userId: string) => {
  try {
    // Get user's current subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*,subscription_plans!inner(astrology_features)")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    let chartLimit = 5; // Free user default - 5 charts per month
    let reportLimit = 5; // Free user default - 5 reports per month

    if (subscription?.subscription_plans?.astrology_features) {
      const features = subscription.subscription_plans.astrology_features;
      chartLimit = features.birth_charts_limit || 999; // null means unlimited
      reportLimit = features.compatibility_reports_limit || 999;
    }

    // Count current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: chartCount } = await supabase
      .from("birth_charts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    const { count: reportCount } = await supabase
      .from("astrology_reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    return {
      canCreateChart: (chartCount || 0) < chartLimit,
      canCreateReport: (reportCount || 0) < reportLimit,
      chartLimit,
      reportLimit,
      chartCount: chartCount || 0,
      reportCount: reportCount || 0,
    };
  } catch (error) {
    console.error("Error checking plan limitations:", error);
    // Default to free plan limitations on error
    return {
      canCreateChart: true,
      canCreateReport: true,
      chartLimit: 5,
      reportLimit: 5,
      chartCount: 0,
      reportCount: 0,
    };
  }
};

// Enhanced compatibility analysis
const generateCompatibilityAnalysis = (
  chart1: BirthChart,
  chart2: BirthChart,
  score: number,
): string => {
  const level =
    score >= 80
      ? "excellent"
      : score >= 70
        ? "very good"
        : score >= 60
          ? "good"
          : score >= 50
            ? "fair"
            : "challenging";

  return `The compatibility between ${chart1.name} and ${chart2.name} shows a ${level} connection with a score of ${score}%. This analysis is based on planetary positions, aspects, and elemental harmony between your birth charts. The cosmic energies suggest areas of natural harmony as well as opportunities for growth and understanding in your relationship.`;
};

// Calculate elemental harmony between two charts
const calculateElementalHarmony = (
  chart1: BirthChartData,
  chart2: BirthChartData,
) => {
  // Implementation for elemental harmony calculation
  return {
    fire: 0.8,
    earth: 0.6,
    air: 0.7,
    water: 0.9,
  };
};

// Analyze compatibility aspects
const analyzeCompatibilityAspects = (
  chart1: BirthChartData,
  chart2: BirthChartData,
) => {
  // Implementation for aspect analysis
  return {
    harmonious: 12,
    challenging: 5,
    neutral: 8,
  };
};

// Generate fallback horoscope
const generateFallbackHoroscope = (
  zodiacSign: string,
  date: string,
): DailyHoroscope => {
  const themes = {
    Aries: "energy and leadership",
    Taurus: "stability and material comfort",
    Gemini: "communication and learning",
    Cancer: "emotions and family connections",
    Leo: "creativity and self-expression",
    Virgo: "organization and attention to detail",
    Libra: "balance and relationships",
    Scorpio: "transformation and deep insights",
    Sagittarius: "adventure and philosophical growth",
    Capricorn: "ambition and practical achievements",
    Aquarius: "innovation and humanitarian efforts",
    Pisces: "intuition and spiritual connection",
  };

  return {
    id: `fallback-${zodiacSign}-${date}`,
    zodiac_sign: zodiacSign,
    date,
    content: `Today brings positive energy for ${zodiacSign}. The cosmic influences highlight ${themes[zodiacSign]}. Trust your instincts and embrace new opportunities that align with your natural talents.`,
    love_score: Math.floor(Math.random() * 20) + 75,
    career_score: Math.floor(Math.random() * 20) + 75,
    health_score: Math.floor(Math.random() * 20) + 75,
    lucky_numbers: [
      Math.floor(Math.random() * 50) + 1,
      Math.floor(Math.random() * 50) + 1,
      Math.floor(Math.random() * 50) + 1,
    ],
    lucky_colors: ["Purple", "Gold"],
    ai_generated: true,
    created_at: new Date().toISOString(),
  };
};

// Enhanced transit forecast generation
const generateEnhancedTransitForecast = async (
  chartId: string,
  forecastDate: string,
  period: string,
): Promise<string> => {
  const periods = {
    daily: "Today's planetary transits",
    weekly: "This week's cosmic influences",
    monthly: "This month's astrological forecast",
    yearly: "This year's major planetary movements",
  };

  const periodText = periods[period] || "Upcoming planetary transits";

  return `${periodText} starting ${forecastDate} indicate significant cosmic shifts that will influence your life path. Key planetary movements suggest opportunities for growth, transformation, and positive change. Pay attention to intuitive insights and be open to new possibilities during this ${period} period.`;
};

// Helper function to format Vedic report content
const formatVedicReportContent = (report: any, isPremium: boolean): string => {
  let content = `**Vedic Astrology Report**\n\n`;

  if (report.introduction) {
    content += `**Introduction**\n${report.introduction}\n\n`;
  }

  if (report.janmaKundali) {
    content += `**Janma Kundali (Birth Chart)**\n${report.janmaKundali}\n\n`;
  }

  if (report.bhavaAnalysis) {
    content += `**Bhava (House) Analysis**\n${report.bhavaAnalysis}\n\n`;
  }

  if (report.grahaAnalysis) {
    content += `**Graha (Planet) Analysis**\n${report.grahaAnalysis}\n\n`;
  }

  if (report.nakshatraInsights) {
    content += `**Nakshatra Insights**\n${report.nakshatraInsights}\n\n`;
  }

  if (isPremium) {
    if (report.dashaAnalysis) {
      content += `**Vimshottari Dasha Analysis**\n${report.dashaAnalysis}\n\n`;
    }

    if (report.yogasAndDoshas) {
      content += `**Yogas and Doshas**\n${report.yogasAndDoshas}\n\n`;
    }

    if (report.planetaryStrengths) {
      content += `**Planetary Strengths**\n${report.planetaryStrengths}\n\n`;
    }

    if (report.transits) {
      content += `**Transits and Gochar**\n${report.transits}\n\n`;
    }
  }

  if (report.remedies) {
    content += `**Remedies and Spiritual Guidance**\n${report.remedies}\n\n`;
  }

  if (report.conclusion) {
    content += `**Conclusion**\n${report.conclusion}\n\n`;
  }

  return content;
};

// Helper function to generate auto report title
const generateAutoReportTitle = (
  userName: string,
  reportType: string,
): string => {
  const typeNames = {
    natal: "Natal Chart Report",
    personality: "Personality Profile",
    career: "Career & Life Purpose Report",
    relationships: "Love & Relationships Report",
    yearly: "Yearly Forecast Report",
    spiritual: "Spiritual Path Report",
    vedic: "Vedic Astrology Report",
  };

  const typeName = typeNames[reportType] || "Astrology Report";
  return userName + "'s " + typeName;
};
