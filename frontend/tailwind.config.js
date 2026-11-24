/** @type {import('tailwindcss').Config} */
const brand = (shade) => `rgb(var(--brand-${shade}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Couleur de l'école : modifiable par établissement via les variables CSS
        brand: {
          50: brand(50), 100: brand(100), 200: brand(200), 300: brand(300),
          400: brand(400), 500: brand(500), 600: brand(600), 700: brand(700),
          800: brand(800), 900: brand(900), 950: brand(950),
        },
        ink: '#0F172A',
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.06)',
        pop: '0 10px 30px -10px rgb(15 23 42 / 0.25)',
      },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-up': 'fade-up 220ms ease-out both' },
    },
  },
  plugins: [],
};
