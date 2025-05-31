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
 * Calculate aspects between planets
 */
export function calculateAspects(planets: PlanetaryPosition[]): AspectData[] {
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
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            aspect: aspectName,
            orb,
            exact: orb <= 1,
          });
        }
      });
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Mock planetary calculation - in production, use Swiss Ephemeris or similar
 */
export function calculatePlanetaryPositions(
  birthData: BirthData,
): PlanetaryPosition[] {
  const planets: PlanetaryPosition[] = [];

  // Mock data - in production, calculate actual positions using ephemeris
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
  };

  Object.entries(mockPositions).forEach(([planetName, longitude]) => {
    const signData = longitudeToSign(longitude);

    planets.push({
      name: planetName,
      longitude,
      latitude: 0, // Simplified
      distance: 1, // Simplified
      speed: 1, // Simplified
      sign: signData.sign,
      degree: signData.degree,
      minute: signData.minute,
      second: signData.second,
    });
  });

  return planets;
}

/**
 * Calculate complete birth chart
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
  const aspects = calculateAspects(planets);

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
