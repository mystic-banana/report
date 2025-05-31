/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        accent: { // Cosmic Deep Purple
          DEFAULT: '#4A148C',
          400: '#7E57C2', // Added for text-accent-400
          500: '#5E1EB5',
          600: '#4A148C',
          700: '#3D0F73'
        },
        gold: { // Cosmic Accent Gold
          DEFAULT: '#FFD700'
          // Add more shades if needed e.g.:
          // light: '#FFEB99',
          // dark: '#B8860B',
        },
        celestialBlue: { // Cosmic Celestial Blue
          DEFAULT: '#1A237E'
          // Add more shades if needed
        },
        magazine: {
          primary: '#1a1a1a',
          secondary: '#2d2d2d',
          accent: '#FFD700', // Updated to Cosmic Gold
          text: '#e5e5e5',
          muted: '#737373',
          border: '#404040',
          highlight: '#FFD700' // Updated to Cosmic Gold
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        '4.5xl': ['2.5rem', '1.15'],
        '5.5xl': ['3.5rem', '1.15'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      gridTemplateColumns: {
        'magazine': 'repeat(12, minmax(0, 1fr))',
        'featured': 'repeat(auto-fit, minmax(300px, 1fr))',
      },
      height: {
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};