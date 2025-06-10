import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Globe, Loader } from "lucide-react";

interface LocationResult {
  id: string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search for a city or location...",
  initialValue = "",
  className = "",
}) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for locations using multiple APIs for comprehensive coverage
  const searchLocations = async (
    searchQuery: string,
  ): Promise<LocationResult[]> => {
    if (!searchQuery || searchQuery.length < 2) return [];

    try {
      // Use OpenStreetMap Nominatim API for global coverage
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: searchQuery,
            format: "json",
            limit: "10",
            addressdetails: "1",
            extratags: "1",
          }),
      );

      if (!nominatimResponse.ok) {
        throw new Error("Nominatim API failed");
      }

      const nominatimData = await nominatimResponse.json();

      const locations: LocationResult[] = nominatimData
        .filter(
          (item: any) =>
            item.type === "city" ||
            item.type === "town" ||
            item.type === "village" ||
            item.class === "place" ||
            item.addresstype === "city" ||
            item.addresstype === "town" ||
            item.addresstype === "village",
        )
        .map((item: any) => {
          const address = item.address || {};
          const city =
            address.city || address.town || address.village || item.name;
          const country = address.country || "Unknown";
          const region = address.state || address.region || address.county;

          return {
            id: item.place_id?.toString() || Math.random().toString(),
            name: city,
            country,
            region,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            timezone: getTimezoneFromCoordinates(
              parseFloat(item.lat),
              parseFloat(item.lon),
            ),
            population: item.extratags?.population
              ? parseInt(item.extratags.population)
              : undefined,
          };
        })
        .filter(
          (location: LocationResult) =>
            !isNaN(location.latitude) &&
            !isNaN(location.longitude) &&
            location.name &&
            location.country,
        )
        .slice(0, 8); // Limit to 8 results

      return locations;
    } catch (error) {
      console.error("Location search error:", error);

      // Fallback to a basic world cities dataset
      return getFallbackLocations(searchQuery);
    }
  };

  // Simple timezone estimation based on longitude
  const getTimezoneFromCoordinates = (lat: number, lng: number): string => {
    // This is a simplified timezone calculation
    // In production, you'd want to use a proper timezone API
    const timezoneOffset = Math.round(lng / 15);
    const sign = timezoneOffset >= 0 ? "+" : "-";
    const hours = Math.abs(timezoneOffset).toString().padStart(2, "0");
    return `UTC${sign}${hours}:00`;
  };

  // Fallback locations for common cities when API fails
  const getFallbackLocations = (searchQuery: string): LocationResult[] => {
    const fallbackCities = [
      {
        name: "New York",
        country: "United States",
        lat: 40.7128,
        lng: -74.006,
        tz: "America/New_York",
      },
      {
        name: "London",
        country: "United Kingdom",
        lat: 51.5074,
        lng: -0.1278,
        tz: "Europe/London",
      },
      {
        name: "Tokyo",
        country: "Japan",
        lat: 35.6762,
        lng: 139.6503,
        tz: "Asia/Tokyo",
      },
      {
        name: "Paris",
        country: "France",
        lat: 48.8566,
        lng: 2.3522,
        tz: "Europe/Paris",
      },
      {
        name: "Sydney",
        country: "Australia",
        lat: -33.8688,
        lng: 151.2093,
        tz: "Australia/Sydney",
      },
      {
        name: "Mumbai",
        country: "India",
        lat: 19.076,
        lng: 72.8777,
        tz: "Asia/Kolkata",
      },
      {
        name: "São Paulo",
        country: "Brazil",
        lat: -23.5505,
        lng: -46.6333,
        tz: "America/Sao_Paulo",
      },
      {
        name: "Cairo",
        country: "Egypt",
        lat: 30.0444,
        lng: 31.2357,
        tz: "Africa/Cairo",
      },
      {
        name: "Moscow",
        country: "Russia",
        lat: 55.7558,
        lng: 37.6176,
        tz: "Europe/Moscow",
      },
      {
        name: "Beijing",
        country: "China",
        lat: 39.9042,
        lng: 116.4074,
        tz: "Asia/Shanghai",
      },
      {
        name: "Los Angeles",
        country: "United States",
        lat: 34.0522,
        lng: -118.2437,
        tz: "America/Los_Angeles",
      },
      {
        name: "Berlin",
        country: "Germany",
        lat: 52.52,
        lng: 13.405,
        tz: "Europe/Berlin",
      },
      {
        name: "Toronto",
        country: "Canada",
        lat: 43.6532,
        lng: -79.3832,
        tz: "America/Toronto",
      },
      {
        name: "Mexico City",
        country: "Mexico",
        lat: 19.4326,
        lng: -99.1332,
        tz: "America/Mexico_City",
      },
      {
        name: "Buenos Aires",
        country: "Argentina",
        lat: -34.6118,
        lng: -58.396,
        tz: "America/Argentina/Buenos_Aires",
      },
    ];

    return fallbackCities
      .filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .map((city) => ({
        id: `fallback-${city.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: city.name,
        country: city.country,
        latitude: city.lat,
        longitude: city.lng,
        timezone: city.tz,
      }))
      .slice(0, 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Debounce search
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setIsOpen(true);

      try {
        const locations = await searchLocations(value);
        setResults(locations);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleLocationSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleLocationSelect = (location: LocationResult) => {
    setQuery(`${location.name}, ${location.country}`);
    setIsOpen(false);
    setSelectedIndex(-1);
    onLocationSelect(location);
  };

  const formatLocationDisplay = (location: LocationResult) => {
    let display = location.name;
    if (location.region && location.region !== location.name) {
      display += `, ${location.region}`;
    }
    display += `, ${location.country}`;
    return display;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-dark-700 border border-dark-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
          autoComplete="off"
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        {!isLoading && query && (
          <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <Loader className="w-5 h-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Searching worldwide...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((location, index) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                className={`w-full text-left px-4 py-3 hover:bg-dark-700 transition-colors ${
                  index === selectedIndex ? "bg-dark-700" : ""
                } ${index === 0 ? "rounded-t-lg" : ""} ${
                  index === results.length - 1 ? "rounded-b-lg" : ""
                }`}
              >
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-purple-400 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {location.name}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {location.region && location.region !== location.name && (
                        <span>{location.region}, </span>
                      )}
                      {location.country}
                      {location.population && (
                        <span className="ml-2 text-xs">
                          ({(location.population / 1000000).toFixed(1)}M)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {location.latitude.toFixed(2)}°,{" "}
                    {location.longitude.toFixed(2)}°
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              <MapPin className="w-5 h-5 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No locations found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
