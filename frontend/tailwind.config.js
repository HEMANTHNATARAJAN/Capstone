/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bw: {
          bg: '#121212',
          card: '#1a1a1a',
          cardHover: '#222222',
          sidebar: '#161616',
          border: '#2a2a2a',
          accent: '#2563eb', // Blue CTA
          accentHover: '#1d4ed8',
          textMuted: '#9ca3af',
          textLight: '#f3f4f6',
          highlight: '#38bdf8'
        }
      }
    },
  },
  plugins: [],
}
