function c(light, dark) {
  return `var(--theme-light, ${light}) var(--theme-dark, ${dark})`;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: c("hsl(214.3 31.8% 91.4%)", "hsl(217.2 32.6% 17.5%)"),
        input: c("hsl(214.3 31.8% 91.4%)", "hsl(217.2 32.6% 17.5%)"),
        ring: c("hsl(222.2 84% 4.9%)", "hsl(212.7 26.8% 83.9%)"),
        background: c("hsl(0 0% 100%)", "hsl(222.2 84% 4.9%)"),
        foreground: c("hsl(222.2 84% 4.9%)", "hsl(210 40% 98%)"),
        primary: {
          DEFAULT: c("hsl(222.2 47.4% 11.2%)", "hsl(210 40% 98%)"),
          foreground: c("hsl(210 40% 98%)", "hsl(222.2 47.4% 11.2%)"),
        },
        secondary: {
          DEFAULT: c("hsl(210 40% 96.1%)", "hsl(217.2 32.6% 17.5%)"),
          foreground: c("hsl(222.2 47.4% 11.2%)", "hsl(210 40% 98%)"),
        },
        destructive: {
          DEFAULT: c("hsl(0 84.2% 60.2%)", "hsl(0 62.8% 30.6%)"),
          foreground: c("hsl(210 40% 98%)", "hsl(210 40% 98%)"),
        },
        muted: {
          DEFAULT: c("hsl(210 40% 96.1%)", "hsl(217.2 32.6% 17.5%)"),
          foreground: c("hsl(215.4 16.3% 46.9%)", "hsl(215 20.2% 65.1%)"),
        },
        accent: {
          DEFAULT: c("hsl(210 40% 96.1%)", "hsl(217.2 32.6% 17.5%)"),
          foreground: c("hsl(217.2 32.6% 17.5%)", "hsl(210 40% 98%)"),
        },
        popover: {
          DEFAULT: c("hsl(0 0% 100%)", "hsl(222.2 84% 4.9%)"),
          foreground: c("hsl(222.2 84% 4.9%)", "hsl(210 40% 98%)"),
        },
        card: {
          DEFAULT: c("hsl(0 0% 100%)", "hsl(222.2 84% 4.9%)"),
          foreground: c("hsl(222.2 84% 4.9%)", "hsl(210 40% 98%)"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
