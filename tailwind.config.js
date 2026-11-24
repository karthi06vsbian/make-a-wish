/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#06030c',
          900: '#0c0717',
          850: '#120b22',
          800: '#190e30',
          700: '#251545',
          600: '#382065',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        cream: {
          50: '#ffffff',
          100: '#fdfbf7',
          200: '#f8f4ec',
          300: '#f0e8d9',
          400: '#e3d4bd',
          DEFAULT: '#fdfbf7',
        },
        sacred: {
          flame: '#f97316',
          crimson: '#e11d48',
          saffron: '#ff7722',
          lotus: '#e879f9',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -3px rgba(245, 158, 11, 0.35)',
        'glow-gold-lg': '0 0 50px 0px rgba(245, 158, 11, 0.45)',
        'glow-diya': '0 0 35px 2px rgba(249, 115, 22, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'diya-flicker': 'diyaFlicker 2.5s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        diyaFlicker: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1) translateY(0)' },
          '25%': { opacity: '1', transform: 'scale(1.05) translateY(-1px)' },
          '50%': { opacity: '0.85', transform: 'scale(0.97) translateY(1px)' },
          '75%': { opacity: '0.95', transform: 'scale(1.03) translateY(-0.5px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
