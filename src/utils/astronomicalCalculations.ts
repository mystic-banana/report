import { format, parseISO } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

// Types for astronomical data
export interface PlanetaryPosition {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  house?: number;
}

export interface BirthChartData {
  planets: PlanetaryPosition[];
  houses: HousePosition[];
  aspects: AspectData[];
  ascendant: number;
  midheaven: number;
  calculatedAt: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  // Enhanced data for comprehensive natal reports
  chiron?: PlanetaryPosition;
  partOfFortune?: PlanetaryPosition;
  lunarPhase?: {
    phase: string;
    illumination: number;
    description: string;
  };
  elementalBalance?: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalBalance?: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  chartPatterns?: ChartPattern[];
  retrogradeInfo?: {
    planets: string[];
    count: number;
  };
}

export interface HousePosition {
  house: number;
  cusp: number;
  sign: string;
  degree: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  exact: boolean;
  strength: "strong" | "moderate" | "weak";
  nature: "harmonious" | "challenging" | "neutral";
  description?: string;
}

export interface ChartPattern {
  name: string;
  type:
    | "T-Square"
    | "Grand Trine"
    | "Grand Cross"
    | "Stellium"
    | "Kite"
    | "Yod";
  planets: string[];
  description: string;
  significance: "high" | "medium" | "low";
}

export interface BirthData {
  name: string;
  birthDate: string;
  birthTime?: string;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

// Zodiac signs
export const ZODIAC_SIGNS = [
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

// Planets
export const PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "North Node",
  "South Node",
  "Chiron",
];

// Elements
export const ELEMENTS = {
  Fire: ["Aries", "Leo", "Sagittarius"],
  Earth: ["Taurus", "Virgo", "Capricorn"],
  Air: ["Gemini", "Libra", "Aquarius"],
  Water: ["Cancer", "Scorpio", "Pisces"],
};

// Modalities
export const MODALITIES = {
  Cardinal: ["Aries", "Cancer", "Libra", "Capricorn"],
  Fixed: ["Taurus", "Leo", "Scorpio", "Aquarius"],
  Mutable: ["Gemini", "Virgo", "Sagittarius", "Pisces"],
};

// Lunar Phases
export const LUNAR_PHASES = [
  {
    name: "New Moon",
    range: [0, 45],
    description: "New beginnings and fresh starts",
  },
  {
    name: "Waxing Crescent",
    range: [45, 90],
    description: "Growth and building momentum",
  },
  {
    name: "First Quarter",
    range: [90, 135],
    description: "Action and decision-making",
  },
  {
    name: "Waxing Gibbous",
    range: [135, 180],
    description: "Refinement and adjustment",
  },
  {
    name: "Full Moon",
    range: [180, 225],
    description: "Culmination and manifestation",
  },
  {
    name: "Waning Gibbous",
    range: [225, 270],
    description: "Gratitude and sharing wisdom",
  },
  {
    name: "Last Quarter",
    range: [270, 315],
    description: "Release and letting go",
  },
  {
    name: "Waning Crescent",
    range: [315, 360],
    description: "Rest and reflection",
  },
];

// Houses
export const HOUSES = [
  "1st House",
  "2nd House",
  "3rd House",
  "4th House",
  "5th House",
  "6th House",
  "7th House",
  "8th House",
  "9th House",
  "10th House",
  "11th House",
  "12th House",
];

// Aspects
export const ASPECTS = {
  conjunction: { angle: 0, orb: 8, symbol: "☌" },
  opposition: { angle: 180, orb: 8, symbol: "☍" },
  trine: { angle: 120, orb: 8, symbol: "△" },
  square: { angle: 90, orb: 8, symbol: "□" },
  sextile: { angle: 60, orb: 6, symbol: "⚹" },
  quincunx: { angle: 150, orb: 3, symbol: "⚻" },
};

/**
 * Convert longitude to zodiac sign and degree
 */
export function longitudeToSign(longitude: number): {
  sign: string;
  degree: number;
  minute: number;
  second: number;
} {
  const normalizedLong = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLong / 30);
  const degreeInSign = normalizedLong % 30;
  const degree = Math.floor(degreeInSign);
  const minute = Math.floor((degreeInSign - degree) * 60);
  const second = Math.floor(((degreeInSign - degree) * 60 - minute) * 60);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    minute,
    second,
  };
}

