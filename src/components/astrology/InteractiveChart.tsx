import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react";
import * as d3 from "d3";
import {
  BirthChartData,
  PlanetaryPosition,
  HousePosition,
  AspectData,
  ZODIAC_SIGNS,
} from "../../utils/astronomicalCalculations";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Star,
  Palette,
  Settings,
  Eye,
  HelpCircle,
  Maximize,
  Minimize,
} from "lucide-react";
import Button from "../ui/Button";
import {
  generatePDFWithWatermark,
  addImageWatermark,
} from "../../utils/pdfGenerator";
import { motion, AnimatePresence } from "framer-motion";

interface InteractiveChartProps {
  chartData: BirthChartData;
  width?: number;
  height?: number;
  showAspects?: boolean;
  showHouseNumbers?: boolean;
  onPlanetClick?: (planet: PlanetaryPosition) => void;
  onHouseClick?: (house: HousePosition) => void;
  userName?: string;
  birthDate?: string;
  lightMode?: boolean;
  showPremiumFeatures?: boolean;
  showNatalSummary?: boolean;
  isMobile?: boolean;
  isPremiumUser?: boolean;
  enablePerformanceMode?: boolean;
  showAdvancedTooltips?: boolean;
  customTheme?: ChartTheme;
}

interface ChartTheme {
  name: string;
  colors: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
}

interface ChartSettings {
  showDegreeMarkers: boolean;
  showAspectOrbs: boolean;
  showRetrogradePlanets: boolean;
  animationSpeed: number;
  tooltipDelay: number;
}

