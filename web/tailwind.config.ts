import type { Config } from "tailwindcss";

/**
 * "Matchday Broadcast" design system.
 * Bold condensed type, solid panels with hard edges, flame-orange on warm ink.
 * Deliberately NOT the dark/neon/glassmorphism default.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm ink base (stadium at night, not pure black)
        ink: {
          950: "#0a0c0b",
          900: "#101413",
          850: "#151a18",
          800: "#1b211f",
          700: "#262e2b",
          600: "#36403c",
        },
        // Kept the `pitch` name so existing markup maps onto the new ink scale
        pitch: {
          950: "#0a0c0b",
          900: "#101413",
          800: "#1b211f",
          700: "#262e2b",
        },
        cream: "#f4efe2", // primary text
        bone: "#cdc7b8", // muted text
        // Brand accents — flame is primary (NOT neon green)
        flame: "#ff4d1c",
        "flame-soft": "#ff7a4d",
        turf: "#16d672", // green used sparingly, as the pitch nod
        gold: "#ffc233",
        cobalt: "#3b6bff",
        magenta: "#ff2e7e",
        // Aliases so legacy class names keep working with the new palette
        neon: {
          DEFAULT: "#ff4d1c",
          soft: "#ff7a4d",
          dim: "#c23a12",
        },
        electric: "#3b6bff",
      },
      fontFamily: {
        display: ["var(--font-display)", "Oswald", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Archivo", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Hard offset shadows — tactile, print-like, no blur
        hard: "4px 4px 0 0 #000",
        "hard-lg": "7px 7px 0 0 #000",
        "hard-flame": "5px 5px 0 0 #ff4d1c",
        // Back-compat aliases for legacy class names
        neon: "3px 3px 0 0 #ff4d1c",
        glass: "0 2px 0 0 rgba(0,0,0,0.5)",
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
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        ticker: "ticker 30s linear infinite",
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
