import React, { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import Button from "../ui/Button";
import {
  generatePDFWithWatermark,
  addImageWatermark,
} from "../../utils/pdfGenerator";

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
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
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

  // Planet colors
  const planetColors: { [key: string]: string } = {
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
  };

  const drawChart = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // Set background color based on mode
    svg.style("background-color", currentLightMode ? "#ffffff" : "#1a1a1a");

    // Create main group with zoom and rotation
    const mainGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${centerX}, ${centerY}) scale(${zoomLevel}) rotate(${rotation})`,
      );

    // Draw outer circle
    mainGroup
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", currentLightMode ? "#4A148C" : "#FFD700")
      .attr("stroke-width", 3);

    // Draw inner circle
    mainGroup
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius * 0.7)
      .attr("fill", "none")
      .attr("stroke", currentLightMode ? "#888" : "#666")
      .attr("stroke-width", 1);

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
        .attr("fill", currentLightMode ? "#B8860B" : "#FFD700")
        .attr("font-size", "20px")
        .attr("font-family", "serif")
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
        .attr("stroke", currentLightMode ? "#ccc" : "#444")
        .attr("stroke-width", 1);
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
        .attr("stroke", currentLightMode ? "#666" : "#888")
        .attr("stroke-width", 2);

      // House number
      if (showHouseNumbers) {
        const labelAngle =
          (house.cusp +
            (chartData.houses[(index + 1) % 12].cusp - house.cusp) / 2 -
            90) *
          (Math.PI / 180);
        const labelX = Math.cos(labelAngle) * (radius * 0.5);
        const labelY = Math.sin(labelAngle) * (radius * 0.5);

        mainGroup
          .append("text")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", currentLightMode ? "#666" : "#888")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(house.house.toString())
          .style("cursor", "pointer")
          .on("click", () => {
            setSelectedHouse(house);
            onHouseClick?.(house);
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

          mainGroup
            .append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", aspectColors[aspect.aspect] || "#666")
            .attr("stroke-width", aspect.exact ? 2 : 1)
            .attr("stroke-dasharray", aspect.exact ? "none" : "3,3")
            .attr("opacity", 0.6);
        }
      });
    }

    // Draw planets
    chartData.planets.forEach((planet) => {
      const angle = (planet.longitude - 90) * (Math.PI / 180);
      const x = Math.cos(angle) * (radius * 0.9);
      const y = Math.sin(angle) * (radius * 0.9);

      // Planet circle background
      mainGroup
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 15)
        .attr("fill", planetColors[planet.name] || "#FFF")
        .attr(
          "stroke",
          selectedPlanet?.name === planet.name
            ? "#FFD700"
            : currentLightMode
              ? "#333"
              : "#000",
        )
        .attr("stroke-width", selectedPlanet?.name === planet.name ? 3 : 1)
        .style("cursor", "pointer")
        .on("click", () => {
          setSelectedPlanet(planet);
          onPlanetClick?.(planet);
        })
        .on("mouseover", function () {
          d3.select(this).attr("r", 18);
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", 15);
        });

      // Planet symbol
      mainGroup
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", currentLightMode ? "#fff" : "#000")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(planetSymbols[planet.name] || planet.name.charAt(0))
        .style("pointer-events", "none");

      // Planet degree text
      const degreeX = Math.cos(angle) * (radius * 1.05);
      const degreeY = Math.sin(angle) * (radius * 1.05);

      mainGroup
        .append("text")
        .attr("x", degreeX)
        .attr("y", degreeY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", currentLightMode ? "#666" : "#CCC")
        .attr("font-size", "10px")
        .text(`${planet.degree}°${planet.sign.substring(0, 3)}`);
    });
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    setSelectedPlanet(null);
    setSelectedHouse(null);
  };
  const toggleLightMode = () => setCurrentLightMode(!currentLightMode);

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
  }, [
    chartData,
    width,
    height,
    showAspects,
    showHouseNumbers,
    zoomLevel,
    rotation,
    selectedPlanet,
    selectedHouse,
    currentLightMode,
  ]);

  useEffect(() => {
    const handleExportEvent = () => handleExport();
    window.addEventListener("exportChart", handleExportEvent);
    return () => window.removeEventListener("exportChart", handleExportEvent);
  }, []);

  return (
    <div
      className={`${currentLightMode ? "bg-white" : "bg-dark-800"} rounded-2xl p-6 border ${currentLightMode ? "border-gray-200" : "border-dark-700"}`}
    >
      {/* Enhanced Chart Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className={`text-2xl font-serif font-bold ${currentLightMode ? "text-gray-900" : "text-white"}`}
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
          <div className="flex items-center space-x-2">
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

        {/* Chart Options */}
        {showPremiumFeatures && (
          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showElementalGrid}
                onChange={(e) => setShowElementalGrid(e.target.checked)}
                className="rounded"
              />
              <span
                className={`text-sm ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
              >
                Show Elemental Grid
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showAspectLegend}
                onChange={(e) => setShowAspectLegend(e.target.checked)}
                className="rounded"
              />
              <span
                className={`text-sm ${currentLightMode ? "text-gray-700" : "text-gray-300"}`}
              >
                Show Aspect Legend
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SVG Chart */}
        <div className="flex-1 flex justify-center">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className={`${currentLightMode ? "bg-white border-gray-300" : "bg-dark-900 border-dark-600"} rounded-lg border`}
          />
        </div>

        {/* Info Panel */}
        <div className="lg:w-80 space-y-4">
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
                            currentLightMode ? "text-gray-700" : "text-gray-300"
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
};

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

export default InteractiveChart;
