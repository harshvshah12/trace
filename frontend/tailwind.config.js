/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#07080b',
          900: '#0c0d12',
          850: '#11131a',
          800: '#161922',
          700: '#222634',
          600: '#2f3547',
          400: '#64748b',
          200: '#cbd5e1'
        },
        signal: {
          graduate: '#10b981',
          enrolled: '#f59e0b',
          dropout: '#ef4444',
          cyan: '#06b6d4',
          violet: '#8b5cf6'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
