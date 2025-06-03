import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Type,
  Contrast,
  Volume2,
  VolumeX,
  Keyboard,
  MousePointer,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface AccessibilityToolbarProps {
  className?: string;
}

const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    soundEnabled: true,
    keyboardNavigation: false,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibility-settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const applySettings = (newSettings: typeof settings) => {
    const root = document.documentElement;

    if (newSettings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    if (newSettings.largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }

    if (newSettings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    if (newSettings.keyboardNavigation) {
      root.classList.add("keyboard-navigation");
    } else {
      root.classList.remove("keyboard-navigation");
    }
  };

  const handleSettingChange = (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem("accessibility-settings", JSON.stringify(newSettings));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl p-4 min-w-[280px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Eye className="w-4 h-4 mr-2 text-blue-400" />
                Accessibility
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Close accessibility toolbar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Contrast className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">High Contrast</span>
                </div>
                <button
                  onClick={() => handleSettingChange("highContrast")}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    settings.highContrast ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  aria-label={`${settings.highContrast ? "Disable" : "Enable"} high contrast`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      settings.highContrast ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Large Text */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Large Text</span>
                </div>
                <button
                  onClick={() => handleSettingChange("largeText")}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    settings.largeText ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  aria-label={`${settings.largeText ? "Disable" : "Enable"} large text`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      settings.largeText ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MousePointer className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Reduced Motion</span>
                </div>
                <button
                  onClick={() => handleSettingChange("reducedMotion")}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    settings.reducedMotion ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  aria-label={`${settings.reducedMotion ? "Disable" : "Enable"} reduced motion`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      settings.reducedMotion ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Keyboard className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Keyboard Focus</span>
                </div>
                <button
                  onClick={() => handleSettingChange("keyboardNavigation")}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    settings.keyboardNavigation ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  aria-label={`${settings.keyboardNavigation ? "Disable" : "Enable"} keyboard navigation`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      settings.keyboardNavigation
                        ? "translate-x-5"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-gray-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-300">Sound Effects</span>
                </div>
                <button
                  onClick={() => handleSettingChange("soundEnabled")}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    settings.soundEnabled ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  aria-label={`${settings.soundEnabled ? "Disable" : "Enable"} sound effects`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      settings.soundEnabled ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dark-600">
              <p className="text-xs text-gray-400 text-center">
                Press Tab to navigate, Enter to activate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={handleKeyDown}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark-900"
        aria-label={`${isExpanded ? "Close" : "Open"} accessibility toolbar`}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-1">
          <Eye className="w-5 h-5" />
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default AccessibilityToolbar;
