// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enable class based dark mode
  content: [
    './src/**/*.{js,jsx,ts,tsx,css}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(260, 80%, 60%)', // neon purple
        accent: 'hsl(190, 80%, 55%)', // cyan
        secondary: 'hsl(215, 70%, 55%)', // dark teal
        navy: '#0a0b2c', // dark navy background
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        xl: '12px',
      },
    },
  },
  plugins: [],
};
