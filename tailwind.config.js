function lightDarkVar(baseName) {
  return `var(--theme-light, hsl(var(--${baseName}))) var(--theme-dark, hsl(var(--${baseName}-dark)))`;
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
        border: lightDarkVar("border"),
        input: lightDarkVar("input"),
        ring: lightDarkVar("ring"),
        background: lightDarkVar("background"),
        foreground: lightDarkVar("foreground"),
        primary: {
          DEFAULT: lightDarkVar("primary"),
          foreground: lightDarkVar("primary-foreground"),
        },
        secondary: {
          DEFAULT: lightDarkVar("secondary"),
          foreground: lightDarkVar("secondary-foreground"),
        },
        destructive: {
          DEFAULT: lightDarkVar("destructive"),
          foreground: lightDarkVar("destructive-foreground"),
        },
        muted: {
          DEFAULT: lightDarkVar("muted"),
          foreground: lightDarkVar("muted-foreground"),
        },
        accent: {
          DEFAULT: lightDarkVar("accent"),
          foreground: lightDarkVar("accent-foreground"),
        },
        popover: {
          DEFAULT: lightDarkVar("popover"),
          foreground: lightDarkVar("popover-foreground"),
        },
        card: {
          DEFAULT: lightDarkVar("card"),
          foreground: lightDarkVar("card-foreground"),
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
