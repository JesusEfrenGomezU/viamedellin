/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          300: '#9EEAA8',
          400: '#6DD97A',
          500: '#4CC85A',
          600: '#38A846',
        },
        oscuro: {
          950: '#050810',
          900: '#080C17',
          800: '#0D1220',
          700: '#131B2E',
          600: '#1C2640',
          500: '#263352',
          400: '#354769',
        },
        gris: {
          400: '#8BA3BF',
          500: '#5E7A9A',
          600: '#3D5470',
        }
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(76, 200, 90, 0.35)',
        'glow-sm': '0 0 12px rgba(76, 200, 90, 0.25)',
        card: '0 4px 24px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-city': 'linear-gradient(160deg, #0D1220 0%, #0A111E 50%, #060D18 100%)',
        'gradient-verde': 'linear-gradient(135deg, #4CC85A 0%, #38A846 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(76, 200, 90, 0.2)' },
          '50%': { boxShadow: '0 0 28px rgba(76, 200, 90, 0.45)' },
        },
      },
    },
  },
  plugins: [],
}
