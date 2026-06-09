import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
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
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ["Inter", "-apple-system", "sans-serif"],
      },
      colors: {
        // ── ArtKrate Design Tokens ────────────────────
        canvas: "hsl(24, 12%, 6%)",
        surface: {
          DEFAULT: "hsl(24, 10%, 10%)",
          raised: "hsl(24, 9%, 14%)",
          border: "hsl(30, 15%, 20%)",
        },
        cream: {
          DEFAULT: "hsl(42, 40%, 93%)",
          muted: "hsl(38, 25%, 70%)",
          subtle: "hsl(36, 15%, 45%)",
        },
        gold: {
          DEFAULT: "hsl(42, 60%, 54%)",
          hover: "hsl(40, 65%, 48%)",
          muted: "hsl(42, 40%, 35%)",
          light: "hsl(44, 70%, 70%)",
        },
        ochre: "hsl(36, 80%, 36%)",
        terra: {
          DEFAULT: "hsl(16, 65%, 46%)",
          hover: "hsl(15, 68%, 40%)",
          muted: "hsl(16, 45%, 30%)",
        },
        admin: {
          bg: "hsl(214, 25%, 18%)",
          accent: "hsl(210, 60%, 55%)",
          border: "hsl(213, 20%, 28%)",
        },
        // ── ShadCN compat ─────────────────────────────
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
        fadeSlideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-12px) rotate(1deg)" },
          "66%": { transform: "translateY(-6px) rotate(-0.5deg)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(42 60% 54% / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px hsl(42 60% 54% / 0)" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-slide-up": "fadeSlideUp 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        shimmer: "shimmer 4s linear infinite",
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        typewriter: "typewriter 2s steps(40, end)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
