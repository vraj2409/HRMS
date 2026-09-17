/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#FAFAF7',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#14171F',
          soft: '#4B5160',
          faint: '#8B90A0',
        },
        line: '#E7E4DB',
        primary: {
          50: '#EEF3F0',
          100: '#D3E0D8',
          400: '#4C7C68',
          500: '#2D5C4D',
          600: '#234A3E',
          700: '#1B3A31',
        },
        amber: {
          50: '#FBF2E9',
          100: '#F3DEC1',
          500: '#B45309',
          600: '#943F06',
        },
        rose: {
          50: '#FBEEEE',
          500: '#B3413A',
          600: '#8E3130',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,23,31,0.04), 0 1px 8px rgba(20,23,31,0.04)',
      },
    },
  },
  plugins: [],
};
