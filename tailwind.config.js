/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryGreen: "#4C9390", // Primary Accent Green
        secondaryGreen: "#5BA9A5", // Medium Green for Hover States
        tertiaryGreen: "#F8FFFF", // Light Green for Selected Backgrounds
        primaryWhite: "#FFFFFF", // Neutral White for Light Backgrounds and Text
        primaryGray: "#2B2B2B", // Primary Dark Gray for Dark Backgrounds and Text
        secondaryGray: "#AFAFAF", // Mid Gray for Borders
        tertiaryGray: "#E5E7Eb", // Light Gray for Secondary Light Backgrounds
        labelGray: "#4b5563", // Gray for Bold Text
        errorRed: "#F24822", // Red for Error Messages
        successGreen: "#20A161", // Green for Success Messages
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        accent: ["Abel", "sans-serif"],
      },
    },
  },
  plugins: [],
};
