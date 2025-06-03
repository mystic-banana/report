import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Crown, Star } from "lucide-react";

interface PlanetaryRulersProps {
  chartData: BirthChart;
}

const PlanetaryRulers: React.FC<PlanetaryRulersProps> = ({ chartData }) => {
  const planets = chartData.chart_data?.planets || [];
  const houses = chartData.chart_data?.houses || [];

  const classicalRulerships = {
    Aries: { ruler: "Mars", symbol: "♂" },
    Taurus: { ruler: "Venus", symbol: "♀" },
    Gemini: { ruler: "Mercury", symbol: "☿" },
    Cancer: { ruler: "Moon", symbol: "☽" },
    Leo: { ruler: "Sun", symbol: "☉" },
    Virgo: { ruler: "Mercury", symbol: "☿" },
    Libra: { ruler: "Venus", symbol: "♀" },
    Scorpio: { ruler: "Mars", symbol: "♂" },
    Sagittarius: { ruler: "Jupiter", symbol: "♃" },
    Capricorn: { ruler: "Saturn", symbol: "♄" },
    Aquarius: { ruler: "Saturn", symbol: "♄" },
    Pisces: { ruler: "Jupiter", symbol: "♃" },
  };

  const getHouseRuler = (houseNumber: number) => {
    const house = houses.find((h) => h.number === houseNumber);
    if (!house?.sign) return null;

    const rulership = classicalRulerships[house.sign];
    if (!rulership) return null;

    const rulerPlanet = planets.find((p) => p.name === rulership.ruler);
    return {
      ...rulership,
      planet: rulerPlanet,
      sign: house.sign,
    };
  };

  const getPlanetColor = (planetName: string) => {
    const colors = {
      Sun: "text-yellow-400",
      Moon: "text-blue-400",
      Mercury: "text-green-400",
      Venus: "text-pink-400",
      Mars: "text-red-400",
      Jupiter: "text-orange-400",
      Saturn: "text-purple-400",
    };
    return colors[planetName] || "text-gray-400";
  };

  const getHouseName = (houseNumber: number) => {
    const names = {
      1: "Self & Identity",
      2: "Resources & Values",
      3: "Communication & Siblings",
      4: "Home & Family",
      5: "Creativity & Children",
      6: "Health & Service",
      7: "Partnerships",
      8: "Transformation",
      9: "Philosophy & Travel",
      10: "Career & Reputation",
      11: "Friends & Hopes",
      12: "Spirituality & Hidden",
    };
    return names[houseNumber] || `House ${houseNumber}`;
  };

  const getRulerCondition = (ruler: any) => {
    if (!ruler.planet)
      return { condition: "Not Found", color: "text-gray-400" };

    const planet = ruler.planet;
    const dignities = {
      Sun: {
        domicile: "Leo",
        exaltation: "Aries",
        detriment: "Aquarius",
        fall: "Libra",
      },
      Moon: {
        domicile: "Cancer",
        exaltation: "Taurus",
        detriment: "Capricorn",
        fall: "Scorpio",
      },
      Mercury: {
        domicile: ["Gemini", "Virgo"],
        exaltation: "Virgo",
        detriment: ["Sagittarius", "Pisces"],
        fall: "Pisces",
      },
      Venus: {
        domicile: ["Taurus", "Libra"],
        exaltation: "Pisces",
        detriment: ["Scorpio", "Aries"],
        fall: "Virgo",
      },
      Mars: {
        domicile: ["Aries", "Scorpio"],
        exaltation: "Capricorn",
        detriment: ["Libra", "Taurus"],
        fall: "Cancer",
      },
      Jupiter: {
        domicile: ["Sagittarius", "Pisces"],
        exaltation: "Cancer",
        detriment: ["Gemini", "Virgo"],
        fall: "Capricorn",
      },
      Saturn: {
        domicile: ["Capricorn", "Aquarius"],
        exaltation: "Libra",
        detriment: ["Cancer", "Leo"],
        fall: "Aries",
      },
    };

    const planetDignity = dignities[planet.name];
    if (!planetDignity) return { condition: "Neutral", color: "text-gray-300" };

    if (
      Array.isArray(planetDignity.domicile)
        ? planetDignity.domicile.includes(planet.sign)
        : planetDignity.domicile === planet.sign
    ) {
      return { condition: "Domicile", color: "text-green-400" };
    }
    if (planetDignity.exaltation === planet.sign) {
      return { condition: "Exaltation", color: "text-yellow-400" };
    }
    if (
      Array.isArray(planetDignity.detriment)
        ? planetDignity.detriment.includes(planet.sign)
        : planetDignity.detriment === planet.sign
    ) {
      return { condition: "Detriment", color: "text-orange-400" };
    }
    if (planetDignity.fall === planet.sign) {
      return { condition: "Fall", color: "text-red-400" };
    }
    return { condition: "Neutral", color: "text-gray-300" };
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

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Crown className="w-6 h-6 mr-3 text-purple-400" />
        Planetary Rulers Analysis
      </h2>

      {/* House Rulers Table */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          House Rulers & Their Conditions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-semibold">
                  House
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  Sign
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  Ruler
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  Ruler's Sign
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  Ruler's House
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  Condition
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(
                (houseNumber) => {
                  const ruler = getHouseRuler(houseNumber);
                  const condition = ruler
                    ? getRulerCondition(ruler)
                    : { condition: "—", color: "text-gray-400" };

                  return (
                    <tr
                      key={houseNumber}
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-400 font-bold">
                            {houseNumber}
                          </span>
                          <span className="text-gray-300 text-sm">
                            {getHouseName(houseNumber)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {ruler ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg text-purple-300">
                              {getSignSymbol(ruler.sign)}
                            </span>
                            <span className="text-gray-300">{ruler.sign}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {ruler ? (
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-lg ${getPlanetColor(ruler.ruler)}`}
                            >
                              {ruler.symbol}
                            </span>
                            <span className="text-white">{ruler.ruler}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {ruler?.planet ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg text-blue-300">
                              {getSignSymbol(ruler.planet.sign)}
                            </span>
                            <span className="text-gray-300">
                              {ruler.planet.sign}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {ruler?.planet ? (
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                            {ruler.planet.house || "—"}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${condition.color}`}>
                          {condition.condition}
                        </span>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ruler Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strong Rulers */}
        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-400/20">
          <h3 className="text-green-300 font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Well-Placed Rulers
          </h3>
          <div className="space-y-3">
            {Array.from({ length: 12 }, (_, i) => i + 1)
              .map((houseNumber) => {
                const ruler = getHouseRuler(houseNumber);
                const condition = ruler ? getRulerCondition(ruler) : null;
                return { houseNumber, ruler, condition };
              })
              .filter(
                ({ condition }) =>
                  condition &&
                  ["Domicile", "Exaltation"].includes(condition.condition),
              )
              .map(({ houseNumber, ruler, condition }) => (
                <div key={houseNumber} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300 font-medium">
                      House {houseNumber} ({getHouseName(houseNumber)})
                    </span>
                    <span className={`text-sm font-medium ${condition?.color}`}>
                      {condition?.condition}
                    </span>
                  </div>
                  <p className="text-green-200 text-sm">
                    {ruler?.ruler} in {ruler?.planet?.sign} brings strength to{" "}
                    {getHouseName(houseNumber).toLowerCase()} matters.
                  </p>
                </div>
              ))}
            {Array.from({ length: 12 }, (_, i) => i + 1)
              .map((houseNumber) => {
                const ruler = getHouseRuler(houseNumber);
                const condition = ruler ? getRulerCondition(ruler) : null;
                return { houseNumber, ruler, condition };
              })
              .filter(
                ({ condition }) =>
                  condition &&
                  ["Domicile", "Exaltation"].includes(condition.condition),
              ).length === 0 && (
              <p className="text-green-200 text-sm italic">
                No rulers in domicile or exaltation. Focus on neutral placements
                for stability.
              </p>
            )}
          </div>
        </div>

        {/* Challenged Rulers */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-400/20">
          <h3 className="text-red-300 font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Challenged Rulers
          </h3>
          <div className="space-y-3">
            {Array.from({ length: 12 }, (_, i) => i + 1)
              .map((houseNumber) => {
                const ruler = getHouseRuler(houseNumber);
                const condition = ruler ? getRulerCondition(ruler) : null;
                return { houseNumber, ruler, condition };
              })
              .filter(
                ({ condition }) =>
                  condition &&
                  ["Detriment", "Fall"].includes(condition.condition),
              )
              .map(({ houseNumber, ruler, condition }) => (
                <div key={houseNumber} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-300 font-medium">
                      House {houseNumber} ({getHouseName(houseNumber)})
                    </span>
                    <span className={`text-sm font-medium ${condition?.color}`}>
                      {condition?.condition}
                    </span>
                  </div>
                  <p className="text-red-200 text-sm">
                    {ruler?.ruler} in {ruler?.planet?.sign} may require extra
                    attention in {getHouseName(houseNumber).toLowerCase()}{" "}
                    areas.
                  </p>
                </div>
              ))}
            {Array.from({ length: 12 }, (_, i) => i + 1)
              .map((houseNumber) => {
                const ruler = getHouseRuler(houseNumber);
                const condition = ruler ? getRulerCondition(ruler) : null;
                return { houseNumber, ruler, condition };
              })
              .filter(
                ({ condition }) =>
                  condition &&
                  ["Detriment", "Fall"].includes(condition.condition),
              ).length === 0 && (
              <p className="text-red-200 text-sm italic">
                No rulers in detriment or fall. Your planetary rulers are
                generally well-supported.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ruler Interpretation */}
      <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-purple-400/20">
        <h3 className="text-purple-300 font-semibold mb-4">
          Understanding Planetary Rulers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-purple-300 font-medium mb-2">
              Classical Rulership:
            </h4>
            <p className="text-purple-200 text-sm leading-relaxed mb-4">
              Each house is ruled by the planet that governs the sign on its
              cusp. The condition and placement of this ruling planet
              significantly influences the house's expression and the life areas
              it represents.
            </p>
            <h4 className="text-purple-300 font-medium mb-2">
              Dignity Conditions:
            </h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>
                <span className="text-green-400">•</span>{" "}
                <strong>Domicile:</strong> Planet in its own sign (strongest)
              </li>
              <li>
                <span className="text-yellow-400">•</span>{" "}
                <strong>Exaltation:</strong> Planet in its exaltation sign (very
                strong)
              </li>
              <li>
                <span className="text-orange-400">•</span>{" "}
                <strong>Detriment:</strong> Planet opposite its domicile
                (weakened)
              </li>
              <li>
                <span className="text-red-400">•</span> <strong>Fall:</strong>{" "}
                Planet opposite its exaltation (most challenged)
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-purple-300 font-medium mb-2">
              Practical Application:
            </h4>
            <p className="text-purple-200 text-sm leading-relaxed">
              Well-placed rulers indicate areas of natural strength and ease in
              your life. Challenged rulers point to areas requiring conscious
              effort and development. The house placement of each ruler shows
              where that life area's energy is directed.
            </p>
            <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
              <p className="text-purple-200 text-xs italic">
                "The ruler of a house acts as the ambassador of that house's
                affairs, carrying its influence to wherever it is placed in the
                chart."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryRulers;