/**
 * Calculate house positions using Placidus system
 */
export function calculateHouses(
  ascendant: number,
  midheaven: number,
  latitude: number,
): HousePosition[] {
  const houses: HousePosition[] = [];

  // Simplified house calculation - in production, use proper ephemeris library
  for (let i = 1; i <= 12; i++) {
    let cusp: number;

    if (i === 1) {
      cusp = ascendant;
    } else if (i === 10) {
      cusp = midheaven;
    } else if (i === 4) {
      cusp = (midheaven + 180) % 360;
    } else if (i === 7) {
      cusp = (ascendant + 180) % 360;
    } else {
      // Simplified calculation - distribute houses evenly
      const baseAngle = i <= 6 ? ascendant : (ascendant + 180) % 360;
      const houseOffset = ((i - 1) % 6) * 30;
      cusp = (baseAngle + houseOffset) % 360;
    }

    const signData = longitudeToSign(cusp);

    houses.push({
      house: i,
      cusp,
      sign: signData.sign,
      degree: signData.degree,
    });
  }

  return houses;
}

/**
 * Calculate enhanced aspects between planets
 */
export function calculateEnhancedAspects(
  planets: PlanetaryPosition[],
): AspectData[] {
  const aspects: AspectData[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];

      const angle = Math.abs(planet1.longitude - planet2.longitude);
      const normalizedAngle = Math.min(angle, 360 - angle);

      Object.entries(ASPECTS).forEach(([aspectName, aspectData]) => {
        const orb = Math.abs(normalizedAngle - aspectData.angle);
        if (orb <= aspectData.orb) {
          const strength = orb <= 2 ? "strong" : orb <= 5 ? "moderate" : "weak";
          const nature = ["conjunction", "trine", "sextile"].includes(
            aspectName,
          )
            ? "harmonious"
            : ["opposition", "square"].includes(aspectName)
              ? "challenging"
              : "neutral";

          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            aspect: aspectName,
            orb,
            exact: orb <= 1,
            strength,
            nature,
            description: generateAspectDescription(
              planet1.name,
              planet2.name,
              aspectName,
            ),
          });
        }
      });
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Calculate aspects between planets (legacy function for compatibility)
 */
export function calculateAspects(planets: PlanetaryPosition[]): AspectData[] {
  return calculateEnhancedAspects(planets);
}

/**
 * Enhanced planetary calculation with additional points
 */
export function calculatePlanetaryPositions(
  birthData: BirthData,
): PlanetaryPosition[] {
  const planets: PlanetaryPosition[] = [];

  // Enhanced mock data - in production, use Swiss Ephemeris or similar
  const mockPositions = {
    Sun: 120.5,
    Moon: 45.2,
    Mercury: 135.8,
    Venus: 98.3,
    Mars: 210.7,
    Jupiter: 67.4,
    Saturn: 289.1,
    Uranus: 15.6,
    Neptune: 334.2,
    Pluto: 267.9,
    "North Node": 156.3,
    "South Node": 336.3,
    Chiron: 78.9,
  };

  // Add retrograde status (mock)
  const retrogradeStatus = {
    Mercury: Math.random() > 0.7,
    Venus: Math.random() > 0.8,
    Mars: Math.random() > 0.8,
    Jupiter: Math.random() > 0.9,
    Saturn: Math.random() > 0.9,
    Uranus: Math.random() > 0.95,
    Neptune: Math.random() > 0.95,
    Pluto: Math.random() > 0.95,
  };

  Object.entries(mockPositions).forEach(([planetName, longitude]) => {
    const signData = longitudeToSign(longitude);
    const isRetrograde = retrogradeStatus[planetName] || false;

    planets.push({
      name: planetName,
      longitude,
      latitude: 0, // Simplified
      distance: 1, // Simplified
      speed: isRetrograde ? -0.5 : 1, // Negative speed indicates retrograde
      sign: signData.sign,
      degree: signData.degree,
      minute: signData.minute,
      second: signData.second,
    });
  });

  return planets;
}

