import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Star, Circle } from "lucide-react";

interface VedicChartGridProps {
  chartData: BirthChart;
}

const VedicChartGrid: React.FC<VedicChartGridProps> = ({ chartData }) => {
  const planets = chartData.chart_data?.planets || [];

  const vedicSigns = [
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

  const vedicSignsHindi = [
    "मेष",
    "वृष",
    "मिथुन",
    "कर्क",
    "सिंह",
    "कन्या",
    "तुला",
    "वृश्चिक",
    "धनु",
    "मकर",
    "कुम्भ",
    "मीन",
  ];

  const planetSymbols = {
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
    return planets.filter((planet) => planet.sign === signName);
  };

  const renderNorthIndianChart = () => {
    // North Indian chart layout (diamond shape)
    const positions = [
      { row: 0, col: 1, house: 1 }, // Top
      { row: 0, col: 2, house: 2 }, // Top right
      { row: 1, col: 2, house: 3 }, // Right
      { row: 2, col: 2, house: 4 }, // Bottom right
      { row: 2, col: 1, house: 5 }, // Bottom
      { row: 2, col: 0, house: 6 }, // Bottom left
      { row: 1, col: 0, house: 7 }, // Left
      { row: 0, col: 0, house: 8 }, // Top left
      { row: 1, col: 1, house: 9 }, // Center top
      { row: 1, col: 1, house: 10 }, // Center
      { row: 1, col: 1, house: 11 }, // Center
      { row: 1, col: 1, house: 12 }, // Center bottom
    ];

    return (
      <div className="relative w-80 h-80 mx-auto">
        <div className="absolute inset-0 transform rotate-45">
          <div className="w-full h-full border-4 border-orange-400 bg-gradient-to-br from-orange-900/20 to-red-900/20">
            {/* Create the diamond grid */}
            <div className="grid grid-cols-3 grid-rows-3 h-full">
              {Array.from({ length: 12 }, (_, i) => {
                const signIndex = i;
                const planetsInSign = getPlanetsInSign(signIndex);

                return (
                  <div
                    key={i}
                    className="border border-orange-300/50 flex flex-col items-center justify-center p-1 text-center relative"
                  >
                    <div className="transform -rotate-45">
                      <div className="text-xs text-orange-300 font-semibold mb-1">
                        {i + 1}
                      </div>
                      <div className="text-xs text-orange-200">
                        {vedicSignsHindi[signIndex]}
                      </div>
                      <div className="flex flex-wrap justify-center mt-1">
                        {planetsInSign.map((planet, pIndex) => (
                          <span
                            key={pIndex}
                            className="text-xs text-yellow-300 bg-orange-800/50 rounded px-1 m-0.5"
                            title={planet.name}
                          >
                            {planetSymbols[planet.name] ||
                              planet.name.charAt(0)}
                          </span>
                        ))}
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
          <div className="bg-orange-800/80 rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-orange-200 font-bold text-sm">जन्म</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSouthIndianChart = () => {
    // South Indian chart layout (square with fixed houses)
    return (
      <div className="w-80 h-80 mx-auto">
        <div className="grid grid-cols-4 grid-rows-4 h-full border-4 border-orange-400 bg-gradient-to-br from-orange-900/20 to-red-900/20">
          {Array.from({ length: 16 }, (_, i) => {
            // Map grid positions to houses (South Indian style)
            const houseMapping = {
              0: 1,
              1: 2,
              2: 3,
              3: 4,
              15: 12,
              14: 11,
              13: 10,
              12: 9,
              4: 5,
              7: 6,
              8: 7,
              11: 8,
            };

            const house = houseMapping[i];
            if (!house) {
              return <div key={i} className="border border-orange-300/30" />;
            }

            const signIndex = house - 1;
            const planetsInSign = getPlanetsInSign(signIndex);

            return (
              <div
                key={i}
                className="border border-orange-300/50 flex flex-col items-center justify-center p-1 text-center"
              >
                <div className="text-xs text-orange-300 font-semibold mb-1">
                  {house}
                </div>
                <div className="text-xs text-orange-200">
                  {vedicSignsHindi[signIndex]}
                </div>
                <div className="flex flex-wrap justify-center mt-1">
                  {planetsInSign.map((planet, pIndex) => (
                    <span
                      key={pIndex}
                      className="text-xs text-yellow-300 bg-orange-800/50 rounded px-1 m-0.5"
                      title={planet.name}
                    >
                      {planetSymbols[planet.name] || planet.name.charAt(0)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center">
        <Star className="w-6 h-6 mr-3 text-orange-400" />
        जन्म कुंडली (Janma Kundali)
      </h2>

      <div className="space-y-8">
        {/* North Indian Style Chart */}
        <div>
          <h3 className="text-lg font-semibold text-orange-300 mb-4 text-center">
            उत्तर भारतीय शैली (North Indian Style)
          </h3>
          {renderNorthIndianChart()}
        </div>

        {/* South Indian Style Chart */}
        <div>
          <h3 className="text-lg font-semibold text-orange-300 mb-4 text-center">
            दक्षिण भारतीय शैली (South Indian Style)
          </h3>
          {renderSouthIndianChart()}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-400/20">
          <h4 className="text-orange-300 font-medium mb-2">
            ग्रह संकेत (Planet Symbols)
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(planetSymbols).map(([planet, symbol]) => (
              <div key={planet} className="text-orange-200">
                <span className="font-bold">{symbol}</span> = {planet}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-400/20">
          <h4 className="text-orange-300 font-medium mb-2">
            राशि चक्र (Zodiac Wheel)
          </h4>
          <p className="text-orange-200 text-xs">
            The chart shows planetary positions in the 12 houses (भाव) and signs
            (राशि) at the time of birth.
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-400/20">
          <h4 className="text-orange-300 font-medium mb-2">
            वैदिक ज्योतिष (Vedic Astrology)
          </h4>
          <p className="text-orange-200 text-xs">
            Based on the sidereal zodiac system, accounting for the precession
            of equinoxes for accurate calculations.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-orange-200 text-sm italic">
          "ज्योतिषं चक्षुर्वेदानाम्" - Astrology is the eye of the Vedas
        </p>
      </div>
    </div>
  );
};

export default VedicChartGrid;
