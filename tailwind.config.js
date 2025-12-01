/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A84FF',
        secondary: "#F2F2F7",
        accent: "#FF9F0A",
        background: "#FFFFFF",
        foreground: "#1C1C1E",
      },
      borderRadius: {
        DEFAULT: "12px",
      },
      boxShadow: {
        card: "0 10px 25px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
