/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#30B464",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "emerald": {
          50: "#ecfdf3",
          100: "#d1fae3",
          200: "#a7f3cb",
          300: "#6ee7a8",
          400: "#34d37f",
          500: "#30B464",
          600: "#2a9d57",
          700: "#237d47",
          800: "#1f633a",
          900: "#1b5131",
          950: "#0a2d19",
        },
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
