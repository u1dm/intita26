import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        muted: "#56645d",
        line: "rgba(11, 51, 41, 0.15)",
        brand: "#0b3329",
        accent: "#19483d"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(11, 51, 41, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
