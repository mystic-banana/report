import React from "react";
import { AstrologyReport } from "../../../store/astrologyStore";
import { Star, Calendar, Shield } from "lucide-react";

interface ReportFooterProps {
  report: AstrologyReport;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const ReportFooter: React.FC<ReportFooterProps> = ({ report, system }) => {
  const getSystemDisclaimer = () => {
    switch (system) {
      case "vedic":
        return "This Vedic astrology report is based on ancient Jyotish principles and should be used for guidance and self-reflection.";
      case "chinese":
        return "This Chinese astrology analysis follows traditional Four Pillars methodology and the wisdom of the I-Ching.";
      case "hellenistic":
        return "This Hellenistic astrology report uses classical techniques from ancient Greek and Roman traditions.";
      default:
        return "This Western astrology report uses modern psychological and traditional astrological principles.";
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mt-12">
      {/* Main Footer Content */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-yellow-400 mr-3" />
          <h2 className="text-3xl font-bold text-white">MysticBanana</h2>
          <Star className="w-8 h-8 text-yellow-400 ml-3" />
        </div>
        <p className="text-gray-300 text-lg mb-2">
          Professional Astrology Reports & Cosmic Insights
        </p>
        <p className="text-gray-400 text-sm">
          Connecting you with the wisdom of the stars
        </p>
      </div>

      {/* Report Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-white font-medium">Generated</p>
          <p className="text-gray-300 text-sm">{currentDate}</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 text-center">
          <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-white font-medium">Report Type</p>
          <p className="text-gray-300 text-sm">
            {report.report_type
              .replace("-", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 text-center">
          <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-white font-medium">Quality</p>
          <p className="text-gray-300 text-sm">
            {report.is_premium ? "Premium Analysis" : "Standard Report"}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/20 mb-6">
        <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Important Disclaimer
        </h4>
        <p className="text-blue-200 text-sm leading-relaxed mb-3">
          {getSystemDisclaimer()}
        </p>
        <p className="text-blue-200 text-sm leading-relaxed">
          Astrology is a tool for self-understanding and should not replace
          professional advice for medical, legal, or financial decisions. Your
          free will and personal choices ultimately shape your destiny.
        </p>
      </div>

      {/* Contact Information */}
      <div className="text-center border-t border-white/10 pt-6">
        <p className="text-gray-400 text-sm mb-2">
          For questions about this report or to explore our premium services:
        </p>
        <p className="text-gray-300 font-medium">
          Visit MysticBanana.com | Email: support@mysticbanana.com
        </p>
        <p className="text-gray-500 text-xs mt-4">
          © {new Date().getFullYear()} MysticBanana. All rights reserved.
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="flex justify-center mt-6 space-x-2">
        {["⭐", "🌙", "✨", "🔮", "🌟"].map((emoji, index) => (
          <span key={index} className="text-2xl opacity-60">
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ReportFooter;
