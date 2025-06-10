import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Circle, Star } from "lucide-react";
import { reportTheme } from "../themes/reportTheme";

// Define planet interface to fix type issues
interface Planet {
  name: string;
  longitude?: number;
  [key: string]: any; // For other planet properties
}

// Define planet symbols type for type safety
type PlanetName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

interface ChartVisualizationProps {
  chartData: BirthChart;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const ChartVisualization: React.FC<ChartVisualizationProps> = ({
  chartData,
  system,
}) => {
  const getChartTitle = () => {
    switch (system) {
      case "vedic":
        return "Janma Kundali";
      case "chinese":
        return "Four Pillars Chart";
      case "hellenistic":
        return "Natal Horoscope";
      default:
        return "Birth Chart";
    }
  };

  const renderWesternChart = () => {
    // Get dimensions from theme
    const chartSize = reportTheme.charts.size.large;
    const centerPoint = chartSize / 2;
    
    return (
      <div 
        className="relative mx-auto chart-container"
        style={{ width: `${chartSize}px`, height: `${chartSize}px` }}
      >
        {/* Outer Circle */}
        <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: reportTheme.colors.primary }}>
          {/* Inner Circle */}
          <div className="absolute inset-12 border-2 rounded-full" style={{ borderColor: reportTheme.colors.primary, opacity: 0.7 }}>
            {/* Center */}
            <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Star className="w-10 h-10" style={{ color: reportTheme.colors.primary }} />
            </div>
          </div>
        </div>

        {/* House Lines */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30 - 90;
          const radian = (angle * Math.PI) / 180;
          // Adjusted positioning for larger chart
          const outerRadius = centerPoint * 0.9;
          const lineLength = centerPoint * 0.12;
          
          const x1 = centerPoint + outerRadius * Math.cos(radian);
          const y1 = centerPoint + outerRadius * Math.sin(radian);

          return (
            <div
              key={i}
              className="absolute origin-bottom"
              style={{
                left: `${x1}px`,
                top: `${y1}px`,
                width: "3px",
                height: `${lineLength}px`,
                backgroundColor: reportTheme.colors.secondary,
                opacity: 0.8,
                transform: `rotate(${angle + 90}deg)`,
                transformOrigin: "center bottom",
              }}
            />
          );
        })}

        {/* Zodiac Signs */}
        {[
          "♈",
          "♉",
          "♊",
          "♋",
          "♌",
          "♍",
          "♎",
          "♏",
          "♐",
          "♑",
          "♒",
          "♓",
        ].map((sign, i) => {
          const angle = i * 30 - 75;
          const radian = (angle * Math.PI) / 180;
          const radius = centerPoint * 0.75;
          const x = centerPoint + radius * Math.cos(radian);
          const y = centerPoint + radius * Math.sin(radian);

          return (
            <div
              key={i}
              className="absolute text-3xl font-bold transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${x}px`, 
                top: `${y}px`,
                color: reportTheme.colors.primary, 
                textShadow: "0 0 4px rgba(0,0,0,0.5)"
              }}
            >
              {sign}
            </div>
          );
        })}

        {/* Planets */}
        {chartData.chart_data?.planets?.slice(0, 10).map((planet: Planet, i: number) => {
          const angle = (planet.longitude || i * 36) - 90;
          const radian = (angle * Math.PI) / 180;
          const radius = centerPoint * 0.55;
          const x = centerPoint + radius * Math.cos(radian);
          const y = centerPoint + radius * Math.sin(radian);

          const planetSymbols: Record<PlanetName, string> = {
            Sun: "☉",
            Moon: "☽",
            Mercury: "☿",
            Venus: "♀",
            Mars: "♂",
            Jupiter: "♃",
            Saturn: "♄",
            Uranus: "♅",
            Neptune: "♆",
            Pluto: "♇",
          };

          // Get planet color from theme color array
          const planetColors = reportTheme.colors.charts.western;
          const planetColor = planetColors[i % planetColors.length];
          
          // Type-safe check for planet symbol
          const planetName = planet.name as PlanetName;
          const planetSymbol = planetName && planetSymbols[planetName] ? planetSymbols[planetName] : "●";

          return (
            <div
              key={i}
              className="absolute text-2xl font-bold transform -translate-x-1/2 -translate-y-1/2 rounded-full w-12 h-12 flex items-center justify-center"
              style={{ 
                left: `${x}px`, 
                top: `${y}px`, 
                backgroundColor: "rgba(18, 18, 18, 0.8)",
                color: planetColor,
                border: `2px solid ${planetColor}`,
                boxShadow: `0 0 8px rgba(255, 255, 255, 0.2)`,
              }}
              title={planet.name}
            >
              {planetSymbol}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="report-card">
      <h2 className="report-section-title flex items-center justify-center">
        <Circle className="w-6 h-6 mr-3" style={{ color: reportTheme.colors.primary }} />
        {getChartTitle()}
      </h2>

      <div className="flex justify-center my-8">{renderWesternChart()}</div>

      <div className="mt-8 text-center">
        <p className="text-sm italic" style={{ color: reportTheme.colors.text.secondary }}>
          Chart visualization showing planetary positions at birth time
        </p>
      </div>
    </div>
  );
};

export default ChartVisualization;
