// Common theme settings for all report renderers
export const reportTheme = {
  // Base colors
  colors: {
    primary: "#FFB74D", // Amber color similar to the app's primary color
    secondary: "#9575CD", // Purple-ish secondary color
    background: {
      base: "#121212", // Dark background consistent with the app
      gradient: "linear-gradient(135deg, #121212 0%, #202020 100%)",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B0B0B0",
      accent: "#FFB74D", // Amber for accents
    },
    charts: {
      western: ["#FFB74D", "#9575CD", "#4FC3F7", "#4DB6AC", "#AED581", "#FF8A65"],
      vedic: ["#FFB74D", "#FF8A65", "#F06292", "#9575CD", "#4FC3F7", "#4DB6AC"],
      chinese: ["#FF8A65", "#FFB74D", "#AED581", "#4DB6AC", "#4FC3F7", "#9575CD"],
      hellenistic: ["#9575CD", "#FFB74D", "#4FC3F7", "#AED581", "#FF8A65", "#F06292"],
    },
    sections: {
      header: "linear-gradient(135deg, #303030 0%, #202020 100%)",
      content: "#1E1E1E",
      card: "#242424",
      highlight: "#2D2D2D",
    },
  },
  // Shared styling
  styles: {
    container: "max-w-6xl mx-auto px-4 sm:px-6 py-8",
    card: "bg-opacity-80 backdrop-filter backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-lg",
    sectionTitle: "text-2xl font-bold text-white mb-4 border-b border-amber-500/30 pb-2",
    chartContainer: "aspect-square max-w-[600px] mx-auto p-4 bg-gray-900/70 rounded-xl border border-gray-800",
  },
  // Chart settings
  charts: {
    size: {
      small: 250,
      medium: 400,
      large: 600,
    },
    lineWidth: 2,
    symbolSize: 16,
  },
  // Font settings
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  // Spacing for consistent layout
  spacing: {
    section: "2.5rem", // space between sections
    element: "1.5rem", // space between elements within a section
    inner: "1rem", // inner padding
  },
};
