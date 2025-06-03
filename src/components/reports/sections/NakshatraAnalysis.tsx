import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Star, Moon } from "lucide-react";

interface NakshatraAnalysisProps {
  chartData: BirthChart;
}

const NakshatraAnalysis: React.FC<NakshatraAnalysisProps> = ({ chartData }) => {
  const planets = chartData.chart_data?.planets || [];

  const nakshatras = [
    {
      name: "Ashwini",
      deity: "Ashwini Kumaras",
      symbol: "Horse's Head",
      element: "Earth",
      guna: "Rajas",
    },
    {
      name: "Bharani",
      deity: "Yama",
      symbol: "Yoni",
      element: "Earth",
      guna: "Rajas",
    },
    {
      name: "Krittika",
      deity: "Agni",
      symbol: "Razor",
      element: "Fire",
      guna: "Rajas",
    },
    {
      name: "Rohini",
      deity: "Brahma",
      symbol: "Cart",
      element: "Earth",
      guna: "Rajas",
    },
    {
      name: "Mrigashira",
      deity: "Soma",
      symbol: "Deer's Head",
      element: "Earth",
      guna: "Tamas",
    },
    {
      name: "Ardra",
      deity: "Rudra",
      symbol: "Teardrop",
      element: "Water",
      guna: "Tamas",
    },
    {
      name: "Punarvasu",
      deity: "Aditi",
      symbol: "Bow",
      element: "Water",
      guna: "Sattva",
    },
    {
      name: "Pushya",
      deity: "Brihaspati",
      symbol: "Flower",
      element: "Water",
      guna: "Sattva",
    },
    {
      name: "Ashlesha",
      deity: "Nagas",
      symbol: "Serpent",
      element: "Water",
      guna: "Sattva",
    },
    {
      name: "Magha",
      deity: "Pitrs",
      symbol: "Throne",
      element: "Water",
      guna: "Tamas",
    },
    {
      name: "Purva Phalguni",
      deity: "Bhaga",
      symbol: "Hammock",
      element: "Water",
      guna: "Rajas",
    },
    {
      name: "Uttara Phalguni",
      deity: "Aryaman",
      symbol: "Bed",
      element: "Fire",
      guna: "Rajas",
    },
    {
      name: "Hasta",
      deity: "Savitar",
      symbol: "Hand",
      element: "Fire",
      guna: "Rajas",
    },
    {
      name: "Chitra",
      deity: "Vishvakarma",
      symbol: "Pearl",
      element: "Fire",
      guna: "Tamas",
    },
    {
      name: "Swati",
      deity: "Vayu",
      symbol: "Sword",
      element: "Fire",
      guna: "Tamas",
    },
    {
      name: "Vishakha",
      deity: "Indra-Agni",
      symbol: "Archway",
      element: "Fire",
      guna: "Sattva",
    },
    {
      name: "Anuradha",
      deity: "Mitra",
      symbol: "Lotus",
      element: "Fire",
      guna: "Sattva",
    },
    {
      name: "Jyeshtha",
      deity: "Indra",
      symbol: "Earring",
      element: "Air",
      guna: "Sattva",
    },
    {
      name: "Mula",
      deity: "Nirriti",
      symbol: "Root",
      element: "Air",
      guna: "Tamas",
    },
    {
      name: "Purva Ashadha",
      deity: "Apas",
      symbol: "Fan",
      element: "Air",
      guna: "Rajas",
    },
    {
      name: "Uttara Ashadha",
      deity: "Vishvedevas",
      symbol: "Elephant Tusk",
      element: "Air",
      guna: "Rajas",
    },
    {
      name: "Shravana",
      deity: "Vishnu",
      symbol: "Ear",
      element: "Air",
      guna: "Rajas",
    },
    {
      name: "Dhanishtha",
      deity: "Vasus",
      symbol: "Drum",
      element: "Air",
      guna: "Tamas",
    },
    {
      name: "Shatabhisha",
      deity: "Varuna",
      symbol: "Circle",
      element: "Air",
      guna: "Tamas",
    },
    {
      name: "Purva Bhadrapada",
      deity: "Aja Ekapada",
      symbol: "Sword",
      element: "Air",
      guna: "Sattva",
    },
    {
      name: "Uttara Bhadrapada",
      deity: "Ahir Budhnya",
      symbol: "Snake",
      element: "Air",
      guna: "Sattva",
    },
    {
      name: "Revati",
      deity: "Pushan",
      symbol: "Fish",
      element: "Air",
      guna: "Sattva",
    },
  ];

  const getMoonNakshatra = () => {
    const moon = planets.find((p) => p.name === "Moon");
    if (moon && moon.nakshatra) {
      return nakshatras.find((n) => n.name === moon.nakshatra) || nakshatras[0];
    }
    // Default to first nakshatra if not found
    return nakshatras[0];
  };

  const getAscendantNakshatra = () => {
    // For demo purposes, we'll use a calculated nakshatra
    // In real implementation, this would be calculated from the ascendant degree
    return nakshatras[Math.floor(Math.random() * nakshatras.length)];
  };

  const moonNakshatra = getMoonNakshatra();
  const ascendantNakshatra = getAscendantNakshatra();

  const getElementColor = (element: string) => {
    switch (element) {
      case "Fire":
        return "text-red-400 bg-red-400/20";
      case "Earth":
        return "text-green-400 bg-green-400/20";
      case "Air":
        return "text-blue-400 bg-blue-400/20";
      case "Water":
        return "text-cyan-400 bg-cyan-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getGunaColor = (guna: string) => {
    switch (guna) {
      case "Sattva":
        return "text-yellow-400 bg-yellow-400/20";
      case "Rajas":
        return "text-orange-400 bg-orange-400/20";
      case "Tamas":
        return "text-purple-400 bg-purple-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getNakshatraDescription = (nakshatra: any) => {
    const descriptions = {
      Ashwini:
        "Swift action, healing abilities, and pioneering spirit. Natural healers and innovators.",
      Bharani:
        "Transformation, creativity, and nurturing. Strong connection to life cycles and creativity.",
      Krittika:
        "Sharp intellect, purification, and leadership. Natural ability to cut through illusions.",
      Rohini:
        "Beauty, fertility, and material growth. Strong artistic and creative abilities.",
      Mrigashira:
        "Searching nature, curiosity, and gentleness. Natural seekers of knowledge and truth.",
    };
    return (
      descriptions[nakshatra.name] ||
      "A unique nakshatra with special spiritual significance and karmic lessons."
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Star className="w-6 h-6 mr-3 text-orange-400" />
        नक्षत्र विश्लेषण (Nakshatra Analysis)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moon Nakshatra */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-400/20">
          <h3 className="text-xl font-semibold text-blue-300 mb-4 flex items-center">
            <Moon className="w-5 h-5 mr-2" />
            चन्द्र नक्षत्र (Moon Nakshatra)
          </h3>

          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-white mb-2">
                {moonNakshatra.name}
              </h4>
              <p className="text-blue-200 text-sm">{moonNakshatra.symbol}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-medium">Deity</p>
                <p className="text-white">{moonNakshatra.deity}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-medium">Element</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getElementColor(moonNakshatra.element)}`}
                >
                  {moonNakshatra.element}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-blue-300 text-sm font-medium mb-2">
                Guna (Quality)
              </p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getGunaColor(moonNakshatra.guna)}`}
              >
                {moonNakshatra.guna}
              </span>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-blue-300 text-sm font-medium mb-2">
                Characteristics
              </p>
              <p className="text-blue-200 text-sm leading-relaxed">
                {getNakshatraDescription(moonNakshatra)}
              </p>
            </div>
          </div>
        </div>

        {/* Ascendant Nakshatra */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-400/20">
          <h3 className="text-xl font-semibold text-orange-300 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            लग्न नक्षत्र (Ascendant Nakshatra)
          </h3>

          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-white mb-2">
                {ascendantNakshatra.name}
              </h4>
              <p className="text-orange-200 text-sm">
                {ascendantNakshatra.symbol}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-orange-300 text-sm font-medium">Deity</p>
                <p className="text-white">{ascendantNakshatra.deity}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-orange-300 text-sm font-medium">Element</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getElementColor(ascendantNakshatra.element)}`}
                >
                  {ascendantNakshatra.element}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-orange-300 text-sm font-medium mb-2">
                Guna (Quality)
              </p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getGunaColor(ascendantNakshatra.guna)}`}
              >
                {ascendantNakshatra.guna}
              </span>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-orange-300 text-sm font-medium mb-2">
                Life Path Influence
              </p>
              <p className="text-orange-200 text-sm leading-relaxed">
                {getNakshatraDescription(ascendantNakshatra)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nakshatra Compatibility */}
      <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">
          नक्षत्र संगतता (Nakshatra Compatibility)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-purple-300 font-medium mb-2">
              Favorable Nakshatras
            </h4>
            <p className="text-purple-200 text-sm">
              Nakshatras that harmonize well with your Moon nakshatra for
              relationships and partnerships.
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-purple-300 font-medium mb-2">
              Career Alignment
            </h4>
            <p className="text-purple-200 text-sm">
              Your nakshatra influences career choices and professional success
              patterns.
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-purple-300 font-medium mb-2">Spiritual Path</h4>
            <p className="text-purple-200 text-sm">
              Each nakshatra offers unique spiritual lessons and growth
              opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Vedic Wisdom */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-400/20">
        <p className="text-yellow-200 text-sm italic">
          "नक्षत्राणि दिव्यानि ज्योतींषि" - The nakshatras are divine lights
          that guide our earthly journey
        </p>
      </div>
    </div>
  );
};

export default NakshatraAnalysis;
