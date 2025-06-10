import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Clock, Calendar, TrendingUp } from "lucide-react";

interface TimeAnalysisProps {
  chartData: BirthChart;
}

const TimeAnalysis: React.FC<TimeAnalysisProps> = ({ chartData }) => {
  const planets = chartData.chart_data?.planets || [];
  const birthDate = new Date(chartData.birth_date);
  const currentDate = new Date();

  // Calculate age
  const age = Math.floor(
    (currentDate.getTime() - birthDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25),
  );

  // Hellenistic time-lord systems
  const calculateDecennialLords = () => {
    const decennialSequence = [
      { planet: "Mars", years: 15, age: "0-15" },
      { planet: "Sun", years: 19, age: "15-34" },
      { planet: "Venus", years: 8, age: "34-42" },
      { planet: "Mercury", years: 20, age: "42-62" },
      { planet: "Moon", years: 25, age: "62-87" },
      { planet: "Saturn", years: 30, age: "87-117" },
    ];

    let currentAge = age;
    for (const period of decennialSequence) {
      const startAge = parseInt(period.age.split("-")[0]);
      const endAge = parseInt(period.age.split("-")[1]);
      if (currentAge >= startAge && currentAge < endAge) {
        return {
          current: period,
          yearsInPeriod: currentAge - startAge,
          yearsRemaining: endAge - currentAge,
        };
      }
    }
    return {
      current: decennialSequence[0],
      yearsInPeriod: 0,
      yearsRemaining: 0,
    };
  };

  const calculateAnnualProfections = () => {
    // Annual profections cycle through houses every year
    const profectionHouse = (age % 12) + 1;
    const houseRulers = {
      1: "Mars",
      2: "Venus",
      3: "Mercury",
      4: "Moon",
      5: "Sun",
      6: "Mercury",
      7: "Venus",
      8: "Mars",
      9: "Jupiter",
      10: "Saturn",
      11: "Saturn",
      12: "Jupiter",
    };

    return {
      house: profectionHouse,
      ruler: houseRulers[profectionHouse],
      theme: getHouseTheme(profectionHouse),
    };
  };

  const calculateZodiacalReleasing = () => {
    // Simplified zodiacal releasing from Lot of Fortune
    const fortunePosition = 120; // Simplified - would calculate actual Lot of Fortune
    const fortuneSign = Math.floor(fortunePosition / 30) + 1;

    const releasingSequence = [
      { sign: "Cancer", planet: "Moon", years: 25 },
      { sign: "Leo", planet: "Sun", years: 19 },
      { sign: "Virgo", planet: "Mercury", years: 20 },
      { sign: "Libra", planet: "Venus", years: 8 },
      { sign: "Scorpio", planet: "Mars", years: 15 },
      { sign: "Sagittarius", planet: "Jupiter", years: 12 },
      { sign: "Capricorn", planet: "Saturn", years: 27 },
      { sign: "Aquarius", planet: "Saturn", years: 27 },
      { sign: "Pisces", planet: "Jupiter", years: 12 },
      { sign: "Aries", planet: "Mars", years: 15 },
      { sign: "Taurus", planet: "Venus", years: 8 },
      { sign: "Gemini", planet: "Mercury", years: 20 },
    ];

    let totalYears = 0;
    let currentPeriod = null;

    for (let i = 0; i < releasingSequence.length; i++) {
      const period = releasingSequence[(fortuneSign - 1 + i) % 12];
      if (age >= totalYears && age < totalYears + period.years) {
        currentPeriod = {
          ...period,
          startAge: totalYears,
          endAge: totalYears + period.years,
          yearsInPeriod: age - totalYears,
          yearsRemaining: totalYears + period.years - age,
        };
        break;
      }
      totalYears += period.years;
    }

    return currentPeriod || releasingSequence[0];
  };

  const getHouseTheme = (house: number) => {
    const themes = {
      1: "Self, Identity, New Beginnings",
      2: "Resources, Values, Self-Worth",
      3: "Communication, Learning, Siblings",
      4: "Home, Family, Roots",
      5: "Creativity, Children, Romance",
      6: "Health, Work, Daily Routine",
      7: "Partnerships, Marriage, Others",
      8: "Transformation, Shared Resources",
      9: "Philosophy, Travel, Higher Learning",
      10: "Career, Reputation, Public Life",
      11: "Friends, Groups, Hopes & Dreams",
      12: "Spirituality, Subconscious, Endings",
    };
    return themes[house] || "Unknown";
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

  const getPlanetSymbol = (planetName: string) => {
    const symbols = {
      Sun: "☉",
      Moon: "☽",
      Mercury: "☿",
      Venus: "♀",
      Mars: "♂",
      Jupiter: "♃",
      Saturn: "♄",
    };
    return symbols[planetName] || "●";
  };

  const decennialLord = calculateDecennialLords();
  const annualProfection = calculateAnnualProfections();
  const zodiacalReleasing = calculateZodiacalReleasing();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Clock className="w-6 h-6 mr-3 text-purple-400" />
        Χρονοκρατορία (Time-Lord Analysis)
      </h2>

      {/* Current Age & Overview */}
      <div className="mb-8 text-center">
        <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl p-6 border border-purple-400/20">
          <h3 className="text-2xl font-bold text-white mb-2">
            Current Age: {age}
          </h3>
          <p className="text-purple-200">
            Born {birthDate.toLocaleDateString()} • Analyzing time-lord periods
            for your current life phase
          </p>
        </div>
      </div>

      {/* Time-Lord Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Decennial Lords */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-400/20">
          <h3 className="text-red-300 font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Decennial Lord
          </h3>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <span
                className={`text-3xl ${getPlanetColor(decennialLord.current.planet)} mr-2`}
              >
                {getPlanetSymbol(decennialLord.current.planet)}
              </span>
              <span className="text-white text-xl font-bold">
                {decennialLord.current.planet}
              </span>
            </div>
            <p className="text-red-200 text-sm">
              Ages {decennialLord.current.age}
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-red-300 text-xs font-medium">
                Years in Period:
              </p>
              <p className="text-white">{decennialLord.yearsInPeriod} years</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-red-300 text-xs font-medium">
                Years Remaining:
              </p>
              <p className="text-white">{decennialLord.yearsRemaining} years</p>
            </div>
          </div>
        </div>

        {/* Annual Profections */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-400/20">
          <h3 className="text-blue-300 font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Annual Profection
          </h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-white mb-2">
              House {annualProfection.house}
            </div>
            <div className="flex items-center justify-center mb-2">
              <span
                className={`text-2xl ${getPlanetColor(annualProfection.ruler)} mr-2`}
              >
                {getPlanetSymbol(annualProfection.ruler)}
              </span>
              <span className="text-blue-200">
                {annualProfection.ruler} Year
              </span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-blue-300 text-xs font-medium mb-1">Theme:</p>
            <p className="text-blue-200 text-sm leading-relaxed">
              {annualProfection.theme}
            </p>
          </div>
        </div>

        {/* Zodiacal Releasing */}
        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-400/20">
          <h3 className="text-green-300 font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Zodiacal Releasing
          </h3>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <span
                className={`text-3xl ${getPlanetColor(zodiacalReleasing.planet)} mr-2`}
              >
                {getPlanetSymbol(zodiacalReleasing.planet)}
              </span>
              <span className="text-white text-xl font-bold">
                {zodiacalReleasing.planet}
              </span>
            </div>
            <p className="text-green-200 text-sm">
              {zodiacalReleasing.sign} Period
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-green-300 text-xs font-medium">Period:</p>
              <p className="text-white text-sm">
                Ages {zodiacalReleasing.startAge}-{zodiacalReleasing.endAge}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-green-300 text-xs font-medium">Remaining:</p>
              <p className="text-white">
                {zodiacalReleasing.yearsRemaining} years
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time-Lord Interpretations */}
      <div className="space-y-6 mb-8">
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-purple-400/20">
          <h3 className="text-purple-300 font-semibold mb-4">
            Current {decennialLord.current.planet} Decennial Period
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-purple-300 font-medium mb-2">
                Period Themes:
              </h4>
              <div className="space-y-2">
                {decennialLord.current.planet === "Mars" && (
                  <p className="text-purple-200 text-sm">
                    Energy, action, and establishing independence. Time for
                    courage and initiative.
                  </p>
                )}
                {decennialLord.current.planet === "Sun" && (
                  <p className="text-purple-200 text-sm">
                    Leadership, recognition, and personal authority. Peak
                    creative and professional years.
                  </p>
                )}
                {decennialLord.current.planet === "Venus" && (
                  <p className="text-purple-200 text-sm">
                    Relationships, beauty, and harmony. Focus on partnerships
                    and artistic expression.
                  </p>
                )}
                {decennialLord.current.planet === "Mercury" && (
                  <p className="text-purple-200 text-sm">
                    Communication, learning, and intellectual pursuits. Time for
                    teaching and writing.
                  </p>
                )}
                {decennialLord.current.planet === "Moon" && (
                  <p className="text-purple-200 text-sm">
                    Reflection, intuition, and emotional wisdom. Focus on inner
                    life and nurturing.
                  </p>
                )}
                {decennialLord.current.planet === "Saturn" && (
                  <p className="text-purple-200 text-sm">
                    Wisdom, legacy, and spiritual mastery. Time for sharing
                    accumulated knowledge.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-purple-300 font-medium mb-2">
                Planetary Condition:
              </h4>
              <div className="bg-purple-500/10 rounded-lg p-3">
                <p className="text-purple-200 text-sm">
                  The condition of {decennialLord.current.planet} in your birth
                  chart influences how this period manifests. Check its sign,
                  house, and aspects for detailed insights.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-400/20">
          <h3 className="text-blue-300 font-semibold mb-4">
            House {annualProfection.house} Profection Year
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-blue-300 font-medium mb-2">
                This Year's Focus:
              </h4>
              <p className="text-blue-200 text-sm leading-relaxed">
                {annualProfection.theme}. The ruler {annualProfection.ruler}{" "}
                becomes especially important this year, so pay attention to its
                transits and condition.
              </p>
            </div>
            <div>
              <h4 className="text-blue-300 font-medium mb-2">
                Profection Guidance:
              </h4>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <p className="text-blue-200 text-sm">
                  Annual profections highlight different life areas each year.
                  This system helps time important decisions and understand
                  yearly themes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time-Lord Systems Explanation */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-400/20">
        <h3 className="text-indigo-300 font-semibold mb-4">
          Understanding Hellenistic Time-Lords
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-indigo-300 font-medium mb-2">
              Decennial Lords:
            </h4>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Long-term periods ruled by different planets, showing major life
              phases and developmental themes over decades.
            </p>
          </div>
          <div>
            <h4 className="text-indigo-300 font-medium mb-2">
              Annual Profections:
            </h4>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Each year of life is ruled by a different house, cycling through
              all 12 houses every 12 years, highlighting annual themes.
            </p>
          </div>
          <div>
            <h4 className="text-indigo-300 font-medium mb-2">
              Zodiacal Releasing:
            </h4>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Complex system based on Lot of Fortune, revealing periods of peak
              activity and significant life developments.
            </p>
          </div>
        </div>
      </div>

      {/* Classical Quote */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-400/20">
        <p className="text-purple-200 text-sm italic">
          "Πάντα ῥεῖ καὶ οὐδὲν μένει" - Everything flows and nothing remains
        </p>
      </div>
    </div>
  );
};

export default TimeAnalysis;
