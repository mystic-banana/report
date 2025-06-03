import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Gem, Star, Sun, Moon } from "lucide-react";

interface RemedialMeasuresProps {
  chartData: BirthChart;
}

const RemedialMeasures: React.FC<RemedialMeasuresProps> = ({ chartData }) => {
  const planets = chartData.chart_data?.planets || [];

  const getWeakPlanets = () => {
    // In a real implementation, this would analyze planetary strengths
    // For demo purposes, we'll return some sample weak planets
    return [
      { name: "Saturn", weakness: "Debilitated", remedy: "Blue Sapphire" },
      { name: "Mars", weakness: "Combust", remedy: "Red Coral" },
      { name: "Mercury", weakness: "Retrograde", remedy: "Emerald" },
    ];
  };

  const getGemstoneRecommendations = () => {
    return [
      {
        planet: "Sun",
        gemstone: "Ruby",
        sanskrit: "माणिक्य",
        benefits: ["Leadership", "Confidence", "Authority", "Health"],
        weight: "3-6 carats",
        metal: "Gold",
        finger: "Ring finger",
        day: "Sunday",
      },
      {
        planet: "Moon",
        gemstone: "Pearl",
        sanskrit: "मोती",
        benefits: ["Emotional balance", "Peace of mind", "Intuition"],
        weight: "4-7 carats",
        metal: "Silver",
        finger: "Little finger",
        day: "Monday",
      },
      {
        planet: "Jupiter",
        gemstone: "Yellow Sapphire",
        sanskrit: "पुखराज",
        benefits: ["Wisdom", "Prosperity", "Spiritual growth"],
        weight: "3-6 carats",
        metal: "Gold",
        finger: "Index finger",
        day: "Thursday",
      },
    ];
  };

  const getMantras = () => {
    return [
      {
        planet: "Sun",
        mantra: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
        transliteration: "Om Hraam Hreem Hraum Sah Suryaya Namah",
        count: "7,000 times",
        benefits: "Enhances leadership and vitality",
      },
      {
        planet: "Moon",
        mantra: "ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः",
        transliteration: "Om Shraam Shreem Shraum Sah Chandraya Namah",
        count: "11,000 times",
        benefits: "Brings emotional stability and peace",
      },
      {
        planet: "Mars",
        mantra: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः",
        transliteration: "Om Kraam Kreem Kraum Sah Bhaumaya Namah",
        count: "10,000 times",
        benefits: "Increases courage and removes obstacles",
      },
    ];
  };

  const getCharityRecommendations = () => {
    return [
      {
        planet: "Sun",
        items: ["Wheat", "Jaggery", "Red cloth", "Copper items"],
        recipients: "Poor people, temples",
        day: "Sunday",
        color: "Red/Orange",
      },
      {
        planet: "Moon",
        items: ["Rice", "Milk", "White cloth", "Silver items"],
        recipients: "Women, elderly people",
        day: "Monday",
        color: "White",
      },
      {
        planet: "Jupiter",
        items: ["Yellow cloth", "Turmeric", "Books", "Gold items"],
        recipients: "Brahmins, teachers, students",
        day: "Thursday",
        color: "Yellow",
      },
    ];
  };

  const getFastingRecommendations = () => {
    return [
      {
        planet: "Saturn",
        day: "Saturday",
        type: "Complete fast or eat once",
        foods: "Avoid oil, salt, and spices",
        duration: "19 Saturdays",
      },
      {
        planet: "Mars",
        day: "Tuesday",
        type: "Fast till sunset",
        foods: "Avoid red lentils and spicy food",
        duration: "21 Tuesdays",
      },
      {
        planet: "Rahu",
        day: "Saturday",
        type: "Partial fast",
        foods: "Avoid non-vegetarian food",
        duration: "18 Saturdays",
      },
    ];
  };

  const weakPlanets = getWeakPlanets();
  const gemstones = getGemstoneRecommendations();
  const mantras = getMantras();
  const charities = getCharityRecommendations();
  const fasting = getFastingRecommendations();

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

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Gem className="w-6 h-6 mr-3 text-orange-400" />
        उपाय एवं उपचार (Remedial Measures)
      </h2>

      {/* Weak Planets Analysis */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-orange-300 mb-4">
          ग्रह दुर्बलता विश्लेषण (Planetary Weakness Analysis)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weakPlanets.map((planet, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanetColor(planet.name)}`}
                >
                  {planet.name}
                </span>
                <span className="text-red-400 text-sm">{planet.weakness}</span>
              </div>
              <p className="text-gray-300 text-sm">
                Recommended: {planet.remedy}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Gemstone Recommendations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-orange-300 mb-4 flex items-center">
          <Gem className="w-5 h-5 mr-2" />
          रत्न सिफारिशें (Gemstone Recommendations)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gemstones.map((gem, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    {gem.gemstone}
                  </h4>
                  <p className="text-purple-300 text-sm">{gem.sanskrit}</p>
                  <p className="text-gray-400 text-xs">For {gem.planet}</p>
                </div>
                <div className="text-3xl">💎</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-purple-300 text-xs font-medium">Weight</p>
                  <p className="text-white text-sm">{gem.weight}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-purple-300 text-xs font-medium">Metal</p>
                  <p className="text-white text-sm">{gem.metal}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-purple-300 text-xs font-medium">Finger</p>
                  <p className="text-white text-sm">{gem.finger}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-purple-300 text-xs font-medium">Day</p>
                  <p className="text-white text-sm">{gem.day}</p>
                </div>
              </div>

              <div>
                <p className="text-purple-300 text-sm font-medium mb-2">
                  Benefits:
                </p>
                <div className="flex flex-wrap gap-1">
                  {gem.benefits.map((benefit, bIndex) => (
                    <span
                      key={bIndex}
                      className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-xs"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mantra Recommendations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-orange-300 mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          मंत्र साधना (Mantra Practices)
        </h3>
        <div className="space-y-4">
          {mantras.map((mantra, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanetColor(mantra.planet)}`}
                  >
                    {mantra.planet}
                  </span>
                  <span className="text-yellow-300 text-sm">
                    {mantra.count}
                  </span>
                </div>
                <div className="text-2xl">🕉️</div>
              </div>

              <div className="mb-4">
                <p className="text-yellow-300 font-medium mb-2">Sanskrit:</p>
                <p className="text-white text-lg font-mono bg-black/20 p-3 rounded-lg">
                  {mantra.mantra}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-yellow-300 font-medium mb-2">
                  Transliteration:
                </p>
                <p className="text-yellow-200 italic">
                  {mantra.transliteration}
                </p>
              </div>

              <div>
                <p className="text-yellow-300 font-medium mb-2">Benefits:</p>
                <p className="text-yellow-200 text-sm">{mantra.benefits}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charity Recommendations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-orange-300 mb-4">
          दान सिफारिशें (Charity Recommendations)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {charities.map((charity, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-4 border border-green-400/20"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${getPlanetColor(charity.planet)}`}
                >
                  {charity.planet}
                </span>
                <span className="text-green-300 text-sm">{charity.day}</span>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-green-300 text-xs font-medium">Items:</p>
                  <p className="text-green-200 text-sm">
                    {charity.items.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-green-300 text-xs font-medium">
                    Recipients:
                  </p>
                  <p className="text-green-200 text-sm">{charity.recipients}</p>
                </div>
                <div>
                  <p className="text-green-300 text-xs font-medium">Color:</p>
                  <p className="text-green-200 text-sm">{charity.color}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fasting Recommendations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-orange-300 mb-4">
          व्रत सिफारिशें (Fasting Recommendations)
        </h3>
        <div className="space-y-4">
          {fasting.map((fast, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-400/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanetColor(fast.planet)}`}
                  >
                    {fast.planet}
                  </span>
                  <span className="text-indigo-300">{fast.day}</span>
                </div>
                <span className="text-indigo-300 text-sm">{fast.duration}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-indigo-300 text-sm font-medium mb-1">
                    Type:
                  </p>
                  <p className="text-indigo-200 text-sm">{fast.type}</p>
                </div>
                <div>
                  <p className="text-indigo-300 text-sm font-medium mb-1">
                    Dietary Guidelines:
                  </p>
                  <p className="text-indigo-200 text-sm">{fast.foods}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Guidelines */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-400/20">
        <h3 className="text-orange-300 font-semibold mb-4">
          सामान्य दिशानिर्देश (General Guidelines)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-orange-300 font-medium mb-2">
              Before Starting Remedies:
            </h4>
            <ul className="text-orange-200 text-sm space-y-1">
              <li>• Consult a qualified astrologer</li>
              <li>• Ensure gemstone authenticity</li>
              <li>• Start on auspicious days</li>
              <li>• Maintain purity and devotion</li>
            </ul>
          </div>
          <div>
            <h4 className="text-orange-300 font-medium mb-2">
              Important Notes:
            </h4>
            <ul className="text-orange-200 text-sm space-y-1">
              <li>• Results may take 3-6 months</li>
              <li>• Combine multiple remedies for best results</li>
              <li>• Maintain regular practice</li>
              <li>• Have faith and positive attitude</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Vedic Wisdom */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-400/20">
        <p className="text-yellow-200 text-sm italic">
          "उपायो हि दुःखहरणे सर्वेषां" - Remedies are the means to remove all
          sufferings
        </p>
      </div>
    </div>
  );
};

export default RemedialMeasures;
