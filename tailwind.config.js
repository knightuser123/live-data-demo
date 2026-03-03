/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      keyframes: {
        cellBlink: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#ff6b6b' },
          '100%': { backgroundColor: 'transparent' },
        },
        rowBlink: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#4ecdc4' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        cellBlink: 'cellBlink 0.6s ease-in-out',
        rowBlink: 'rowBlink 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
};
