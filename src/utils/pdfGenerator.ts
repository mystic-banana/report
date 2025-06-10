import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for report generation
interface AstrologyReportParams {
  title: string;
  content: string;
  reportType: string;
  userName: string;
  birthDate: string;
  chartData: any;
  isPremium: boolean;
  planetaryPositions: Array<any>;
  aspectTable: Array<any>;
  elementalBalance: Record<string, number>;
  modalBalance: Record<string, number>;
}

/**
 * Generates a professional astrology PDF report
 * Uses the Supabase serverless PDF generation function
 * 
 * @param params Report parameters
 * @returns Promise that resolves when report is generated
 */
export async function generateProfessionalAstrologyReport(
  params: AstrologyReportParams
): Promise<void> {
  try {
    toast.loading("Generating PDF report...");
    
    // Extract SVG from chart data if available
    let chartSvg = "";
    if (params.chartData && params.chartData.svgContent) {
      chartSvg = params.chartData.svgContent;
    }
    
    // Format aspect table for report
    const formattedAspects = params.aspectTable.map(aspect => ({
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      aspectType: aspect.type,
      orb: aspect.orb,
      influence: aspect.influence || "neutral"
    }));
    
    // Prepare interpretations data
    const interpretations = {
      summary: params.content.substring(0, 200) + "...",
      planets: params.planetaryPositions.map(planet => ({
        name: planet.name,
        sign: planet.sign,
        house: planet.house,
        interpretation: `${planet.name} in ${planet.sign} represents...`
      })),
      houses: Array.from({ length: 12 }, (_, i) => {
        const house = params.chartData.houses?.[i] || {};
        return {
          number: i + 1,
          sign: house.sign || "Unknown",
          interpretation: `House ${i + 1} in ${house.sign || "Unknown"} signifies...`
        };
      }),
      aspects: formattedAspects.map(aspect => ({
        description: `${aspect.planet1} ${aspect.aspectType} ${aspect.planet2}`,
        interpretation: `This aspect indicates...`
      }))
    };
    
    // Prepare report data for PDF generation
    const reportData = {
      chartSvg,
      name: params.userName,
      title: params.title,
      type: params.reportType,
      date: params.birthDate,
      content: params.content,
      interpretations,
      elementalBalance: params.elementalBalance,
      modalBalance: params.modalBalance
    };
    
    // Call serverless function to generate PDF
    const { data, error } = await supabase.functions.invoke("generate-pdf-report", {
      body: { 
        data: reportData, 
        template: "professional-report",
        watermark: !params.isPremium 
      }
    });
    
    if (error) throw new Error(error.message);
    
    // Download the generated PDF
    if (data?.url) {
      toast.dismiss();
      toast.success("PDF report generated successfully!");
      window.open(data.url, '_blank');
    } else {
      throw new Error("No PDF URL returned");
    }
  } catch (error) {
    toast.dismiss();
    toast.error("Failed to generate PDF report");
    console.error("Error generating PDF report:", error);
  }
}
