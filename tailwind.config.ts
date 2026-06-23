import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B1538",
          dark: "#6E102C",
          light: "#A31A44",
        },
        secondary: {
          DEFAULT: "#F2B824",
          dark: "#D9A31F",
          light: "#F5C84D",
        },
        brand: {
          gray: "#706F6F",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F5F5",
          border: "#E8E8E8",
        },
      },
      fontFamily: {
        sans: ["Tajawal", "Tahoma", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
