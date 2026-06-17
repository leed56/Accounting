/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFBFC',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        primary: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          dark: '#15803D',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
        ai: {
          DEFAULT: '#8B5CF6',
          light: '#EDE9FE',
        },
        income: '#16A34A',
        expense: '#EF4444',
        profit: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        sinhala: ['"Noto Sans Sinhala"', 'Inter', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.08)',
        elevated: '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        lg: '16px',
      },
    },
  },
  plugins: [],
};
