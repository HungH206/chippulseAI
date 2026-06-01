/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slate': {
          '50': '#f8fafc',
          '100': '#f1f5f9',
          '200': '#e2e8f0',
          '250': '#dde5ed',
          '300': '#cbd5e1',
          '400': '#94a3b8',
          '450': '#8b96a8',
          '500': '#64748b',
          '600': '#475569',
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
        }
      },
      boxShadow: {
        '3xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '2xs': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      },
      height: {
        '18': '4.5rem',
      },
      lineHeight: {
        '12': '3rem',
      },
      fontSize: {
        '2xs': '0.6875rem',
      }
    },
  },
  plugins: [],
}
