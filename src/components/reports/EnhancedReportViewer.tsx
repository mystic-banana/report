import React, { useState, useEffect, useRef, useCallback } from "react";
import { AstrologyReport } from "../../store/astrologyStore";
import { supabase } from "../../lib/supabaseClient";
import { useReportAnalytics } from "../../hooks/useReportAnalytics";
import LoadingSpinner from "../ui/LoadingSpinner";
import Button from "../ui/Button";
import ReportRenderer from "./ReportRenderer";
import {
  Download,
  Eye,
  X,
  Crown,
  Share2,
  Bookmark,
  BookmarkCheck,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  FileText,
  Copy,
  ExternalLink,
  MessageSquare,
  Highlighter,
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Type,
  File,
  ArrowLeftRight,
} from "lucide-react";
// Server-side PDF export only - removed client-side PDF generation
import { annotationService } from "../../services/annotationService";
import { reportComparisonService } from "../../services/reportComparisonService";
import type {
  ReportAnnotation,
  AnnotationPosition,
  AnnotationStyle,
} from "../../types/reportTypes";
import toast from "react-hot-toast";

interface EnhancedReportViewerProps {
  report: AstrologyReport;
  onClose: () => void;
  onBookmark?: (reportId: string, isBookmarked: boolean) => void;
  onShare?: (reportId: string, shareData: any) => void;
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  element?: HTMLElement;
}

// Remove this interface as we're using the one from types

