import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Star, Circle } from "lucide-react";

interface HellenisticChartProps {
  chartData: BirthChart;
}

const HellenisticChart: React.FC<HellenisticChartProps> = ({ chartData }) => {
  const planets = chartData.chart_data?.planets || [];
  const houses = chartData.chart_data?.houses || [];

  const classicalPlanets = [
    { name: "Sun", symbol: "☉", color: "text-yellow-400" },
    { name: "Moon", symbol: "☽", color: "text-blue-400" },
    { name: "Mercury", symbol: "☿", color: "text-green-400" },
    { name: "Venus", symbol: "♀", color: "text-pink-400" },
    { name: "Mars", symbol: "♂", color: "text-red-400" },
    { name: "Jupiter", symbol: "♃", color: "text-orange-400" },
    { name: "Saturn", symbol: "♄", color: "text-purple-400" },
  ];

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

  const renderClassicalChart = () => {
    return (
      <div className="relative w-96 h-96 mx-auto">
        {/* Outer Square */}
        <div className="absolute inset-0 border-4 border-purple-400 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
          {/* Inner divisions for houses */}
          <div className="absolute inset-4 grid grid-cols-3 grid-rows-3 gap-1">
            {Array.from({ length: 12 }, (_, i) => {
              const houseNumber = i + 1;
              const house = houses.find((h) => h.number === houseNumber);
              const planetsInHouse = planets.filter(
                (p) =>
                  p.house === houseNumber &&
                  classicalPlanets.some((cp) => cp.name === p.name),
              );

              return (
                <div
                  key={i}
                  className="border border-purple-300/30 bg-purple-800/10 flex flex-col items-center justify-center p-1 text-center relative"
                >
                  <div className="text-xs text-purple-300 font-semibold mb-1">
                    {houseNumber}
                  </div>
                  {house?.sign && (
                    <div className="text-lg text-purple-200 mb-1">
                      {getSignSymbol(house.sign)}
                    </div>
                  )}
                  <div className="flex flex-wrap justify-center">
                    {planetsInHouse.map((planet, pIndex) => {
                      const classicalPlanet = classicalPlanets.find(
                        (cp) => cp.name === planet.name,
                      );
                      return (
                        <span
                          key={pIndex}
                          className={`text-sm ${classicalPlanet?.color || "text-white"} m-0.5`}
                          title={planet.name}
                        >
                          {classicalPlanet?.symbol || planet.name.charAt(0)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-purple-800/80 rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-purple-200 font-bold text-sm">Γενέθλια</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center">
        <Star className="w-6 h-6 mr-3 text-purple-400" />
        Γενέθλια Ὡροσκόπιον (Hellenistic Chart)
      </h2>

      <div className="space-y-8">
        {/* Classical Chart */}
        <div>
          <h3 className="text-lg font-semibold text-purple-300 mb-4 text-center">
            Classical Square Chart
          </h3>
          {renderClassicalChart()}
        </div>

        {/* Classical Planets Table */}
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-purple-400/20">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Classical Planetary Positions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-400/20">
                  <th className="text-left py-2 px-3 text-purple-300 font-semibold text-sm">
                    Planet
                  </th>
                  <th className="text-left py-2 px-3 text-purple-300 font-semibold text-sm">
                    Sign
                  </th>
                  <th className="text-left py-2 px-3 text-purple-300 font-semibold text-sm">
                    Degree
                  </th>
                  <th className="text-left py-2 px-3 text-purple-300 font-semibold text-sm">
                    House
                  </th>
                  <th className="text-left py-2 px-3 text-purple-300 font-semibold text-sm">
                    Dignity
                  </th>
                </tr>
              </thead>
              <tbody>
                {classicalPlanets.map((classicalPlanet) => {
                  const planet = planets.find(
                    (p) => p.name === classicalPlanet.name,
                  );
                  if (!planet) return null;

                  const getDignity = (planetName: string, sign: string) => {
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

                    const planetDignity = dignities[planetName];
                    if (!planetDignity) return "—";

                    if (
                      Array.isArray(planetDignity.domicile)
                        ? planetDignity.domicile.includes(sign)
                        : planetDignity.domicile === sign
                    ) {
                      return "Domicile";
                    }
                    if (planetDignity.exaltation === sign) return "Exaltation";
                    if (
                      Array.isArray(planetDignity.detriment)
                        ? planetDignity.detriment.includes(sign)
                        : planetDignity.detriment === sign
                    ) {
                      return "Detriment";
                    }
                    if (planetDignity.fall === sign) return "Fall";
                    return "—";
                  };

                  const dignity = getDignity(planet.name, planet.sign);
                  const dignityColor =
                    {
                      Domicile: "text-green-400",
                      Exaltation: "text-yellow-400",
                      Detriment: "text-orange-400",
                      Fall: "text-red-400",
                    }[dignity] || "text-gray-400";

                  return (
                    <tr
                      key={planet.name}
                      className="border-b border-purple-400/10"
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${classicalPlanet.color}`}>
                            {classicalPlanet.symbol}
                          </span>
                          <span className="text-white text-sm">
                            {planet.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg text-purple-300">
                            {getSignSymbol(planet.sign)}
                          </span>
                          <span className="text-purple-200 text-sm">
                            {planet.sign}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-purple-200 text-sm font-mono">
                        {Math.floor(planet.degree || 0)}°
                        {(planet.minute || 0).toString().padStart(2, "0")}'
                      </td>
                      <td className="py-2 px-3">
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                          {planet.house || "—"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-sm font-medium ${dignityColor}`}>
                          {dignity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Classical Techniques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-400/20">
            <h4 className="text-indigo-300 font-semibold mb-3">
              Hellenistic Techniques
            </h4>
            <ul className="text-indigo-200 text-sm space-y-2">
              <li>• Whole Sign Houses</li>
              <li>• Classical Planetary Dignities</li>
              <li>• Sect (Day/Night Chart)</li>
              <li>• Bonification & Maltreatment</li>
              <li>• Lots (Arabic Parts)</li>
              <li>• Time-Lord Systems</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20">
            <h4 className="text-purple-300 font-semibold mb-3">
              Classical Wisdom
            </h4>
            <p className="text-purple-200 text-sm leading-relaxed">
              Hellenistic astrology, practiced from the 1st century BCE to the
              7th century CE, forms the foundation of Western astrological
              tradition. This system emphasizes planetary condition, sect, and
              the complex relationships between celestial bodies.
            </p>
          </div>
        </div>
      </div>

      {/* Classical Quote */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-400/20">
        <p className="text-purple-200 text-sm italic">
          "Τὰ ἄστρα κλίνει, οὐκ ἀναγκάζει" - The stars incline, they do not
          compel
        </p>
      </div>
    </div>
  );
};

export default HellenisticChart;
