/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        charcoal: '#2B2B2B',
        navy: '#0F2747',
        'deep-purple': '#2A1E3F',
        burgundy: '#5A1A1A',
        forest: '#1F3A2E',
        saddle: '#5B3A1A',
        offwhite: '#F7F5F2',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
