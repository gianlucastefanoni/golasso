// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}", // adattato per TypeScript
  ],
  plugins: [],
};

export default config;
