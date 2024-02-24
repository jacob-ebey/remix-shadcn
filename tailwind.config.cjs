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
				progress: {
					"0%": { transform: " translateX(0) scaleX(0)" },
					"40%": { transform: "translateX(0) scaleX(0.4)" },
					"100%": { transform: "translateX(100%) scaleX(0.5)" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				progress: "progress 1s infinite linear",
			},
			transformOrigin: {
				"left-right": "0% 50%",
			},
			typography: () => ({
				DEFAULT: {
					css: {
						color: lightDarkVar("foreground"),
						'[class~="lead"]': {
							color: lightDarkVar("foreground"),
						},
						a: {
							color: lightDarkVar("primary"),
						},
						strong: {
							color: lightDarkVar("foreground"),
						},
						"a strong": {
							color: lightDarkVar("primary"),
						},
						"blockquote strong": {
							color: lightDarkVar("foreground"),
						},
						"thead th strong": {
							color: lightDarkVar("foreground"),
						},
						"ol > li::marker": {
							color: lightDarkVar("foreground"),
						},
						"ul > li::marker": {
							color: lightDarkVar("foreground"),
						},
						dt: {
							color: lightDarkVar("foreground"),
						},
						blockquote: {
							color: lightDarkVar("foreground"),
						},
						h1: {
							color: lightDarkVar("foreground"),
						},
						"h1 strong": {
							color: lightDarkVar("foreground"),
						},
						h2: {
							color: lightDarkVar("foreground"),
						},
						"h2 strong": {
							color: lightDarkVar("foreground"),
						},
						h3: {
							color: lightDarkVar("foreground"),
						},
						"h3 strong": {
							color: lightDarkVar("foreground"),
						},
						h4: {
							color: lightDarkVar("foreground"),
						},
						"h4 strong": {
							color: lightDarkVar("foreground"),
						},
						kbd: {
							color: lightDarkVar("foreground"),
						},
						code: {
							color: lightDarkVar("foreground"),
						},
						"a code": {
							color: lightDarkVar("primary"),
						},
						"h1 code": {
							color: lightDarkVar("foreground"),
						},
						"h2 code": {
							color: lightDarkVar("foreground"),
						},
						"h3 code": {
							color: lightDarkVar("foreground"),
						},
						"h4 code": {
							color: lightDarkVar("foreground"),
						},
						"blockquote code": {
							color: lightDarkVar("foreground"),
						},
						"thead th code": {
							color: lightDarkVar("foreground"),
						},
						pre: {
							color: lightDarkVar("foreground"),
						},
						"pre code": {
							color: lightDarkVar("foreground"),
						},
						"thead th": {
							color: lightDarkVar("foreground"),
						},
						figcaption: {
							color: lightDarkVar("foreground"),
						},
					},
				},
			}),
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography"),
		require("@tailwindcss/container-queries"),
	],
};
