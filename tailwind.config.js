/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,

  // ⭐ Correct content paths for Next.js App Router
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.module.css",
    "./components/**/*.module.css",
  ],

  // Using `_` instead of `:` for responsive/hover variants
  separator: "_",

  theme: {
    extend: {
      colors: {
        primary: '#161413',
        secondary: "#F2F2F7",
        accent: "#FF9F0A",
        background: "#FFFFFF",
        foreground: "#161413",
        black: "#161413",
        white: "#FFFFFF",
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

  plugins: [
    // ⭐ Custom Tailwind Utility: no-transform
    function ({ addUtilities }) {
      addUtilities(
        {
          ".no-transform": {
            transform: "none !important",
          },
        },
        {
          variants: ["responsive", "hover", "focus"], // generates lg:no-transform, md:no-transform, etc.
        }
      );
    },
  ],
};
