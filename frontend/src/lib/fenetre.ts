/*
 * Position des fenêtres (modales).
 *
 * Normalement, une fenêtre s'affiche au milieu de l'écran. Mais dans certains
 * lecteurs (par exemple l'application Claude sur téléphone), la page est affichée
 * dans un cadre plus haut que l'écran : « le milieu » est alors hors de vue et
 * l'utilisateur ne voit que le fond flouté. Dans ce cas, on place la fenêtre
 * à l'endroit où il vient de toucher l'écran.
 */
let dernierToucher: number | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => (dernierToucher = e.clientY), { capture: true, passive: true });
}

export interface PlacementFenetre {
  /** null : centrée normalement ; sinon position verticale en pixels */
  haut: number | null;
  /** hauteur maximale utilisable, en pixels */
  hauteurMax: number;
}

export function placementFenetre(): PlacementFenetre {
  if (typeof window === 'undefined') return { haut: null, hauteurMax: 800 };
  const ecran = window.screen?.availHeight || window.screen?.height || 0;
  const cadre = window.innerHeight;
  const cadreTropHaut = ecran > 0 && cadre > ecran * 1.15;
  if (!cadreTropHaut) return { haut: null, hauteurMax: cadre - 32 };

  const actif = document.activeElement as HTMLElement | null;
  const y = dernierToucher ?? (actif && actif !== document.body ? actif.getBoundingClientRect().top : 80);
  const hauteurMax = Math.max(360, ecran - 48);
  return { haut: Math.max(16, Math.min(y - 160, cadre - hauteurMax - 16)), hauteurMax };
}
