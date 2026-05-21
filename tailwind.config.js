/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Montserrat"', "system-ui", "sans-serif"],
      },
      animation: {
        "spin-reverse": "spin 3s linear infinite reverse",
        "fade-in": "fadeIn 0.5s ease-out both",
        "fade-in-delayed": "fadeIn 1s ease-out 1.4s forwards",
        shake: "shake 0.5s ease-in-out infinite",
        "shake-once": "shakeOnce 0.5s ease-in-out 1",
        rainbow: "rainbow 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0) rotate(0)" },
          "20%": { transform: "translateX(-3px) rotate(-0.5deg)" },
          "40%": { transform: "translateX(3px) rotate(0.5deg)" },
          "60%": { transform: "translateX(-2px) rotate(-0.3deg)" },
          "80%": { transform: "translateX(2px) rotate(0.3deg)" },
        },
        shakeOnce: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-12px)" },
          "40%": { transform: "translateX(12px)" },
          "60%": { transform: "translateX(-8px)" },
          "80%": { transform: "translateX(8px)" },
        },
        rainbow: {
          "0%": { color: "#000000" },
          "20%": { color: "#ff2d55" },
          "40%": { color: "#ff9500" },
          "60%": { color: "#34c759" },
          "80%": { color: "#007aff" },
          "100%": { color: "#000000" },
        },
      },
    },
  },
  plugins: [],
};
