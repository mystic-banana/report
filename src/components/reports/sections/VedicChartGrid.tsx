import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { reportTheme } from "../themes/reportTheme";

interface VedicChartGridProps {
  chartData: BirthChart;
}

interface Planet {
  name: string;
  sign?: string;
  [key: string]: any;
}

type PlanetName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Rahu' | 'Ketu';

const VedicChartGrid: React.FC<VedicChartGridProps> = ({ chartData }) => {
  const planets = chartData.chart_data?.planets || [];

  const vedicSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  const vedicSignsHindi = [
    "मेष", "वृष", "मिथुन", "कर्क", "सिंह", "कन्या",
    "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन",
  ];

  const planetSymbols: Record<PlanetName, string> = {
    Sun: "सू",
    Moon: "च",
    Mercury: "बु",
    Venus: "शु",
    Mars: "मं",
    Jupiter: "गु",
    Saturn: "श",
    Rahu: "रा",
    Ketu: "के",
  };

  const getPlanetsInSign = (signIndex: number) => {
    const signName = vedicSigns[signIndex];
    return planets.filter((planet: Planet) => planet.sign === signName);
  };

  const renderNorthIndianChart = () => {
    // North Indian chart layout (diamond shape)
    const chartSize = reportTheme.charts.size.large;
    const borderColor = reportTheme.colors.charts.vedic[0];
    const accentColor = reportTheme.colors.charts.vedic[1];
    const textColor = reportTheme.colors.primary;
    const planetColors = reportTheme.colors.charts.vedic;
    
    return (
      <div className="relative mx-auto chart-container" style={{ width: `${chartSize}px`, height: `${chartSize}px` }}>
        <div className="absolute inset-0 transform rotate-45">
          <div className="w-full h-full border-4 bg-gradient-to-br" 
            style={{ 
              borderColor: borderColor,
              background: `linear-gradient(135deg, ${reportTheme.colors.background.base}80, ${reportTheme.colors.background.gradient}80)`
            }}
          >
            {/* Create the diamond grid */}
            <div className="grid grid-cols-3 grid-rows-3 h-full">
              {Array.from({ length: 12 }, (_, i) => {
                const signIndex = i;
                const planetsInSign = getPlanetsInSign(signIndex);

                return (
                  <div
                    key={i}
                    className="border flex flex-col items-center justify-center p-1 text-center relative"
                    style={{ borderColor: `${borderColor}50` }}
                  >
                    <div className="transform -rotate-45">
                      <div className="text-sm font-semibold mb-1" style={{ color: accentColor }}>
                        {i + 1}
                      </div>
                      <div className="text-sm" style={{ color: textColor }}>
                        {vedicSignsHindi[signIndex]}
                      </div>
                      <div className="flex flex-wrap justify-center mt-2">
                        {planetsInSign.map((planet: Planet, pIndex: number) => {
                          // Get planet color from theme
                          const planetName = planet.name as PlanetName;
                          const planetSymbol = planetName && planetSymbols[planetName] ? 
                            planetSymbols[planetName] : planet.name.charAt(0);
                          const planetColor = planetColors[pIndex % planetColors.length];
                          
                          return (
                            <span
                              key={pIndex}
                              className="text-sm rounded px-1.5 py-0.5 m-0.5 font-bold"
                              style={{ 
                                color: planetColor, 
                                backgroundColor: "rgba(18, 18, 18, 0.7)", 
                                border: `1px solid ${planetColor}`
                              }}
                              title={planet.name}
                            >
                              {planetSymbol}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full w-20 h-20 flex items-center justify-center" 
            style={{ 
              backgroundColor: typeof reportTheme.colors.background.gradient === 'string' 
                ? 'rgba(24, 24, 24, 0.8)'  // Fallback if gradient is a string
                : reportTheme.colors.background.base,
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 10px rgba(0, 0, 0, 0.5)`
            }}
          >
            <span className="font-bold text-lg" style={{ color: textColor }}>जन्म</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSouthIndianChart = () => {
    // South Indian chart layout (square with fixed houses)
    const chartSize = reportTheme.charts.size.large;
    const borderColor = reportTheme.colors.charts.vedic[0];
    const accentColor = reportTheme.colors.charts.vedic[1];
    const textColor = reportTheme.colors.primary;
    const planetColors = reportTheme.colors.charts.vedic;
    
    // Map grid positions to houses (South Indian style)
    const houseMapping: Record<number, number> = {
      0: 1, 1: 2, 2: 3, 3: 4,
      15: 12, 14: 11, 13: 10, 12: 9,
      4: 5, 7: 6, 8: 7, 11: 8,
    };
    
    return (
      <div className="mx-auto chart-container" style={{ width: `${chartSize}px`, height: `${chartSize}px` }}>
        <div className="grid grid-cols-4 grid-rows-4 h-full border-4" 
          style={{ 
            borderColor: borderColor,
            background: `linear-gradient(135deg, ${reportTheme.colors.background.base}80, ${typeof reportTheme.colors.background.gradient === 'string' ? reportTheme.colors.background.base : reportTheme.colors.background.base}80)`
          }}
        >
          {Array.from({ length: 16 }, (_, i) => {
            // In TypeScript, we need to ensure type safety when accessing the houseMapping
            const house = i in houseMapping ? houseMapping[i] : undefined;
            if (!house) {
              return <div key={i} className="border" style={{ borderColor: `${borderColor}30` }} />;
            }

            const signIndex = house - 1;
            const planetsInSign = getPlanetsInSign(signIndex);

            return (
              <div
                key={i}
                className="border flex flex-col items-center justify-center p-1 text-center" 
                style={{ borderColor: `${borderColor}50` }}
              >
                <div className="text-sm font-semibold mb-1" style={{ color: accentColor }}>
                  {house}
                </div>
                <div className="text-sm" style={{ color: textColor }}>
                  {vedicSignsHindi[signIndex]}
                </div>
                <div className="flex flex-wrap justify-center mt-2">
                  {planetsInSign.map((planet: Planet, pIndex: number) => {
                    // Get planet color from theme
                    const planetName = planet.name as PlanetName;
                    const planetSymbol = planetName && planetSymbols[planetName] ? 
                      planetSymbols[planetName] : planet.name.charAt(0);
                    const planetColor = planetColors[pIndex % planetColors.length];
                    
                    return (
                      <span
                        key={pIndex}
                        className="text-sm rounded px-1.5 py-0.5 m-0.5 font-bold"
                        style={{ 
                          color: planetColor, 
                          backgroundColor: "rgba(18, 18, 18, 0.7)", 
                          border: `1px solid ${planetColor}`
                        }}
                        title={planet.name}
                      >
                        {planetSymbol}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="report-card">
      <h2 className="report-section-title text-center">Vedic Chart</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
        <div>
          <h3
            className="text-lg mb-4 text-center"
            style={{ color: reportTheme.colors.primary }}
          >
            North Indian Style
          </h3>
          {renderNorthIndianChart()}
        </div>
        <div>
          <h3
            className="text-lg mb-4 text-center"
            style={{ color: reportTheme.colors.primary }}
          >
            South Indian Style
          </h3>
          {renderSouthIndianChart()}
        </div>
      </div>

      {/* Legend section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="rounded-lg p-4" style={{ 
          background: `linear-gradient(135deg, rgba(255,183,77,0.1) 0%, rgba(255,138,101,0.1) 100%)`,
          border: '1px solid rgba(255,183,77,0.2)'
        }}>
          <h4 className="text-sm font-medium mb-2" style={{ color: reportTheme.colors.primary }}>
            Planet Symbols
          </h4>
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(planetSymbols).slice(0, 6).map(([name, symbol]) => (
              <div key={name} className="text-xs" style={{ color: reportTheme.colors.text.secondary }}>
                <span className="font-bold mr-1" style={{ color: reportTheme.colors.primary }}>{symbol}</span>
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p
          className="text-sm italic"
          style={{ color: reportTheme.colors.text.secondary }}
        >
          Vedic chart showing planetary positions in Rashi (signs)
        </p>
      </div>
    </div>
  );
};

export default VedicChartGrid;