/**
 * Calculate complete enhanced birth chart
 */
export function calculateBirthChart(birthData: BirthData): BirthChartData {
  const planets = calculatePlanetaryPositions(birthData);

  // Mock ascendant and midheaven - in production, calculate based on time and location
  const ascendant = 75.5; // Mock value
  const midheaven = 345.2; // Mock value

  const houses = calculateHouses(
    ascendant,
    midheaven,
    birthData.location.latitude,
  );
  const aspects = calculateEnhancedAspects(planets);

  // Assign houses to planets
  planets.forEach((planet) => {
    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i];
      const nextHouse = houses[(i + 1) % 12];

      if (isInHouse(planet.longitude, currentHouse.cusp, nextHouse.cusp)) {
        planet.house = currentHouse.house;
        break;
      }
    }
  });

  // Calculate additional points
  const chiron = planets.find((p) => p.name === "Chiron");
  const partOfFortune = calculatePartOfFortune(planets, ascendant);
  const lunarPhase = calculateLunarPhase(planets);
  const elementalBalance = calculateElementalBalance(planets);
  const modalBalance = calculateModalBalance(planets);
  const chartPatterns = detectChartPatterns(planets, aspects);
  const retrogradeInfo = calculateRetrogradeInfo(planets);

  return {
    planets,
    houses,
    aspects,
    ascendant,
    midheaven,
    calculatedAt: new Date().toISOString(),
    coordinates: {
      latitude: birthData.location.latitude,
      longitude: birthData.location.longitude,
    },
    timezone: birthData.location.timezone,
    chiron,
    partOfFortune,
    lunarPhase,
    elementalBalance,
    modalBalance,
    chartPatterns,
    retrogradeInfo,
  };
}

/**
 * Check if a longitude is within a house
 */
function isInHouse(
  longitude: number,
  houseStart: number,
  houseEnd: number,
): boolean {
  if (houseStart <= houseEnd) {
    return longitude >= houseStart && longitude < houseEnd;
  } else {
    // Handle crossing 0 degrees
    return longitude >= houseStart || longitude < houseEnd;
  }
}

/**
 * Get zodiac sign for a given date (simplified sun sign)
 */
export function getZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return "Aquarius";
  return "Pisces";
}

/**
 * Format planetary position for display
 */
export function formatPlanetaryPosition(planet: PlanetaryPosition): string {
  return `${planet.degree}°${planet.minute}'${planet.second}" ${planet.sign}`;
}

/**
 * Calculate compatibility score between two charts
 */
