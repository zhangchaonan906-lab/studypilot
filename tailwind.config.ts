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
        ink: "#18212f",
        mist: "#f5f7fb",
        primary: "#2563eb",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(24, 33, 47, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
