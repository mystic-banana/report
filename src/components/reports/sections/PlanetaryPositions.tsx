import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Star, Circle } from "lucide-react";

interface PlanetaryPositionsProps {
  chartData: BirthChart;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const PlanetaryPositions: React.FC<PlanetaryPositionsProps> = ({
  chartData,
  system,
}) => {
  const planets = chartData.chart_data?.planets || [];

  const planetSymbols = {
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
    "North Node": "☊",
    "South Node": "☋",
    Chiron: "⚷",
    Lilith: "⚸",
  };

  const getSignSymbol = (sign: string) => {
    const signs = {
      Aries: "♈",
      Taurus: "♉",
      Gemini: "♊",
      Cancer: "♋",
      Leo: "♌",
      Virgo: "♍",
      Libra: "♎",
      Scorpio: "♏",
      Sagittarius: "♐",
      Capricorn: "♑",
      Aquarius: "♒",
      Pisces: "♓",
    };
    return signs[sign] || sign;
  };

  const formatDegree = (
    degree: number,
    minute: number = 0,
    second: number = 0,
  ) => {
    return `${Math.floor(degree)}°${minute.toString().padStart(2, "0")}'${second.toString().padStart(2, "0")}"`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Star className="w-6 h-6 mr-3 text-yellow-400" />
        Planetary Positions
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-4 text-white font-semibold">
                Planet
              </th>
              <th className="text-left py-3 px-4 text-white font-semibold">
                Sign
              </th>
              <th className="text-left py-3 px-4 text-white font-semibold">
                Degree
              </th>
              <th className="text-left py-3 px-4 text-white font-semibold">
                House
              </th>
              {system === "vedic" && (
                <th className="text-left py-3 px-4 text-white font-semibold">
                  Nakshatra
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {planets.map((planet, index) => (
              <tr
                key={index}
                className="border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {planetSymbols[planet.name] || "●"}
                    </span>
                    <span className="text-white font-medium">
                      {planet.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl text-blue-400">
                      {getSignSymbol(planet.sign)}
                    </span>
                    <span className="text-gray-300">{planet.sign}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300 font-mono">
                  {formatDegree(
                    planet.degree || 0,
                    planet.minute || 0,
                    planet.second || 0,
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-sm">
                    House {planet.house || "N/A"}
                  </span>
                </td>
                {system === "vedic" && (
                  <td className="py-3 px-4 text-orange-300">
                    {planet.nakshatra || "N/A"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-400/20">
        <p className="text-blue-200 text-sm">
          <strong>Note:</strong> Planetary positions are calculated for the
          exact time and location of birth. Each planet's influence varies based
          on its sign, house placement, and aspects to other planets.
        </p>
      </div>
    </div>
  );
};

export default PlanetaryPositions;
