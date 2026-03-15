/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fa',
          100: '#d9e4f2',
          500: '#1e3a5f',
          700: '#152c48',
          900: '#0F2040',
        },
        teal: {
          50: '#E1F5EE',
          100: '#9FE1CB',
          400: '#1D9E75',
          600: '#0F6E56',
          800: '#085041',
          900: '#04342C',
        },
        amber: {
          50: '#FAEEDA',
          400: '#EF9F27',
          600: '#BA7517',
          800: '#633806',
        },
        coral: {
          50: '#FAECE7',
          400: '#D85A30',
          600: '#993C1D',
          800: '#4A1B0C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
