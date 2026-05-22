import type { Config } from "tailwindcss";

/**
 * "Red Zone" design system — modern red + black mobile sports app.
 * Deep black surfaces, vivid red accents, white type, rounded cards,
 * pill buttons, bold condensed numerals. (ref: live-match / player-profile UI)
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Near-black surface ramp
        ink: {
          950: "#070708",
          900: "#0c0c0e",
          850: "#141417",
          800: "#1a1a1e",
          700: "#26262c",
          600: "#3a3a42",
        },
        // Kept the `pitch` name so existing markup maps onto the black ramp
        pitch: {
          950: "#070708",
          900: "#0c0c0e",
          800: "#1a1a1e",
          700: "#26262c",
        },
        cream: "#ffffff", // primary text (now white)
        bone: "#8a8a93", // muted text
        // Brand red is primary
        red: {
          DEFAULT: "#ff2d2d",
          400: "#ff5a5a",
          500: "#ff2d2d",
          600: "#e11414",
          700: "#b50f0f",
        },
        flame: "#ff2d2d",
        "flame-soft": "#ff5a5a",
        turf: "#16d672",
        gold: "#ffc233",
        cobalt: "#3b6bff",
        magenta: "#ff2e7e",
        // Legacy aliases now mapped to red
        neon: {
          DEFAULT: "#ff2d2d",
          soft: "#ff5a5a",
          dim: "#b50f0f",
        },
        electric: "#3b6bff",
      },
      fontFamily: {
        display: ["var(--font-display)", "Oswald", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Archivo", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Soft glows / lifts (sleek app feel)
        red: "0 10px 30px rgba(255,45,45,0.35)",
        "red-sm": "0 6px 18px rgba(255,45,45,0.30)",
        lift: "0 12px 40px rgba(0,0,0,0.55)",
        // Back-compat aliases
        neon: "0 10px 30px rgba(255,45,45,0.35)",
        glass: "0 12px 40px rgba(0,0,0,0.45)",
        hard: "0 8px 24px rgba(0,0,0,0.5)",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseDot: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.85)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        ticker: "ticker 32s linear infinite",
        float: "float 5s ease-in-out infinite",
        pulseDot: "pulseDot 1.4s ease-in-out infinite",
        pulseGlow: "pulseDot 1.4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
