//Path: agentic-ai-main\tailwind.config.ts
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typographyPlugin from "@tailwindcss/typography";

export default {
  // Use 'class' for class-based dark mode strategy
  darkMode: "class",
  
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'arial'],
      },
      colors: {
        border: "hsl(0 0% 16.5%)",
        input: "hsl(0 0% 16.5%)",
        ring: "hsl(51 100% 50%)",
        background: "hsl(0 0% 3.9%)",
        foreground: "hsl(0 0% 100%)",
        primary: {
          DEFAULT: "hsl(51 100% 50%)",
          foreground: "hsl(0 0% 0%)",
        },
        secondary: {
          DEFAULT: "hsl(39 100% 50%)",
          foreground: "hsl(0 0% 0%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(0 0% 16.5%)",
          foreground: "hsl(0 0% 62.7%)",
        },
        accent: {
          DEFAULT: "hsl(51 100% 50%)",
          foreground: "hsl(0 0% 0%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 10.2%)",
          foreground: "hsl(0 0% 100%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 10.2%)",
          foreground: "hsl(0 0% 100%)",
        },
        gold: {
          DEFAULT: "#FFD700",
          light: "#FFF5CC",
          dark: "#B8860B",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: '#FFD700',
              textDecoration: 'underline',
              '&:hover': {
                color: '#FFC700',
              },
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  
  plugins: [
    tailwindcssAnimate,
    typographyPlugin,
  ],
} satisfies Config;