import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Flame, Droplets, Wind, Mountain } from "lucide-react";

interface ElementalBalanceProps {
  chartData: BirthChart;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const ElementalBalance: React.FC<ElementalBalanceProps> = ({
  chartData,
  system,
}) => {
  const planets = chartData.chart_data?.planets || [];

  const getElementFromSign = (sign: string) => {
    const elements = {
      Aries: "Fire",
      Leo: "Fire",
      Sagittarius: "Fire",
      Taurus: "Earth",
      Virgo: "Earth",
      Capricorn: "Earth",
      Gemini: "Air",
      Libra: "Air",
      Aquarius: "Air",
      Cancer: "Water",
      Scorpio: "Water",
      Pisces: "Water",
    };
    return elements[sign] || "Unknown";
  };

  const getModalityFromSign = (sign: string) => {
    const modalities = {
      Aries: "Cardinal",
      Cancer: "Cardinal",
      Libra: "Cardinal",
      Capricorn: "Cardinal",
      Taurus: "Fixed",
      Leo: "Fixed",
      Scorpio: "Fixed",
      Aquarius: "Fixed",
      Gemini: "Mutable",
      Virgo: "Mutable",
      Sagittarius: "Mutable",
      Pisces: "Mutable",
    };
    return modalities[sign] || "Unknown";
  };

  const calculateElementalBalance = () => {
    const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const modalities = { Cardinal: 0, Fixed: 0, Mutable: 0 };

    planets.forEach((planet) => {
      if (planet.sign) {
        const element = getElementFromSign(planet.sign);
        const modality = getModalityFromSign(planet.sign);

        if (elements[element] !== undefined) elements[element]++;
        if (modalities[modality] !== undefined) modalities[modality]++;
      }
    });

    return { elements, modalities };
  };

  const { elements, modalities } = calculateElementalBalance();
  const totalPlanets = planets.length;

  const getElementIcon = (element: string) => {
    switch (element) {
      case "Fire":
        return <Flame className="w-5 h-5" />;
      case "Earth":
        return <Mountain className="w-5 h-5" />;
      case "Air":
        return <Wind className="w-5 h-5" />;
      case "Water":
        return <Droplets className="w-5 h-5" />;
      default:
        return <div className="w-5 h-5" />;
    }
  };

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

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case "Cardinal":
        return "text-yellow-400 bg-yellow-400/20";
      case "Fixed":
        return "text-purple-400 bg-purple-400/20";
      case "Mutable":
        return "text-pink-400 bg-pink-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getDominantElement = () => {
    return Object.entries(elements).reduce((a, b) =>
      elements[a[0]] > elements[b[0]] ? a : b,
    )[0];
  };

  const getDominantModality = () => {
    return Object.entries(modalities).reduce((a, b) =>
      modalities[a[0]] > modalities[b[0]] ? a : b,
    )[0];
  };

  const getElementDescription = (element: string) => {
    const descriptions = {
      Fire: "Passionate, energetic, and action-oriented. Fire signs are natural leaders who inspire others.",
      Earth:
        "Practical, grounded, and reliable. Earth signs build solid foundations and value stability.",
      Air: "Intellectual, communicative, and social. Air signs excel at ideas and connecting with others.",
      Water:
        "Emotional, intuitive, and empathetic. Water signs are deeply feeling and psychically sensitive.",
    };
    return descriptions[element] || "";
  };

  const getModalityDescription = (modality: string) => {
    const descriptions = {
      Cardinal:
        "Initiating, leadership-oriented, and pioneering. Cardinal signs start new cycles and projects.",
      Fixed:
        "Stable, determined, and persistent. Fixed signs maintain and perfect what has been started.",
      Mutable:
        "Adaptable, flexible, and changeable. Mutable signs adjust and prepare for new cycles.",
    };
    return descriptions[modality] || "";
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Flame className="w-6 h-6 mr-3 text-orange-400" />
        Elemental Balance
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Elements */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Elements Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(elements).map(([element, count]) => {
              const percentage =
                totalPlanets > 0 ? (count / totalPlanets) * 100 : 0;
              return (
                <div key={element} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${getElementColor(element)}`}
                      >
                        {getElementIcon(element)}
                      </div>
                      <div>
                        <span className="text-white font-medium">
                          {element}
                        </span>
                        <div className="text-sm text-gray-400">
                          {count} planets
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-300 font-mono">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${element === "Fire" ? "bg-red-500" : element === "Earth" ? "bg-green-500" : element === "Air" ? "bg-blue-500" : "bg-cyan-500"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modalities */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Modalities Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(modalities).map(([modality, count]) => {
              const percentage =
                totalPlanets > 0 ? (count / totalPlanets) * 100 : 0;
              return (
                <div key={modality} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${getModalityColor(modality)}`}
                      >
                        <span className="font-bold text-sm">
                          {modality.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-white font-medium">
                          {modality}
                        </span>
                        <div className="text-sm text-gray-400">
                          {count} planets
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-300 font-mono">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${modality === "Cardinal" ? "bg-yellow-500" : modality === "Fixed" ? "bg-purple-500" : "bg-pink-500"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dominant Traits */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-400/20">
          <h4 className="text-orange-300 font-semibold mb-3 flex items-center">
            {getElementIcon(getDominantElement())}
            <span className="ml-2">
              Dominant Element: {getDominantElement()}
            </span>
          </h4>
          <p className="text-orange-200 text-sm leading-relaxed">
            {getElementDescription(getDominantElement())}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20">
          <h4 className="text-purple-300 font-semibold mb-3">
            Dominant Modality: {getDominantModality()}
          </h4>
          <p className="text-purple-200 text-sm leading-relaxed">
            {getModalityDescription(getDominantModality())}
          </p>
        </div>
      </div>

      {/* Balance Analysis */}
      <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-400/20">
        <h4 className="text-blue-300 font-semibold mb-3">
          Elemental Balance Analysis
        </h4>
        <p className="text-blue-200 text-sm leading-relaxed">
          Your elemental balance reveals your natural approach to life. A strong{" "}
          {getDominantElement().toLowerCase()}
          emphasis suggests you naturally express{" "}
          {getDominantElement().toLowerCase()} qualities, while your
          {getDominantModality().toLowerCase()} modality shows how you prefer to
          engage with the world. Areas with fewer planets may represent growth
          opportunities or latent potentials.
        </p>
      </div>
    </div>
  );
};

export default ElementalBalance;
