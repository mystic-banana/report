import React from "react";
import { AstrologyReport } from "../../../store/astrologyStore";
import { FileText, Sparkles } from "lucide-react";

interface ReportContentProps {
  report: AstrologyReport;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const ReportContent: React.FC<ReportContentProps> = ({ report, system }) => {
  const getSystemTitle = () => {
    switch (system) {
      case "vedic":
        return "Jyotish Analysis";
      case "chinese":
        return "Chinese Astrology Insights";
      case "hellenistic":
        return "Classical Interpretation";
      default:
        return "Astrological Analysis";
    }
  };

  const formatContent = (content: string) => {
    // Split content by double asterisks to create sections
    const sections = content.split("**").filter((section) => section.trim());
    const formattedSections = [];

    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i]?.trim();
      const text = sections[i + 1]?.trim();

      if (title && text) {
        formattedSections.push({ title, text });
      }
    }

    return formattedSections;
  };

  const contentSections = formatContent(report.content || "");

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
        <FileText className="w-8 h-8 mr-4 text-blue-400" />
        {getSystemTitle()}
      </h2>

      {contentSections.length > 0 ? (
        <div className="space-y-8">
          {contentSections.map((section, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                {section.title}
              </h3>
              <div className="prose prose-invert max-w-none">
                {section.text.split("\n").map(
                  (paragraph, pIndex) =>
                    paragraph.trim() && (
                      <p
                        key={pIndex}
                        className="text-gray-300 leading-relaxed mb-4"
                      >
                        {paragraph.trim()}
                      </p>
                    ),
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            Report content is being generated...
          </p>
        </div>
      )}

      {/* System-specific insights */}
      {system === "vedic" && (
        <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-400/20">
          <h4 className="text-orange-300 font-semibold mb-3">Vedic Wisdom</h4>
          <p className="text-orange-200 text-sm italic">
            "यत् पिण्डे तत् ब्रह्माण्डे" - As is the individual, so is the
            universe. This ancient principle guides Vedic astrology's
            understanding of cosmic connections.
          </p>
        </div>
      )}

      {system === "chinese" && (
        <div className="mt-8 p-6 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-xl border border-red-400/20">
          <h4 className="text-red-300 font-semibold mb-3">
            Chinese Philosophy
          </h4>
          <p className="text-red-200 text-sm italic">
            "天人合一" - The harmony between Heaven and humanity forms the
            foundation of Chinese astrological understanding.
          </p>
        </div>
      )}

      {system === "hellenistic" && (
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-400/20">
          <h4 className="text-purple-300 font-semibold mb-3">
            Classical Wisdom
          </h4>
          <p className="text-purple-200 text-sm italic">
            "Astra inclinant, non necessitant" - The stars incline, they do not
            compel. Ancient wisdom recognizes both cosmic influence and human
            free will.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportContent;
