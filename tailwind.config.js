/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0037b0', 50: '#eef2ff', 100: '#dbe4ff', 200: '#baccff', 300: '#8aabff', 400: '#5581ff', 500: '#0037b0', 600: '#002d91', 700: '#002373', 800: '#001a55', 900: '#001138' },
        surface: { DEFAULT: '#ffffff', container: '#f8f9fa', 'container-high': '#f1f2f4', 'container-highest': '#e7e8ea' },
        'on-surface': { DEFAULT: '#191c1d', muted: '#5f6368', dim: '#9aa0a6' },
        outline: { DEFAULT: '#dadce0', strong: '#80868b' },
        status: { paid: '#16A34A', partial: '#F97316', unpaid: '#DC2626', occupied: '#16A34A', vacant: '#9AA0A6' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px 0 rgba(0,0,0,0.04)',
        premium: '0 10px 25px -5px rgba(0, 55, 176, 0.05), 0 8px 10px -6px rgba(0, 55, 176, 0.05)',
      },
      borderRadius: { card: '12px', 'card-sm': '8px' },
    },
  },
  plugins: [],
}
