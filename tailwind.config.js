/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
        accent: {
          // Cosmic Deep Purple
          DEFAULT: "#4A148C",
          400: "#7E57C2",
          500: "#5E1EB5",
          600: "#4A148C",
          700: "#3D0F73",
        },
        gold: {
          // Cosmic Accent Gold with better contrast
          DEFAULT: "#B8860B", // Darker gold for better readability
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // Medium gold
          600: "#D97706",
          700: "#B45309", // Dark gold for text
          800: "#92400E",
          900: "#78350F",
        },
        celestialBlue: {
          // Cosmic Celestial Blue
          DEFAULT: "#1A237E",
          // Add more shades if needed
        },
        magazine: {
          primary: "#1a1a1a",
          secondary: "#2d2d2d",
          accent: "#F59E0B", // Better contrast gold
          text: "#e5e5e5",
          muted: "#737373",
          border: "#404040",
          highlight: "#D97706", // Darker gold for highlights
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif",
        ],
        serif: ["Playfair Display", "Georgia", "Times New Roman", "serif"],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "4.5xl": ["2.5rem", "1.15"],
        "5.5xl": ["3.5rem", "1.15"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      gridTemplateColumns: {
        magazine: "repeat(12, minmax(0, 1fr))",
        featured: "repeat(auto-fit, minmax(300px, 1fr))",
      },
      height: {
        128: "32rem",
        144: "36rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
