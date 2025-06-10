import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Zap, Circle } from "lucide-react";

interface ElementalCycleProps {
  chartData: BirthChart;
}

const ElementalCycle: React.FC<ElementalCycleProps> = ({ chartData }) => {
  const elements = [
    {
      name: "Wood",
      chinese: "木",
      pinyin: "Mù",
      color: "text-green-400 bg-green-400/20",
      season: "Spring",
      direction: "East",
      organ: "Liver",
      emotion: "Anger",
      virtue: "Kindness",
      characteristics: [
        "Growth and expansion",
        "Creativity and flexibility",
        "Planning and vision",
        "Compassion and generosity",
      ],
      symbol: "🌳",
    },
    {
      name: "Fire",
      chinese: "火",
      pinyin: "Huǒ",
      color: "text-red-400 bg-red-400/20",
      season: "Summer",
      direction: "South",
      organ: "Heart",
      emotion: "Joy",
      virtue: "Propriety",
      characteristics: [
        "Energy and enthusiasm",
        "Leadership and charisma",
        "Communication and expression",
        "Passion and warmth",
      ],
      symbol: "🔥",
    },
    {
      name: "Earth",
      chinese: "土",
      pinyin: "Tǔ",
      color: "text-yellow-400 bg-yellow-400/20",
      season: "Late Summer",
      direction: "Center",
      organ: "Spleen",
      emotion: "Worry",
      virtue: "Trustworthiness",
      characteristics: [
        "Stability and grounding",
        "Nurturing and supportive",
        "Practical and reliable",
        "Harmonizing and balancing",
      ],
      symbol: "🏔️",
    },
    {
      name: "Metal",
      chinese: "金",
      pinyin: "Jīn",
      color: "text-gray-400 bg-gray-400/20",
      season: "Autumn",
      direction: "West",
      organ: "Lungs",
      emotion: "Grief",
      virtue: "Righteousness",
      characteristics: [
        "Structure and organization",
        "Precision and clarity",
        "Discipline and focus",
        "Justice and integrity",
      ],
      symbol: "⚔️",
    },
    {
      name: "Water",
      chinese: "水",
      pinyin: "Shuǐ",
      color: "text-blue-400 bg-blue-400/20",
      season: "Winter",
      direction: "North",
      organ: "Kidneys",
      emotion: "Fear",
      virtue: "Wisdom",
      characteristics: [
        "Adaptability and flow",
        "Intuition and depth",
        "Persistence and endurance",
        "Mystery and transformation",
      ],
      symbol: "🌊",
    },
  ];

  const getPersonalElement = () => {
    // In a real implementation, this would be calculated from the birth data
    // For demo purposes, we'll use a simple calculation based on birth year
    const birthYear = new Date(chartData.birth_date).getFullYear();
    const elementIndex = (birthYear % 10) % 5;
    return elements[elementIndex];
  };

  const getGenerativeCycle = () => {
    return [
      { from: "Wood", to: "Fire", relationship: "Wood feeds Fire" },
      { from: "Fire", to: "Earth", relationship: "Fire creates Earth (ash)" },
      { from: "Earth", to: "Metal", relationship: "Earth bears Metal" },
      { from: "Metal", to: "Water", relationship: "Metal collects Water" },
      { from: "Water", to: "Wood", relationship: "Water nourishes Wood" },
    ];
  };

  const getDestructiveCycle = () => {
    return [
      { from: "Wood", to: "Earth", relationship: "Wood depletes Earth" },
      { from: "Earth", to: "Water", relationship: "Earth absorbs Water" },
      { from: "Water", to: "Fire", relationship: "Water extinguishes Fire" },
      { from: "Fire", to: "Metal", relationship: "Fire melts Metal" },
      { from: "Metal", to: "Wood", relationship: "Metal cuts Wood" },
    ];
  };

  const personalElement = getPersonalElement();
  const generativeCycle = getGenerativeCycle();
  const destructiveCycle = getDestructiveCycle();

  const getSupportingElement = () => {
    const supportingRelation = generativeCycle.find(
      (cycle) => cycle.to === personalElement.name,
    );
    return elements.find((el) => el.name === supportingRelation?.from);
  };

  const getSupportedElement = () => {
    const supportedRelation = generativeCycle.find(
      (cycle) => cycle.from === personalElement.name,
    );
    return elements.find((el) => el.name === supportedRelation?.to);
  };

  const getConflictingElement = () => {
    const conflictingRelation = destructiveCycle.find(
      (cycle) => cycle.from === personalElement.name,
    );
    return elements.find((el) => el.name === conflictingRelation?.to);
  };

  const supportingElement = getSupportingElement();
  const supportedElement = getSupportedElement();
  const conflictingElement = getConflictingElement();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Zap className="w-6 h-6 mr-3 text-yellow-400" />
        五行循环 (Five Elements Cycle)
      </h2>

      {/* Personal Element */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          Your Personal Element
        </h3>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{personalElement.symbol}</div>
              <div>
                <h4 className="text-2xl font-bold text-white">
                  {personalElement.name}
                </h4>
                <p className="text-purple-300 text-lg">
                  {personalElement.chinese} ({personalElement.pinyin})
                </p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-full font-medium ${personalElement.color}`}
            >
              {personalElement.season}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 text-sm font-medium">Direction</p>
              <p className="text-white">{personalElement.direction}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 text-sm font-medium">Organ</p>
              <p className="text-white">{personalElement.organ}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 text-sm font-medium">Emotion</p>
              <p className="text-white">{personalElement.emotion}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 text-sm font-medium">Virtue</p>
              <p className="text-white">{personalElement.virtue}</p>
            </div>
          </div>

          <div>
            <h5 className="text-purple-300 font-medium mb-2">
              Key Characteristics:
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {personalElement.characteristics.map((char, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-purple-400">•</span>
                  <span className="text-purple-200 text-sm">{char}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Five Elements Overview */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          The Five Elements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {elements.map((element, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 border transition-all duration-300 ${
                element.name === personalElement.name
                  ? "border-yellow-400/50 bg-yellow-400/10 scale-105"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{element.symbol}</div>
                <h4 className="text-white font-semibold">{element.name}</h4>
                <p className="text-gray-300 text-sm mb-2">
                  {element.chinese} ({element.pinyin})
                </p>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${element.color}`}
                >
                  {element.season}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Elemental Relationships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Generative Cycle */}
        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-400/20">
          <h3 className="text-green-300 font-semibold mb-4 flex items-center">
            <Circle className="w-5 h-5 mr-2" />
            生克循环 (Generative Cycle)
          </h3>
          <div className="space-y-3">
            {generativeCycle.map((cycle, index) => {
              const isPersonalInvolved =
                cycle.from === personalElement.name ||
                cycle.to === personalElement.name;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    isPersonalInvolved
                      ? "border-green-400/30 bg-green-400/10"
                      : "border-green-400/20 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-green-300 font-medium">
                      {cycle.from} → {cycle.to}
                    </span>
                    {isPersonalInvolved && (
                      <span className="text-green-400 text-xs">You</span>
                    )}
                  </div>
                  <p className="text-green-200 text-sm">{cycle.relationship}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destructive Cycle */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-400/20">
          <h3 className="text-red-300 font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            相克循环 (Destructive Cycle)
          </h3>
          <div className="space-y-3">
            {destructiveCycle.map((cycle, index) => {
              const isPersonalInvolved =
                cycle.from === personalElement.name ||
                cycle.to === personalElement.name;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    isPersonalInvolved
                      ? "border-red-400/30 bg-red-400/10"
                      : "border-red-400/20 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-red-300 font-medium">
                      {cycle.from} ⚡ {cycle.to}
                    </span>
                    {isPersonalInvolved && (
                      <span className="text-red-400 text-xs">You</span>
                    )}
                  </div>
                  <p className="text-red-200 text-sm">{cycle.relationship}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Personal Element Relationships */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/20 mb-6">
        <h3 className="text-blue-300 font-semibold mb-4">
          Your Elemental Relationships
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {supportingElement && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2 flex items-center">
                <span className="text-2xl mr-2">
                  {supportingElement.symbol}
                </span>
                Supporting Element
              </h4>
              <p className="text-green-200 text-sm mb-2">
                <strong>{supportingElement.name}</strong> nourishes your{" "}
                <strong>{personalElement.name}</strong> energy
              </p>
              <p className="text-green-200 text-xs">
                Seek {supportingElement.name.toLowerCase()} energy for strength
                and growth
              </p>
            </div>
          )}

          {supportedElement && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2 flex items-center">
                <span className="text-2xl mr-2">{supportedElement.symbol}</span>
                Supported Element
              </h4>
              <p className="text-blue-200 text-sm mb-2">
                Your <strong>{personalElement.name}</strong> energy nourishes{" "}
                <strong>{supportedElement.name}</strong>
              </p>
              <p className="text-blue-200 text-xs">
                You naturally support {supportedElement.name.toLowerCase()}{" "}
                activities
              </p>
            </div>
          )}

          {conflictingElement && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-red-300 font-medium mb-2 flex items-center">
                <span className="text-2xl mr-2">
                  {conflictingElement.symbol}
                </span>
                Challenging Element
              </h4>
              <p className="text-red-200 text-sm mb-2">
                Your <strong>{personalElement.name}</strong> energy conflicts
                with <strong>{conflictingElement.name}</strong>
              </p>
              <p className="text-red-200 text-xs">
                Balance needed with {conflictingElement.name.toLowerCase()}{" "}
                influences
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Practical Applications */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/20">
        <h3 className="text-yellow-300 font-semibold mb-4">
          Practical Applications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-yellow-300 font-medium mb-2">
              Enhance Your Element:
            </h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>
                • Surround yourself with {personalElement.name.toLowerCase()}{" "}
                colors and materials
              </li>
              <li>
                • Face the {personalElement.direction.toLowerCase()} direction
                when making decisions
              </li>
              <li>• Embrace {personalElement.season.toLowerCase()} energy</li>
              <li>• Cultivate {personalElement.virtue.toLowerCase()}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-yellow-300 font-medium mb-2">
              Balance Recommendations:
            </h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>
                • Incorporate supporting element (
                {supportingElement?.name.toLowerCase()}) for strength
              </li>
              <li>
                • Be mindful of conflicting element (
                {conflictingElement?.name.toLowerCase()}) influences
              </li>
              <li>• Use the generative cycle for personal growth</li>
              <li>• Understand destructive patterns to avoid imbalance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chinese Wisdom */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-xl border border-red-400/20">
        <p className="text-red-200 text-sm italic">
          "五行相生相克，万物和谐共存" - The five elements generate and overcome
          each other, all things exist in harmony
        </p>
      </div>
    </div>
  );
};

export default ElementalCycle;
