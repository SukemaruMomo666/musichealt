/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna Warm Cream untuk aksen
        primary: '#DEDBC8', 
      },
      fontFamily: {
        // Almarai jadi default (sans), Instrument Serif untuk aksen serif
        sans: ['Almarai', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
      },
    },
  },
  plugins: [],
}