/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E1F5FE',
          100: '#BAE6FD',
          200: '#8ED8FC',
          300: '#6BC5FB',
          400: '#4BB2F8',
          500: '#33A0F6',
          600: '#1E8CE5',
          700: '#0D78D6',
          800: '#0266C8',
          900: '#0054A6',
        },
        accent: {
          light: '#E1F5FE',
          DEFAULT: '#0266C8',
          dark: '#0054A6',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0B0F19',
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(2, 102, 200, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(2, 102, 200, 0.15)',
        glow: '0 0 25px -5px rgba(2, 102, 200, 0.4)',
      },
    },
  },
  plugins: [],
};
