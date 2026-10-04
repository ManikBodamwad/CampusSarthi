import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        slate: {
          850: "#151e2e",
          900: "#0f172a",
          950: "#090d16",
        },
        crimson: {
          DEFAULT: "#881337",
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        amber: {
          500: "#f59e0b",
          600: "#d97706",
        },
        emerald: {
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.08)',
        'glass-lg': '0 12px 40px 0 rgba(15, 23, 42, 0.12)',
        'glow-brand': '0 0 24px -4px rgba(99, 102, 241, 0.4)',
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.4)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
export default config;
