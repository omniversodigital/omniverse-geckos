import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Gaming theme colors
        gecko: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        neon: {
          blue: '#00ffff',
          pink: '#ff00ff',
          green: '#00ff00',
          yellow: '#ffff00',
          purple: '#8b00ff',
        },
        game: {
          gold: '#ffd700',
          silver: '#c0c0c0',
          bronze: '#cd7f32',
          legendary: '#ff6b35',
          epic: '#9b59b6',
          rare: '#3498db',
          common: '#95a5a6',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
        heading: ['var(--font-heading)', ...fontFamily.serif],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Gaming animations
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px currentColor',
            opacity: '1',
          },
          '50%': { 
            boxShadow: '0 0 20px currentColor, 0 0 30px currentColor',
            opacity: '0.8',
          },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-in': {
          '0%': { 
            transform: 'scale(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'scale(1.1)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
          '100%': { 
            transform: 'scale(1)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
        },
        'slide-up': {
          '0%': {
            transform: 'translateY(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'gecko-wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'gecko-wiggle': 'gecko-wiggle 1s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        'game-grid': `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '475px',
        '3xl': '1680px',
        '4xl': '2048px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      blur: {
        xs: '2px',
      },
      brightness: {
        25: '.25',
        175: '1.75',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    // Custom plugin for game-specific utilities
    function({ addUtilities, theme, addComponents }) {
      const newUtilities = {
        '.text-glow': {
          textShadow: '0 0 10px currentColor',
        },
        '.text-glow-lg': {
          textShadow: '0 0 20px currentColor, 0 0 30px currentColor',
        },
        '.border-glow': {
          boxShadow: '0 0 10px currentColor',
        },
        '.border-glow-lg': {
          boxShadow: '0 0 20px currentColor, 0 0 30px currentColor',
        },
        '.bg-grid': {
          backgroundImage: theme('backgroundImage.game-grid'),
          backgroundSize: '20px 20px',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.gradient-mask': {
          '-webkit-mask-image': 'linear-gradient(to bottom, black 70%, transparent 100%)',
          'mask-image': 'linear-gradient(to bottom, black 70%, transparent 100%)',
        },
      }

      const newComponents = {
        '.card-game': {
          '@apply bg-card border border-border rounded-lg p-6 shadow-lg backdrop-blur-sm': {},
          '&:hover': {
            '@apply shadow-xl border-glow transition-all duration-300': {},
          },
        },
        '.btn-game': {
          '@apply inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50': {},
          '&.primary': {
            '@apply bg-primary text-primary-foreground hover:bg-primary/90': {},
          },
          '&.secondary': {
            '@apply bg-secondary text-secondary-foreground hover:bg-secondary/80': {},
          },
          '&.neon': {
            '@apply border-2 border-current text-neon-blue bg-transparent': {},
            '&:hover': {
              '@apply bg-neon-blue text-black shadow-lg border-glow': {},
            },
          },
        },
        '.nft-card': {
          '@apply relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 backdrop-blur-sm transition-all duration-300': {},
          '&:hover': {
            '@apply scale-102 shadow-2xl border-glow': {},
            '&::before': {
              content: '""',
              '@apply absolute inset-0 bg-shimmer-gradient opacity-0 transition-opacity duration-300': {},
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
            },
            '&:hover::before': {
              '@apply opacity-100': {},
            },
          },
        },
      }

      addUtilities(newUtilities)
      addComponents(newComponents)
    },
  ],
}

export default config