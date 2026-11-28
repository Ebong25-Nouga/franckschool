/** Couleurs possibles de l'établissement (nuances de bleu de la charte). */
export const teintes: { nom: string; hex: string; rgb: Record<number, string> }[] = [
  { nom: 'Bleu encre', hex: '#1C32A5', rgb: { 50: '240 244 255', 100: '224 231 255', 200: '194 207 252', 300: '150 170 245', 400: '98 124 232', 500: '58 86 214', 600: '37 64 196', 700: '28 50 165', 800: '23 39 128', 900: '17 28 94', 950: '10 16 56' } },
  { nom: 'Bleu roi', hex: '#1D4ED8', rgb: { 50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253', 400: '96 165 250', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216', 800: '30 64 175', 900: '30 58 138', 950: '23 37 84' } },
  { nom: 'Bleu nuit', hex: '#1E3A5F', rgb: { 50: '240 245 250', 100: '220 230 241', 200: '186 204 226', 300: '140 168 203', 400: '92 128 172', 500: '61 99 145', 600: '45 79 121', 700: '36 64 100', 800: '30 58 95', 900: '23 43 71', 950: '14 27 46' } },
  { nom: 'Bleu lagune', hex: '#0E6E9C', rgb: { 50: '236 248 253', 100: '208 237 249', 200: '164 219 242', 300: '106 193 230', 400: '50 160 210', 500: '22 132 186', 600: '14 110 156', 700: '14 89 126', 800: '17 74 104', 900: '18 61 86', 950: '10 38 56' } },
];

/** Applique la couleur de l'établissement à toute l'interface (variables CSS --brand-*). */
export function appliquerTeinte(hex: string) {
  const t = teintes.find((x) => x.hex.toLowerCase() === hex.toLowerCase()) ?? teintes[0];
  Object.entries(t.rgb).forEach(([k, v]) => document.documentElement.style.setProperty(`--brand-${k}`, v));
}
