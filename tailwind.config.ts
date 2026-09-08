import type { Config } from "tailwindcss";
import zaadPreset from "@zaad/design-system/tailwind.preset";

const config: Config = {
  presets: [zaadPreset as Config],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