export function calculateCompatibilityScore(
  chart1: BirthChartData,
  chart2: BirthChartData,
): number {
  let score = 50; // Base score

  // Compare sun signs
  const sun1 = chart1.planets.find((p) => p.name === "Sun");
  const sun2 = chart2.planets.find((p) => p.name === "Sun");

  if (sun1 && sun2) {
    const sunCompatibility = getSignCompatibility(sun1.sign, sun2.sign);
    score += sunCompatibility * 0.3;
  }

  // Compare moon signs
  const moon1 = chart1.planets.find((p) => p.name === "Moon");
  const moon2 = chart2.planets.find((p) => p.name === "Moon");

  if (moon1 && moon2) {
    const moonCompatibility = getSignCompatibility(moon1.sign, moon2.sign);
    score += moonCompatibility * 0.25;
  }

  // Compare Venus signs (love compatibility)
  const venus1 = chart1.planets.find((p) => p.name === "Venus");
  const venus2 = chart2.planets.find((p) => p.name === "Venus");

  if (venus1 && venus2) {
    const venusCompatibility = getSignCompatibility(venus1.sign, venus2.sign);
    score += venusCompatibility * 0.2;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get compatibility score between two zodiac signs
 */
function getSignCompatibility(sign1: string, sign2: string): number {
  const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
    Aries: { Leo: 20, Sagittarius: 20, Gemini: 15, Aquarius: 15, Aries: 10 },
    Taurus: { Virgo: 20, Capricorn: 20, Cancer: 15, Pisces: 15, Taurus: 10 },
    Gemini: { Libra: 20, Aquarius: 20, Aries: 15, Leo: 15, Gemini: 10 },
    Cancer: { Scorpio: 20, Pisces: 20, Taurus: 15, Virgo: 15, Cancer: 10 },
    Leo: { Aries: 20, Sagittarius: 20, Gemini: 15, Libra: 15, Leo: 10 },
    Virgo: { Taurus: 20, Capricorn: 20, Cancer: 15, Scorpio: 15, Virgo: 10 },
    Libra: { Gemini: 20, Aquarius: 20, Leo: 15, Sagittarius: 15, Libra: 10 },
    Scorpio: { Cancer: 20, Pisces: 20, Virgo: 15, Capricorn: 15, Scorpio: 10 },
    Sagittarius: {
      Aries: 20,
      Leo: 20,
      Libra: 15,
      Aquarius: 15,
      Sagittarius: 10,
    },
    Capricorn: {
      Taurus: 20,
      Virgo: 20,
      Scorpio: 15,
      Pisces: 15,
      Capricorn: 10,
    },
    Aquarius: {
      Gemini: 20,
      Libra: 20,
      Aries: 15,
      Sagittarius: 15,
      Aquarius: 10,
    },
    Pisces: { Cancer: 20, Scorpio: 20, Taurus: 15, Capricorn: 15, Pisces: 10 },
  };

  return compatibilityMatrix[sign1]?.[sign2] || 0;
}

/**
 * Calculate Part of Fortune
 */
export function calculatePartOfFortune(
  planets: PlanetaryPosition[],
  ascendant: number,
): PlanetaryPosition {
  const sun = planets.find((p) => p.name === "Sun");
  const moon = planets.find((p) => p.name === "Moon");

  if (!sun || !moon) {
    // Fallback position
    const longitude = (ascendant + 90) % 360;
    const signData = longitudeToSign(longitude);
    return {
      name: "Part of Fortune",
      longitude,
      latitude: 0,
      distance: 1,
      speed: 0,
      sign: signData.sign,
      degree: signData.degree,
      minute: signData.minute,
      second: signData.second,
    };
  }

  // Formula: Ascendant + Moon - Sun (for day births)
  const longitude = (ascendant + moon.longitude - sun.longitude + 360) % 360;
  const signData = longitudeToSign(longitude);

  return {
    name: "Part of Fortune",
    longitude,
    latitude: 0,
    distance: 1,
    speed: 0,
    sign: signData.sign,
    degree: signData.degree,
    minute: signData.minute,
    second: signData.second,
  };
}

/**
 * Calculate lunar phase at birth
 */
export function calculateLunarPhase(planets: PlanetaryPosition[]) {
  const sun = planets.find((p) => p.name === "Sun");
  const moon = planets.find((p) => p.name === "Moon");

  if (!sun || !moon) {
    return {
      phase: "New Moon",
      illumination: 0,
      description: "New beginnings and fresh starts",
    };
  }

  const angle = Math.abs(moon.longitude - sun.longitude);
  const normalizedAngle = angle > 180 ? 360 - angle : angle;

  const phase =
    LUNAR_PHASES.find(
      (p) => normalizedAngle >= p.range[0] && normalizedAngle < p.range[1],
    ) || LUNAR_PHASES[0];

  return {
    phase: phase.name,
    illumination: Math.round((normalizedAngle / 180) * 100),
    description: phase.description,
  };
}

/**
 * Calculate elemental balance
 */
export function calculateElementalBalance(planets: PlanetaryPosition[]) {
  const balance = { fire: 0, earth: 0, air: 0, water: 0 };

  planets.forEach((planet) => {
    if (ELEMENTS.Fire.includes(planet.sign)) balance.fire++;
    else if (ELEMENTS.Earth.includes(planet.sign)) balance.earth++;
    else if (ELEMENTS.Air.includes(planet.sign)) balance.air++;
    else if (ELEMENTS.Water.includes(planet.sign)) balance.water++;
  });

  return balance;
}

/**
 * Calculate modal balance
 */
export function calculateModalBalance(planets: PlanetaryPosition[]) {
  const balance = { cardinal: 0, fixed: 0, mutable: 0 };

  planets.forEach((planet) => {
    if (MODALITIES.Cardinal.includes(planet.sign)) balance.cardinal++;
    else if (MODALITIES.Fixed.includes(planet.sign)) balance.fixed++;
    else if (MODALITIES.Mutable.includes(planet.sign)) balance.mutable++;
  });

  return balance;
}

/**
 * Detect chart patterns
 */
export function detectChartPatterns(
  planets: PlanetaryPosition[],
  aspects: AspectData[],
): ChartPattern[] {
  const patterns: ChartPattern[] = [];

  // Detect Stellium (3+ planets in same sign or house)
  const signGroups: { [key: string]: string[] } = {};
  planets.forEach((planet) => {
    if (!signGroups[planet.sign]) signGroups[planet.sign] = [];
    signGroups[planet.sign].push(planet.name);
  });

  Object.entries(signGroups).forEach(([sign, planetNames]) => {
    if (planetNames.length >= 3) {
      patterns.push({
        name: `${sign} Stellium`,
        type: "Stellium",
        planets: planetNames,
        description: `A concentration of energy in ${sign}, emphasizing its themes`,
        significance: "high",
      });
    }
  });

  // Detect Grand Trine (simplified)
  const trines = aspects.filter((a) => a.aspect === "trine");
  if (trines.length >= 3) {
    const trinePlanets = Array.from(
      new Set([...trines.flatMap((t) => [t.planet1, t.planet2])]),
    );

    if (trinePlanets.length >= 3) {
      patterns.push({
        name: "Grand Trine",
        type: "Grand Trine",
        planets: trinePlanets.slice(0, 3),
        description:
          "A harmonious triangle of energy promoting natural talents",
        significance: "high",
      });
    }
  }

  return patterns;
}

/**
 * Calculate retrograde information
 */
export function calculateRetrogradeInfo(planets: PlanetaryPosition[]) {
  const retrogradePlanets = planets
    .filter((p) => p.speed < 0)
    .map((p) => p.name);

  return {
    planets: retrogradePlanets,
    count: retrogradePlanets.length,
  };
}

/**
 * Generate aspect description
 */
function generateAspectDescription(
  planet1: string,
  planet2: string,
  aspect: string,
): string {
  const descriptions = {
    conjunction: `${planet1} and ${planet2} blend their energies`,
    opposition: `${planet1} and ${planet2} create dynamic tension`,
    trine: `${planet1} and ${planet2} flow harmoniously together`,
    square: `${planet1} and ${planet2} challenge each other to grow`,
    sextile: `${planet1} and ${planet2} support each other's expression`,
    quincunx: `${planet1} and ${planet2} require adjustment and adaptation`,
  };

  return descriptions[aspect] || `${planet1} ${aspect} ${planet2}`;
}
