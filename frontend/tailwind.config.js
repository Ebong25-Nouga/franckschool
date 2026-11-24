/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (n) => Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((s) => [s, v(`${n}-${s}`)]));

/*
 * Identité FRANCK SCHOOL — « le cahier d'écolier »
 *  encre   : le bleu du stylo plume, couleur de l'école (paramétrable par établissement)
 *  papier  : fond légèrement bleuté, comme une feuille de cahier
 *  stylo   : le rouge de correction (impayés, erreurs, notes < 10)
 *  feutre  : le surligneur jaune, réservé à ce qui demande une action
 *  valide  : le vert « acquis »
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"Figtree Variable"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: scale('brand'),
        papier: { DEFAULT: '#F5F7FB', 2: '#EBEFF7', ligne: '#DCE3F0' },
        encre: { DEFAULT: '#0E1533', doux: '#4A5578', pale: '#8790AD' },
        stylo: { DEFAULT: '#D0263A', 50: '#FDEEF0', 100: '#FAD5DA', 700: '#A81B2D' },
        feutre: { DEFAULT: '#FFE36E', 50: '#FFF9DB', 700: '#8A6A00' },
        valide: { DEFAULT: '#0F8A5F', 50: '#E7F6EF', 100: '#C6EBDA', 700: '#0A6646' },
        orange: { DEFAULT: '#E8761E', 50: '#FDF1E6' },
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: { xl2: '1.125rem' },
      boxShadow: {
        feuille: '0 1px 0 rgb(14 21 51 / 0.04), 0 1px 2px rgb(14 21 51 / 0.06), 0 0 0 1px rgb(14 21 51 / 0.05)',
        leve: '0 12px 32px -12px rgb(14 21 51 / 0.28), 0 0 0 1px rgb(14 21 51 / 0.06)',
        encre: '0 8px 24px -8px rgb(var(--brand-700) / 0.55)',
      },
      keyframes: {
        entree: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        glisse: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        pop: { from: { opacity: 0, transform: 'scale(.96) translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        trait: { from: { 'background-size': '0% 100%' }, to: { 'background-size': '100% 100%' } },
      },
      animation: {
        entree: 'entree 320ms cubic-bezier(.2,.7,.2,1) both',
        glisse: 'glisse 260ms cubic-bezier(.2,.7,.2,1) both',
        pop: 'pop 200ms cubic-bezier(.2,.7,.2,1) both',
        trait: 'trait 700ms 250ms cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};