const EnhancedReportViewer: React.FC<EnhancedReportViewerProps> = ({
  report,
  onClose,
  onBookmark,
  onShare,
}) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"modern" | "legacy" | "reader">(
    "modern",
  );
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>(
    [],
  );
  const [annotations, setAnnotations] = useState<ReportAnnotation[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [selectedText, setSelectedText] = useState<string>("");
  const [annotationMode, setAnnotationMode] = useState<
    "highlight" | "note" | "comment" | null
  >(null);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
  const [annotationFilter, setAnnotationFilter] = useState<string>("");
  const [newAnnotationContent, setNewAnnotationContent] = useState("");
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<ReportAnnotation | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(200); // words per minute
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [theme, setTheme] = useState<"dark" | "light" | "sepia">("dark");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const {
    startReportTracking,
    updateReadingProgress,
    trackReportInteraction,
    trackReportExport,
    trackReportShare,
    endReportTracking,
    getReportAnalytics,
  } = useReportAnalytics();

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // Get birth chart data for the report
        const { data: chartInfo, error } = await supabase
          .from("astrology_reports")
          .select(
            "*, birth_charts!inner(name, birth_date, birth_time, chart_data, birth_location)",
          )
          .eq("id", report.id)
          .single();

        if (error) throw error;

        setChartData(chartInfo.birth_charts);

        // Check if report is bookmarked
        const { data: bookmarkData } = await supabase
          .from("report_bookmarks")
          .select("id")
          .eq("report_id", report.id)
          .single();

        setIsBookmarked(!!bookmarkData);

        // Calculate estimated reading time
        const wordCount = report.content.split(/\s+/).length;
        setEstimatedReadTime(Math.ceil(wordCount / readingSpeed));

        // Load annotations
        const reportAnnotations = await annotationService.getAnnotations(
          report.id,
        );
        setAnnotations(reportAnnotations);

        // Start analytics tracking
        await startReportTracking(report.id, report.report_type, wordCount);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();

    // Cleanup on unmount
    return () => {
      endReportTracking();
    };
  }, [report.id, readingSpeed, startReportTracking, endReportTracking]);

  // Generate table of contents from headings
  useEffect(() => {
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll(
        "h1, h2, h3, h4, h5, h6",
      );
      const toc: TableOfContentsItem[] = [];

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const id = `heading-${index}`;
        heading.id = id;

        toc.push({
          id,
          title: heading.textContent || "",
          level,
          element: heading as HTMLElement,
        });
      });

      setTableOfContents(toc);
    }
  }, [chartData, viewMode]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadingProgress(Math.min(progress, 100));

        // Update analytics
        updateReadingProgress(progress);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
      return () => contentElement.removeEventListener("scroll", handleScroll);
    }
  }, [updateReadingProgress]);

  // Search functionality
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (!term.trim() || !contentRef.current) {
        setSearchResults([]);
        setCurrentSearchIndex(0);
        return;
      }

      const content = contentRef.current.textContent || "";
      const regex = new RegExp(
        term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi",
      );
      const matches = [];
      let match;

      while ((match = regex.exec(content)) !== null) {
        matches.push(match.index);
      }

      setSearchResults(matches);
      setCurrentSearchIndex(0);

      if (matches.length > 0) {
        scrollToSearchResult(0);
      }

      // Track search interaction
      trackReportInteraction("search", { term, resultsCount: matches.length });
    },
    [trackReportInteraction],
  );

  const scrollToSearchResult = (index: number) => {
    if (searchResults.length === 0 || !contentRef.current) return;

    const content = contentRef.current.textContent || "";
    const position = searchResults[index];

    // Find the element containing this text position
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT,
      null,
    );

    let currentPosition = 0;
    let node;

    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent?.length || 0;
      if (currentPosition + nodeLength >= position) {
        const element = node.parentElement;
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Highlight the text temporarily
          element.style.backgroundColor = "rgba(245, 158, 11, 0.3)";
          setTimeout(() => {
            element.style.backgroundColor = "";
          }, 2000);
        }
        break;
      }
      currentPosition += nodeLength;
    }
  };

  const navigateSearch = (direction: "next" | "prev") => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex =
        currentSearchIndex === 0
          ? searchResults.length - 1
          : currentSearchIndex - 1;
    }

    setCurrentSearchIndex(newIndex);
    scrollToSearchResult(newIndex);
  };

  // Bookmark functionality
  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await supabase
          .from("report_bookmarks")
          .delete()
          .eq("report_id", report.id);
        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await supabase
          .from("report_bookmarks")
          .insert({ report_id: report.id });
        setIsBookmarked(true);
        toast.success("Report bookmarked");
      }

      onBookmark?.(report.id, !isBookmarked);
      trackReportInteraction("bookmark", {
        action: isBookmarked ? "remove" : "add",
      });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmark");
    }
  };

  // Export functionality
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // Import the serverPdfExport functions dynamically
      const { generateAndDownloadPdf, generatePdfReport } = await import("../../utils/serverPdfExport");

      // Simple progress simulation
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Since we're calling the edge function, we need to package the report data
      // Create a unique mock report ID to avoid DB queries
      const tempReportId = `temp-${report.id}-${Date.now()}`;
      
      // Use server-side PDF generation
      const downloadUrl = await generatePdfReport(
        report.id, // Use the actual report ID if it exists in DB, otherwise the mock data will be used
        undefined, // Use default template
        {
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate: `<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Mystic Banana Astrology</div>`,
          footerTemplate: `<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
          margin: {
            top: '20mm',
            bottom: '20mm',
            left: '20mm',
            right: '20mm'
          }
        },
        undefined, // No custom template content
        {
          // Include mock data for consistent behavior
          mockData: {
            reportData: {
              id: report.id,
              title: report.title,
              content: report.content,
              report_type: report.report_type,
              is_premium: report.is_premium,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            userProfile: chartData || {
              name: "Test User",
              birthdate: new Date().toISOString(),
              birthplace: "Test Location"
            },
            isMockReport: true
          }
        }
      );

      clearInterval(progressInterval);
      setExportProgress(100);

      if (downloadUrl) {
        // If we got a download URL, use it
        window.open(downloadUrl, '_blank');
        toast.success("PDF exported successfully. Downloading...");
      } else {
        throw new Error("Failed to generate PDF: No download URL returned");
      }

      trackReportExport("pdf", report.id);
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error(`Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`); 
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToDOCX = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // Dynamic import to avoid bundle size issues
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } =
        await import("docx");

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 15, 85));
      }, 150);

      // Parse content into paragraphs
      const contentLines = report.content
        .split("\n")
        .filter((line) => line.trim());
      const docParagraphs = [];

      // Add title
      docParagraphs.push(
        new Paragraph({
          text: report.title,
          heading: HeadingLevel.TITLE,
        }),
      );

      // Add metadata
      if (chartData) {
        docParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated for: ${chartData.name || "User"}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Report Type: ${report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated: ${new Date().toLocaleDateString()}`,
              }),
            ],
          }),
          new Paragraph({ text: "" }), // Empty line
        );
      }

      // Process content lines
      contentLines.forEach((line) => {
        if (line.startsWith("##")) {
          // Heading 2
          docParagraphs.push(
            new Paragraph({
              text: line.replace("##", "").trim(),
              heading: HeadingLevel.HEADING_2,
            }),
          );
        } else if (line.startsWith("#")) {
          // Heading 1
          docParagraphs.push(
            new Paragraph({
              text: line.replace("#", "").trim(),
              heading: HeadingLevel.HEADING_1,
            }),
          );
        } else if (line.includes("**")) {
          // Bold text
          const parts = line.split("**");
          const children = [];
          for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
              if (parts[i]) children.push(new TextRun({ text: parts[i] }));
            } else {
              if (parts[i])
                children.push(new TextRun({ text: parts[i], bold: true }));
            }
          }
          docParagraphs.push(new Paragraph({ children }));
        } else {
          // Regular paragraph
          docParagraphs.push(new Paragraph({ text: line }));
        }
      });

      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docParagraphs,
          },
        ],
      });

      clearInterval(progressInterval);
      setExportProgress(95);

      // Generate and download
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportProgress(100);
      toast.success("DOCX exported successfully");
      trackReportExport("docx", report.id);
    } catch (error) {
      console.error("DOCX export failed:", error);
      toast.error("Failed to export DOCX");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToPlainText = () => {
    try {
      // Clean up the content by removing markdown formatting
      let plainText = report.content
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold formatting
        .replace(/\*(.*?)\*/g, "$1") // Remove italic formatting
        .replace(/#{1,6}\s/g, "") // Remove heading markers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to plain text
        .replace(/\n{3,}/g, "\n\n"); // Normalize line breaks

      // Add header information
      let fullText = `${report.title}\n`;
      fullText += "=".repeat(report.title.length) + "\n\n";

      if (chartData) {
        fullText += `Generated for: ${chartData.name || "User"}\n`;
        fullText += `Report Type: ${report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}\n`;
        fullText += `Generated: ${new Date().toLocaleDateString()}\n\n`;
      }

      fullText += plainText;

      // Add footer
      fullText += "\n\n---\nGenerated by Mystic Banana Astrology";

      const blob = new Blob([fullText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Plain text exported successfully");
      trackReportExport("txt", report.id);
    } catch (error) {
      console.error("Plain text export failed:", error);
      toast.error("Failed to export plain text");
    }
  };

  const exportToHTML = () => {
    try {
      let htmlContent = generateLegacyHTML();

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("HTML exported successfully");
      trackReportExport("html", report.id);
    } catch (error) {
      console.error("HTML export failed:", error);
      toast.error("Failed to export HTML");
    }
  };

  // Share functionality
  const shareReport = async () => {
    try {
      const shareData = {
        title: report.title,
        text: `Check out this ${report.report_type} astrology report`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard");
      }

      onShare?.(report.id, shareData);
      trackReportShare("native", report.id);
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share report");
    }
  };

  // Enhanced Print functionality
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    includeCharts: true,
    includeAnnotations: false,
    pageSize: "A4",
    orientation: "portrait",
    fontSize: "medium",
    includeTableOfContents: true,
    colorMode: "grayscale",
  });

  const printReport = () => {
    // Apply print-specific styles
    document.body.classList.add("printing");

    // Create print-specific stylesheet
    const printStyles = document.createElement("style");
    printStyles.id = "print-styles";
    printStyles.textContent = generatePrintCSS();
    document.head.appendChild(printStyles);

    // Trigger print
    window.print();

    // Cleanup after print
    setTimeout(() => {
      document.body.classList.remove("printing");
      const existingStyles = document.getElementById("print-styles");
      if (existingStyles) {
        existingStyles.remove();
      }
    }, 1000);

    trackReportInteraction("print", {
      reportId: report.id,
      options: printOptions,
    });
  };

  const generatePrintCSS = () => {
    return `
      @media print {
        /* Hide non-essential elements */
        .no-print,
        button:not(.print-button),
        .search-bar,
        .toolbar,
        .annotation-tools,
        .zoom-controls {
          display: none !important;
        }

        /* Page setup */
        @page {
          size: ${printOptions.pageSize} ${printOptions.orientation};
          margin: 2cm 1.5cm;
        }

        /* Body and container styles */
        body {
          background: white !important;
          color: black !important;
          font-size: ${printOptions.fontSize === "small" ? "12px" : printOptions.fontSize === "large" ? "16px" : "14px"} !important;
          line-height: 1.6 !important;
        }

        /* Content container */
        .print-content {
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* Headings */
        h1, h2, h3, h4, h5, h6 {
          color: black !important;
          page-break-after: avoid;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }

        h1 {
          font-size: 24px !important;
          border-bottom: 2px solid #333;
          padding-bottom: 0.5em;
        }

        h2 {
          font-size: 20px !important;
          page-break-before: auto;
        }

        h3 {
          font-size: 18px !important;
        }

        /* Paragraphs and text */
        p {
          margin-bottom: 1em;
          orphans: 3;
          widows: 3;
        }

        /* Page breaks */
        .page-break {
          page-break-before: always;
        }

        .avoid-break {
          page-break-inside: avoid;
        }

        /* Tables */
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
          page-break-inside: avoid;
        }

        th, td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
        }

        th {
          background-color: #f0f0f0 !important;
          font-weight: bold;
        }

        /* Charts and images */
        .chart-container {
          ${
            printOptions.includeCharts
              ? `
            page-break-inside: avoid;
            margin: 1em 0;
            max-height: 400px;
            overflow: hidden;
          `
              : "display: none !important;"
          }
        }

        img, svg {
          max-width: 100% !important;
          height: auto !important;
          ${printOptions.colorMode === "grayscale" ? "filter: grayscale(100%);" : ""}
        }

        /* Annotations */
        .annotation {
          ${
            printOptions.includeAnnotations
              ? `
            border-left: 3px solid #333;
            padding-left: 1em;
            margin: 1em 0;
            background: #f9f9f9 !important;
          `
              : "display: none !important;"
          }
        }

        /* Table of Contents */
        .print-toc {
          ${
            printOptions.includeTableOfContents
              ? `
            page-break-after: always;
            margin-bottom: 2em;
          `
              : "display: none !important;"
          }
        }

        .print-toc h2 {
          border-bottom: 1px solid #333;
          padding-bottom: 0.5em;
        }

        .print-toc ul {
          list-style: none;
          padding: 0;
        }

        .print-toc li {
          margin: 0.5em 0;
          padding-left: ${printOptions.includeTableOfContents ? "1em" : "0"};
        }

        .print-toc a {
          text-decoration: none;
          color: black !important;
        }

        /* Footer */
        .print-footer {
          position: fixed;
          bottom: 1cm;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 10px;
          color: #666;
        }

        /* Prevent breaking of important sections */
        .birth-data-section,
        .planetary-positions,
        .aspect-analysis {
          page-break-inside: avoid;
        }

        /* Links */
        a {
          color: black !important;
          text-decoration: underline;
        }

        a[href]:after {
          content: " (" attr(href) ")";
          font-size: 0.8em;
          color: #666;
        }
      }
    `;
  };

  const showPrintPreview = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const printContent = generatePrintHTML();
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  const generatePrintHTML = () => {
    const toc = printOptions.includeTableOfContents
      ? generateTableOfContents()
      : "";
    const content = contentRef.current?.innerHTML || "";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.title} - Print Version</title>
        <style>${generatePrintCSS()}</style>
      </head>
      <body class="printing">
        <div class="print-content">
          <header class="print-header">
            <h1>${report.title}</h1>
            <p>Generated for: ${chartData?.name || "User"}</p>
            <p>Report Type: ${report.report_type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </header>
          
          ${toc}
          
          <main class="report-content">
            ${content}
          </main>
          
          <footer class="print-footer">
            <p>Generated by Mystic Banana Astrology - Page <span class="page-number"></span></p>
          </footer>
        </div>
      </body>
      </html>
    `;
  };

  const generateTableOfContents = () => {
    return `
      <div class="print-toc">
        <h2>Table of Contents</h2>
        <ul>
          ${tableOfContents
            .map(
              (item) => `
            <li style="margin-left: ${(item.level - 1) * 20}px;">
              <a href="#${item.id}">${item.title}</a>
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>
    `;
  };

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Zoom functionality
  const adjustZoom = (delta: number) => {
    const newZoom = Math.max(50, Math.min(200, zoomLevel + delta));
    setZoomLevel(newZoom);
    trackReportInteraction("zoom", { level: newZoom });
  };

  // Text-to-speech functionality
  const toggleTextToSpeech = () => {
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(report.content);
      utterance.rate = 0.8;
      utterance.onend = () => setIsReading(false);
      speechSynthesis.speak(utterance);
      setIsReading(true);
      trackReportInteraction("text_to_speech", { action: "start" });
    }
  };

  // Annotation functionality
  const handleTextSelection = () => {
    const selection = annotationService.getTextSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
      if (annotationMode) {
        createAnnotationFromSelection(selection);
      }
    }
  };

  const createAnnotationFromSelection = async (selection: Selection) => {
    if (!annotationMode || !selection.toString().trim()) return;

    const position = annotationService.createHighlight(selection, {
      color: "#fbbf24",
      backgroundColor: "rgba(251, 191, 36, 0.2)",
    });

    if (!position) return;

    let content = "";
    if (annotationMode === "highlight") {
      content = selection.toString().trim();
    } else {
      content = newAnnotationContent || `${annotationMode} annotation`;
    }

    const annotation = await annotationService.createAnnotation(
      report.id,
      annotationMode,
      content,
      position,
      {
        color: annotationMode === "highlight" ? "#fbbf24" : "#3b82f6",
        backgroundColor:
          annotationMode === "highlight"
            ? "rgba(251, 191, 36, 0.2)"
            : "rgba(59, 130, 246, 0.2)",
      },
    );

    if (annotation) {
      setAnnotations((prev) => [annotation, ...prev]);
      setNewAnnotationContent("");
      setAnnotationMode(null);
      selection.removeAllRanges();
      toast.success(
        `${annotationMode.charAt(0).toUpperCase() + annotationMode.slice(1)} created`,
      );
      trackReportInteraction("annotation", { type: annotationMode });
    }
  };

  const deleteAnnotation = async (annotationId: string) => {
    const success = await annotationService.deleteAnnotation(annotationId);
    if (success) {
      setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
      setSelectedAnnotation(null);
      toast.success("Annotation deleted");
    }
  };

  const updateAnnotation = async (
    annotationId: string,
    updates: Partial<ReportAnnotation>,
  ) => {
    const updated = await annotationService.updateAnnotation(
      annotationId,
      updates,
    );
    if (updated) {
      setAnnotations((prev) =>
        prev.map((a) => (a.id === annotationId ? updated : a)),
      );
      setSelectedAnnotation(updated);
      toast.success("Annotation updated");
    }
  };

  const exportAnnotations = async (format: "json" | "csv" | "html") => {
    try {
      const blob = await annotationService.exportAnnotations(report.id, format);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `annotations_${report.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Annotations exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export annotations");
    }
  };

  const filteredAnnotations = annotations.filter((annotation) =>
    annotationFilter
      ? annotation.content
          .toLowerCase()
          .includes(annotationFilter.toLowerCase()) ||
        annotation.tags.some((tag) =>
          tag.toLowerCase().includes(annotationFilter.toLowerCase()),
        )
      : true,
  );

  // Report comparison functionality
  const openComparison = () => {
    setShowComparisonModal(true);
  };

  // Generate legacy HTML (same as original HTMLReportViewer)
  const generateLegacyHTML = () => {
    if (!chartData) return "";

    const isVedic = report.report_type.includes("vedic");
    const isHellenistic = report.report_type.includes("hellenistic");
    const isChinese = report.report_type.includes("chinese");
    const isPremium = report.is_premium;
    const userName = chartData?.name || "User";
    const birthDate = chartData?.birth_date
      ? new Date(chartData.birth_date).toLocaleDateString()
      : "";
    const birthTime = chartData?.birth_time || "";
    const birthLocation = chartData?.birth_location;

    const getReportTypeTitle = () => {
      if (isVedic) return "Vedic Astrology Analysis";
      if (isHellenistic) return "Hellenistic Astrology Analysis";
      if (isChinese) return "Chinese Astrology Analysis";
      return "Western Astrology Analysis";
    };

    const getReportTypeIcon = () => {
      if (isVedic) return "🕉️";
      if (isHellenistic) return "🏛️";
      if (isChinese) return "☯️";
      return "⭐";
    };

    const formatReportContent = (content: string) => {
      return content
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>")
        .replace(/^/, "<p>")
        .replace(/$/, "</p>");
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${theme === "light" ? "#ffffff" : theme === "sepia" ? "#f4f1ea" : "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"};
            color: ${theme === "light" ? "#1a1a1a" : theme === "sepia" ? "#5c4b37" : "#e5e5e5"};
            line-height: ${lineHeight};
            font-size: ${fontSize}px;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header {
            text-align: center; margin-bottom: 3rem; padding: 2rem;
            background: ${theme === "light" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : theme === "sepia" ? "linear-gradient(135deg, #8b7355 0%, #a0956b 100%)" : "linear-gradient(135deg, #4A148C 0%, #7E57C2 100%)"};
            border-radius: 1rem; position: relative; overflow: hidden;
        }
        .report-title { font-size: 2.5rem; font-weight: 700; color: white; margin-bottom: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .content-section {
            background: ${theme === "light" ? "rgba(255,255,255,0.8)" : theme === "sepia" ? "rgba(244,241,234,0.8)" : "rgba(45, 45, 45, 0.8)"};
            border-radius: 1rem; padding: 2rem; margin-bottom: 2rem;
            border: 1px solid ${theme === "light" ? "#e5e5e5" : theme === "sepia" ? "#d4c4a8" : "#404040"};
        }
        .content-text { line-height: ${lineHeight}; font-size: ${fontSize}px; }
        @media print { body { background: white; color: black; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="report-title">${report.title}</h1>
            <p class="report-subtitle">Generated for ${userName}</p>
            ${isPremium ? '<div class="premium-badge">👑 Premium Report</div>' : ""}
        </div>
        <div class="content-section">
            <h2 class="section-title">
                <span class="section-icon">${getReportTypeIcon()}</span>
                ${getReportTypeTitle()}
            </h2>
            <div class="content-text">
                ${formatReportContent(report.content)}
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-dark-800 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-white mt-4">Loading enhanced report viewer...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-dark-800 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-white mb-4">
              Error: Could not load chart data for this report.
            </p>
            <Button onClick={onClose} variant="primary">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className={`fixed inset-0 bg-black/80 flex flex-col z-50 ${isFullscreen ? "bg-dark-900" : ""}`}
    >
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 bg-dark-900 border-b border-dark-700">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{report.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>
                {report.report_type
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
              {report.is_premium && (
                <>
                  <span>•</span>
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Premium</span>
                </>
              )}
              <span>•</span>
              <span>{estimatedReadTime} min read</span>
            </div>
          </div>
        </div>

        {/* Enhanced Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search in report..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-48 px-3 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchResults.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <span className="text-xs text-gray-400">
                  {currentSearchIndex + 1}/{searchResults.length}
                </span>
                <button
                  onClick={() => navigateSearch("prev")}
                  className="p-1 hover:bg-dark-600 rounded"
                >
                  <ChevronLeft size={12} className="text-gray-400" />
                </button>
                <button
                  onClick={() => navigateSearch("next")}
                  className="p-1 hover:bg-dark-600 rounded"
                >
                  <ChevronRight size={12} className="text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-dark-700 rounded px-2 py-1">
            <button
              onClick={() => adjustZoom(-10)}
              className="p-1 hover:bg-dark-600 rounded"
              title="Zoom Out"
            >
              <ZoomOut size={14} className="text-gray-400" />
            </button>
            <span className="text-xs text-gray-400 px-2">{zoomLevel}%</span>
            <button
              onClick={() => adjustZoom(10)}
              className="p-1 hover:bg-dark-600 rounded"
              title="Zoom In"
            >
              <ZoomIn size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Action Buttons */}
          <Button
            onClick={toggleBookmark}
            variant="ghost"
            size="sm"
            icon={isBookmarked ? BookmarkCheck : Bookmark}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Report"}
          />

          <Button
            onClick={shareReport}
            variant="ghost"
            size="sm"
            icon={Share2}
            title="Share Report"
          />

          <Button
            onClick={() => setShowTableOfContents(!showTableOfContents)}
            variant="ghost"
            size="sm"
            icon={Menu}
            title="Table of Contents"
          />

          <Button
            onClick={toggleTextToSpeech}
            variant="ghost"
            size="sm"
            icon={isReading ? Pause : Play}
            title={isReading ? "Stop Reading" : "Read Aloud"}
          />

          {/* Print Menu */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              icon={Printer}
              title="Print Options"
            />
            <div className="absolute right-0 top-full mt-1 w-64 bg-dark-700 border border-dark-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={printReport}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors flex items-center space-x-2"
                >
                  <Printer size={14} />
                  <span>Quick Print</span>
                </button>
                <button
                  onClick={() => setShowPrintOptions(true)}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors flex items-center space-x-2"
                >
                  <Settings size={14} />
                  <span>Print Options</span>
                </button>
                <button
                  onClick={showPrintPreview}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors flex items-center space-x-2"
                >
                  <Eye size={14} />
                  <span>Print Preview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Export Menu */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              title="Export Options"
            />
            <div className="absolute right-0 top-full mt-1 w-56 bg-dark-700 border border-dark-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors flex items-center space-x-2"
                >
                  <FileText size={14} />
                  <span>Export as PDF</span>
                  {isExporting && <LoadingSpinner size="sm" />}
                </button>
                <button
                  onClick={exportToDOCX}
                  disabled={isExporting}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors flex items-center space-x-2"
                >
                  <File size={14} />
                  <span>Export as DOCX</span>
                  {isExporting && <LoadingSpinner size="sm" />}
                </button>
                <button
                  onClick={exportToHTML}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors flex items-center space-x-2"
                >
                  <ExternalLink size={14} />
                  <span>Export as HTML</span>
                </button>
                <button
                  onClick={exportToPlainText}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-600 transition-colors flex items-center space-x-2"
                >
                  <Type size={14} />
                  <span>Export as Plain Text</span>
                </button>
              </div>
            </div>
          </div>

          {/* Annotation Tools */}
          <div className="flex items-center space-x-1 bg-dark-700 rounded px-2 py-1">
            <button
              onClick={() =>
                setAnnotationMode(
                  annotationMode === "highlight" ? null : "highlight",
                )
              }
              className={`p-1 rounded transition-colors ${
                annotationMode === "highlight"
                  ? "bg-amber-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Highlight Text"
            >
              <Highlighter size={14} />
            </button>
            <button
              onClick={() =>
                setAnnotationMode(annotationMode === "note" ? null : "note")
              }
              className={`p-1 rounded transition-colors ${
                annotationMode === "note"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Add Note"
            >
              <MessageSquare size={14} />
            </button>
            <button
              onClick={() => setShowAnnotationPanel(!showAnnotationPanel)}
              className={`p-1 rounded transition-colors ${
                showAnnotationPanel
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Show Annotations"
            >
              <Eye size={14} />
            </button>
          </div>

          <Button
            onClick={openComparison}
            variant="ghost"
            size="sm"
            icon={ArrowLeftRight}
            title="Compare Reports"
          />

          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="sm"
            icon={Settings}
            title="Display Settings"
          />

          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            icon={isFullscreen ? Minimize2 : Maximize2}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          />

          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            icon={X}
            title="Close"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-dark-800">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table of Contents Sidebar */}
        {showTableOfContents && (
          <div className="w-80 bg-dark-800 border-r border-dark-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Table of Contents
              </h3>
              <nav className="space-y-2">
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.element?.scrollIntoView({ behavior: "smooth" });
                      trackReportInteraction("toc_navigation", {
                        section: item.title,
                      });
                    }}
                    className={`block w-full text-left px-3 py-2 rounded text-sm hover:bg-dark-700 transition-colors ${
                      item.level === 1
                        ? "text-white font-medium"
                        : item.level === 2
                          ? "text-gray-300 ml-4"
                          : "text-gray-400 ml-8"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Report Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto p-6 relative"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              zoom: `${zoomLevel}%`,
              backgroundColor:
                theme === "light"
                  ? "#ffffff"
                  : theme === "sepia"
                    ? "#f4f1ea"
                    : "#0f0f23",
              color:
                theme === "light"
                  ? "#1a1a1a"
                  : theme === "sepia"
                    ? "#5c4b37"
                    : "#e5e5e5",
            }}
            onMouseUp={handleTextSelection}
          >
            {/* Annotation Mode Indicator */}
            {annotationMode && (
              <div className="absolute top-4 left-4 z-10 bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      annotationMode === "highlight"
                        ? "bg-amber-400"
                        : "bg-blue-400"
                    }`}
                  />
                  <span className="text-white text-sm font-medium">
                    {annotationMode === "highlight"
                      ? "Highlight Mode"
                      : "Note Mode"}
                  </span>
                  <button
                    onClick={() => setAnnotationMode(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                {annotationMode === "note" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Enter note content..."
                      value={newAnnotationContent}
                      onChange={(e) => setNewAnnotationContent(e.target.value)}
                      className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Select text to create {annotationMode}
                </p>
              </div>
            )}

            {/* Existing Annotations Overlay */}
            {showAnnotations &&
              annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute pointer-events-none"
                  style={{
                    // Position would be calculated based on annotation.position
                    // This is a simplified version
                    top: `${Math.random() * 200 + 100}px`,
                    left: `${Math.random() * 200 + 100}px`,
                  }}
                >
                  <div
                    className="pointer-events-auto cursor-pointer px-2 py-1 rounded text-xs shadow-lg"
                    style={{
                      backgroundColor: annotation.style.backgroundColor,
                      color: annotation.style.color,
                      border: `1px solid ${annotation.style.borderColor}`,
                    }}
                    onClick={() => setSelectedAnnotation(annotation)}
                  >
                    {annotation.type === "highlight"
                      ? "📝"
                      : annotation.type === "note"
                        ? "📋"
                        : "💬"}
                  </div>
                </div>
              ))}
            {viewMode === "modern" ? (
              <ReportRenderer
                report={report}
                chartData={chartData}
                className="max-w-4xl mx-auto"
              />
            ) : viewMode === "reader" ? (
              <div className="max-w-3xl mx-auto prose prose-lg">
                <h1 className="text-3xl font-bold mb-6">{report.title}</h1>
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: report.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n\n/g, "</p><p>")
                      .replace(/^/, "<p>")
                      .replace(/$/, "</p>"),
                  }}
                />
              </div>
            ) : (
              <iframe
                srcDoc={generateLegacyHTML()}
                className="w-full h-full border-0"
                title="HTML Report Preview"
              />
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 bg-dark-800 border-l border-dark-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Display Settings
              </h3>

              {/* View Mode */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  View Mode
                </label>
                <div className="space-y-2">
                  {["modern", "reader", "legacy"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as any)}
                      className={`w-full px-3 py-2 text-left rounded transition-colors ${
                        viewMode === mode
                          ? "bg-amber-600 text-white"
                          : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme
                </label>
                <div className="space-y-2">
                  {["dark", "light", "sepia"].map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => setTheme(themeOption as any)}
                      className={`w-full px-3 py-2 text-left rounded transition-colors ${
                        theme === themeOption
                          ? "bg-amber-600 text-white"
                          : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                      }`}
                    >
                      {themeOption.charAt(0).toUpperCase() +
                        themeOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Line Height */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Line Height: {lineHeight}
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Reading Speed */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reading Speed: {readingSpeed} WPM
                </label>
                <input
                  type="range"
                  min="100"
                  max="400"
                  step="25"
                  value={readingSpeed}
                  onChange={(e) => setReadingSpeed(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Options Modal */}
      {showPrintOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Print Options
              </h3>
              <button
                onClick={() => setShowPrintOptions(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Page Size */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Page Size
                </label>
                <select
                  value={printOptions.pageSize}
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      pageSize: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Orientation
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        orientation: "portrait",
                      }))
                    }
                    className={`flex-1 px-3 py-2 rounded transition-colors ${
                      printOptions.orientation === "portrait"
                        ? "bg-amber-600 text-white"
                        : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        orientation: "landscape",
                      }))
                    }
                    className={`flex-1 px-3 py-2 rounded transition-colors ${
                      printOptions.orientation === "landscape"
                        ? "bg-amber-600 text-white"
                        : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size
                </label>
                <div className="flex space-x-2">
                  {["small", "medium", "large"].map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setPrintOptions((prev) => ({ ...prev, fontSize: size }))
                      }
                      className={`flex-1 px-3 py-2 rounded transition-colors capitalize ${
                        printOptions.fontSize === size
                          ? "bg-amber-600 text-white"
                          : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={printOptions.includeCharts}
                    onChange={(e) =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        includeCharts: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-amber-600 bg-dark-700 border-dark-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-gray-300">
                    Include Charts & Graphics
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={printOptions.includeAnnotations}
                    onChange={(e) =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        includeAnnotations: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-amber-600 bg-dark-700 border-dark-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-gray-300">Include Annotations</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={printOptions.includeTableOfContents}
                    onChange={(e) =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        includeTableOfContents: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-amber-600 bg-dark-700 border-dark-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-gray-300">
                    Include Table of Contents
                  </span>
                </label>
              </div>

              {/* Color Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color Mode
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        colorMode: "color",
                      }))
                    }
                    className={`flex-1 px-3 py-2 rounded transition-colors ${
                      printOptions.colorMode === "color"
                        ? "bg-amber-600 text-white"
                        : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                    }`}
                  >
                    Color
                  </button>
                  <button
                    onClick={() =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        colorMode: "grayscale",
                      }))
                    }
                    className={`flex-1 px-3 py-2 rounded transition-colors ${
                      printOptions.colorMode === "grayscale"
                        ? "bg-amber-600 text-white"
                        : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                    }`}
                  >
                    Grayscale
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={showPrintPreview}
                variant="outline"
                className="flex-1"
                icon={Eye}
              >
                Preview
              </Button>
              <Button
                onClick={() => {
                  printReport();
                  setShowPrintOptions(false);
                }}
                variant="primary"
                className="flex-1"
                icon={Printer}
              >
                Print
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Progress Modal */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-white mt-4 mb-2">Exporting PDF...</p>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">{exportProgress}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedReportViewer;
