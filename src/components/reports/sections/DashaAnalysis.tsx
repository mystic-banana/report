import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Clock, TrendingUp } from "lucide-react";

interface DashaAnalysisProps {
  chartData: BirthChart;
}

const DashaAnalysis: React.FC<DashaAnalysisProps> = ({ chartData }) => {
  // Sample Dasha data - in real implementation, this would be calculated
  const currentDate = new Date();
  const birthDate = new Date(chartData.birth_date);

  const mahadashas = [
    {
      planet: "Venus",
      startAge: 0,
      duration: 20,
      element: "Water",
      nature: "Benefic",
    },
    {
      planet: "Sun",
      startAge: 20,
      duration: 6,
      element: "Fire",
      nature: "Malefic",
    },
    {
      planet: "Moon",
      startAge: 26,
      duration: 10,
      element: "Water",
      nature: "Benefic",
    },
    {
      planet: "Mars",
      startAge: 36,
      duration: 7,
      element: "Fire",
      nature: "Malefic",
    },
    {
      planet: "Rahu",
      startAge: 43,
      duration: 18,
      element: "Air",
      nature: "Malefic",
    },
    {
      planet: "Jupiter",
      startAge: 61,
      duration: 16,
      element: "Ether",
      nature: "Benefic",
    },
    {
      planet: "Saturn",
      startAge: 77,
      duration: 19,
      element: "Air",
      nature: "Malefic",
    },
    {
      planet: "Mercury",
      startAge: 96,
      duration: 17,
      element: "Earth",
      nature: "Benefic",
    },
    {
      planet: "Ketu",
      startAge: 113,
      duration: 7,
      element: "Fire",
      nature: "Malefic",
    },
  ];

  const getCurrentAge = () => {
    const ageInMs = currentDate.getTime() - birthDate.getTime();
    return Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25));
  };

  const currentAge = getCurrentAge();

  const getCurrentMahadasha = () => {
    return (
      mahadashas.find(
        (dasha) =>
          currentAge >= dasha.startAge &&
          currentAge < dasha.startAge + dasha.duration,
      ) || mahadashas[0]
    );
  };

  const getNextMahadasha = () => {
    const currentDasha = getCurrentMahadasha();
    const currentIndex = mahadashas.indexOf(currentDasha);
    return mahadashas[currentIndex + 1] || mahadashas[0];
  };

  const currentDasha = getCurrentMahadasha();
  const nextDasha = getNextMahadasha();

  const getPlanetColor = (planet: string) => {
    const colors = {
      Sun: "text-yellow-400 bg-yellow-400/20",
      Moon: "text-blue-400 bg-blue-400/20",
      Mars: "text-red-400 bg-red-400/20",
      Mercury: "text-green-400 bg-green-400/20",
      Jupiter: "text-orange-400 bg-orange-400/20",
      Venus: "text-pink-400 bg-pink-400/20",
      Saturn: "text-purple-400 bg-purple-400/20",
      Rahu: "text-gray-400 bg-gray-400/20",
      Ketu: "text-cyan-400 bg-cyan-400/20",
    };
    return colors[planet] || "text-gray-400 bg-gray-400/20";
  };

  const getDashaDescription = (planet: string) => {
    const descriptions = {
      Sun: "Period of leadership, authority, and self-expression. Focus on career advancement and personal recognition.",
      Moon: "Time of emotional growth, intuition, and nurturing. Emphasis on home, family, and inner development.",
      Mars: "Period of action, courage, and competition. Energy for new ventures and overcoming obstacles.",
      Mercury:
        "Time of communication, learning, and intellectual pursuits. Favorable for education and business.",
      Jupiter:
        "Period of wisdom, spirituality, and expansion. Growth in knowledge, wealth, and spiritual understanding.",
      Venus:
        "Time of love, beauty, and creativity. Focus on relationships, arts, and material comforts.",
      Saturn:
        "Period of discipline, hard work, and karmic lessons. Time for building solid foundations.",
      Rahu: "Time of material ambition and worldly desires. Period of rapid changes and unconventional paths.",
      Ketu: "Period of spiritual awakening and detachment. Focus on inner growth and letting go of material attachments.",
    };
    return (
      descriptions[planet] ||
      "A significant period of personal growth and karmic experiences."
    );
  };

  const getSubDashas = (mainPlanet: string) => {
    // Simplified sub-dasha calculation
    const planets = [
      "Sun",
      "Moon",
      "Mars",
      "Mercury",
      "Jupiter",
      "Venus",
      "Saturn",
      "Rahu",
      "Ketu",
    ];
    const mainIndex = planets.indexOf(mainPlanet);
    const subDashas = [];

    for (let i = 0; i < 9; i++) {
      const planetIndex = (mainIndex + i) % planets.length;
      subDashas.push(planets[planetIndex]);
    }

    return subDashas;
  };

  const currentSubDashas = getSubDashas(currentDasha.planet);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Clock className="w-6 h-6 mr-3 text-orange-400" />
        दशा विश्लेषण (Dasha Analysis)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Mahadasha */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-400/20">
          <h3 className="text-xl font-semibold text-orange-300 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            वर्तमान महादशा (Current Mahadasha)
          </h3>

          <div className="text-center mb-6">
            <h4 className="text-3xl font-bold text-white mb-2">
              {currentDasha.planet}
            </h4>
            <p className="text-orange-200">
              Age {currentDasha.startAge} -{" "}
              {currentDasha.startAge + currentDasha.duration}
            </p>
            <p className="text-orange-300 text-sm">
              Duration: {currentDasha.duration} years
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-orange-300 text-sm font-medium">Element</p>
                <p className="text-white">{currentDasha.element}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-orange-300 text-sm font-medium">Nature</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentDasha.nature === "Benefic"
                      ? "text-green-400 bg-green-400/20"
                      : "text-red-400 bg-red-400/20"
                  }`}
                >
                  {currentDasha.nature}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-orange-300 text-sm font-medium mb-2">
                Period Influence
              </p>
              <p className="text-orange-200 text-sm leading-relaxed">
                {getDashaDescription(currentDasha.planet)}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between text-sm text-orange-300 mb-2">
                <span>Progress</span>
                <span>
                  {Math.max(0, currentAge - currentDasha.startAge)} /{" "}
                  {currentDasha.duration} years
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((currentAge - currentDasha.startAge) / currentDasha.duration) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Next Mahadasha */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/20">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">
            आगामी महादशा (Upcoming Mahadasha)
          </h3>

          <div className="text-center mb-6">
            <h4 className="text-3xl font-bold text-white mb-2">
              {nextDasha.planet}
            </h4>
            <p className="text-blue-200">
              Age {nextDasha.startAge} -{" "}
              {nextDasha.startAge + nextDasha.duration}
            </p>
            <p className="text-blue-300 text-sm">
              Duration: {nextDasha.duration} years
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-medium">Element</p>
                <p className="text-white">{nextDasha.element}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-medium">Nature</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    nextDasha.nature === "Benefic"
                      ? "text-green-400 bg-green-400/20"
                      : "text-red-400 bg-red-400/20"
                  }`}
                >
                  {nextDasha.nature}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-blue-300 text-sm font-medium mb-2">
                Future Influence
              </p>
              <p className="text-blue-200 text-sm leading-relaxed">
                {getDashaDescription(nextDasha.planet)}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-blue-300 text-sm font-medium mb-2">
                Time Remaining
              </p>
              <p className="text-blue-200 text-lg font-semibold">
                {Math.max(
                  0,
                  currentDasha.startAge + currentDasha.duration - currentAge,
                )}{" "}
                years
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Dasha Sequence */}
      <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">
          अंतर्दशा क्रम (Sub-Dasha Sequence) - {currentDasha.planet} Period
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {currentSubDashas.map((planet, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg text-center ${getPlanetColor(planet)}`}
            >
              <div className="font-medium text-xs">{planet}</div>
            </div>
          ))}
        </div>
        <p className="text-purple-200 text-sm mt-4">
          Each sub-period brings the combined influence of the main dasha planet
          and the sub-dasha planet.
        </p>
      </div>

      {/* Dasha Timeline */}
      <div className="mt-8 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-400/20">
        <h3 className="text-lg font-semibold text-green-300 mb-4">
          Life Dasha Timeline
        </h3>
        <div className="space-y-2">
          {mahadashas.slice(0, 6).map((dasha, index) => {
            const isCurrent = dasha === currentDasha;
            const isPast = currentAge > dasha.startAge + dasha.duration;

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isCurrent
                    ? "bg-green-500/20 border border-green-400/30"
                    : isPast
                      ? "bg-gray-500/10"
                      : "bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getPlanetColor(dasha.planet)}`}
                  >
                    {dasha.planet}
                  </span>
                  <span
                    className={`text-sm ${isCurrent ? "text-green-300 font-semibold" : "text-gray-300"}`}
                  >
                    Age {dasha.startAge} - {dasha.startAge + dasha.duration}
                  </span>
                </div>
                <span
                  className={`text-xs ${isCurrent ? "text-green-300" : "text-gray-400"}`}
                >
                  {dasha.duration} years
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vedic Wisdom */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-400/20">
        <p className="text-yellow-200 text-sm italic">
          "काल: कलयति सर्वाणि भूतानि" - Time transforms all beings according to
          their karma
        </p>
      </div>
    </div>
  );
};

export default DashaAnalysis;
