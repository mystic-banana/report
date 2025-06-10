import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Sparkles, Star } from "lucide-react";

interface YogaAnalysisProps {
  chartData: BirthChart;
}

const YogaAnalysis: React.FC<YogaAnalysisProps> = ({ chartData }) => {
  // Sample yoga data - in real implementation, this would be calculated from chart positions
  const detectedYogas = [
    {
      name: "Gaja Kesari Yoga",
      sanskrit: "गजकेसरी योग",
      type: "Benefic",
      strength: "Strong",
      description:
        "Jupiter and Moon in mutual kendras create this auspicious yoga, bringing wisdom, wealth, and respect.",
      effects: [
        "Enhanced wisdom and intelligence",
        "Financial prosperity",
        "Social recognition",
        "Strong moral character",
      ],
      planets: ["Jupiter", "Moon"],
    },
    {
      name: "Raj Yoga",
      sanskrit: "राज योग",
      type: "Benefic",
      strength: "Moderate",
      description:
        "Combination of trine and kendra lords creating royal combinations for success and authority.",
      effects: [
        "Leadership qualities",
        "Success in career",
        "Authority and power",
        "Recognition from government",
      ],
      planets: ["Sun", "Mars"],
    },
    {
      name: "Dhana Yoga",
      sanskrit: "धन योग",
      type: "Benefic",
      strength: "Strong",
      description:
        "Wealth-giving combinations involving 2nd, 5th, 9th, and 11th house lords.",
      effects: [
        "Multiple income sources",
        "Accumulation of wealth",
        "Financial stability",
        "Profitable investments",
      ],
      planets: ["Venus", "Mercury"],
    },
    {
      name: "Kala Sarpa Yoga",
      sanskrit: "काल सर्प योग",
      type: "Challenging",
      strength: "Moderate",
      description:
        "All planets hemmed between Rahu and Ketu, creating karmic challenges and spiritual growth.",
      effects: [
        "Karmic obstacles",
        "Delayed success",
        "Spiritual awakening",
        "Need for remedial measures",
      ],
      planets: ["Rahu", "Ketu"],
    },
  ];

  const getYogaTypeColor = (type: string) => {
    switch (type) {
      case "Benefic":
        return "text-green-400 bg-green-400/20";
      case "Challenging":
        return "text-red-400 bg-red-400/20";
      case "Neutral":
        return "text-yellow-400 bg-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Strong":
        return "text-green-400";
      case "Moderate":
        return "text-yellow-400";
      case "Weak":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getYogaIcon = (type: string) => {
    return type === "Benefic" ? "🌟" : type === "Challenging" ? "⚡" : "⚖️";
  };

  const beneficYogas = detectedYogas.filter((yoga) => yoga.type === "Benefic");
  const challengingYogas = detectedYogas.filter(
    (yoga) => yoga.type === "Challenging",
  );

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Sparkles className="w-6 h-6 mr-3 text-orange-400" />
        योग विश्लेषण (Yoga Analysis)
      </h2>

      {/* Yoga Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-400/20 text-center">
          <div className="text-3xl mb-2">🌟</div>
          <h3 className="text-green-300 font-semibold mb-1">Benefic Yogas</h3>
          <p className="text-2xl font-bold text-white">{beneficYogas.length}</p>
          <p className="text-green-200 text-sm">Auspicious combinations</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-400/20 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="text-red-300 font-semibold mb-1">Challenging Yogas</h3>
          <p className="text-2xl font-bold text-white">
            {challengingYogas.length}
          </p>
          <p className="text-red-200 text-sm">Karmic lessons</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20 text-center">
          <div className="text-3xl mb-2">🔮</div>
          <h3 className="text-purple-300 font-semibold mb-1">Total Yogas</h3>
          <p className="text-2xl font-bold text-white">
            {detectedYogas.length}
          </p>
          <p className="text-purple-200 text-sm">Planetary combinations</p>
        </div>
      </div>

      {/* Detailed Yoga Analysis */}
      <div className="space-y-6">
        {detectedYogas.map((yoga, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getYogaIcon(yoga.type)}</div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {yoga.name}
                  </h3>
                  <p className="text-orange-300 text-sm">{yoga.sanskrit}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getYogaTypeColor(yoga.type)}`}
                >
                  {yoga.type}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium bg-white/10 ${getStrengthColor(yoga.strength)}`}
                >
                  {yoga.strength}
                </span>
              </div>
            </div>

            <p className="text-gray-300 mb-4 leading-relaxed">
              {yoga.description}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  Key Effects
                </h4>
                <ul className="space-y-2">
                  {yoga.effects.map((effect, effectIndex) => (
                    <li
                      key={effectIndex}
                      className="flex items-start space-x-2"
                    >
                      <span className="text-yellow-400 text-sm mt-1">•</span>
                      <span className="text-gray-300 text-sm">{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">
                  Involved Planets
                </h4>
                <div className="flex flex-wrap gap-2">
                  {yoga.planets.map((planet, planetIndex) => (
                    <span
                      key={planetIndex}
                      className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm"
                    >
                      {planet}
                    </span>
                  ))}
                </div>

                {yoga.type === "Challenging" && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-400/20">
                    <p className="text-red-300 text-sm font-medium mb-1">
                      Remedial Guidance
                    </p>
                    <p className="text-red-200 text-xs">
                      Regular spiritual practices, charity, and mantras can help
                      mitigate challenging effects.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Yoga Interpretation Guide */}
      <div className="mt-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-400/20">
        <h3 className="text-lg font-semibold text-indigo-300 mb-4">
          Understanding Yogas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-indigo-300 font-medium mb-2">Benefic Yogas</h4>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Auspicious planetary combinations that bring positive results,
              success, and spiritual growth. These yogas indicate areas of
              natural talent and favorable life experiences.
            </p>
          </div>
          <div>
            <h4 className="text-indigo-300 font-medium mb-2">
              Challenging Yogas
            </h4>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Karmic combinations that present obstacles and lessons for
              spiritual evolution. These yogas indicate areas requiring
              conscious effort and spiritual practices.
            </p>
          </div>
        </div>
      </div>

      {/* Activation Periods */}
      <div className="mt-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/20">
        <h3 className="text-lg font-semibold text-yellow-300 mb-4">
          Yoga Activation
        </h3>
        <p className="text-yellow-200 text-sm leading-relaxed mb-4">
          Yogas become most prominent during the dasha periods of the planets
          involved. The strength and timing of results depend on planetary
          dignity, aspects, and current transits.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <h4 className="text-yellow-300 font-medium text-sm mb-1">
              Current Period
            </h4>
            <p className="text-yellow-200 text-xs">
              Active yogas in current dasha
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <h4 className="text-yellow-300 font-medium text-sm mb-1">
              Transit Influence
            </h4>
            <p className="text-yellow-200 text-xs">
              Current planetary transits affecting yogas
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <h4 className="text-yellow-300 font-medium text-sm mb-1">
              Future Activation
            </h4>
            <p className="text-yellow-200 text-xs">
              Upcoming periods of yoga prominence
            </p>
          </div>
        </div>
      </div>

      {/* Vedic Wisdom */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-400/20">
        <p className="text-orange-200 text-sm italic">
          "योगो भवति दुःखहा" - Yoga becomes the destroyer of suffering
        </p>
      </div>
    </div>
  );
};

export default YogaAnalysis;
