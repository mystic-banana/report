import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Columns, Star } from "lucide-react";

interface FourPillarsChartProps {
  chartData: BirthChart;
}

const FourPillarsChart: React.FC<FourPillarsChartProps> = ({ chartData }) => {
  const birthDate = new Date(chartData.birth_date);
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth() + 1;
  const birthDay = birthDate.getDate();
  const birthHour = chartData.birth_time
    ? parseInt(chartData.birth_time.split(":")[0])
    : 12;

  // Chinese zodiac animals (12-year cycle)
  const animals = [
    "Rat",
    "Ox",
    "Tiger",
    "Rabbit",
    "Dragon",
    "Snake",
    "Horse",
    "Goat",
    "Monkey",
    "Rooster",
    "Dog",
    "Pig",
  ];

  // Chinese zodiac animals in Chinese
  const animalsChinese = [
    "鼠",
    "牛",
    "虎",
    "兔",
    "龙",
    "蛇",
    "马",
    "羊",
    "猴",
    "鸡",
    "狗",
    "猪",
  ];

  // Five elements
  const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const elementsChinese = ["木", "火", "土", "金", "水"];

  // Heavenly Stems (10-year cycle)
  const heavenlyStems = [
    "甲",
    "乙",
    "丙",
    "丁",
    "戊",
    "己",
    "庚",
    "辛",
    "壬",
    "癸",
  ];
  const heavenlyStemsEnglish = [
    "Jia",
    "Yi",
    "Bing",
    "Ding",
    "Wu",
    "Ji",
    "Geng",
    "Xin",
    "Ren",
    "Gui",
  ];

  // Earthly Branches (12-year cycle)
  const earthlyBranches = [
    "子",
    "丑",
    "寅",
    "卯",
    "辰",
    "巳",
    "午",
    "未",
    "申",
    "酉",
    "戌",
    "亥",
  ];
  const earthlyBranchesEnglish = [
    "Zi",
    "Chou",
    "Yin",
    "Mao",
    "Chen",
    "Si",
    "Wu",
    "Wei",
    "Shen",
    "You",
    "Xu",
    "Hai",
  ];

  const getYearPillar = () => {
    const stemIndex = (birthYear - 4) % 10;
    const branchIndex = (birthYear - 4) % 12;
    const animalIndex = (birthYear - 4) % 12;
    const elementIndex = Math.floor(stemIndex / 2);

    return {
      stem: heavenlyStems[stemIndex],
      stemEnglish: heavenlyStemsEnglish[stemIndex],
      branch: earthlyBranches[branchIndex],
      branchEnglish: earthlyBranchesEnglish[branchIndex],
      animal: animals[animalIndex],
      animalChinese: animalsChinese[animalIndex],
      element: elements[elementIndex],
      elementChinese: elementsChinese[elementIndex],
    };
  };

  const getMonthPillar = () => {
    // Simplified month calculation
    const monthIndex = (birthMonth - 1) % 12;
    const stemIndex = (birthYear * 12 + birthMonth - 1) % 10;

    return {
      stem: heavenlyStems[stemIndex],
      stemEnglish: heavenlyStemsEnglish[stemIndex],
      branch: earthlyBranches[monthIndex],
      branchEnglish: earthlyBranchesEnglish[monthIndex],
      animal: animals[monthIndex],
      animalChinese: animalsChinese[monthIndex],
    };
  };

  const getDayPillar = () => {
    // Simplified day calculation
    const daysSinceEpoch = Math.floor(
      (birthDate.getTime() - new Date(1900, 0, 1).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const stemIndex = daysSinceEpoch % 10;
    const branchIndex = daysSinceEpoch % 12;

    return {
      stem: heavenlyStems[stemIndex],
      stemEnglish: heavenlyStemsEnglish[stemIndex],
      branch: earthlyBranches[branchIndex],
      branchEnglish: earthlyBranchesEnglish[branchIndex],
      animal: animals[branchIndex],
      animalChinese: animalsChinese[branchIndex],
    };
  };

  const getHourPillar = () => {
    // Each hour corresponds to a 2-hour period
    const hourIndex = Math.floor(birthHour / 2) % 12;
    const stemIndex = (birthHour + birthDay) % 10;

    return {
      stem: heavenlyStems[stemIndex],
      stemEnglish: heavenlyStemsEnglish[stemIndex],
      branch: earthlyBranches[hourIndex],
      branchEnglish: earthlyBranchesEnglish[hourIndex],
      animal: animals[hourIndex],
      animalChinese: animalsChinese[hourIndex],
    };
  };

  const yearPillar = getYearPillar();
  const monthPillar = getMonthPillar();
  const dayPillar = getDayPillar();
  const hourPillar = getHourPillar();

  const pillars = [
    {
      name: "Hour",
      chinese: "时",
      pillar: hourPillar,
      period: "2-hour period",
    },
    { name: "Day", chinese: "日", pillar: dayPillar, period: "Daily cycle" },
    {
      name: "Month",
      chinese: "月",
      pillar: monthPillar,
      period: "Monthly cycle",
    },
    { name: "Year", chinese: "年", pillar: yearPillar, period: "Yearly cycle" },
  ];

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
        <Columns className="w-6 h-6 mr-3 text-red-400" />
        四柱八字 (Four Pillars of Destiny)
      </h2>

      {/* Main Four Pillars Chart */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-xl p-6 border border-red-400/20">
          <div className="grid grid-cols-4 gap-4">
            {pillars.map((pillar, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/10 rounded-xl p-4 mb-3">
                  <h3 className="text-red-300 font-semibold mb-2">
                    {pillar.name} Pillar
                  </h3>
                  <p className="text-red-200 text-sm mb-3">{pillar.chinese}</p>

                  {/* Heavenly Stem */}
                  <div className="bg-red-500/20 rounded-lg p-3 mb-2">
                    <div className="text-2xl font-bold text-white mb-1">
                      {pillar.pillar.stem}
                    </div>
                    <div className="text-red-200 text-xs">
                      {pillar.pillar.stemEnglish}
                    </div>
                    <div className="text-red-300 text-xs">Heavenly Stem</div>
                  </div>

                  {/* Earthly Branch */}
                  <div className="bg-yellow-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white mb-1">
                      {pillar.pillar.branch}
                    </div>
                    <div className="text-yellow-200 text-xs">
                      {pillar.pillar.branchEnglish}
                    </div>
                    <div className="text-yellow-300 text-xs">
                      Earthly Branch
                    </div>
                  </div>
                </div>

                {/* Animal and Element */}
                <div className="space-y-2">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-lg">{pillar.pillar.animalChinese}</div>
                    <div className="text-white text-sm">
                      {pillar.pillar.animal}
                    </div>
                  </div>
                  {pillar.name === "Year" && (
                    <div
                      className={`rounded-lg p-2 text-xs font-medium ${getElementColor(pillar.pillar.element)}`}
                    >
                      <div>{pillar.pillar.elementChinese}</div>
                      <div>{pillar.pillar.element}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pillar Meanings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-400/20">
          <h3 className="text-red-300 font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Pillar Significance
          </h3>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <h4 className="text-red-300 font-medium text-sm">
                Year Pillar (年)
              </h4>
              <p className="text-red-200 text-xs">
                Represents ancestors, early life, and foundational energy
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <h4 className="text-red-300 font-medium text-sm">
                Month Pillar (月)
              </h4>
              <p className="text-red-200 text-xs">
                Represents parents, career, and middle-age period
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <h4 className="text-red-300 font-medium text-sm">
                Day Pillar (日)
              </h4>
              <p className="text-red-200 text-xs">
                Represents self, spouse, and core personality
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <h4 className="text-red-300 font-medium text-sm">
                Hour Pillar (时)
              </h4>
              <p className="text-red-200 text-xs">
                Represents children, later life, and future prospects
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-red-500/10 rounded-xl p-6 border border-yellow-400/20">
          <h3 className="text-yellow-300 font-semibold mb-4">
            Elemental Analysis
          </h3>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <h4 className="text-yellow-300 font-medium text-sm">
                Dominant Element
              </h4>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getElementColor(yearPillar.element)}`}
              >
                {yearPillar.elementChinese} {yearPillar.element}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <h4 className="text-yellow-300 font-medium text-sm">
                Year Animal
              </h4>
              <p className="text-yellow-200">
                {yearPillar.animalChinese} {yearPillar.animal}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <h4 className="text-yellow-300 font-medium text-sm">
                Birth Year
              </h4>
              <p className="text-yellow-200">{birthYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Five Elements Cycle */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/20 mb-6">
        <h3 className="text-blue-300 font-semibold mb-4">
          五行相生相克 (Five Elements Interaction)
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {elements.map((element, index) => (
            <div
              key={index}
              className={`text-center p-3 rounded-lg ${getElementColor(element)}`}
            >
              <div className="text-2xl mb-1">{elementsChinese[index]}</div>
              <div className="text-sm font-medium">{element}</div>
            </div>
          ))}
        </div>
        <p className="text-blue-200 text-sm mt-4 text-center">
          Wood feeds Fire → Fire creates Earth → Earth bears Metal → Metal
          collects Water → Water nourishes Wood
        </p>
      </div>

      {/* Chinese Wisdom */}
      <div className="text-center p-4 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-xl border border-red-400/20">
        <p className="text-red-200 text-sm italic">
          "知命者不怨天，知己者不怨人" - Those who understand destiny do not
          blame heaven; those who know themselves do not blame others
        </p>
      </div>
    </div>
  );
};

export default FourPillarsChart;
