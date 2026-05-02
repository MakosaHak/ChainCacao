module.exports = {
  content: ["./index.html", "./script.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#154212",
        secondary: "#755750",
        tertiary: "#735c00",
        background: "#fdfdf6",
        surface: "#ffffff",
        "surface-variant": "#f4f4e8",
        outline: "#72796e",
        "on-surface": "#1b1d0e",
        "on-primary": "#ffffff",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};