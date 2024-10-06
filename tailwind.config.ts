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
        primarySpotify: "#1ed760"
      },
      textColor: {
        primarySpotify: "#1ed760"
      },
      fill: {
        primarySpotify: "#1ed760"
      }
    },
  },
  plugins: [],
};
export default config;
