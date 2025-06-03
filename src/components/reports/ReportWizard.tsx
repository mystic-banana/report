import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAstrologyStore, BirthChart } from "../../store/astrologyStore";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ChevronRight, ChevronLeft, FileText, Check } from "lucide-react";

interface ReportWizardProps {
  onClose: () => void;
}

const ReportWizard: React.FC<ReportWizardProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { birthCharts, addReport } = useAstrologyStore();
  const [step, setStep] = useState(1);
  const [selectedChart, setSelectedChart] = useState<BirthChart | null>(null);
  const [reportType, setReportType] = useState<string>("");
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(
    null,
  );

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
      // Create a report title
      const reportTitle = `${selectedChart.name}'s ${reportType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} Report`;

      // In a real implementation, you would call your report generation API here
      // For now, we'll simulate it with a timeout

      // First, create the report record in the database
      const { data: reportData, error: reportError } = await supabase
        .from("astrology_reports")
        .insert([
          {
            title: reportTitle,
            report_type: reportType,
            birth_chart_id: selectedChart.id,
            is_premium: isPremium,
            content: "Generating report content...", // Placeholder content
            status: "pending",
          },
        ])
        .select()
        .single();

      if (reportError) throw reportError;

      // In a real implementation, you would now call your backend to generate the report content
      // For this example, we'll simulate it with a timeout and update the record

      // Simulate report generation
      setTimeout(async () => {
        const sampleContent = `**Introduction**\n\nThis is a ${reportType} report for ${selectedChart.name}, born on ${new Date(selectedChart.birth_date).toLocaleDateString()}.\n\n**Planetary Positions**\n\nThe Sun is in ${selectedChart.chart_data?.planets.find((p) => p.name === "Sun")?.sign || "Unknown"}.\nThe Moon is in ${selectedChart.chart_data?.planets.find((p) => p.name === "Moon")?.sign || "Unknown"}.\n\n**Interpretation**\n\nThis combination suggests a personality that is both [interpretation based on Sun sign] and emotionally [interpretation based on Moon sign].`;

        // Update the report with the generated content
        const { error: updateError } = await supabase
          .from("astrology_reports")
          .update({
            content: sampleContent,
            status: "completed",
          })
          .eq("id", reportData.id);

        if (updateError) {
          console.error("Error updating report:", updateError);
        } else {
          // Add to local state
          addReport({
            ...reportData,
            content: sampleContent,
            status: "completed",
          });

          setGeneratedReportId(reportData.id);
        }
      }, 2000);

      // Set the generated report ID to show success state
      setGeneratedReportId(reportData.id);
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                        <p className="text-xs text-gray-500 mt-1">
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
                <p className="text-gray-400 mb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
                  <div className="h-32 bg-gray-700 relative">
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
                  <div className="p-4">
                    <h3 className="font-medium text-white">{type.name}</h3>
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

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Birth Chart</p>
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
                <div>
                  <p className="text-sm text-gray-400">Report Type</p>
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
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
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
                <h2 className="text-2xl font-bold text-white mb-2">
                  Report Generated!
                </h2>
                <p className="text-gray-400 mb-6">
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
              <div className="py-8">
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-2xl w-full max-w-4xl">
        {/* Header */}
        <div className="p-6 border-b border-dark-700">
          <h1 className="text-2xl font-bold text-white">Create New Report</h1>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === stepNumber
                      ? "bg-amber-500 text-black"
                      : step > stepNumber
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {step > stepNumber ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className="text-xs text-gray-400 mt-2">
                  {stepNumber === 1 && "Chart"}
                  {stepNumber === 2 && "Type"}
                  {stepNumber === 3 && "Review"}
                  {stepNumber === 4 && "Generate"}
                </span>
              </div>
            ))}

            {/* Progress line */}
            <div className="absolute h-0.5 bg-gray-700 w-[calc(100%-120px)] left-[60px] top-[6.5rem] -z-10">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${(step - 1) * 33.33}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {renderStepContent()}

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-dark-700 flex justify-between">
          {step > 1 && step !== 4 && (
            <Button variant="outline" onClick={handleBack} icon={ChevronLeft}>
              Back
            </Button>
          )}
          {step === 1 && <div></div>}
          {step === 4 && generatedReportId && <div></div>}

          {step < 4 && (
            <Button
              variant="primary"
              onClick={handleNext}
              iconRight={ChevronRight}
            >
              {step === 3 ? "Finish" : "Next"}
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
