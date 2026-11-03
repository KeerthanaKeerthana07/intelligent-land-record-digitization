/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B2545',
          800: '#13315C',
          700: '#134074',
          600: '#1D4E89',
          500: '#2E6FBA',
          100: '#EEF4F8',
          50: '#F4F7FB',
        },
        teal: {
          900: '#044E46',
          800: '#0A6C62',
          700: '#0F766E',
          600: '#0D9488',
          500: '#14B8A6',
          100: '#CCFBF1',
          50: '#F0FDFA',
        },
        gov: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          text: '#1E293B',
          muted: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
