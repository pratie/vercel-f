/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
        // Brand orange. Tailwind's stock orange-500 is #f97316, which is a
        // visibly different hue to the #ff4500 used in the logo and landing
        // page -- the app looked like a second product. Re-anchoring the ramp
        // here fixes every existing orange-* utility in one place.
        orange: {
          50: '#fff4f0',
          100: '#ffe4d9',
          200: '#ffc7b3',
          300: '#ffa284',
          400: '#ff7448',
          500: '#ff4500',
          600: '#e63e00',
          700: '#bf3400',
          800: '#992900',
          900: '#7a2100',
          950: '#420f00',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Warm neutrals for the app shell. `paper` is the page background,
        // `ink` the text ramp — both slightly warm so white cards get depth.
        paper: '#faf8f4',
        cream: '#f4efe7',
        ink: {
          900: '#241d15',
          700: '#453c31',
          600: '#5c5346',
          400: '#8a8072',
          300: '#b3a996',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        // The layered "shadow border" cards use everywhere. Tokenised so the
        // raw rgba stack isn't copy-pasted into 15 different className strings.
        card: 'var(--shadow-border)',
        'card-hover': 'var(--shadow-border-hover)',
        orange: 'var(--shadow-orange)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
