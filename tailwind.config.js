/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0037b0',
        'primary-container': '#1d4ed8',
        secondary: '#575e70',
        tertiary: '#F97316',
        background: '#f8f9fa',
        surface: '#ffffff',
        'surface-container-low': '#f3f4f5',
        'surface-container': '#edeeef',
        'surface-container-high': '#e7e8e9',
        'on-surface': '#191c1d',
        'on-surface-variant': '#434655',
        outline: '#747686',
        'status-paid': '#16A34A',
        'status-partial': '#F97316',
        'status-unpaid': '#DC2626',
        'border-subtle': '#E5E7EB',
        'on-primary': '#ffffff',
        'outline-variant': '#c4c5d7',
      },
      fontFamily: { inter: ['Inter', 'sans-serif'] },
      boxShadow: {
        premium: '0 10px 25px -5px rgba(0, 55, 176, 0.05), 0 8px 10px -6px rgba(0, 55, 176, 0.05)',
      },
    },
  },
  plugins: [],
}
