import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Home, Circle } from "lucide-react";

interface HouseAnalysisProps {
  chartData: BirthChart;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const HouseAnalysis: React.FC<HouseAnalysisProps> = ({ chartData, system }) => {
  const houses = chartData.chart_data?.houses || [];

  const houseNames = {
    1: "Self & Identity",
    2: "Values & Resources",
    3: "Communication & Siblings",
    4: "Home & Family",
    5: "Creativity & Romance",
    6: "Health & Service",
    7: "Partnerships & Marriage",
    8: "Transformation & Shared Resources",
    9: "Philosophy & Higher Learning",
    10: "Career & Public Image",
    11: "Friends & Aspirations",
    12: "Spirituality & Subconscious",
  };

  const getHouseColor = (houseNumber: number) => {
    const colors = [
      "text-red-400 bg-red-400/20",
      "text-orange-400 bg-orange-400/20",
      "text-yellow-400 bg-yellow-400/20",
      "text-green-400 bg-green-400/20",
      "text-teal-400 bg-teal-400/20",
      "text-blue-400 bg-blue-400/20",
      "text-indigo-400 bg-indigo-400/20",
      "text-purple-400 bg-purple-400/20",
      "text-pink-400 bg-pink-400/20",
      "text-rose-400 bg-rose-400/20",
      "text-cyan-400 bg-cyan-400/20",
      "text-violet-400 bg-violet-400/20",
    ];
    return colors[(houseNumber - 1) % colors.length];
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

  const getPlanetsInHouse = (houseNumber: number) => {
    const planets = chartData.chart_data?.planets || [];
    return planets.filter((planet) => planet.house === houseNumber);
  };

  const getHouseStrength = (houseNumber: number) => {
    const planetsInHouse = getPlanetsInHouse(houseNumber);
    const planetCount = planetsInHouse.length;

    if (planetCount >= 3)
      return { strength: "Strong", color: "text-green-400" };
    if (planetCount === 2)
      return { strength: "Moderate", color: "text-yellow-400" };
    if (planetCount === 1)
      return { strength: "Active", color: "text-blue-400" };
    return { strength: "Quiet", color: "text-gray-400" };
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Home className="w-6 h-6 mr-3 text-indigo-400" />
        House Analysis
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Houses Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            House Positions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNumber) => {
              const house = houses.find((h) => h.number === houseNumber);
              const planetsInHouse = getPlanetsInHouse(houseNumber);
              const strength = getHouseStrength(houseNumber);

              return (
                <div
                  key={houseNumber}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getHouseColor(houseNumber)}`}
                      >
                        {houseNumber}
                      </span>
                      <div>
                        <span className="text-white font-medium">
                          {houseNames[houseNumber]}
                        </span>
                        <div className="text-sm text-gray-400">
                          {house?.sign && (
                            <span className="flex items-center">
                              <span className="text-lg mr-1">
                                {getSignSymbol(house.sign)}
                              </span>
                              {house.sign}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${strength.color} bg-current/20`}
                    >
                      {strength.strength}
                    </span>
                  </div>

                  {planetsInHouse.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-1">Planets:</div>
                      <div className="flex flex-wrap gap-1">
                        {planetsInHouse.map((planet, index) => (
                          <span
                            key={index}
                            className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs"
                          >
                            {planet.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* House Summary */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              House Activity Summary
            </h3>
            <div className="space-y-3">
              {["Strong", "Moderate", "Active", "Quiet"].map((strength) => {
                const count = Array.from(
                  { length: 12 },
                  (_, i) => i + 1,
                ).filter(
                  (houseNumber) =>
                    getHouseStrength(houseNumber).strength === strength,
                ).length;

                const percentage = (count / 12) * 100;
                const colorMap = {
                  Strong: "bg-green-500",
                  Moderate: "bg-yellow-500",
                  Active: "bg-blue-500",
                  Quiet: "bg-gray-500",
                };

                return (
                  <div key={strength} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        {strength} Houses
                      </span>
                      <span className="text-gray-300">{count}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colorMap[strength]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {percentage.toFixed(0)}% of houses
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-400/20">
            <h4 className="text-indigo-300 font-medium mb-3">
              House Interpretation
            </h4>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Houses represent different life areas and experiences. Planets in
              houses show where your energy is focused, while empty houses
              indicate areas that may require conscious attention or represent
              natural talents that flow easily.
            </p>
          </div>

          {system === "vedic" && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-400/20">
              <h4 className="text-orange-300 font-medium mb-3">
                Vedic House System
              </h4>
              <p className="text-orange-200 text-sm leading-relaxed">
                In Vedic astrology, houses (Bhavas) represent the stage of life
                where karmic lessons unfold. The strength of house lords and
                planetary aspects determine the quality of experiences in each
                life area.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseAnalysis;
