import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#090909",
        lemon: "#C8FF00",
        "lemon-soft": "#E8FF6A",
        violet: "#8B5CF6",
        "violet-soft": "#C084FC",
        glass: "rgba(255, 255, 255, 0.07)"
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "Pixelify Sans", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        lemon: "0 0 28px rgba(200, 255, 0, 0.28)",
        violet: "0 0 30px rgba(139, 92, 246, 0.22)",
        glass: "0 24px 80px rgba(0, 0, 0, 0.46)"
      },
      backgroundImage: {
        "pixel-grid":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
