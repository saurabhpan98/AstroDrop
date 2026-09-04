/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cosmos: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          900: '#0f172a'
        }
      },
      backgroundImage: {
        'stellar-radial': 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.12) 0%, rgba(240, 249, 255, 0) 75%)',
        'orbit-pattern': 'radial-gradient(#0284c7 0.75px, transparent 0.75px)'
      }
    }
  },
  plugins: []
};