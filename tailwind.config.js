import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        navy: {
          50: "#f0f4fc",
          100: "#e0ebf9",
          500: "#4f46e5", // Electric indigo-blue
          700: "#3730a3",
          800: "#1e1b4b", // Deep indigo-navy
          900: "#0f172a", // Dark slate
          950: "#020617", // Ultra-dark
        },
        verified: "#10b981", // Emerald green
        danger: "#ef4444",   // Premium rose-red
        pending: "#f59e0b",  // Amber orange
        surface: "#f8fafc",  // Light slate background
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(10 28 73 / 0.04), 0 1px 2px -1px rgb(10 28 73 / 0.06)",
        premium: "0 10px 30px -10px rgba(79, 70, 229, 0.15), 0 1px 3px 0 rgba(79, 70, 229, 0.05)",
        glow: "0 0 20px 0 rgba(79, 70, 229, 0.15)",
        verifiedGlow: "0 0 25px 0 rgba(16, 185, 129, 0.2)",
      },
      animation: {
        scan: "scan 2.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%, 100%": { transform: "translateY(0%)", opacity: "0.2" },
          "50%": { transform: "translateY(100%)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;