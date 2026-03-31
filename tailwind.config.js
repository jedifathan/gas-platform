/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── GAS Brand Palette ────────────────────────────────────────────────
        // Background white — Alabaster
        alabaster: '#FEF9F3',

        // Primary: dark green → light green
        primary: {
          50:  '#f2f7ed',
          100: '#e0edcf',
          200: '#c2dba0',
          300: '#9dc56a',
          400: '#7dae3f',
          500: '#619035',   // #619035 — light green
          600: '#4e7429',
          700: '#3d621b',   // #3d621b — dark green (main brand)
          800: '#304e16',
          900: '#273f12',
          950: '#13210a',
        },
        // Accent: orange (use sparingly)
        accent: {
          50:  '#fff5e9',
          100: '#ffe8c8',
          200: '#ffd090',
          300: '#ffb259',
          400: '#ff9c2e',
          500: '#ff8e15',   // #ff8e15 — orange
          600: '#e06b00',
          700: '#b85200',
          800: '#8f4100',
          900: '#6b3200',
        },
        // Highlight: yellow
        highlight: {
          50:  '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#ffee58',
          500: '#fcd700',   // #fcd700 — yellow
          600: '#d4b400',
          700: '#a68d00',
          800: '#796700',
          900: '#4d4200',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundColor: {
        // Shorthand so you can use bg-page anywhere for the app background
        page: '#FEF9F3',
      },
    },
  },
  plugins: [],
}
