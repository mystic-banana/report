import { ChartTheme, ThemeColors, CustomTheme } from './InteractiveChart.types';

// Zodiac symbol mapping
export const zodiacSymbols: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

// Planet symbol mapping
export const planetSymbols: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  "North Node": '☊',
  "South Node": '☋',
  Chiron: '⚷',
  Ceres: '⚳',
  Pallas: '⚴',
  Juno: '⚵',
  Vesta: '⚶',
};

// Element color function
export const getElementColor = (sign: string): string => {
  const elements: Record<string, string> = {
    fire: "#F9A825", // warm gold
    earth: "#43A047", // nurturing green
    air: "#26C6DA", // clear blue
    water: "#5E35B1", // deep purple
  };

  const elementMap: Record<string, string> = {
    Aries: "fire", Leo: "fire", Sagittarius: "fire",
    Taurus: "earth", Virgo: "earth", Capricorn: "earth",
    Gemini: "air", Libra: "air", Aquarius: "air",
    Cancer: "water", Scorpio: "water", Pisces: "water",
  };

  return elements[elementMap[sign] || "fire"];
};

// Modality symbol function
export const getModalitySymbol = (sign: string): string => {
  const modalities: Record<string, string> = {
    cardinal: "►", // initiating
    fixed: "■",    // sustaining
    mutable: "◆",  // adaptable
  };

  const modalityMap: Record<string, string> = {
    Aries: "cardinal", Cancer: "cardinal", Libra: "cardinal", Capricorn: "cardinal",
    Taurus: "fixed", Leo: "fixed", Scorpio: "fixed", Aquarius: "fixed",
    Gemini: "mutable", Virgo: "mutable", Sagittarius: "mutable", Pisces: "mutable",
  };

  return modalities[modalityMap[sign] || "cardinal"];
};

// Theme definitions
export const themes: Record<ChartTheme, CustomTheme> = {
  [ChartTheme.LIGHT]: {
    name: 'Light',
    colors: {
      background: '#ffffff',
      primary: '#302b63',
      secondary: '#24243e',
      accent: '#f78c6b',
      text: '#333333'
    }
  },
  [ChartTheme.DARK]: {
    name: 'Dark',
    colors: {
      background: '#121212',
      primary: '#bb86fc',
      secondary: '#03dac6',
      accent: '#cf6679',
      text: '#e0e0e0'
    }
  },
  [ChartTheme.COSMIC]: {
    name: 'Cosmic',
    colors: {
      background: '#0f0c29',
      primary: '#7303c0',
      secondary: '#ec38bc',
      accent: '#fdeff9',
      text: '#ffffff'
    }
  }
};
