import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1B2A4A", soft: "#3C4B6B", faint: "#8A93A6" },
        paper: { DEFAULT: "#FFFFFF", tint: "#F3F5F9", line: "#DDE2EB" },
        seal: { DEFAULT: "#1F7A4D", tint: "#E6F3EC" },      // open / verified
        route: { DEFAULT: "#2457C5", tint: "#E7EEFB" },     // upcoming
        caution: { DEFAULT: "#9A6412", tint: "#FBF1DF" },   // expected / needs verification
        dormant: { DEFAULT: "#6B7280", tint: "#EEEFF2" },   // closed / unknown
      },
      fontFamily: {
        sans: ["var(--font-plex)", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
      },
      maxWidth: { page: "76rem" },
    },
  },
  plugins: [],
};
export default config;
