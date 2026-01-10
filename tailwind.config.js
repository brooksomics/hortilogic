/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for garden/plant theme
        soil: {
          50: '#faf8f3',
          100: '#f5f1e7',
          200: '#e8ddc7',
          300: '#dbc9a7',
          400: '#c8a86a',
          500: '#b5872d',
          600: '#a37a29',
          700: '#886522',
          800: '#6d511c',
          900: '#594217',
        },
        leaf: {
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
        },
      },
    },
  },
  plugins: [],
}
