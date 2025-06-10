import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback
} from "react";
import * as d3 from "d3";
import {
  BirthChartData,
  PlanetaryPosition,
  HousePosition
} from "../../utils/astronomicalCalculations";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import "./InteractiveChart.css";

// Create a single supabase client for the component
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types and Enums
export enum ChartTheme {
  LIGHT = 'light',
  DARK = 'dark',
  COSMIC = 'cosmic'
}

export interface InteractiveChartProps {
  chartData: BirthChartData;
  width?: number;
  height?: number;
  onPlanetClick?: (planet: PlanetaryPosition) => void;
  onHouseClick?: (house: HousePosition) => void;
  initialZoom?: number;
  theme?: ChartTheme;
  showControls?: boolean;
  showSummary?: boolean;
  watermark?: boolean;
  enableExport?: boolean;
  isPremium?: boolean;
  className?: string;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
  chartData,
  width = 600,
  height = 600,
  onPlanetClick,
  onHouseClick,
  initialZoom = 1,
  theme = ChartTheme.LIGHT,
  showControls = true,
  showSummary = true,
  watermark = true,
  enableExport = true,
  isPremium = false,
  className = "",
}) => {
  // Chart state
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [rotation, setRotation] = useState<number>(0);
  const [hoveredElement, setHoveredElement] = useState<{
    type: "planet" | "house" | "sign" | null;
    data: any | null;
  }>({ type: null, data: null });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Derived state
  const containerSize = useMemo(
    () => ({ width, height }),
    [width, height]
  );
  
  // Theme colors based on selected theme
  const themeColors = useMemo(() => {
    switch (theme) {
      case ChartTheme.DARK:
        return {
          background: "#121212",
          text: "#ffffff",
          lines: "#333333",
          accent: "#bb86fc",
        };
      case ChartTheme.COSMIC:
        return {
          background: "#0a0a2a",
          text: "#e0e0ff",
          lines: "#2a2a4a",
          accent: "#00ffcc",
        };
      case ChartTheme.LIGHT:
      default:
        return {
          background: "#ffffff",
          text: "#000000",
          lines: "#cccccc",
          accent: "#3f51b5",
        };
    }
  }, [theme]);
  
  // Chart drawing function
  const drawChart = useCallback(() => {
    if (!svgRef.current || !chartData) return;
    
    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8 * zoom;
    
    // Create a group for all chart elements that can be rotated and zoomed
    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY}) rotate(${rotation})`);
      
    // Draw zodiac circle
    chartGroup
      .append("circle")
      .attr("r", radius)
      .attr("fill", themeColors.background)
      .attr("stroke", themeColors.lines)
      .attr("stroke-width", 2);
      
    // Draw zodiac segments (12 signs)
    const segmentAngle = 360 / 12;
    for (let i = 0; i < 12; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      
      // Draw segment arc
      const arc = d3.arc()
        .innerRadius(radius * 0.8)
        .outerRadius(radius)
        .startAngle((startAngle * Math.PI) / 180)
        .endAngle((endAngle * Math.PI) / 180);
      
      chartGroup
        .append("path")
        .attr("d", arc as any)
        .attr("fill", themeColors.background)
        .attr("stroke", themeColors.lines)
        .attr("stroke-width", 1)
        .on("mouseover", () => {
          setHoveredElement({
            type: "sign",
            data: {
              sign: `Sign ${i + 1}`,
              element: ["Fire", "Earth", "Air", "Water"][Math.floor(i / 3)],
              modality: ["Cardinal", "Fixed", "Mutable"][i % 3]
            }
          });
        })
        .on("mouseout", () => {
          setHoveredElement({ type: null, data: null });
        });
    }
    
    // Draw houses if available in chart data
    if (chartData.houses && chartData.houses.length > 0) {
      chartData.houses.forEach((house, index) => {
        const houseNumber = index + 1;
        const cuspDegree = house.cusp || 0;
        const cuspRad = ((cuspDegree) * Math.PI) / 180;
        
        // Draw house cusp lines
        chartGroup
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", radius * 0.9 * Math.cos(cuspRad))
          .attr("y2", radius * 0.9 * Math.sin(cuspRad))
          .attr("stroke", themeColors.lines)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "5,5")
          .on("mouseover", () => {
            setHoveredElement({
              type: "house",
              data: {
                house: houseNumber,
                sign: house.sign,
                cusp: house.cusp || 0
              }
            });
          })
          .on("mouseout", () => {
            setHoveredElement({ type: null, data: null });
          })
          .on("click", () => {
            if (onHouseClick) onHouseClick(house);
          });
      });
    }
    
    // Draw planets if available in chart data
    if (chartData.planets && chartData.planets.length > 0) {
      chartData.planets.forEach((planetData) => {
        const planetDegree = planetData.degree || 0;
        const planetRad = ((planetDegree) * Math.PI) / 180;
        const planetX = radius * 0.7 * Math.cos(planetRad);
        const planetY = radius * 0.7 * Math.sin(planetRad);
        
        // Planet symbol group
        const planetGroup = chartGroup
          .append("g")
          .attr("transform", `translate(${planetX}, ${planetY})`);
        
        // Planet circle
        planetGroup
          .append("circle")
          .attr("r", 10)
          .attr("fill", themeColors.accent)
          .attr("stroke", themeColors.text)
          .attr("stroke-width", 1)
          .on("mouseover", () => {
            setHoveredElement({
              type: "planet",
              data: {
                name: planetData.name,
                sign: planetData.sign,
                house: planetData.house,
                degree: planetData.degree || 0
              }
            });
          })
          .on("mouseout", () => {
            setHoveredElement({ type: null, data: null });
          })
          .on("click", () => {
            if (onPlanetClick) onPlanetClick(planetData);
          });
        
        // Planet text label
        planetGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.3em")
          .attr("fill", themeColors.text)
          .style("font-size", "12px")
          .text(planetData.name ? planetData.name.charAt(0) : "?");
      });
    }
    
    // Draw aspects between planets if needed - simplified for now
    // Will be implemented in future versions
    
  }, [chartData, containerSize, rotation, zoom, themeColors, setHoveredElement, onHouseClick, onPlanetClick]);
  
  // Initialize and update chart on dependencies change
  useEffect(() => {
    drawChart();
  }, [drawChart]);
  
  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetRotation = () => setRotation(0);
  
  // Export handlers
  const handleExport = () => {
    if (!svgRef.current) return;
    
    try {
      // Create a copy of the SVG with watermark if needed
      const svgCopy = svgRef.current.cloneNode(true) as SVGSVGElement;
      
      if (watermark && !isPremium) {
        // Add watermark to SVG
        const watermarkText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        watermarkText.setAttribute("x", "50%");
        watermarkText.setAttribute("y", "95%");
        watermarkText.setAttribute("text-anchor", "middle");
        watermarkText.setAttribute("font-size", "14px");
        watermarkText.setAttribute("fill", "rgba(128, 128, 128, 0.5)");
        watermarkText.textContent = "Generated with Mystic Banana";
        svgCopy.appendChild(watermarkText);
      }
      
      // Convert SVG to data URL
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgCopy);
      const svgBlob = new Blob([svgStr], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `astrology-chart-${new Date().toISOString().split("T")[0]}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Chart exported successfully!");
    } catch (error) {
      console.error("Error exporting SVG:", error);
      toast.error("Failed to export chart");
    }
  };
  
  const handleExportPDF = async () => {
    if (!svgRef.current) return;
    
    try {
      setIsLoading(true);
      
      // Create a serialized version of the SVG
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgRef.current);
      
      // Mock chart data for PDF generation
      const mockData = {
        chartSvg: svgStr,
        name: "Birth Chart",
        date: new Date().toISOString(),
        interpretations: {
          summary: "This is a sample birth chart interpretation.",
          planets: chartData.planets.map(planet => ({
            name: planet.name,
            sign: planet.sign,
            interpretation: `${planet.name} in ${planet.sign} interpretation...`
          })),
          houses: chartData.houses.map((house, index) => ({
            number: index + 1,
            sign: house.sign,
            interpretation: `House ${index + 1} in ${house.sign} interpretation...`
          }))
        }
      };
      
      // Call serverless function to generate PDF
      const { data, error } = await supabase.functions.invoke("generate-pdf-report", {
        body: { data: mockData, template: "birth-chart", watermark: !isPremium && watermark }
      });
      
      if (error) throw new Error(error.message);
      
      // Download the generated PDF
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("PDF exported successfully!");
      } else {
        throw new Error("No PDF URL returned");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div 
      className={`interactive-chart-container ${className}`} 
      ref={chartContainerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <svg 
        ref={svgRef} 
        width={containerSize.width} 
        height={containerSize.height}
        style={{ background: themeColors.background }}
      />
      
      {showControls && (
        <div className="chart-controls">
          <button onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button onClick={handleResetRotation} title="Reset Rotation">
            <RotateCcw size={18} />
          </button>
          {enableExport && (
            <>
              <button onClick={handleExport} title="Export SVG">
                <Download size={18} />
              </button>
              <button 
                onClick={handleExportPDF} 
                title="Export PDF"
                disabled={isLoading}
              >
                <Download size={18} />
                {isLoading && <span className="loading-indicator" />}
              </button>
            </>
          )}
        </div>
      )}
      
      {showSummary && hoveredElement.type && hoveredElement.data && (
        <div className="chart-tooltip">
          {hoveredElement.type === "planet" && (
            <div>
              <h4>{hoveredElement.data.name} in {hoveredElement.data.sign}</h4>
              <p>House: {hoveredElement.data.house}</p>
              <p>Degree: {hoveredElement.data.degree.toFixed(2)}°</p>
            </div>
          )}
          {hoveredElement.type === "house" && (
            <div>
              <h4>House {hoveredElement.data.house}</h4>
              <p>Sign: {hoveredElement.data.sign}</p>
              <p>Cusp: {hoveredElement.data.cusp.toFixed(2)}°</p>
            </div>
          )}
          {hoveredElement.type === "sign" && (
            <div>
              <h4>{hoveredElement.data.sign}</h4>
              <p>Element: {hoveredElement.data.element}</p>
              <p>Modality: {hoveredElement.data.modality}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveChart;
