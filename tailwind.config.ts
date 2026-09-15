import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      },
      colors: {
        forest: {
          50: "#effaf2",
          100: "#d9f2df",
          200: "#b6e5c2",
          300: "#83d19b",
          400: "#49b76f",
          500: "#1c9d4c",
          600: "#0f7d38",
          700: "#0c632e",
          800: "#0a4f28",
          900: "#073d20",
          950: "#032414"
        },
        harvest: {
          100: "#fff4cc",
          300: "#ffd95c",
          500: "#f5b51b",
          700: "#b97808"
        },
        soil: "#6b4f33"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(2, 36, 20, 0.12)",
        line: "0 1px 0 rgba(7, 61, 32, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
