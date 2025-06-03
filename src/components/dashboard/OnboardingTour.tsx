import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  BookOpen,
  Calendar,
  Headphones,
  Settings,
  Sparkles,
} from "lucide-react";
import Button from "../ui/Button";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
  icon: React.ComponentType<any>;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: "welcome",
      title: "Welcome to Mystic Banana!",
      content:
        "Let's take a quick tour of your personalized astrology dashboard. You'll discover powerful tools to explore your cosmic journey.",
      target: "dashboard-header",
      position: "bottom",
      icon: Sparkles,
    },
    {
      id: "navigation",
      title: "Easy Navigation",
      content:
        "Use these tabs to switch between different sections: Astrology tools, Tarot readings, Saved content, and Recent activity.",
      target: "navigation-tabs",
      position: "bottom",
      icon: Star,
    },
    {
      id: "astrology",
      title: "Astrology Tools",
      content:
        "Create birth charts, generate reports, and explore compatibility analyses. Your cosmic insights await!",
      target: "astrology-section",
      position: "top",
      icon: Star,
    },
    {
      id: "saved-content",
      title: "Your Saved Content",
      content:
        "Access your saved birth charts, reports, and favorite articles. Everything you need is organized here.",
      target: "saved-content",
      position: "top",
      icon: BookOpen,
    },
    {
      id: "activity",
      title: "Track Your Journey",
      content:
        "Monitor your recent activities and see your spiritual growth over time with detailed statistics.",
      target: "activity-section",
      position: "top",
      icon: Calendar,
    },
    {
      id: "personalization",
      title: "Customize Your Experience",
      content:
        "Use the settings to personalize your dashboard theme, layout, and notification preferences.",
      target: "settings-button",
      position: "left",
      icon: Settings,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
    setCurrentStep(0);
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(0);
  };

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tour Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-8 border border-purple-500/30 shadow-2xl max-w-md mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {currentStepData.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Step {currentStep + 1} of {tourSteps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Close tour"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-8">
                <p className="text-gray-300 leading-relaxed">
                  {currentStepData.content}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm text-purple-400">
                    {Math.round(((currentStep + 1) / tourSteps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentStep + 1) / tourSteps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {tourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep
                          ? "bg-purple-400"
                          : index < currentStep
                            ? "bg-purple-600"
                            : "bg-gray-600"
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="flex space-x-3">
                  {currentStep > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrevious}
                      icon={ChevronLeft}
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    icon={
                      currentStep === tourSteps.length - 1
                        ? undefined
                        : ChevronRight
                    }
                  >
                    {currentStep === tourSteps.length - 1
                      ? "Get Started"
                      : "Next"}
                  </Button>
                </div>
              </div>

              {/* Skip Button */}
              <div className="text-center mt-4">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Skip tour
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
