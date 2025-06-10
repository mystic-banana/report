import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
// Import BirthChart type directly from astrologyStore
import type { BirthChart } from "../../store/astrologyStore";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ChevronRight, ChevronLeft, FileText, Check } from "lucide-react";

interface ReportWizardProps {
  onClose: () => void;
  selectedTemplateId?: string;
  selectedTemplateType?: string;
  selectedChartId?: string;
}

const ReportWizard: React.FC<ReportWizardProps> = ({
  onClose,
  selectedTemplateId,
  selectedTemplateType,
  selectedChartId,
}): React.ReactNode => {
  const navigate = useNavigate();
  const { birthCharts, addReport, createReportFromTemplate } =
    useAstrologyStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedChart, setSelectedChart] = useState<BirthChart | null>(null);
  const [reportType, setReportType] = useState<string>(
    selectedTemplateType || "",
  );
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(
    null,
  );

  // Initialize selectedChart from selectedChartId if provided
  useEffect(() => {
    if (selectedChartId && birthCharts.length > 0) {
      console.log(`Looking for birth chart with ID: ${selectedChartId}`);
      const chart = birthCharts.find(chart => chart.id === selectedChartId);
      if (chart) {
        console.log(`Found birth chart: ${chart.name}`);
        setSelectedChart(chart);
      } else {
        console.warn(`Could not find birth chart with ID: ${selectedChartId}`);
      }
    }
  }, [birthCharts, selectedChartId]);

  // Skip report type selection if a template is already selected
  useEffect(() => {
    if (selectedTemplateType && step === 2) {
      setStep(3);
    }
  }, [selectedTemplateType, step]);

  const handleNext = () => {
    if (step === 1 && !selectedChart) {
      setError("Please select a birth chart");
      return;
    }
    if (step === 2 && !reportType) {
      setError("Please select a report type");
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const generateReport = async () => {
    if (!selectedChart || !reportType) {
      setError("Missing required information");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let reportResult;

      // If a template was selected, use createReportFromTemplate
      if (selectedTemplateId && selectedChart?.id) {
        console.log(
          "Creating report from template:",
          selectedTemplateId,
          selectedChart.id
        );
        
        if (!user?.id) {
          throw new Error("User ID is required to create a report. Please log in.");
        }

        reportResult = await createReportFromTemplate(
          selectedTemplateId,
          selectedChart.id,
          user.id,
          {
            isPremium,
          }
        );

        if (!reportResult) {
          throw new Error("Failed to create report from template");
        }

        // Add the report to local state
        await addReport(reportResult);
        setGeneratedReportId(reportResult.id);
      } else {
        // Otherwise use the standard report creation flow
        // Create a report title
        const reportTitle = `${selectedChart?.name || "Unknown"}'s ${reportType.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} Report`;

        // Check if user is logged in
        if (!user?.id) {
          throw new Error("User ID is required to create a report. Please log in.");
        }

        // First, create the report record in the database
        const { data: reportData, error: reportError } = await supabase
          .from("astrology_reports")
          .insert([
            {
              title: reportTitle,
              report_type: reportType,
              birth_chart_id: selectedChart?.id,
              user_id: user.id,
              is_premium: isPremium,
              content: "Generating report content...", // Placeholder content
            },
          ])
          .select()
          .single();

        if (reportError) throw reportError;

        // Simulate report generation
        setTimeout(async () => {
          const sampleContent = `**Introduction**\n\nThis is a ${reportType} report for ${selectedChart?.name || "Unknown"}, born on ${selectedChart?.birth_date ? new Date(selectedChart.birth_date).toLocaleDateString() : "Unknown"}.\n\n**Planetary Positions**\n\nThe Sun is in ${selectedChart?.chart_data?.planets?.find((p: any) => p.name === "Sun")?.sign || "Unknown"}.\nThe Moon is in ${selectedChart?.chart_data?.planets?.find((p: any) => p.name === "Moon")?.sign || "Unknown"}.\n\n**Interpretation**\n\nThis combination suggests a personality that is both [interpretation based on Sun sign] and emotionally [interpretation based on Moon sign].`;

          // Update the report with the generated content
          const { error: updateError } = await supabase
            .from("astrology_reports")
            .update({
              content: sampleContent,
            })
            .eq("id", reportData.id);

          if (updateError) {
            console.error("Error updating report:", updateError);
          } else {
            // Add to local state
            addReport({
              ...reportData,
              content: sampleContent,
            });

            setGeneratedReportId(reportData.id);
          }
        }, 2000);

        // Set the generated report ID to show success state
        setGeneratedReportId(reportData.id);
      }
    } catch (err: unknown) {
      console.error("Error generating report:", err);
      const errorMessage = err instanceof Error ? err.message : "Please try again";
      setError(`Failed to generate report: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      id: "natal-basic",
      name: "Basic Natal Chart",
      description: "Essential planetary positions and their meanings",
      premium: false,
      image:
        "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=300&q=80",
    },
    {
      id: "natal-premium",
      name: "Premium Natal Chart",
      description:
        "Comprehensive analysis with aspects and house interpretations",
      premium: true,
      image:
        "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=300&q=80",
    },
    {
      id: "vedic-basic",
      name: "Vedic Astrology",
      description: "Traditional Jyotish analysis with Nakshatras",
      premium: false,
      image:
        "https://images.unsplash.com/photo-1545922421-5ec0bc0f0ef8?w=300&q=80",
    },
    {
      id: "hellenistic-basic",
      name: "Hellenistic Astrology",
      description: "Ancient Greek astrological techniques",
      premium: false,
      image:
        "https://images.unsplash.com/photo-1608316677206-84a8deb3ec9c?w=300&q=80",
    },
    {
      id: "chinese-basic",
      name: "Chinese Astrology",
      description: "Traditional Chinese zodiac and element analysis",
      premium: false,
      image:
        "https://images.unsplash.com/photo-1578874557108-364f5d0aaa1d?w=300&q=80",
    },
    {
      id: "transit-basic",
      name: "Transit Report",
      description: "Current planetary influences on your chart",
      premium: false,
      image:
        "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=300&q=80",
    },
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Select Birth Chart
            </h2>
            <p className="text-gray-400">
              Choose a birth chart to generate a report for:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
              {birthCharts.map((chart) => (
                <div
                  key={chart.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedChart?.id === chart.id
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                  }`}
                  onClick={() => setSelectedChart(chart)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{chart.name}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(chart.birth_date).toLocaleDateString()}
                        {chart.birth_time && `, ${chart.birth_time}`}
                      </p>
                      {chart.birth_location && (
                        <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                          {chart.birth_location.city},{" "}
                          {chart.birth_location.country}
                        </p>
                      )}
                    </div>
                    {selectedChart?.id === chart.id && (
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {birthCharts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4 sm:mb-6">
                  You don't have any birth charts yet.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/astrology/birth-chart")}
                >
                  Create Birth Chart
                </Button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Select Report Type
            </h2>
            <p className="text-gray-400">
              Choose the type of report you want to generate:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
              {reportTypes.map((type) => (
                <div
                  key={type.id}
                  className={`rounded-lg border overflow-hidden cursor-pointer transition-all ${
                    reportType === type.id
                      ? "border-amber-500 ring-2 ring-amber-500/50"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                  onClick={() => {
                    setReportType(type.id);
                    setIsPremium(type.premium);
                  }}
                >
                  <div className="h-24 sm:h-28 md:h-32 bg-gray-700 relative">
                    <img
                      src={type.image}
                      alt={type.name}
                      className="w-full h-full object-cover"
                    />
                    {type.premium && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-xs font-bold text-black px-2 py-1 rounded-full">
                        PREMIUM
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-medium text-white">{type.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Confirm Report Details
            </h2>

            <div className="space-y-3 sm:space-y-4 bg-dark-800 p-3 sm:p-6 rounded-lg">
              <h3 className="text-base sm:text-lg font-medium text-white">Birth Chart</h3>
              <p className="text-white font-medium">
                {selectedChart?.name}
              </p>
              <p className="text-sm text-gray-500">
                {selectedChart &&
                  new Date(selectedChart.birth_date).toLocaleDateString()}
                {selectedChart?.birth_time &&
                  `, ${selectedChart.birth_time}`}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 bg-dark-800 p-3 sm:p-6 rounded-lg">
              <h3 className="text-base sm:text-lg font-medium text-white">Report Type</h3>
              <p className="text-white font-medium">
                {reportType
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                {isPremium && (
                  <span className="ml-2 text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full">
                    PREMIUM
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 bg-dark-800 p-3 sm:p-6 rounded-lg">
              <h3 className="font-medium text-white mb-2">What's included:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Detailed planetary positions and aspects
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Personalized interpretation based on your birth data
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Downloadable HTML report
                  </span>
                </li>
                {isPremium && (
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Advanced interpretations and additional insights
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            {loading ? (
              <div className="py-8">
                <LoadingSpinner size="lg" />
                <p className="text-white mt-4">Generating your report...</p>
                <p className="text-gray-400 text-sm mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : generatedReportId ? (
              <div className="py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">
                  Report Successfully Generated
                </h2>
                <p className="text-gray-400 mb-4 sm:mb-6">
                  Your report has been successfully created.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    variant="primary"
                    icon={FileText}
                    onClick={() => {
                      onClose();
                      navigate(`/astrology/reports?view=${generatedReportId}`);
                    }}
                  >
                    View Report
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 bg-dark-800 p-3 sm:p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Ready to Generate Report
                </h2>
                <p className="text-gray-400 mb-6">
                  Click the button below to create your personalized
                  astrological report.
                </p>
                <Button variant="primary" size="lg" onClick={generateReport}>
                  Generate Report
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-dark-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-dark-700">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Create New Report</h1>
        </div>

        {/* Progress Steps - Responsive */}
        <div className="px-4 sm:px-6 pt-6">
          <div className="relative flex items-center justify-between mb-8 gap-1 sm:gap-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-1 flex-col items-center z-10">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    step === stepNumber
                      ? "bg-amber-500 text-black"
                      : step > stepNumber
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {step > stepNumber ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className="text-xs text-gray-400 mt-1 sm:mt-2 hidden xs:block">
                  {stepNumber === 1 && "Chart"}
                  {stepNumber === 2 && "Type"}
                  {stepNumber === 3 && "Review"}
                  {stepNumber === 4 && "Generate"}
                </span>
              </div>
            ))}

            {/* Progress line */}
            <div className="absolute h-0.5 bg-gray-700 w-[80%] left-[10%] top-[1.05rem] sm:top-[1.2rem] -z-0 hidden sm:block">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${(step - 1) * 33.33}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {renderStepContent()}

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-dark-700 flex justify-between">
          {step > 1 && step !== 4 && (
            <Button variant="outline" onClick={handleBack} icon={ChevronLeft}>
              Back
            </Button>
          )}
          {step === 1 && <div></div>}
          {step === 4 && generatedReportId && <div></div>}

          {step !== 4 && (
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex items-center gap-1"
            >
              {step === 3 ? "Finish" : "Next"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {step === 4 && !generatedReportId && !loading && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportWizard;
