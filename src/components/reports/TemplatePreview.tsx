import React, { useState, useEffect } from "react";
import { ReportTemplate } from "../../types/reportTypes";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import {
  X,
  Star,
  Download,
  Share2,
  Heart,
  Eye,
  Crown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { templateManagementService } from "../../services/templateManagementService";
import toast from "react-hot-toast";

interface TemplatePreviewProps {
  template: ReportTemplate;
  onClose: () => void;
  onSelect?: () => void;
  onRate?: (rating: number) => void;
  showActions?: boolean;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onClose,
  onSelect,
  onRate,
  showActions = true,
}) => {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    const generatePreview = async () => {
      setIsLoading(true);
      try {
        const html = await templateManagementService.generateTemplatePreview(
          template,
          {
            // Sample data for preview
            userName: "John Doe",
            birthDate: "1990-01-15",
            birthTime: "14:30",
            birthLocation: "New York, NY",
            reportType: template.type,
          },
        );
        setPreviewHtml(html);
      } catch (error) {
        console.error("Error generating preview:", error);
        setPreviewHtml("<div>Preview not available</div>");
      } finally {
        setIsLoading(false);
      }
    };

    generatePreview();
  }, [template]);

  const handleRating = async (rating: number) => {
    setIsRating(true);
    try {
      setUserRating(rating);
      if (onRate) {
        await onRate(rating);
      }
      toast.success("Rating submitted successfully");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    } finally {
      setIsRating(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `${template.name} - Report Template`,
        text: `Check out this ${template.type} astrology report template: ${template.description}`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share template");
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await templateManagementService.exportTemplate(template.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${template.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Template downloaded successfully");
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download template");
    }
  };

  const getTemplateTypeColor = (type: string) => {
    const colors = {
      western: "bg-blue-500/20 text-blue-300",
      vedic: "bg-orange-500/20 text-orange-300",
      chinese: "bg-red-500/20 text-red-300",
      hellenistic: "bg-purple-500/20 text-purple-300",
      transit: "bg-green-500/20 text-green-300",
      compatibility: "bg-pink-500/20 text-pink-300",
    };
    return (
      colors[type as keyof typeof colors] || "bg-gray-500/20 text-gray-300"
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      personal: "👤",
      professional: "💼",
      premium: "👑",
      system: "⚙️",
    };
    return icons[category as keyof typeof icons] || "📄";
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isFullscreen ? "p-0" : ""}`}
    >
      <div
        className={`bg-dark-800 rounded-2xl border border-dark-700 flex flex-col ${isFullscreen ? "w-full h-full rounded-none" : "max-w-6xl w-full h-[90vh]"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {getCategoryIcon(template.category)}
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white">
                    {template.name}
                  </h2>
                  {template.category === "premium" && (
                    <Crown className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                {template.description && (
                  <p className="text-gray-400 text-sm">
                    {template.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Template Info */}
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(template.type)}`}
              >
                {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
              </span>
              {template.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span>{template.rating.toFixed(1)}</span>
                </div>
              )}
              <span>{template.usageCount} uses</span>
            </div>

            {showActions && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Share2}
                  onClick={handleShare}
                  title="Share Template"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Download}
                  onClick={handleDownload}
                  title="Download Template"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={isFullscreen ? Minimize2 : Maximize2}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                />
              </>
            )}

            <Button variant="ghost" size="sm" icon={X} onClick={onClose} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview */}
          <div className="flex-1 bg-white overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-600 mt-4">Generating preview...</p>
                </div>
              </div>
            ) : (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Template Preview"
                sandbox="allow-same-origin"
              />
            )}
          </div>

          {/* Sidebar */}
          {!isFullscreen && (
            <div className="w-80 bg-dark-900 border-l border-dark-700 overflow-y-auto">
              <div className="p-6">
                {/* Template Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Template Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">
                        {template.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white capitalize">
                        {template.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Layout:</span>
                      <span className="text-white capitalize">
                        {template.layout.replace("-", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sections:</span>
                      <span className="text-white">
                        {template.sections.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Public:</span>
                      <span className="text-white">
                        {template.isPublic ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {template.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-white mb-3">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-amber-600/20 text-amber-300 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-white mb-3">
                    Rate this Template
                  </h4>
                  <div className="flex items-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        disabled={isRating}
                        className={`w-8 h-8 flex items-center justify-center transition-colors ${
                          star <= userRating
                            ? "text-amber-400"
                            : "text-gray-600 hover:text-amber-400"
                        }`}
                      >
                        <Star
                          className={`w-5 h-5 ${star <= userRating ? "fill-current" : ""}`}
                        />
                      </button>
                    ))}
                  </div>
                  {template.rating && (
                    <p className="text-sm text-gray-400">
                      Average rating: {template.rating.toFixed(1)} stars
                    </p>
                  )}
                </div>

                {/* Theme Colors */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-white mb-3">
                    Color Scheme
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(template.theme.colors).map(
                      ([key, color]) => (
                        <div key={key} className="text-center">
                          <div
                            className="w-8 h-8 rounded-full mx-auto mb-1 border border-dark-600"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs text-gray-400 capitalize">
                            {key}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="space-y-3">
                    {onSelect && (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={onSelect}
                      >
                        Select Template
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={Download}
                      onClick={handleDownload}
                    >
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
