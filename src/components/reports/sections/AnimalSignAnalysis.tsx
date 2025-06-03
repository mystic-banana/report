import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Star, Heart, Briefcase, Users } from "lucide-react";

interface AnimalSignAnalysisProps {
  chartData: BirthChart;
}

const AnimalSignAnalysis: React.FC<AnimalSignAnalysisProps> = ({
  chartData,
}) => {
  const birthYear = new Date(chartData.birth_date).getFullYear();

  const animalSigns = [
    {
      name: "Rat",
      chinese: "鼠",
      years: [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020],
      element: "Water",
      traits: [
        "Intelligent",
        "Adaptable",
        "Charming",
        "Ambitious",
        "Quick-witted",
      ],
      strengths: [
        "Excellent problem-solving skills",
        "Strong survival instincts",
        "Natural leadership abilities",
        "Good with money and resources",
      ],
      weaknesses: [
        "Can be overly critical",
        "Sometimes selfish",
        "Prone to anxiety",
        "May be too cautious",
      ],
      compatibility: ["Dragon", "Monkey", "Ox"],
      incompatibility: ["Horse", "Rooster"],
      luckyNumbers: [2, 3],
      luckyColors: ["Blue", "Gold", "Green"],
      career: ["Business", "Finance", "Research", "Writing", "Politics"],
      symbol: "🐭",
    },
    {
      name: "Ox",
      chinese: "牛",
      years: [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021],
      element: "Earth",
      traits: ["Reliable", "Patient", "Hardworking", "Honest", "Methodical"],
      strengths: [
        "Strong work ethic",
        "Dependable and trustworthy",
        "Excellent at planning",
        "Natural perseverance",
      ],
      weaknesses: [
        "Can be stubborn",
        "Slow to adapt to change",
        "Sometimes inflexible",
        "May be overly conservative",
      ],
      compatibility: ["Rat", "Snake", "Rooster"],
      incompatibility: ["Tiger", "Dragon", "Horse", "Goat"],
      luckyNumbers: [1, 9],
      luckyColors: ["Red", "Blue", "Purple"],
      career: [
        "Agriculture",
        "Engineering",
        "Architecture",
        "Banking",
        "Real Estate",
      ],
      symbol: "🐂",
    },
    {
      name: "Tiger",
      chinese: "虎",
      years: [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022],
      element: "Wood",
      traits: [
        "Brave",
        "Competitive",
        "Unpredictable",
        "Independent",
        "Charismatic",
      ],
      strengths: [
        "Natural leadership",
        "Courageous and bold",
        "Highly energetic",
        "Protective of others",
      ],
      weaknesses: [
        "Can be impulsive",
        "Sometimes aggressive",
        "Prone to mood swings",
        "May be overly confident",
      ],
      compatibility: ["Horse", "Dog"],
      incompatibility: ["Ox", "Snake", "Monkey"],
      luckyNumbers: [1, 3, 4],
      luckyColors: ["Orange", "Gray", "White"],
      career: [
        "Military",
        "Sports",
        "Adventure Tourism",
        "Emergency Services",
        "Entertainment",
      ],
      symbol: "🐅",
    },
    // Add more animals as needed...
  ];

  const getCurrentAnimal = () => {
    return (
      animalSigns.find((animal) => animal.years.includes(birthYear)) ||
      animalSigns[0]
    );
  };

  const getCompatibleAnimals = (animal: any) => {
    return animalSigns.filter((sign) =>
      animal.compatibility.includes(sign.name),
    );
  };

  const getIncompatibleAnimals = (animal: any) => {
    return animalSigns.filter((sign) =>
      animal.incompatibility.includes(sign.name),
    );
  };

  const currentAnimal = getCurrentAnimal();
  const compatibleAnimals = getCompatibleAnimals(currentAnimal);
  const incompatibleAnimals = getIncompatibleAnimals(currentAnimal);

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

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <Star className="w-6 h-6 mr-3 text-red-400" />
        生肖分析 (Animal Sign Analysis)
      </h2>

      {/* Main Animal Sign */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-red-500/10 to-yellow-500/10 rounded-xl p-8 border border-red-400/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="text-8xl">{currentAnimal.symbol}</div>
              <div>
                <h3 className="text-4xl font-bold text-white mb-2">
                  {currentAnimal.name}
                </h3>
                <p className="text-red-300 text-2xl mb-2">
                  {currentAnimal.chinese}
                </p>
                <p className="text-red-200">Birth Year: {birthYear}</p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-full font-medium ${getElementColor(currentAnimal.element)}`}
            >
              {currentAnimal.element} Element
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-red-300 font-semibold mb-3">
                Key Personality Traits
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentAnimal.traits.map((trait, index) => (
                  <span
                    key={index}
                    className="bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-red-300 font-semibold mb-3">
                Lucky Elements
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-red-300 text-sm">Numbers:</span>
                  <div className="flex space-x-1">
                    {currentAnimal.luckyNumbers.map((num, index) => (
                      <span
                        key={index}
                        className="bg-yellow-500/20 text-yellow-300 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-300 text-sm">Colors:</span>
                  <div className="flex flex-wrap gap-1">
                    {currentAnimal.luckyColors.map((color, index) => (
                      <span
                        key={index}
                        className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-400/20">
          <h3 className="text-green-300 font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Strengths & Talents
          </h3>
          <div className="space-y-3">
            {currentAnimal.strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-green-400 text-sm mt-1">✓</span>
                <span className="text-green-200 text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-400/20">
          <h3 className="text-orange-300 font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Areas for Growth
          </h3>
          <div className="space-y-3">
            {currentAnimal.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-orange-400 text-sm mt-1">!</span>
                <span className="text-orange-200 text-sm">{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compatibility Analysis */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-pink-400" />
          Relationship Compatibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-6 border border-pink-400/20">
            <h4 className="text-pink-300 font-semibold mb-4">
              Most Compatible Signs
            </h4>
            <div className="space-y-3">
              {compatibleAnimals.map((animal, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-white/5 rounded-lg p-3"
                >
                  <span className="text-2xl">{animal.symbol}</span>
                  <div>
                    <span className="text-pink-200 font-medium">
                      {animal.name}
                    </span>
                    <p className="text-pink-300 text-xs">{animal.chinese}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-purple-400/20">
            <h4 className="text-purple-300 font-semibold mb-4">
              Challenging Relationships
            </h4>
            <div className="space-y-3">
              {incompatibleAnimals.map((animal, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-white/5 rounded-lg p-3"
                >
                  <span className="text-2xl">{animal.symbol}</span>
                  <div>
                    <span className="text-purple-200 font-medium">
                      {animal.name}
                    </span>
                    <p className="text-purple-300 text-xs">{animal.chinese}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-purple-200 text-xs mt-3 italic">
              Note: Challenging doesn't mean impossible - understanding
              differences can lead to growth.
            </p>
          </div>
        </div>
      </div>

      {/* Career Guidance */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
          Career & Professional Life
        </h3>
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-400/20">
          <h4 className="text-blue-300 font-semibold mb-4">
            Ideal Career Paths
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {currentAnimal.career.map((career, index) => (
              <div
                key={index}
                className="bg-blue-500/20 text-blue-200 px-3 py-2 rounded-lg text-center text-sm"
              >
                {career}
              </div>
            ))}
          </div>
          <p className="text-blue-200 text-sm mt-4">
            These careers align with your natural {currentAnimal.name} traits
            and tendencies. Consider how your {currentAnimal.element} element
            influences your work style.
          </p>
        </div>
      </div>

      {/* Life Advice */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/20 mb-6">
        <h3 className="text-yellow-300 font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Life Guidance for {currentAnimal.name} People
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-yellow-300 font-medium mb-2">
              Maximize Your Potential:
            </h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>
                • Embrace your natural {currentAnimal.traits[0].toLowerCase()}{" "}
                nature
              </li>
              <li>• Use your {currentAnimal.element} element energy wisely</li>
              <li>• Surround yourself with your lucky colors</li>
              <li>• Focus on careers that match your strengths</li>
            </ul>
          </div>
          <div>
            <h4 className="text-yellow-300 font-medium mb-2">
              Balance & Harmony:
            </h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• Work on your challenging traits mindfully</li>
              <li>• Seek relationships with compatible signs</li>
              <li>• Learn from incompatible signs' different perspectives</li>
              <li>• Honor both your strengths and growth areas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chinese Wisdom */}
      <div className="text-center p-4 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-xl border border-red-400/20">
        <p className="text-red-200 text-sm italic">
          "十二生肖，各有所长" - Each of the twelve zodiac animals has its own
          strengths and unique gifts
        </p>
      </div>
    </div>
  );
};

export default AnimalSignAnalysis;
