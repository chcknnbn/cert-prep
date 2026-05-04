/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        space: {
          950: 'rgb(var(--space-950) / <alpha-value>)',
          900: 'rgb(var(--space-900) / <alpha-value>)',
          850: 'rgb(var(--space-850) / <alpha-value>)',
          800: 'rgb(var(--space-800) / <alpha-value>)',
          750: 'rgb(var(--space-750) / <alpha-value>)',
          700: 'rgb(var(--space-700) / <alpha-value>)',
          600: 'rgb(var(--space-600) / <alpha-value>)',
          500: 'rgb(var(--space-500) / <alpha-value>)',
          400: 'rgb(var(--space-400) / <alpha-value>)',
          300: 'rgb(var(--space-300) / <alpha-value>)',
          200: 'rgb(var(--space-200) / <alpha-value>)',
          100: 'rgb(var(--space-100) / <alpha-value>)',
          50:  'rgb(var(--space-50) / <alpha-value>)',
        },
        amber: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
      },
      animation: {
        'scanline': 'scanline 2s linear infinite',
        'pulse-amber': 'pulseAmber 2s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        pulseAmber: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(245, 158, 11, 0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
