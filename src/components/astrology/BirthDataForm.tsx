import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Clock, User, Globe } from "lucide-react";
import { BirthData } from "../../utils/astronomicalCalculations";
import Button from "../ui/Button";
import LocationSearch from "../ui/LocationSearch";

interface BirthDataFormProps {
  onSubmit: (birthData: BirthData) => void;
  loading?: boolean;
  initialData?: Partial<BirthData>;
}

const BirthDataForm: React.FC<BirthDataFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<BirthData>({
    name: initialData?.name || "",
    birthDate: initialData?.birthDate || "",
    birthTime: initialData?.birthTime || "",
    location: initialData?.location || {
      city: "",
      country: "",
      latitude: 0,
      longitude: 0,
      timezone: "",
    },
  });

  const [locationSelected, setLocationSelected] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Birth date is required";
    }

    if (!formData.location.city) {
      newErrors.location = "Birth location is required";
    }

    if (!locationSelected) {
      newErrors.location = "Please select a location from the search results";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof BirthData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">
          Birth Information
        </h2>
        <p className="text-gray-400">
          Enter your birth details to generate your personalized astrological
          chart
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full bg-dark-700 border rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors ${
              errors.name ? "border-red-500" : "border-dark-600"
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Birth Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Birth Date
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            className={`w-full bg-dark-700 border rounded-lg p-3 text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors ${
              errors.birthDate ? "border-red-500" : "border-dark-600"
            }`}
          />
          {errors.birthDate && (
            <p className="text-red-400 text-sm mt-1">{errors.birthDate}</p>
          )}
        </div>

        {/* Birth Time Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Birth Time (Optional)
          </label>
          <input
            type="time"
            value={formData.birthTime}
            onChange={(e) => handleInputChange("birthTime", e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
          />
          <p className="text-gray-500 text-sm mt-1">
            Time of birth provides more accurate readings. Leave blank if
            unknown.
          </p>
        </div>

        {/* Birth Location Field with Global Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Birth Location
          </label>
          <LocationSearch
            onLocationSelect={(location) => {
              setFormData({
                ...formData,
                location: {
                  city: location.name,
                  country: location.country,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  timezone: location.timezone,
                },
              });
              setLocationSelected(true);
              if (errors.location) {
                setErrors((prev) => ({ ...prev, location: "" }));
              }
            }}
            placeholder="Search for your birth city worldwide..."
            className={`mb-4 ${errors.location ? "border-red-500" : ""}`}
          />

          {locationSelected && formData.location.city && (
            <div className="bg-dark-700/50 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-green-400 font-medium">
                  Location Selected
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-300">
                    <strong>City:</strong> {formData.location.city}
                  </p>
                  <p className="text-gray-300">
                    <strong>Country:</strong> {formData.location.country}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">
                    <strong>Coordinates:</strong>{" "}
                    {formData.location.latitude.toFixed(4)}°,{" "}
                    {formData.location.longitude.toFixed(4)}°
                  </p>
                  <p className="text-gray-300">
                    <strong>Timezone:</strong> {formData.location.timezone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    location: {
                      city: "",
                      country: "",
                      latitude: 0,
                      longitude: 0,
                      timezone: "",
                    },
                  });
                  setLocationSelected(false);
                }}
                className="text-orange-400 hover:text-orange-300 text-sm mt-2 underline"
              >
                Change location
              </button>
            </div>
          )}

          {!locationSelected && (
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-start">
                <Globe className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">
                    Global Location Search
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Search for any city worldwide. Our database includes major
                    cities, towns, and villages from every country. Coordinates
                    and timezone information are automatically provided for
                    accurate astrological calculations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errors.location && (
            <p className="text-red-400 text-sm mt-2">{errors.location}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={
              !locationSelected || !formData.name.trim() || !formData.birthDate
            }
            className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Birth Chart
          </Button>
          {(!locationSelected ||
            !formData.name.trim() ||
            !formData.birthDate) && (
            <p className="text-gray-400 text-sm mt-2 text-center">
              Please fill in all required fields and select a location
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default BirthDataForm;
