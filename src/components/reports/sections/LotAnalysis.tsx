import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Target, Star } from "lucide-react";

interface LotAnalysisProps {
  chartData: BirthChart;
}

const LotAnalysis: React.FC<LotAnalysisProps> = ({ chartData }) => {
  const planets = chartData.chart_data?.planets || [];
  const houses = chartData.chart_data?.houses || [];

  const getPlanetPosition = (planetName: string) => {
    const planet = planets.find((p) => p.name === planetName);
    return planet ? planet.degree || 0 : 0;
  };

  const getSignFromDegree = (degree: number) => {
    const signs = [
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
    const signIndex = Math.floor(degree / 30);
    return signs[signIndex] || "Aries";
  };

  const getHouseFromDegree = (degree: number) => {
    // Simplified house calculation - in real implementation, this would use house cusps
    return Math.floor(degree / 30) + 1;
  };

  const calculateLot = (
    formula: { day: string; night: string },
    isDayChart: boolean = true,
  ) => {
    const formulaToUse = isDayChart ? formula.day : formula.night;
    const parts = formulaToUse.split(" ");

    let result = 0;
    let operation = "+";

    for (const part of parts) {
      if (part === "+" || part === "-") {
        operation = part;
      } else if (part === "Ascendant") {
        const ascendantDegree = 0; // Simplified - would use actual ascendant
        result =
          operation === "+"
            ? result + ascendantDegree
            : result - ascendantDegree;
      } else {
        const planetDegree = getPlanetPosition(part);
        result =
          operation === "+" ? result + planetDegree : result - planetDegree;
      }
    }

    // Normalize to 0-360 degrees
    while (result < 0) result += 360;
    while (result >= 360) result -= 360;

    return result;
  };

  const lots = [
    {
      name: "Lot of Fortune",
      greek: "Κλῆρος Τύχης",
      formula: {
        day: "Ascendant + Moon - Sun",
        night: "Ascendant + Sun - Moon",
      },
      meaning: "Material fortune, body, and life circumstances",
      keywords: ["Wealth", "Health", "Material Success", "Life Force"],
    },
    {
      name: "Lot of Spirit",
      greek: "Κλῆρος Δαίμονος",
      formula: {
        day: "Ascendant + Sun - Moon",
        night: "Ascendant + Moon - Sun",
      },
      meaning: "Spiritual nature, character, and higher aspirations",
      keywords: ["Character", "Spirituality", "Higher Mind", "Reputation"],
    },
    {
      name: "Lot of Love",
      greek: "Κλῆρος Ἔρωτος",
      formula: {
        day: "Ascendant + Venus - Sun",
        night: "Ascendant + Venus - Sun",
      },
      meaning: "Romantic relationships and emotional connections",
      keywords: ["Romance", "Relationships", "Attraction", "Partnerships"],
    },
    {
      name: "Lot of Necessity",
      greek: "Κλῆρος Ἀνάγκης",
      formula: {
        day: "Ascendant + Fortune - Mercury",
        night: "Ascendant + Fortune - Mercury",
      },
      meaning: "Constraints, limitations, and karmic obligations",
      keywords: ["Karma", "Limitations", "Obligations", "Destiny"],
    },
    {
      name: "Lot of Courage",
      greek: "Κλῆρος Ἀνδρείας",
      formula: {
        day: "Ascendant + Fortune - Mars",
        night: "Ascendant + Fortune - Mars",
      },
      meaning: "Bravery, action, and assertiveness",
      keywords: ["Courage", "Action", "Strength", "Initiative"],
    },
    {
      name: "Lot of Victory",
      greek: "Κλῆρος Νίκης",
      formula: {
        day: "Ascendant + Jupiter - Spirit",
        night: "Ascendant + Jupiter - Spirit",
      },
      meaning: "Success, achievement, and triumph over obstacles",
      keywords: ["Success", "Victory", "Achievement", "Recognition"],
    },
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

  const isDayChart = () => {
    // Simplified day/night calculation
    const sun = planets.find((p) => p.name === "Sun");
    return sun ? (sun.house || 1) <= 6 : true;
  };

  const dayChart = isDayChart();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Target className="w-6 h-6 mr-3 text-purple-400" />
        Κλῆροι (Lots Analysis)
      </h2>

      {/* Chart Type */}
      <div className="mb-8 text-center">
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full ${
            dayChart
              ? "bg-yellow-500/20 text-yellow-300"
              : "bg-blue-500/20 text-blue-300"
          }`}
        >
          <span className="text-2xl mr-2">{dayChart ? "☀️" : "🌙"}</span>
          <span className="font-semibold">
            {dayChart
              ? "Diurnal Chart (Day Birth)"
              : "Nocturnal Chart (Night Birth)"}
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Lot calculations adjust based on whether you were born during day or
          night
        </p>
      </div>

      {/* Lots Table */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          Classical Lots (Arabic Parts)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-semibold">
                  Lot
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  Position
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  House
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  Formula
                </th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot, index) => {
                const position = calculateLot(lot.formula, dayChart);
                const sign = getSignFromDegree(position);
                const house = getHouseFromDegree(position);
                const degree = Math.floor(position % 30);
                const minute = Math.floor((position % 1) * 60);
                const formula = dayChart ? lot.formula.day : lot.formula.night;

                return (
                  <tr
                    key={index}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-white font-medium">{lot.name}</div>
                        <div className="text-purple-300 text-sm italic">
                          {lot.greek}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg text-purple-300">
                          {getSignSymbol(sign)}
                        </span>
                        <span className="text-white">{sign}</span>
                        <span className="text-gray-400 text-sm font-mono">
                          {degree}°{minute.toString().padStart(2, "0")}'
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm">
                        House {house}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-300 text-sm font-mono">
                        {formula}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lot Interpretations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {lots.slice(0, 4).map((lot, index) => {
          const position = calculateLot(lot.formula, dayChart);
          const sign = getSignFromDegree(position);
          const house = getHouseFromDegree(position);

          return (
            <div
              key={index}
              className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-purple-400/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-purple-300 font-semibold">{lot.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-purple-300">
                    {getSignSymbol(sign)}
                  </span>
                  <span className="text-white text-sm">{sign}</span>
                </div>
              </div>

              <p className="text-purple-200 text-sm mb-3 leading-relaxed">
                {lot.meaning}
              </p>

              <div className="mb-3">
                <p className="text-purple-300 text-xs font-medium mb-1">
                  Key Themes:
                </p>
                <div className="flex flex-wrap gap-1">
                  {lot.keywords.map((keyword, kIndex) => (
                    <span
                      key={kIndex}
                      className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-purple-300">
                Located in House {house} - influences through {sign} energy
              </div>
            </div>
          );
        })}
      </div>

      {/* Fortune and Spirit Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/20">
          <h3 className="text-yellow-300 font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Lot of Fortune Analysis
          </h3>
          <div className="space-y-3">
            <p className="text-yellow-200 text-sm leading-relaxed">
              The Lot of Fortune represents your material circumstances,
              physical health, and the resources available to you in this
              lifetime. It shows how the luminaries (Sun and Moon) work together
              through your rising sign.
            </p>
            <div className="bg-yellow-500/10 rounded-lg p-3">
              <p className="text-yellow-300 text-xs font-medium mb-1">
                Traditional Meaning:
              </p>
              <p className="text-yellow-200 text-xs">
                "The place where the Moon would be if the Sun were on the
                Ascendant"
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-400/20">
          <h3 className="text-blue-300 font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Lot of Spirit Analysis
          </h3>
          <div className="space-y-3">
            <p className="text-blue-200 text-sm leading-relaxed">
              The Lot of Spirit represents your character, reputation, and
              spiritual nature. It indicates your higher aspirations and how you
              express your essential self in the world through conscious action.
            </p>
            <div className="bg-blue-500/10 rounded-lg p-3">
              <p className="text-blue-300 text-xs font-medium mb-1">
                Traditional Meaning:
              </p>
              <p className="text-blue-200 text-xs">
                "The place where the Sun would be if the Moon were on the
                Ascendant"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lot Methodology */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-400/20">
        <h3 className="text-indigo-300 font-semibold mb-4">
          Understanding Hellenistic Lots
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-indigo-300 font-medium mb-2">
              Calculation Method:
            </h4>
            <p className="text-indigo-200 text-sm leading-relaxed mb-3">
              Lots are calculated using specific formulas that combine planetary
              positions. The most important distinction is between day and night
              births, which reverses certain calculations to maintain the proper
              relationship between the luminaries.
            </p>
            <div className="bg-indigo-500/10 rounded-lg p-3">
              <p className="text-indigo-300 text-xs font-medium mb-1">
                Day vs Night:
              </p>
              <p className="text-indigo-200 text-xs">
                Day births use Sun as the active principle, night births use
                Moon as active
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-indigo-300 font-medium mb-2">
              Interpretation:
            </h4>
            <p className="text-indigo-200 text-sm leading-relaxed mb-3">
              Each lot represents a specific life theme. The sign and house
              placement of the lot shows how that theme manifests in your life.
              The ruler of the lot's sign becomes the "Lord of the Lot" and is
              especially significant.
            </p>
            <div className="bg-indigo-500/10 rounded-lg p-3">
              <p className="text-indigo-300 text-xs font-medium mb-1">
                Key Factors:
              </p>
              <p className="text-indigo-200 text-xs">
                Sign, house, ruler condition, and aspects to the lot position
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Classical Quote */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-400/20">
        <p className="text-purple-200 text-sm italic">
          "Οἱ κλῆροι δηλοῦσι τὰς τύχας" - The lots reveal the fortunes of life
        </p>
      </div>
    </div>
  );
};

export default LotAnalysis;
