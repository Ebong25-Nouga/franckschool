import type { MouseEvent } from 'react';

/**
 * Fait défiler la page jusqu'à une section (#id) sans toucher à l'adresse.
 * Nécessaire car la démo en ligne utilise des adresses en « #/… » : un lien
 * « #tarifs » classique serait pris pour une page et ne mènerait nulle part.
 */
export function versSection(e: MouseEvent, id: string, delai = 0) {
  e.preventDefault();
  const aller = () => {
    const doux = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!id) {
      window.scrollTo({ top: 0, behavior: doux ? 'smooth' : 'auto' });
      return;
    }
    const cible = document.getElementById(id);
    if (!cible) return;
    cible.scrollIntoView({ behavior: doux ? 'smooth' : 'auto', block: 'start' });
    // Place le focus sur la section pour les lecteurs d'écran et le clavier
    cible.setAttribute('tabindex', '-1');
    cible.focus({ preventScroll: true });
  };
  if (delai) setTimeout(aller, delai);
  else aller();
}
