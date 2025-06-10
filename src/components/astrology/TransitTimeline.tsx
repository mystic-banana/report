import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  TrendingUp,
  Star,
  Circle,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";

interface TransitEvent {
  id: string;
  date: string;
  planet: string;
  aspect: string;
  natalPlanet: string;
  type: "conjunction" | "opposition" | "trine" | "square" | "sextile";
  significance: "high" | "medium" | "low";
  description: string;
  duration: number; // in days
  exactTime?: string;
}

interface TransitTimelineProps {
  birthChart: any;
  selectedDate: string;
  onDateChange: (date: string) => void;
  className?: string;
}

const TransitTimeline: React.FC<TransitTimelineProps> = ({
  birthChart,
  selectedDate,
  onDateChange,
  className = "",
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date(selectedDate));
  const [transitEvents, setTransitEvents] = useState<TransitEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TransitEvent | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  // Generate mock transit events for demonstration
  useEffect(() => {
    const generateTransitEvents = (): TransitEvent[] => {
      const events: TransitEvent[] = [];
      const startDate = new Date(selectedDate);

      // Generate events for the next 30 days
      for (let i = 0; i < 30; i++) {
        const eventDate = addDays(startDate, i);

        // Randomly generate 1-3 events per day
        const numEvents = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < numEvents; j++) {
          const planets = [
            "Sun",
            "Moon",
            "Mercury",
            "Venus",
            "Mars",
            "Jupiter",
            "Saturn",
          ];
          const aspects = [
            "conjunction",
            "opposition",
            "trine",
            "square",
            "sextile",
          ] as const;
          const natalPlanets = [
            "Sun",
            "Moon",
            "Mercury",
            "Venus",
            "Mars",
            "Jupiter",
            "Saturn",
            "Ascendant",
          ];

          const planet = planets[Math.floor(Math.random() * planets.length)];
          const aspect = aspects[Math.floor(Math.random() * aspects.length)];
          const natalPlanet =
            natalPlanets[Math.floor(Math.random() * natalPlanets.length)];

          const significance =
            Math.random() > 0.7
              ? "high"
              : Math.random() > 0.4
                ? "medium"
                : "low";

          events.push({
            id: `${eventDate.toISOString()}-${j}`,
            date: eventDate.toISOString().split("T")[0],
            planet,
            aspect,
            natalPlanet,
            type: aspect,
            significance,
            description: `${planet} ${aspect} natal ${natalPlanet} - ${getAspectDescription(aspect, planet, natalPlanet)}`,
            duration: Math.floor(Math.random() * 7) + 1,
            exactTime: `${Math.floor(Math.random() * 24)
              .toString()
              .padStart(2, "0")}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")}`,
          });
        }
      }

      return events.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    };

    setTransitEvents(generateTransitEvents());
  }, [selectedDate]);

  const getAspectDescription = (
    aspect: string,
    planet: string,
    natalPlanet: string,
  ): string => {
    const descriptions = {
      conjunction: "Powerful new beginnings and intensified energy",
      opposition: "Balance needed, potential for breakthrough",
      trine: "Harmonious flow and natural talents highlighted",
      square: "Challenges that promote growth and action",
      sextile: "Opportunities for positive development",
    };
    return descriptions[aspect] || "Significant planetary influence";
  };

  const getAspectColor = (type: string, significance: string): string => {
    const baseColors = {
      conjunction: "from-purple-500 to-indigo-600",
      opposition: "from-red-500 to-pink-600",
      trine: "from-green-500 to-emerald-600",
      square: "from-orange-500 to-red-600",
      sextile: "from-blue-500 to-cyan-600",
    };

    const opacity =
      significance === "high" ? "" : significance === "medium" ? "/80" : "/60";
    return baseColors[type] + opacity;
  };

  const getSignificanceIcon = (significance: string) => {
    switch (significance) {
      case "high":
        return <Star className="w-4 h-4 text-yellow-400" />;
      case "medium":
        return <Circle className="w-3 h-3 text-blue-400" />;
      default:
        return <Circle className="w-2 h-2 text-gray-400" />;
    }
  };

  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i));
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = addDays(currentWeek, direction === "next" ? 7 : -7);
    setCurrentWeek(newWeek);
  };

  const getEventsForDate = (date: Date): TransitEvent[] => {
    const dateStr = date.toISOString().split("T")[0];
    return transitEvents.filter((event) => event.date === dateStr);
  };

  return (
    <div
      className={`bg-dark-800 rounded-2xl p-6 border border-dark-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp
            className="w-6 h-6 text-teal-400 mr-3"
            aria-hidden="true"
          />
          <h3
            className="text-xl font-semibold text-white"
            id="transit-timeline-title"
          >
            Transit Timeline
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-dark-800 ${
                viewMode === "week"
                  ? "bg-teal-600 text-white"
                  : "bg-dark-600 text-gray-300 hover:bg-dark-500"
              }`}
              aria-pressed={viewMode === "week"}
              role="button"
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-dark-800 ${
                viewMode === "month"
                  ? "bg-teal-600 text-white"
                  : "bg-dark-600 text-gray-300 hover:bg-dark-500"
              }`}
              aria-pressed={viewMode === "month"}
              role="button"
            >
              Month
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-medium min-w-[200px] text-center">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </span>
            <button
              onClick={() => navigateWeek("next")}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toISOString().split("T")[0] === selectedDate;

          return (
            <div key={index} className="min-h-[120px]">
              {/* Day Header */}
              <div
                className={`text-center p-2 rounded-t-lg border-b ${
                  isToday
                    ? "bg-teal-600 text-white border-teal-500"
                    : isSelected
                      ? "bg-teal-800 text-white border-teal-600"
                      : "bg-dark-700 text-gray-300 border-dark-600"
                }`}
              >
                <div className="text-xs font-medium">{format(day, "EEE")}</div>
                <div className="text-lg font-bold">{format(day, "d")}</div>
              </div>

              {/* Events */}
              <div
                className={`p-2 rounded-b-lg border-l border-r border-b min-h-[80px] cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-teal-900/30 border-teal-600"
                    : "bg-dark-700/50 border-dark-600 hover:bg-dark-600/50"
                }`}
                onClick={() => onDateChange(day.toISOString().split("T")[0])}
              >
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: eventIndex * 0.1 }}
                      className={`p-1 rounded text-xs bg-gradient-to-r ${getAspectColor(event.type, event.significance)} text-white cursor-pointer hover:scale-105 transition-transform`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {event.planet} {event.aspect} {event.natalPlanet}
                        </span>
                        {getSignificanceIcon(event.significance)}
                      </div>
                      {event.exactTime && (
                        <div className="flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{event.exactTime}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-400 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-indigo-600 mr-2"></div>
          <span className="text-gray-300">Conjunction</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-pink-600 mr-2"></div>
          <span className="text-gray-300">Opposition</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-emerald-600 mr-2"></div>
          <span className="text-gray-300">Trine</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-500 to-red-600 mr-2"></div>
          <span className="text-gray-300">Square</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-cyan-600 mr-2"></div>
          <span className="text-gray-300">Sextile</span>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 rounded-2xl p-6 border border-dark-700 max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center">
                <Info className="w-5 h-5 mr-2 text-teal-400" />
                Transit Details
              </h4>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-white font-medium mb-2">
                  {selectedEvent.planet} {selectedEvent.aspect} natal{" "}
                  {selectedEvent.natalPlanet}
                </h5>
                <p className="text-gray-300 text-sm">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Date:</span>
                  <div className="text-white">
                    {format(new Date(selectedEvent.date), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Exact Time:</span>
                  <div className="text-white">
                    {selectedEvent.exactTime || "All day"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Duration:</span>
                  <div className="text-white">
                    {selectedEvent.duration} day
                    {selectedEvent.duration > 1 ? "s" : ""}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Significance:</span>
                  <div className="text-white flex items-center">
                    {getSignificanceIcon(selectedEvent.significance)}
                    <span className="ml-2 capitalize">
                      {selectedEvent.significance}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TransitTimeline;
