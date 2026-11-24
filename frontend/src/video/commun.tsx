/*
 * Éléments partagés par les scènes de la vidéo de présentation.
 * Toutes les animations sont pilotées par useCurrentFrame() + interpolate()
 * (pas de transition CSS : elles ne sont pas rendues par Remotion).
 */
import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

export const FPS = 30;
export const ENCRE = '#0A1038';
export const BLEU = '#1C32A5';
export const BLEU_CLAIR = '#E0E7FF';
export const PAPIER = '#F5F7FB';
export const LIGNE = '#DCE3F0';
export const TEXTE = '#0E1533';
export const DOUX = '#4A5578';
export const STYLO = '#D0263A';
export const FEUTRE = '#FFE36E';
export const VALIDE = '#0F8A5F';
export const DISPLAY = '"Bricolage Grotesque Variable", "Figtree Variable", system-ui, sans-serif';
export const TEXTE_FONT = '"Figtree Variable", system-ui, sans-serif';

export const sortie = Easing.bezier(0.16, 1, 0.3, 1);

/** Valeur animée entre deux images clés, bornée. */
export function anim(frame: number, de: number, a: number, depuis = 0, vers = 1) {
  return interpolate(frame, [de, a], [depuis, vers], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie });
}

/** Fond commun : bleu encre avec lignes de cahier. */
export function Fond({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: ENCRE,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 12px, 48px 100%',
        fontFamily: TEXTE_FONT,
        color: 'white',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', width: 1100, height: 1100, left: -380, top: -520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,64,196,0.55), transparent 65%)' }} />
      {children}
    </AbsoluteFill>
  );
}

/** Étiquette d'étape en haut à gauche : « 1 · Inscrire un élève ». */
export function Etape({ n, titre, sousTitre }: { n: number; titre: string; sousTitre: string }) {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 110, top: 96, opacity: anim(f, 0, 14), translate: `${anim(f, 0, 18, -30, 0)}px 0px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <span style={{ width: 58, height: 58, borderRadius: 18, background: FEUTRE, color: TEXTE, display: 'grid', placeItems: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 30 }}>{n}</span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 54, letterSpacing: '-0.03em' }}>{titre}</span>
      </div>
      <p style={{ margin: '18px 0 0 76px', fontSize: 28, color: '#C2CFFC', maxWidth: 620, lineHeight: 1.35 }}>{sousTitre}</p>
    </div>
  );
}

/** Carte blanche de l'interface. */
export function Carte({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', background: 'white', color: TEXTE, borderRadius: 28, boxShadow: '0 60px 120px -40px rgba(0,0,0,0.65)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

/** Fait apparaître le texte lettre par lettre (effet de saisie). */
export function Saisie({ texte, de, vitesse = 1.6 }: { texte: string; de: number; vitesse?: number }) {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(texte.length, Math.floor((f - de) * vitesse)));
  const curseur = f >= de && n < texte.length;
  return (
    <span>
      {texte.slice(0, n)}
      {curseur && <span style={{ display: 'inline-block', width: 3, height: '1em', background: BLEU, marginLeft: 2, verticalAlign: 'text-bottom' }} />}
    </span>
  );
}

export const fcfa = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)).replace(/\u202f/g, ' ') + ' FCFA';