const InteractiveChart: React.FC<InteractiveChartProps> = memo(
  ({
    chartData,
    width = 600,
    height = 600,
    showAspects = true,
    showHouseNumbers = true,
    onPlanetClick,
    onHouseClick,
    userName = "User",
    birthDate,
    lightMode = false,
    showPremiumFeatures = false,
    showNatalSummary = true,
    isMobile = false,
    isPremiumUser = false,
    enablePerformanceMode = false,
    showAdvancedTooltips = true,
    customTheme,
  }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedPlanet, setSelectedPlanet] =
      useState<PlanetaryPosition | null>(null);
    const [selectedHouse, setSelectedHouse] = useState<HousePosition | null>(
      null,
    );
    const [zoomLevel, setZoomLevel] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [showElementalGrid, setShowElementalGrid] = useState(false);
    const [showAspectLegend, setShowAspectLegend] = useState(true);
    const [currentLightMode, setCurrentLightMode] = useState(lightMode);
    const [isLoading, setIsLoading] = useState(false);
    const [containerSize, setContainerSize] = useState({ width, height });
    const [showSettings, setShowSettings] = useState(false);
    const [chartSettings, setChartSettings] = useState<ChartSettings>({
      showDegreeMarkers: true,
      showAspectOrbs: isPremiumUser,
      showRetrogradePlanets: true,
      animationSpeed: 1,
      tooltipDelay: 500,
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredElement, setHoveredElement] = useState<{
      type: "planet" | "house";
      data: any;
    } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();

    // Responsive sizing
    useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const size = Math.min(rect.width - 40, isMobile ? 350 : 600);
          setContainerSize({ width: size, height: size });
        }
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }, [isMobile]);

    // Planet symbols
    const planetSymbols: { [key: string]: string } = {
      Sun: "☉",
      Moon: "☽",
      Mercury: "☿",
      Venus: "♀",
      Mars: "♂",
      Jupiter: "♃",
      Saturn: "♄",
      Uranus: "♅",
      Neptune: "♆",
      Pluto: "♇",
      "North Node": "☊",
      "South Node": "☋",
    };

    // Zodiac symbols
    const zodiacSymbols: { [key: string]: string } = {
      Aries: "♈",
      Taurus: "♉",
      Gemini: "♊",
      Cancer: "♋",
      Leo: "♌",
      Virgo: "♍",
      Libra: "♎",
      Scorpio: "♏",
      Sagittarius: "♐",
      Capricorn: "♑",
      Aquarius: "♒",
      Pisces: "♓",
    };

    // Memoized theme and colors
    const currentTheme = useMemo(() => {
      if (customTheme) return customTheme;

      const defaultThemes = {
        default: {
          name: "Default",
          colors: {
            background: currentLightMode ? "#ffffff" : "#1a1a1a",
            primary: currentLightMode ? "#4A148C" : "#FFD700",
            secondary: currentLightMode ? "#888" : "#666",
            accent: currentLightMode ? "#B8860B" : "#FFD700",
            text: currentLightMode ? "#333" : "#fff",
          },
        },
        cosmic: {
          name: "Cosmic",
          colors: {
            background: "#0a0a1a",
            primary: "#6366f1",
            secondary: "#4338ca",
            accent: "#8b5cf6",
            text: "#e5e7eb",
          },
        },
        elegant: {
          name: "Elegant",
          colors: {
            background: "#1f1f1f",
            primary: "#d4af37",
            secondary: "#b8860b",
            accent: "#ffd700",
            text: "#f5f5f5",
          },
        },
      };

      return defaultThemes.default;
    }, [customTheme, currentLightMode]);

    // Memoized planet colors
    const planetColors: { [key: string]: string } = useMemo(
      () => ({
        Sun: "#FFD700",
        Moon: "#C0C0C0",
        Mercury: "#FFA500",
        Venus: "#FF69B4",
        Mars: "#FF4500",
        Jupiter: "#4169E1",
        Saturn: "#8B4513",
        Uranus: "#00CED1",
        Neptune: "#4682B4",
        Pluto: "#800080",
        "North Node": "#32CD32",
        "South Node": "#32CD32",
      }),
      [],
    );

    // Memoized calculations for performance
    const chartCalculations = useMemo(() => {
      const centerX = containerSize.width / 2;
      const centerY = containerSize.height / 2;
      const radius =
        Math.min(containerSize.width, containerSize.height) / 2 -
        (isMobile ? 20 : 40);

      return {
        centerX,
        centerY,
        radius,
        fontSize: isMobile ? 14 : 20,
        planetRadius: isMobile ? 12 : 15,
        strokeWidth: isMobile ? 1.5 : 2,
      };
    }, [containerSize.width, containerSize.height, isMobile]);

    const drawChart = useCallback(() => {
      if (!svgRef.current) return;
      setIsLoading(true);

      // Cancel previous animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Use requestAnimationFrame for better performance
      animationFrameRef.current = requestAnimationFrame(() => {
        const svg = d3.select(svgRef.current);

        // Performance optimization: only clear if necessary
        if (!enablePerformanceMode) {
          svg.selectAll("*").remove();
        } else {
          // Selective updates for performance mode
          svg.selectAll(".dynamic-element").remove();
        }

        const {
          centerX,
          centerY,
          radius,
          fontSize,
          planetRadius,
          strokeWidth,
        } = chartCalculations;

        // Set background color based on theme
        svg.style("background-color", currentTheme.colors.background);

        // Create main group with zoom and rotation
        const mainGroup = svg
          .append("g")
          .attr(
            "transform",
            `translate(${centerX}, ${centerY}) scale(${zoomLevel}) rotate(${rotation})`,
          );

        // Draw outer circle with theme colors
        mainGroup
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", radius)
          .attr("fill", "none")
          .attr("stroke", currentTheme.colors.primary)
          .attr("stroke-width", 3)
          .attr("class", enablePerformanceMode ? "static-element" : "");

        // Draw inner circle with theme colors
        mainGroup
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", radius * 0.7)
          .attr("fill", "none")
          .attr("stroke", currentTheme.colors.secondary)
          .attr("stroke-width", 1)
          .attr("class", enablePerformanceMode ? "static-element" : "");

        // Draw zodiac signs
        ZODIAC_SIGNS.forEach((sign, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const x = Math.cos(angle) * (radius * 0.85);
          const y = Math.sin(angle) * (radius * 0.85);

          mainGroup
            .append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", currentTheme.colors.accent)
            .attr("font-size", `${fontSize}px`)
            .attr("font-family", "serif")
            .attr("class", enablePerformanceMode ? "static-element" : "")
            .text(zodiacSymbols[sign]);

          // Draw zodiac divider lines
          const innerX = Math.cos(angle) * (radius * 0.7);
          const innerY = Math.sin(angle) * (radius * 0.7);
          const outerX = Math.cos(angle) * radius;
          const outerY = Math.sin(angle) * radius;

          mainGroup
            .append("line")
            .attr("x1", innerX)
            .attr("y1", innerY)
            .attr("x2", outerX)
            .attr("y2", outerY)
            .attr("stroke", currentTheme.colors.secondary)
            .attr("stroke-width", 1)
            .attr("class", enablePerformanceMode ? "static-element" : "");
        });

        // Draw house cusps
        chartData.houses.forEach((house, index) => {
          const angle = (house.cusp - 90) * (Math.PI / 180);
          const innerX = Math.cos(angle) * (radius * 0.3);
          const innerY = Math.sin(angle) * (radius * 0.3);
          const outerX = Math.cos(angle) * (radius * 0.7);
          const outerY = Math.sin(angle) * (radius * 0.7);

          // House cusp line
          mainGroup
            .append("line")
            .attr("x1", innerX)
            .attr("y1", innerY)
            .attr("x2", outerX)
            .attr("y2", outerY)
            .attr("stroke", currentTheme.colors.secondary)
            .attr("stroke-width", strokeWidth)
            .attr("class", enablePerformanceMode ? "static-element" : "");

          // House number
          if (showHouseNumbers) {
            const labelAngle =
              (house.cusp +
                (chartData.houses[(index + 1) % 12].cusp - house.cusp) / 2 -
                90) *
              (Math.PI / 180);
            const labelX = Math.cos(labelAngle) * (radius * 0.5);
            const labelY = Math.sin(labelAngle) * (radius * 0.5);

            const houseText = mainGroup
              .append("text")
              .attr("x", labelX)
              .attr("y", labelY)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("fill", currentTheme.colors.secondary)
              .attr("font-size", `${isMobile ? 12 : 14}px`)
              .attr("font-weight", "bold")
              .attr("class", "dynamic-element house-label")
              .text(house.house.toString())
              .style("cursor", "pointer")
              .attr("role", "button")
              .attr(
                "aria-label",
                `${house.house}${getOrdinalSuffix(house.house)} house in ${house.sign}`,
              )
              .attr("tabindex", "0")
              .on("click", () => {
                setSelectedHouse(house);
                onHouseClick?.(house);
              })
              .on("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedHouse(house);
                  onHouseClick?.(house);
                }
              })
              .on("mouseover", function (event) {
                if (showAdvancedTooltips) {
                  setHoveredElement({ type: "house", data: house });
                }
                d3.select(this)
                  .attr("font-weight", "bold")
                  .attr("font-size", `${(isMobile ? 12 : 14) + 2}px`);
              })
              .on("mouseout", function () {
                setHoveredElement(null);
                d3.select(this)
                  .attr("font-weight", "bold")
                  .attr("font-size", `${isMobile ? 12 : 14}px`);
              })
              .on("focus", function () {
                d3.select(this)
                  .attr("font-weight", "bold")
                  .attr("font-size", `${(isMobile ? 12 : 14) + 2}px`);
              })
              .on("blur", function () {
                d3.select(this)
                  .attr("font-weight", "bold")
                  .attr("font-size", `${isMobile ? 12 : 14}px`);
              });
          }
        });

        // Draw aspects
        if (showAspects) {
          chartData.aspects.forEach((aspect) => {
            const planet1 = chartData.planets.find(
              (p) => p.name === aspect.planet1,
            );
            const planet2 = chartData.planets.find(
              (p) => p.name === aspect.planet2,
            );

            if (planet1 && planet2) {
              const angle1 = (planet1.longitude - 90) * (Math.PI / 180);
              const angle2 = (planet2.longitude - 90) * (Math.PI / 180);

              const x1 = Math.cos(angle1) * (radius * 0.6);
              const y1 = Math.sin(angle1) * (radius * 0.6);
              const x2 = Math.cos(angle2) * (radius * 0.6);
              const y2 = Math.sin(angle2) * (radius * 0.6);

              const aspectColors: { [key: string]: string } = {
                conjunction: "#FF0000",
                opposition: "#FF4500",
                trine: "#00FF00",
                square: "#FF0000",
                sextile: "#0000FF",
                quincunx: "#800080",
              };

              const aspectLine = mainGroup
                .append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("stroke", aspectColors[aspect.aspect] || "#666")
                .attr("stroke-width", aspect.exact ? 2 : 1)
                .attr("stroke-dasharray", aspect.exact ? "none" : "3,3")
                .attr("opacity", enablePerformanceMode ? 0.4 : 0.6)
                .attr("class", "dynamic-element aspect-line");

              // Add orb indicators for premium users
              if (chartSettings.showAspectOrbs && isPremiumUser && aspect.orb) {
                const orbRadius = Math.abs(aspect.orb) * 2; // Scale orb for visualization
                mainGroup
                  .append("circle")
                  .attr("cx", (x1 + x2) / 2)
                  .attr("cy", (y1 + y2) / 2)
                  .attr("r", orbRadius)
                  .attr("fill", "none")
                  .attr("stroke", aspectColors[aspect.aspect] || "#666")
                  .attr("stroke-width", 0.5)
                  .attr("stroke-dasharray", "2,2")
                  .attr("opacity", 0.3)
                  .attr("class", "dynamic-element orb-indicator");
              }
            }
          });
        }

        // Draw planets
        chartData.planets.forEach((planet) => {
          const angle = (planet.longitude - 90) * (Math.PI / 180);
          const x = Math.cos(angle) * (radius * 0.9);
          const y = Math.sin(angle) * (radius * 0.9);

          // Planet circle background with enhanced interactions
          const planetCircle = mainGroup
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", planetRadius)
            .attr("fill", planetColors[planet.name] || "#FFF")
            .attr(
              "stroke",
              selectedPlanet?.name === planet.name
                ? currentTheme.colors.accent
                : currentTheme.colors.text,
            )
            .attr("stroke-width", selectedPlanet?.name === planet.name ? 3 : 1)
            .attr("class", "dynamic-element planet-circle")
            .style("cursor", "pointer")
            .attr("role", "button")
            .attr(
              "aria-label",
              `${planet.name} at ${planet.degree}° ${planet.sign}${planet.house ? ` in ${planet.house}${getOrdinalSuffix(planet.house)} house` : ""}`,
            )
            .attr("tabindex", "0")
            .on("click", () => {
              setSelectedPlanet(planet);
              onPlanetClick?.(planet);
            })
            .on("keydown", function (event) {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedPlanet(planet);
                onPlanetClick?.(planet);
              }
            })
            .on("mouseover", function (event) {
              if (showAdvancedTooltips) {
                setHoveredElement({ type: "planet", data: planet });
              }
              d3.select(this)
                .transition()
                .duration(200 / chartSettings.animationSpeed)
                .attr("r", planetRadius + 3);
            })
            .on("mouseout", function () {
              setHoveredElement(null);
              d3.select(this)
                .transition()
                .duration(200 / chartSettings.animationSpeed)
                .attr("r", planetRadius);
            })
            .on("focus", function () {
              d3.select(this)
                .attr("r", planetRadius + 3)
                .attr("stroke-width", 3);
            })
            .on("blur", function () {
              d3.select(this)
                .attr("r", planetRadius)
                .attr(
                  "stroke-width",
                  selectedPlanet?.name === planet.name ? 3 : 1,
                );
            });

          // Add retrograde indicator
          if (chartSettings.showRetrogradePlanets && planet.speed < 0) {
            mainGroup
              .append("text")
              .attr("x", x + planetRadius + 5)
              .attr("y", y - planetRadius - 5)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("fill", "#ff6b6b")
              .attr("font-size", "8px")
              .attr("font-weight", "bold")
              .attr("class", "dynamic-element retrograde-indicator")
              .text("R");
          }

          // Planet symbol
          mainGroup
            .append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr(
              "fill",
              currentTheme.colors.background === "#ffffff" ? "#000" : "#fff",
            )
            .attr("font-size", `${isMobile ? 12 : 16}px`)
            .attr("font-weight", "bold")
            .attr("class", "dynamic-element planet-symbol")
            .text(planetSymbols[planet.name] || planet.name.charAt(0))
            .style("pointer-events", "none");

          // Planet degree text with optional degree markers
          if (chartSettings.showDegreeMarkers) {
            const degreeX = Math.cos(angle) * (radius * 1.05);
            const degreeY = Math.sin(angle) * (radius * 1.05);

            mainGroup
              .append("text")
              .attr("x", degreeX)
              .attr("y", degreeY)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("fill", currentTheme.colors.secondary)
              .attr("font-size", `${isMobile ? 8 : 10}px`)
              .attr("class", "dynamic-element degree-marker")
              .text(`${planet.degree}°${planet.sign.substring(0, 3)}`);
          }
        });

        setIsLoading(false);
      });
    }, [
      chartData,
      chartCalculations,
      showAspects,
      showHouseNumbers,
      zoomLevel,
      rotation,
      selectedPlanet,
      selectedHouse,
      currentTheme,
      chartSettings,
      enablePerformanceMode,
      showAdvancedTooltips,
      isPremiumUser,
      isMobile,
      planetColors,
      onPlanetClick,
      onHouseClick,
    ]);

    // Memoized event handlers
    const handleZoomIn = useCallback(
      () => setZoomLevel((prev) => Math.min(prev + 0.2, 3)),
      [],
    );
    const handleZoomOut = useCallback(
      () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.5)),
      [],
    );
    const handleRotate = useCallback(
      () => setRotation((prev) => (prev + 90) % 360),
      [],
    );
    const handleReset = useCallback(() => {
      setZoomLevel(1);
      setRotation(0);
      setSelectedPlanet(null);
      setSelectedHouse(null);
    }, []);
    const toggleLightMode = useCallback(
      () => setCurrentLightMode(!currentLightMode),
      [],
    );
    const toggleFullscreen = useCallback(
      () => setIsFullscreen(!isFullscreen),
      [isFullscreen],
    );
    const toggleSettings = useCallback(
      () => setShowSettings(!showSettings),
      [showSettings],
    );

    const handleExport = async () => {
      if (!svgRef.current) return;

      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(svgRef.current.parentElement!, {
          backgroundColor: currentLightMode ? "#ffffff" : "#1a1a1a",
          scale: 2,
          useCORS: true,
        });

        addImageWatermark(canvas, {
          userName,
          birthDate,
          reportType: "Birth Chart",
        });

        const link = document.createElement("a");
        link.download = `birth-chart-${userName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
      } catch (error) {
        console.error("Export failed:", error);
        // Fallback to SVG export
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const watermarkText = `Generated for ${userName} ${birthDate ? "(" + new Date(birthDate).toLocaleDateString() + ")" : ""} at mysticbanana.com`;
        const watermarkedSvg = svgData.replace(
          "</svg>",
          `<text x="50%" y="95%" text-anchor="middle" fill="rgba(128,128,128,0.7)" font-size="12">${watermarkText}</text></svg>`,
        );
        const blob = new Blob([watermarkedSvg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `birth-chart-${userName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    };

    const handleExportPDF = async () => {
      if (!svgRef.current?.parentElement) return;

      try {
        const filename = `birth-chart-${userName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
        await generatePDFWithWatermark(svgRef.current.parentElement, filename, {
          userName,
          birthDate,
          reportType: "Birth Chart",
        });
      } catch (error) {
        console.error("PDF export failed:", error);
        handleExport();
      }
    };

    useEffect(() => {
      drawChart();
    }, [drawChart]);

    // Cleanup animation frame on unmount
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const handleExportEvent = () => handleExport();
      window.addEventListener("exportChart", handleExportEvent);
      return () => window.removeEventListener("exportChart", handleExportEvent);
    }, []);

    return (
      <div
        ref={containerRef}
        className={`${currentLightMode ? "bg-white" : "bg-dark-800"} rounded-2xl p-${isMobile ? 4 : 6} border ${currentLightMode ? "border-gray-200" : "border-dark-700"}`}
      >
        {/* Enhanced Chart Header */}
        <div className="mb-6">
          <div
            className={`flex ${isMobile ? "flex-col space-y-2" : "items-center justify-between"} mb-4`}
          >
            <div>
              <h3
                className={`${isMobile ? "text-xl" : "text-2xl"} font-serif font-bold ${currentLightMode ? "text-gray-900" : "text-white"}`}
              >
                {userName}'s Birth Chart
              </h3>
              {birthDate && (
                <p
                  className={`text-sm ${currentLightMode ? "text-gray-600" : "text-gray-400"} mt-1`}
                >
                  Born:{" "}
                  {new Date(birthDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
            <div
              className={`flex items-center ${isMobile ? "flex-wrap gap-1" : "space-x-2"}`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLightMode}
                className="p-2"
                title="Toggle Light/Dark Mode"
              >
                <Palette className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSettings}
                className="p-2"
                title="Chart Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="p-2"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="p-2"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="p-2"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="p-2"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="p-2"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                icon={Download}
              >
                Export PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                icon={Download}
                className="bg-red-600 hover:bg-red-700"
              >
                Download PDF
              </Button>
            </div>
          </div>

          {/* Enhanced Chart Settings */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-4 rounded-lg border ${currentLightMode ? "bg-gray-50 border-gray-200" : "bg-dark-700 border-dark-600"}`}
              >
                <h4
                  className={`text-sm font-medium mb-3 ${currentLightMode ? "text-gray-900" : "text-white"}`}
                >
                  Chart Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={chartSettings.showDegreeMarkers}
                      onChange={(e) =>
                        setChartSettings((prev) => ({
                          ...prev,
                          showDegreeMarkers: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <span
                      className={`text-sm ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                    >
                      Show Degree Markers
                    </span>
                  </label>
                  {isPremiumUser && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={chartSettings.showAspectOrbs}
                        onChange={(e) =>
                          setChartSettings((prev) => ({
                            ...prev,
                            showAspectOrbs: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span
                        className={`text-sm ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                      >
                        Show Aspect Orbs
                      </span>
                    </label>
                  )}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={chartSettings.showRetrogradePlanets}
                      onChange={(e) =>
                        setChartSettings((prev) => ({
                          ...prev,
                          showRetrogradePlanets: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <span
                      className={`text-sm ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                    >
                      Show Retrograde Indicators
                    </span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                    >
                      Animation Speed:
                    </span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={chartSettings.animationSpeed}
                      onChange={(e) =>
                        setChartSettings((prev) => ({
                          ...prev,
                          animationSpeed: parseFloat(e.target.value),
                        }))
                      }
                      className="flex-1"
                    />
                    <span
                      className={`text-xs ${currentLightMode ? "text-gray-600" : "text-gray-400"}`}
                    >
                      {chartSettings.animationSpeed}x
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced Tooltip */}
        <AnimatePresence>
          {hoveredElement && showAdvancedTooltips && (
            <AdvancedTooltip
              element={hoveredElement}
              containerRef={containerRef}
            />
          )}
        </AnimatePresence>

        {/* Chart Container */}
        <div
          className={`flex ${isMobile ? "flex-col" : "flex-col lg:flex-row"} gap-6 ${isFullscreen ? "fixed inset-0 z-50 bg-dark-900 p-4" : ""}`}
        >
          {/* SVG Chart */}
          <div className="flex-1 flex justify-center">
            {isLoading && (
              <div
                className="flex items-center justify-center"
                style={{
                  width: containerSize.width,
                  height: containerSize.height,
                }}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            )}
            <svg
              ref={svgRef}
              width={containerSize.width}
              height={containerSize.height}
              className={`${currentLightMode ? "bg-white border-gray-300" : "bg-dark-900 border-dark-600"} rounded-lg border ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
              role="img"
              aria-label={`Birth chart for ${userName}${birthDate ? ` born on ${new Date(birthDate).toLocaleDateString()}` : ""}`}
              aria-describedby="chart-description"
            />
            <div id="chart-description" className="sr-only">
              Interactive astrological birth chart showing planetary positions
              in zodiac signs and houses. Use tab to navigate between planets
              and houses, press Enter or Space to select elements for detailed
              information.
            </div>
          </div>

          {/* Info Panel */}
          <div className={`${isMobile ? "w-full" : "lg:w-80"} space-y-4`}>
            {/* Natal Summary Table */}
            {showNatalSummary && (
              <div
                className={`${currentLightMode ? "bg-gray-50" : "bg-dark-700"} rounded-lg p-4 border ${currentLightMode ? "border-gray-200" : "border-dark-600"}`}
              >
                <h4
                  className={`text-lg font-semibold ${currentLightMode ? "text-gray-900" : "text-white"} mb-3 flex items-center`}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Natal Summary
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={`border-b ${currentLightMode ? "border-gray-200" : "border-dark-600"}`}
                      >
                        <th
                          className={`text-left py-2 ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                        >
                          Planet
                        </th>
                        <th
                          className={`text-left py-2 ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                        >
                          Sign
                        </th>
                        <th
                          className={`text-left py-2 ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                        >
                          House
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.planets.slice(0, 10).map((planet, index) => (
                        <tr
                          key={planet.name}
                          className={`${index % 2 === 0 ? (currentLightMode ? "bg-gray-25" : "bg-dark-750") : ""}`}
                        >
                          <td
                            className={`py-2 font-medium ${currentLightMode ? "text-gray-900" : "text-white"}`}
                          >
                            <div className="flex items-center">
                              <span
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    planetColors[planet.name] || "#FFF",
                                }}
                              ></span>
                              {planet.name}
                            </div>
                          </td>
                          <td
                            className={`py-2 ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                          >
                            <div className="flex items-center">
                              <span className="mr-1">
                                {zodiacSymbols[planet.sign]}
                              </span>
                              {planet.sign}
                            </div>
                          </td>
                          <td
                            className={`py-2 ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                          >
                            {planet.house
                              ? `${planet.house}${getOrdinalSuffix(planet.house)}`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Rest of the component remains the same but with currentLightMode instead of lightMode */}
            {/* ... (continuing with the same pattern for other sections) */}

            {selectedPlanet && (
              <div
                className={`${currentLightMode ? "bg-gray-50" : "bg-dark-700"} rounded-lg p-4 border ${currentLightMode ? "border-gray-200" : "border-dark-600"}`}
              >
                <h4
                  className={`text-lg font-semibold ${currentLightMode ? "text-gray-900" : "text-white"} mb-2 flex items-center`}
                >
                  <span className="text-2xl mr-2">
                    {planetSymbols[selectedPlanet.name]}
                  </span>
                  {selectedPlanet.name}
                </h4>
                <div
                  className={`space-y-2 text-sm ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                >
                  <p>
                    <strong>Position:</strong> {selectedPlanet.degree}°
                    {selectedPlanet.minute}'{selectedPlanet.second}"{" "}
                    {selectedPlanet.sign}
                  </p>
                  <p>
                    <strong>House:</strong>{" "}
                    {selectedPlanet.house
                      ? `${selectedPlanet.house}${getOrdinalSuffix(selectedPlanet.house)} House`
                      : "Unknown"}
                  </p>
                  <p>
                    <strong>Longitude:</strong>{" "}
                    {selectedPlanet.longitude.toFixed(2)}°
                  </p>
                  {selectedPlanet.speed < 0 && (
                    <p className="text-purple-400 font-medium">
                      <strong>Retrograde</strong> - Introspective energy
                    </p>
                  )}
                  {/* Enhanced Interpretations */}
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-500/20">
                    <p className="text-xs font-medium text-purple-300 mb-1">
                      Astrological Meaning:
                    </p>
                    <p className="text-xs">
                      {getPlanetInterpretation(selectedPlanet)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedHouse && (
              <div
                className={`${currentLightMode ? "bg-gray-50" : "bg-dark-700"} rounded-lg p-4 border ${currentLightMode ? "border-gray-200" : "border-dark-600"}`}
              >
                <h4
                  className={`text-lg font-semibold ${currentLightMode ? "text-gray-900" : "text-white"} mb-2`}
                >
                  {selectedHouse.house}
                  {getOrdinalSuffix(selectedHouse.house)} House
                </h4>
                <div
                  className={`space-y-2 text-sm ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                >
                  <p>
                    <strong>Cusp:</strong> {selectedHouse.degree}°{" "}
                    {selectedHouse.sign}
                  </p>
                  <p>
                    <strong>Sign:</strong> {selectedHouse.sign}
                  </p>
                  <p
                    className={`text-xs ${currentLightMode ? "text-gray-600" : "text-gray-400"} mt-2`}
                  >
                    {getHouseDescription(selectedHouse.house)}
                  </p>
                  {/* Enhanced House Interpretations */}
                  <div className="mt-3 p-3 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg border border-amber-500/20">
                    <p className="text-xs font-medium text-amber-300 mb-1">
                      Life Area Focus:
                    </p>
                    <p className="text-xs">
                      {getDetailedHouseInterpretation(
                        selectedHouse.house,
                        selectedHouse.sign,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chart Legend */}
            {showAspectLegend && (
              <div
                className={`${currentLightMode ? "bg-gray-50" : "bg-dark-700"} rounded-lg p-4 border ${currentLightMode ? "border-gray-200" : "border-dark-600"}`}
              >
                <h4
                  className={`text-lg font-semibold ${currentLightMode ? "text-gray-900" : "text-white"} mb-3 flex items-center`}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Chart Legend
                </h4>
                <div className="space-y-3">
                  <div>
                    <h5
                      className={`text-sm font-medium ${currentLightMode ? "text-gray-900" : "text-white"} mb-2`}
                    >
                      Planets
                    </h5>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(planetColors).map(([planet, color]) => (
                        <div key={planet} className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: color }}
                          ></div>
                          <span
                            className={
                              currentLightMode
                                ? "text-gray-700"
                                : "text-gray-300"
                            }
                          >
                            {planet}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5
                      className={`text-sm font-medium ${currentLightMode ? "text-gray-900" : "text-white"} mb-2`}
                    >
                      Aspects
                    </h5>
                    <div
                      className={`space-y-1 text-xs ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-0.5 bg-red-500 mr-2"></div>
                          <span>Conjunction/Square</span>
                        </div>
                        <span className="text-xs opacity-75">Intense</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
                          <span>Trine</span>
                        </div>
                        <span className="text-xs opacity-75">Harmonious</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
                          <span>Sextile</span>
                        </div>
                        <span className="text-xs opacity-75">Supportive</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-0.5 bg-orange-500 mr-2"></div>
                          <span>Opposition</span>
                        </div>
                        <span className="text-xs opacity-75">Tension</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-xs ${currentLightMode ? "text-gray-600" : "text-gray-400"} pt-2 border-t ${currentLightMode ? "border-gray-200" : "border-dark-600"}`}
                  >
                    <p>• Click planets/houses for details</p>
                    <p>• Use zoom/rotate controls</p>
                    <p>• Toggle light/dark mode</p>
                    <p>• Export chart as image or PDF</p>
                    {showPremiumFeatures && (
                      <p>• Toggle premium features above</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

// Advanced Tooltip Component
const AdvancedTooltip: React.FC<{
  element: { type: "planet" | "house"; data: any };
  containerRef: React.RefObject<HTMLDivElement>;
}> = memo(({ element, containerRef }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          x: e.clientX - rect.left + 10,
          y: e.clientY - rect.top - 10,
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [containerRef]);

  const getTooltipContent = () => {
    if (element.type === "planet") {
      const planet = element.data;
      return (
        <div className="space-y-2">
          <div className="font-semibold text-white">{planet.name}</div>
          <div className="text-sm text-gray-300">
            <div>
              Position: {planet.degree}°{planet.minute}'{planet.second}"{" "}
              {planet.sign}
            </div>
            <div>
              House:{" "}
              {planet.house
                ? `${planet.house}${getOrdinalSuffix(planet.house)}`
                : "Unknown"}
            </div>
            <div>Longitude: {planet.longitude.toFixed(2)}°</div>
            {planet.speed < 0 && <div className="text-red-400">Retrograde</div>}
          </div>
        </div>
      );
    } else {
      const house = element.data;
      return (
        <div className="space-y-2">
          <div className="font-semibold text-white">
            {house.house}
            {getOrdinalSuffix(house.house)} House
          </div>
          <div className="text-sm text-gray-300">
            <div>
              Cusp: {house.degree}° {house.sign}
            </div>
            <div>Sign: {house.sign}</div>
          </div>
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute z-50 bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        maxWidth: "250px",
      }}
    >
      {getTooltipContent()}
    </motion.div>
  );
});

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function getHouseDescription(houseNumber: number): string {
  const descriptions = {
    1: "Self, identity, appearance, first impressions",
    2: "Money, possessions, values, self-worth",
    3: "Communication, siblings, short trips, learning",
    4: "Home, family, roots, emotional foundation",
    5: "Creativity, romance, children, self-expression",
    6: "Work, health, daily routines, service",
    7: "Partnerships, marriage, open enemies, cooperation",
    8: "Transformation, shared resources, mysteries, death/rebirth",
    9: "Philosophy, higher learning, travel, spirituality",
    10: "Career, reputation, public image, authority",
    11: "Friends, groups, hopes, dreams, social causes",
    12: "Subconscious, spirituality, hidden enemies, sacrifice",
  };
  return descriptions[houseNumber] || "House of life experiences";
}

function getPlanetInterpretation(planet: PlanetaryPosition): string {
  const interpretations = {
    Sun: `Your Sun in ${planet.sign} represents your core identity and life purpose. This placement emphasizes ${getSignTraits(planet.sign)} qualities in your personality.`,
    Moon: `Your Moon in ${planet.sign} reveals your emotional nature and instinctive responses. You find comfort through ${getSignEmotionalNeeds(planet.sign)}.`,
    Mercury: `Mercury in ${planet.sign} influences how you communicate and process information. Your thinking style is ${getSignCommunicationStyle(planet.sign)}.`,
    Venus: `Venus in ${planet.sign} shapes your approach to love, beauty, and relationships. You're attracted to ${getSignVenusTraits(planet.sign)}.`,
    Mars: `Mars in ${planet.sign} drives your energy and ambition. You take action through ${getSignMarsExpression(planet.sign)}.`,
    Jupiter: `Jupiter in ${planet.sign} expands your worldview and brings opportunities through ${getSignJupiterGifts(planet.sign)}.`,
    Saturn: `Saturn in ${planet.sign} teaches important life lessons about ${getSignSaturnLessons(planet.sign)}.`,
    Uranus: `Uranus in ${planet.sign} brings innovation and change to areas related to ${getSignUranusRevolution(planet.sign)}.`,
    Neptune: `Neptune in ${planet.sign} influences your dreams and spirituality through ${getSignNeptuneInspiration(planet.sign)}.`,
    Pluto: `Pluto in ${planet.sign} transforms you through deep experiences related to ${getSignPlutoTransformation(planet.sign)}.`,
  };
  return (
    interpretations[planet.name] ||
    `${planet.name} in ${planet.sign} brings unique influences to your chart.`
  );
}

function getDetailedHouseInterpretation(
  houseNumber: number,
  sign: string,
): string {
  const houseThemes = {
    1: `Your ${sign} Ascendant shapes how others see you and your approach to new situations. This gives you a ${getSignApproach(sign)} demeanor.`,
    2: `With ${sign} on your 2nd house cusp, you approach money and values with ${getSignResourceStyle(sign)} energy.`,
    3: `${sign} on your 3rd house brings ${getSignCommunicationFocus(sign)} to your daily communications and learning style.`,
    4: `Your 4th house in ${sign} indicates a home environment that feels ${getSignHomeStyle(sign)}.`,
    5: `${sign} on your 5th house cusp brings ${getSignCreativeExpression(sign)} to your creative and romantic life.`,
    6: `With ${sign} ruling your 6th house, your work style is ${getSignWorkStyle(sign)}.`,
    7: `${sign} on your 7th house cusp attracts partners who are ${getSignPartnerTraits(sign)}.`,
    8: `Your 8th house in ${sign} transforms you through ${getSignTransformationStyle(sign)} experiences.`,
    9: `${sign} on your 9th house expands your worldview through ${getSignPhilosophyStyle(sign)} pursuits.`,
    10: `With ${sign} on your Midheaven, your career path involves ${getSignCareerStyle(sign)} roles.`,
    11: `${sign} on your 11th house brings ${getSignFriendshipStyle(sign)} to your social connections.`,
    12: `Your 12th house in ${sign} connects you to the spiritual through ${getSignSpiritualStyle(sign)} practices.`,
  };
  return (
    houseThemes[houseNumber] ||
    `This house placement brings ${sign} energy to this life area.`
  );
}

// Helper functions for sign interpretations
function getSignTraits(sign: string): string {
  const traits = {
    Aries: "pioneering, energetic, and leadership-oriented",
    Taurus: "stable, practical, and sensual",
    Gemini: "curious, communicative, and adaptable",
    Cancer: "nurturing, intuitive, and protective",
    Leo: "creative, confident, and generous",
    Virgo: "analytical, helpful, and detail-oriented",
    Libra: "harmonious, diplomatic, and aesthetic",
    Scorpio: "intense, transformative, and perceptive",
    Sagittarius: "adventurous, philosophical, and optimistic",
    Capricorn: "ambitious, disciplined, and responsible",
    Aquarius: "innovative, humanitarian, and independent",
    Pisces: "compassionate, intuitive, and artistic",
  };
  return traits[sign] || "unique";
}

function getSignEmotionalNeeds(sign: string): string {
  const needs = {
    Aries: "excitement and new challenges",
    Taurus: "stability and physical comfort",
    Gemini: "mental stimulation and variety",
    Cancer: "emotional security and family connection",
    Leo: "appreciation and creative expression",
    Virgo: "order and meaningful service",
    Libra: "harmony and beautiful surroundings",
    Scorpio: "deep emotional connections and transformation",
    Sagittarius: "freedom and philosophical exploration",
    Capricorn: "achievement and respect",
    Aquarius: "independence and humanitarian causes",
    Pisces: "spiritual connection and artistic expression",
  };
  return needs[sign] || "authentic self-expression";
}

function getSignCommunicationStyle(sign: string): string {
  const styles = {
    Aries: "direct and enthusiastic",
    Taurus: "practical and deliberate",
    Gemini: "quick and versatile",
    Cancer: "intuitive and emotionally aware",
    Leo: "dramatic and confident",
    Virgo: "precise and analytical",
    Libra: "diplomatic and balanced",
    Scorpio: "intense and probing",
    Sagittarius: "philosophical and expansive",
    Capricorn: "structured and authoritative",
    Aquarius: "innovative and detached",
    Pisces: "imaginative and empathetic",
  };
  return styles[sign] || "unique";
}

function getSignVenusTraits(sign: string): string {
  const traits = {
    Aries: "passion and excitement in relationships",
    Taurus: "stability and sensual pleasures",
    Gemini: "intellectual connection and variety",
    Cancer: "emotional depth and nurturing care",
    Leo: "romance and grand gestures",
    Virgo: "practical devotion and attention to detail",
    Libra: "harmony and aesthetic beauty",
    Scorpio: "intensity and emotional transformation",
    Sagittarius: "adventure and philosophical connection",
    Capricorn: "commitment and traditional values",
    Aquarius: "friendship and intellectual freedom",
    Pisces: "spiritual connection and romantic idealism",
  };
  return traits[sign] || "authentic connections";
}

function getSignMarsExpression(sign: string): string {
  const expressions = {
    Aries: "direct action and competitive spirit",
    Taurus: "steady persistence and practical goals",
    Gemini: "mental agility and diverse interests",
    Cancer: "protective instincts and emotional motivation",
    Leo: "creative confidence and dramatic flair",
    Virgo: "methodical planning and helpful service",
    Libra: "diplomatic strategy and collaborative effort",
    Scorpio: "intense focus and transformative power",
    Sagittarius: "adventurous exploration and philosophical action",
    Capricorn: "disciplined ambition and strategic planning",
    Aquarius: "innovative rebellion and humanitarian action",
    Pisces: "intuitive flow and compassionate service",
  };
  return expressions[sign] || "determined effort";
}

function getSignJupiterGifts(sign: string): string {
  const gifts = {
    Aries: "leadership opportunities and pioneering ventures",
    Taurus: "material abundance and practical wisdom",
    Gemini: "learning opportunities and communication skills",
    Cancer: "family blessings and emotional wisdom",
    Leo: "creative recognition and generous spirit",
    Virgo: "service opportunities and analytical skills",
    Libra: "partnership harmony and aesthetic appreciation",
    Scorpio: "transformative experiences and psychological insight",
    Sagittarius: "travel opportunities and philosophical growth",
    Capricorn: "career advancement and structural wisdom",
    Aquarius: "innovative ideas and humanitarian connections",
    Pisces: "spiritual insights and artistic inspiration",
  };
  return gifts[sign] || "expanded awareness";
}

function getSignSaturnLessons(sign: string): string {
  const lessons = {
    Aries: "patience and thoughtful action",
    Taurus: "flexibility and letting go of material attachment",
    Gemini: "focus and deep communication",
    Cancer: "emotional boundaries and self-nurturing",
    Leo: "humility and authentic self-expression",
    Virgo: "accepting imperfection and self-compassion",
    Libra: "independence and authentic relationships",
    Scorpio: "trust and healthy transformation",
    Sagittarius: "commitment and practical wisdom",
    Capricorn: "emotional expression and work-life balance",
    Aquarius: "personal connection and emotional intimacy",
    Pisces: "boundaries and practical manifestation",
  };
  return lessons[sign] || "personal growth";
}

function getSignUranusRevolution(sign: string): string {
  return `${sign.toLowerCase()} themes and revolutionary change`;
}

function getSignNeptuneInspiration(sign: string): string {
  return `${sign.toLowerCase()}-themed dreams and spiritual insights`;
}

function getSignPlutoTransformation(sign: string): string {
  return `${sign.toLowerCase()} themes and deep psychological change`;
}

function getSignApproach(sign: string): string {
  const approaches = {
    Aries: "bold and energetic",
    Taurus: "calm and reliable",
    Gemini: "curious and adaptable",
    Cancer: "gentle and protective",
    Leo: "confident and warm",
    Virgo: "helpful and precise",
    Libra: "charming and diplomatic",
    Scorpio: "magnetic and intense",
    Sagittarius: "optimistic and adventurous",
    Capricorn: "professional and responsible",
    Aquarius: "unique and friendly",
    Pisces: "compassionate and intuitive",
  };
  return approaches[sign] || "distinctive";
}

function getSignResourceStyle(sign: string): string {
  return `${getSignTraits(sign)}`;
}

function getSignCommunicationFocus(sign: string): string {
  return `${getSignCommunicationStyle(sign)} energy`;
}

function getSignHomeStyle(sign: string): string {
  const styles = {
    Aries: "energetic and action-oriented",
    Taurus: "comfortable and stable",
    Gemini: "stimulating and varied",
    Cancer: "nurturing and secure",
    Leo: "warm and creative",
    Virgo: "organized and practical",
    Libra: "harmonious and beautiful",
    Scorpio: "private and transformative",
    Sagittarius: "open and adventurous",
    Capricorn: "structured and traditional",
    Aquarius: "unique and progressive",
    Pisces: "peaceful and spiritual",
  };
  return styles[sign] || "distinctive";
}

function getSignCreativeExpression(sign: string): string {
  return `${getSignTraits(sign)} creativity`;
}

function getSignWorkStyle(sign: string): string {
  return `${getSignTraits(sign)} and methodical`;
}

function getSignPartnerTraits(sign: string): string {
  return getSignTraits(sign);
}

function getSignTransformationStyle(sign: string): string {
  return `${getSignTraits(sign)} transformation`;
}

function getSignPhilosophyStyle(sign: string): string {
  return `${getSignTraits(sign)} learning`;
}

function getSignCareerStyle(sign: string): string {
  return `${getSignTraits(sign)} leadership`;
}

function getSignFriendshipStyle(sign: string): string {
  return `${getSignTraits(sign)} connections`;
}

function getSignSpiritualStyle(sign: string): string {
  return `${getSignTraits(sign)} spiritual practices`;
}

export default InteractiveChart;
