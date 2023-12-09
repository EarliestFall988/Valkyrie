import { type Config } from "tailwindcss";

export default {
  important: true,
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "hero-pattern": "url('/img/hero-pattern.svg')",
      },
      animation: {
        fade: "fade 0.5s ease-in-out",
        fadeSlideDown: "fadeSlideDown 0.5s ease-in-out",
        popover: "popover 0.125s ease-in-out",
        fadeSlideUp: "fadeSlideUp 0.5s ease-in-out",
        toastSlide: "toastSlide 5s ease-in-out",
      },
      keyframes: {
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeSlideDown: {
          "0%": { opacity: "0", transform: "translateY(-2px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        popover: {
          "0%": { opacity: "0", transform: "translateY(-2px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        fadeSlideUp: {
          "0%": { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        toastSlide: {
          "0%": { opacity: "0", transform: "translateY(120%)" },
          "10%": { opacity: "1", transform: "translateY(0%)" },
          "90%": { opacity: "1", transform: "translateY(0%)" },
          "100%": { opacity: "0", transform: "translateY(40%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
