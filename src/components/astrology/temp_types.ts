import { BirthChartData, PlanetaryPosition, HousePosition } from "../../utils/astronomicalCalculations";

// Chart theme enum
export enum ChartTheme {
  LIGHT = 'light',
  DARK = 'dark',
  COSMIC = 'cosmic'
}

// Component props interface
export interface InteractiveChartProps {
  chartData: BirthChartData;
  width?: number;
  height?: number;
  onPlanetClick?: (planet: PlanetaryPosition) => void;
  onHouseClick?: (house: HousePosition) => void;
  initialZoom?: number;
  theme?: ChartTheme;
  showControls?: boolean;
  showSummary?: boolean;
  watermark?: boolean;
  enableExport?: boolean;
  isPremium?: boolean;
  className?: string;
}

// Chart settings interface
export interface ChartSettings {
  zoom: number;
  rotation: number;
  showHouseNumbers: boolean;
  showZodiacSymbols: boolean;
  showPlanetNames: boolean;
  showAspects: boolean;
  showDegreeMarkers: boolean;
  showAspectOrbs: boolean;
  showRetrogradePlanets: boolean;
  animationSpeed: number;
  tooltipDelay: number;
}

// Hovered element type
export interface HoveredElement {
  type: 'planet' | 'house' | 'sign' | 'aspect' | null;
  id: string | number | null;
  data?: PlanetaryPosition | HousePosition | string | [string, string] | null;
  x?: number;
  y?: number;
}

// Container size type
export interface ContainerSize {
  width: number;
  height: number;
}

// Theme colors interface
export interface ThemeColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

// Custom theme interface
export interface CustomTheme {
  name: string;
  colors: ThemeColors;
}
