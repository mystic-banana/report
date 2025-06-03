import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Compass, Home, Star, Gem } from "lucide-react";

interface FengShuiGuidanceProps {
  chartData: BirthChart;
}

const FengShuiGuidance: React.FC<FengShuiGuidanceProps> = ({ chartData }) => {
  const birthYear = new Date(chartData.birth_date).getFullYear();

  // Calculate Kua number based on birth year and gender
  // For demo purposes, we'll assume male. In real implementation, gender would be provided
  const calculateKuaNumber = (year: number, isMale: boolean = true) => {
    const lastTwoDigits = year % 100;
    const sum = Math.floor(lastTwoDigits / 10) + (lastTwoDigits % 10);
    const singleDigit = sum > 9 ? Math.floor(sum / 10) + (sum % 10) : sum;

    if (isMale) {
      const kua = 11 - singleDigit;
      return kua === 5 ? 2 : kua > 9 ? kua - 9 : kua;
    } else {
      const kua = 4 + singleDigit;
      return kua === 5 ? 8 : kua > 9 ? kua - 9 : kua;
    }
  };

  const kuaNumber = calculateKuaNumber(birthYear);

  const kuaDirections = {
    1: {
      element: "Water",
      group: "East",
      favorable: ["North", "South", "East", "Southeast"],
      unfavorable: ["West", "Northwest", "Southwest", "Northeast"],
      bestDirection: "North",
      colors: ["Blue", "Black", "White"],
      personality: "Calm, intuitive, and adaptable",
    },
    2: {
      element: "Earth",
      group: "West",
      favorable: ["Southwest", "Northwest", "West", "Northeast"],
      unfavorable: ["North", "South", "East", "Southeast"],
      bestDirection: "Southwest",
      colors: ["Yellow", "Brown", "Beige"],
      personality: "Practical, nurturing, and stable",
    },
    3: {
      element: "Wood",
      group: "East",
      favorable: ["East", "Southeast", "North", "South"],
      unfavorable: ["West", "Northwest", "Southwest", "Northeast"],
      bestDirection: "East",
      colors: ["Green", "Brown", "Blue"],
      personality: "Dynamic, ambitious, and growth-oriented",
    },
    4: {
      element: "Wood",
      group: "East",
      favorable: ["Southeast", "East", "South", "North"],
      unfavorable: ["West", "Northwest", "Southwest", "Northeast"],
      bestDirection: "Southeast",
      colors: ["Green", "Brown", "Blue"],
      personality: "Creative, flexible, and communicative",
    },
    6: {
      element: "Metal",
      group: "West",
      favorable: ["Northwest", "Southwest", "Northeast", "West"],
      unfavorable: ["North", "South", "East", "Southeast"],
      bestDirection: "Northwest",
      colors: ["White", "Gold", "Silver"],
      personality: "Organized, disciplined, and authoritative",
    },
    7: {
      element: "Metal",
      group: "West",
      favorable: ["West", "Northeast", "Southwest", "Northwest"],
      unfavorable: ["North", "South", "East", "Southeast"],
      bestDirection: "West",
      colors: ["White", "Gold", "Silver"],
      personality: "Charming, sociable, and artistic",
    },
    8: {
      element: "Earth",
      group: "West",
      favorable: ["Northeast", "West", "Northwest", "Southwest"],
      unfavorable: ["North", "South", "East", "Southeast"],
      bestDirection: "Northeast",
      colors: ["Yellow", "Brown", "Beige"],
      personality: "Ambitious, determined, and success-oriented",
    },
    9: {
      element: "Fire",
      group: "East",
      favorable: ["South", "North", "Southeast", "East"],
      unfavorable: ["West", "Northwest", "Southwest", "Northeast"],
      bestDirection: "South",
      colors: ["Red", "Orange", "Pink"],
      personality: "Passionate, intelligent, and charismatic",
    },
  };

  const currentKua = kuaDirections[kuaNumber] || kuaDirections[1];

  const roomGuidance = {
    bedroom: {
      direction: currentKua.bestDirection,
      tips: [
        `Face ${currentKua.bestDirection.toLowerCase()} when sleeping`,
        "Use colors that support your element",
        "Keep the room clutter-free",
        "Position bed away from the door",
      ],
    },
    office: {
      direction: currentKua.favorable[1],
      tips: [
        `Face ${currentKua.favorable[1].toLowerCase()} when working`,
        "Place desk in command position",
        "Use your favorable colors in decor",
        "Add plants for growth energy",
      ],
    },
    kitchen: {
      direction: currentKua.favorable[2],
      tips: [
        "Keep stove clean and in good condition",
        "Avoid placing stove opposite the sink",
        "Use warm, nourishing colors",
        "Ensure good ventilation",
      ],
    },
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case "Wood":
        return "text-green-400 bg-green-400/20";
      case "Fire":
        return "text-red-400 bg-red-400/20";
      case "Earth":
        return "text-yellow-400 bg-yellow-400/20";
      case "Metal":
        return "text-gray-400 bg-gray-400/20";
      case "Water":
        return "text-blue-400 bg-blue-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getDirectionIcon = (direction: string) => {
    const icons = {
      North: "⬆️",
      South: "⬇️",
      East: "➡️",
      West: "⬅️",
      Northeast: "↗️",
      Northwest: "↖️",
      Southeast: "↘️",
      Southwest: "↙️",
    };
    return icons[direction] || "🧭";
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Compass className="w-6 h-6 mr-3 text-red-400" />
        风水指导 (Feng Shui Guidance)
      </h2>

      {/* Kua Number Analysis */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-red-500/10 to-yellow-500/10 rounded-xl p-6 border border-red-400/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Your Kua Number: {kuaNumber}
              </h3>
              <p className="text-red-300 mb-2">{currentKua.personality}</p>
              <div className="flex items-center space-x-4">
                <div
                  className={`px-3 py-1 rounded-full font-medium ${getElementColor(currentKua.element)}`}
                >
                  {currentKua.element} Element
                </div>
                <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full font-medium">
                  {currentKua.group} Group
                </div>
              </div>
            </div>
            <div className="text-6xl">🧭</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-red-300 font-semibold mb-3">
                Favorable Colors
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentKua.colors.map((color, index) => (
                  <span
                    key={index}
                    className="bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-sm"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-red-300 font-semibold mb-3">
                Best Direction
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {getDirectionIcon(currentKua.bestDirection)}
                </span>
                <span className="text-white font-medium">
                  {currentKua.bestDirection}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Directional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Favorable Directions */}
        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-400/20">
          <h3 className="text-green-300 font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Favorable Directions
          </h3>
          <div className="space-y-3">
            {currentKua.favorable.map((direction, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/5 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getDirectionIcon(direction)}
                  </span>
                  <span className="text-green-200 font-medium">
                    {direction}
                  </span>
                </div>
                <span className="text-green-400 text-sm">
                  {index === 0 ? "Best" : "Good"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-green-200 text-sm mt-4">
            Use these directions for sleeping, working, and important
            activities.
          </p>
        </div>

        {/* Unfavorable Directions */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-400/20">
          <h3 className="text-red-300 font-semibold mb-4 flex items-center">
            <Compass className="w-5 h-5 mr-2" />
            Challenging Directions
          </h3>
          <div className="space-y-3">
            {currentKua.unfavorable.map((direction, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/5 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getDirectionIcon(direction)}
                  </span>
                  <span className="text-red-200 font-medium">{direction}</span>
                </div>
                <span className="text-red-400 text-sm">Avoid</span>
              </div>
            ))}
          </div>
          <p className="text-red-200 text-sm mt-4">
            Minimize exposure to these directions for important activities.
          </p>
        </div>
      </div>

      {/* Room-by-Room Guidance */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Home className="w-5 h-5 mr-2 text-blue-400" />
          Room-by-Room Feng Shui
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(roomGuidance).map(([room, guidance]) => (
            <div
              key={room}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/20"
            >
              <h4 className="text-blue-300 font-semibold mb-4 capitalize flex items-center">
                {room === "bedroom" && "🛏️"}
                {room === "office" && "💼"}
                {room === "kitchen" && "🍳"}
                <span className="ml-2">{room}</span>
              </h4>
              <div className="mb-4">
                <p className="text-blue-300 text-sm font-medium mb-2">
                  Optimal Direction: {getDirectionIcon(guidance.direction)}{" "}
                  {guidance.direction}
                </p>
              </div>
              <div className="space-y-2">
                {guidance.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-blue-400 text-sm mt-1">•</span>
                    <span className="text-blue-200 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feng Shui Elements Enhancement */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Gem className="w-5 h-5 mr-2 text-purple-400" />
          Element Enhancement Tips
        </h3>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-purple-300 font-semibold mb-3">
                Enhance Your {currentKua.element} Element:
              </h4>
              <div className="space-y-2">
                {currentKua.element === "Water" && (
                  <>
                    <p className="text-purple-200 text-sm">
                      • Add water features like fountains or aquariums
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Use flowing, curved shapes in decor
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Incorporate mirrors to reflect energy
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Choose dark blue and black colors
                    </p>
                  </>
                )}
                {currentKua.element === "Wood" && (
                  <>
                    <p className="text-purple-200 text-sm">
                      • Add plants and fresh flowers
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Use wooden furniture and bamboo
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Choose green and brown colors
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Display vertical, columnar shapes
                    </p>
                  </>
                )}
                {currentKua.element === "Fire" && (
                  <>
                    <p className="text-purple-200 text-sm">
                      • Use candles and bright lighting
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Add triangular and pointed shapes
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Choose red, orange, and pink colors
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Display certificates and awards
                    </p>
                  </>
                )}
                {currentKua.element === "Earth" && (
                  <>
                    <p className="text-purple-200 text-sm">
                      • Use ceramic and clay objects
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Add square and rectangular shapes
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Choose yellow, brown, and beige colors
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Display crystals and stones
                    </p>
                  </>
                )}
                {currentKua.element === "Metal" && (
                  <>
                    <p className="text-purple-200 text-sm">
                      • Use metal objects and wind chimes
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Add circular and oval shapes
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Choose white, gold, and silver colors
                    </p>
                    <p className="text-purple-200 text-sm">
                      • Keep spaces organized and minimal
                    </p>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-purple-300 font-semibold mb-3">
                General Feng Shui Tips:
              </h4>
              <div className="space-y-2">
                <p className="text-purple-200 text-sm">
                  • Keep your space clean and clutter-free
                </p>
                <p className="text-purple-200 text-sm">
                  • Ensure good air circulation and natural light
                </p>
                <p className="text-purple-200 text-sm">
                  • Position furniture in command positions
                </p>
                <p className="text-purple-200 text-sm">
                  • Use your favorable colors in key areas
                </p>
                <p className="text-purple-200 text-sm">
                  • Face your best direction during important activities
                </p>
                <p className="text-purple-200 text-sm">
                  • Balance all five elements in your space
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wealth and Career Corner */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          Wealth & Career Enhancement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-400/20">
            <h4 className="text-green-300 font-semibold mb-3 flex items-center">
              💰 Wealth Corner
            </h4>
            <p className="text-green-200 text-sm mb-3">
              Southeast corner of your home or office
            </p>
            <div className="space-y-2">
              <p className="text-green-200 text-sm">
                • Place a healthy plant or money tree
              </p>
              <p className="text-green-200 text-sm">
                • Use purple or green colors
              </p>
              <p className="text-green-200 text-sm">
                • Add a small water feature
              </p>
              <p className="text-green-200 text-sm">
                • Keep this area clean and well-lit
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-400/20">
            <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
              🎯 Career Corner
            </h4>
            <p className="text-blue-200 text-sm mb-3">
              North area of your home or office
            </p>
            <div className="space-y-2">
              <p className="text-blue-200 text-sm">
                • Display career achievements and goals
              </p>
              <p className="text-blue-200 text-sm">
                • Use black or dark blue colors
              </p>
              <p className="text-blue-200 text-sm">
                • Add metal elements like wind chimes
              </p>
              <p className="text-blue-200 text-sm">
                • Ensure good lighting and organization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Annual Flying Stars */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/20 mb-6">
        <h3 className="text-yellow-300 font-semibold mb-4">
          Annual Energy Considerations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-yellow-300 font-medium mb-2">
              This Year's Focus:
            </h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• Pay attention to your favorable directions</li>
              <li>• Enhance your personal element in living spaces</li>
              <li>• Avoid major renovations in unfavorable sectors</li>
              <li>• Use annual cures for challenging areas</li>
            </ul>
          </div>
          <div>
            <h4 className="text-yellow-300 font-medium mb-2">
              Monthly Adjustments:
            </h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• Rotate seasonal decorations mindfully</li>
              <li>• Adjust lighting based on energy needs</li>
              <li>• Clear clutter regularly for fresh energy</li>
              <li>• Monitor and maintain feng shui enhancements</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chinese Wisdom */}
      <div className="text-center p-4 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-xl border border-red-400/20">
        <p className="text-red-200 text-sm italic">
          "风水轮流转，运势自然来" - When feng shui flows properly, good fortune
          naturally follows
        </p>
      </div>
    </div>
  );
};

export default FengShuiGuidance;
