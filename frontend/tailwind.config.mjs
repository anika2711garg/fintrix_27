/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#fafafa',
        card: '#09090b',
        primary: '#6366f1',
        secondary: '#4f46e5',
        success: '#22c55e',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
