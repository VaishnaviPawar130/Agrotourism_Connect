/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f3',
          100: '#e0ece2',
          200: '#c2d9c7',
          300: '#97bfa0',
          400: '#699e76',
          500: '#48805a',
          600: '#366548',
          700: '#2c513b',
          800: '#254131',
          900: '#1f362a',
          950: '#0f1e17',
        },
        sand: {
          50: '#fbf9f4',
          100: '#f6f1e6',
          200: '#eee3ca',
          300: '#e1cea3',
          400: '#d1b378',
          500: '#c39c58',
          600: '#b5854b',
          700: '#966840',
          800: '#7a5439',
          900: '#654630',
        },
        slate: {
          950: '#0b1210',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
