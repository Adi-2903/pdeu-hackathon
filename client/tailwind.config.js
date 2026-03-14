/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: { DEFAULT: '#FF6B00', light: '#FF8C42', dark: '#E55A00', glow: 'rgba(255,107,0,0.15)' },
        glass: { card: 'rgba(255,255,255,0.60)', border: 'rgba(0,0,0,0.08)' },
        dark: { bg: '#F5F5F7', surface: '#FFFFFF', elevated: '#EAEAEC' }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
