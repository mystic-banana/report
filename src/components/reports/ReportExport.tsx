import React, { useState } from "react";
import { Download, FileText, ChevronDown, Check, X } from "lucide-react";
import { AstrologyReport } from "../../store/astrologyStore";
import Button from "../ui/Button";
import { exportReportToPdf, exportMultipleReportsToPdf } from "../../utils/pdfExport";
import toast from "react-hot-toast";

interface ReportExportProps {
  report?: AstrologyReport;
  reports?: AstrologyReport[];
  birthChartName?: string;
  birthDate?: string;
  birthLocation?: { city: string; country: string } | null;
  onClose?: () => void;
  className?: string;
}

const ReportExport: React.FC<ReportExportProps> = ({
  report,
  reports = [],
  birthChartName,
  birthDate,
  birthLocation,
  onClose,
  className = "",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeHeader: true,
    includeBirthInfo: true,
    includeMetadata: true,
    customFileName: "",
  });

  // Determine if we're exporting a single report or multiple reports
  const singleReport = report || (reports && reports.length === 1 ? reports[0] : null);
  const multipleReports = !singleReport && reports && reports.length > 1;

  const handleOptionChange = (option: keyof typeof exportOptions, value: boolean | string) => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const filename = exportOptions.customFileName
        ? `${exportOptions.customFileName.trim()}.pdf`
        : undefined;

      if (singleReport) {
        await exportReportToPdf(singleReport, {
          includeHeader: exportOptions.includeHeader,
          includeBirthInfo: exportOptions.includeBirthInfo,
          includeMetadata: exportOptions.includeMetadata,
          fileName: filename,
          birthChartName,
          birthDate,
          birthLocation,
        });
        
        toast.success("Report exported successfully!");
      } else if (multipleReports) {
        await exportMultipleReportsToPdf(reports, {
          includeHeader: exportOptions.includeHeader,
          includeBirthInfo: exportOptions.includeBirthInfo,
          includeMetadata: exportOptions.includeMetadata,
          fileName: filename,
        });
        
        toast.success(`${reports.length} reports exported successfully!`);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error exporting report(s):", error);
      toast.error("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg overflow-hidden ${className}`}>
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="text-amber-500 mr-2" />
          <h3 className="font-semibold text-white">
            {singleReport
              ? "Export Report to PDF"
              : `Export ${reports.length} Reports to PDF`}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Info message */}
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-300">
            {singleReport
              ? "You are about to export this report as a PDF document."
              : `You are about to export ${reports.length} reports as a single PDF document.`}
          </p>
        </div>

        {/* File name */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">File name (optional)</label>
          <input
            type="text"
            placeholder={
              singleReport
                ? `${singleReport.title.substring(0, 30)}...`
                : "astrology_reports_collection"
            }
            value={exportOptions.customFileName}
            onChange={(e) => handleOptionChange("customFileName", e.target.value)}
            className="w-full rounded-lg bg-dark-900 border border-dark-700 px-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
          />
          <p className="text-xs text-gray-500 mt-1">.pdf will be added automatically</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">Export Options</h4>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeHeader}
              onChange={(e) => handleOptionChange("includeHeader", e.target.checked)}
              className="mr-2 rounded bg-dark-900 border-dark-700 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-gray-300">Include header and logo</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeBirthInfo}
              onChange={(e) => handleOptionChange("includeBirthInfo", e.target.checked)}
              className="mr-2 rounded bg-dark-900 border-dark-700 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-gray-300">Include birth chart information</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeMetadata}
              onChange={(e) => handleOptionChange("includeMetadata", e.target.checked)}
              className="mr-2 rounded bg-dark-900 border-dark-700 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-gray-300">Include report metadata and page numbers</span>
          </label>
        </div>

        {/* Preview */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-white mb-2">Preview</h4>
          <div className="bg-white p-3 rounded shadow-lg">
            <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
              <FileText size={48} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Export button */}
        <div className="mt-6 flex justify-end">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mr-2"
              disabled={isExporting}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExport}
            disabled={isExporting}
            loading={isExporting}
          >
            Export to PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportExport;
