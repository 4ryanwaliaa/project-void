import type { Config } from "tailwindcss";

/**
 * PROJECT VOID design tokens.
 * Palette is intentionally tiny: near-black voids, a single blood-red signal color,
 * and clinical white text. Everything else is light and atmosphere.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          black: "#050505",
          panel: "#0b0b0d",
          secondary: "#111111",
          line: "#1c1c1f",
          red: "#D1001F",
          "red-bright": "#ff1f3d",
          "red-deep": "#7a0012",
          white: "#ffffff",
          ash: "#8a8a8f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        brand: "0.45em",
        wide: "0.25em",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "41%": { opacity: "1" },
          "42%": { opacity: "0.3" },
          "43%": { opacity: "1" },
          "78%": { opacity: "0.85" },
          "79%": { opacity: "0.2" },
          "80%": { opacity: "1" },
        },
        "pulse-red": {
          "0%, 100%": { opacity: "0.55", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.6)" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "alarm-flash": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        flicker: "flicker 4s infinite steps(1)",
        "pulse-red": "pulse-red 2.4s ease-in-out infinite",
        scan: "scan 6s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "alarm-flash": "alarm-flash 0.4s steps(1) infinite",
      },
      boxShadow: {
        "red-glow": "0 0 30px -4px rgba(209,0,31,0.55)",
        "red-glow-lg": "0 0 80px -10px rgba(209,0,31,0.7)",
      },
    },
  },
  plugins: [],
};

export default config;
