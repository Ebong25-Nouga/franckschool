import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { anim, BLEU, BLEU_CLAIR, Carte, DISPLAY, DOUX, Etape, fcfa, Fond, FEUTRE, LIGNE, PAPIER, Saisie, STYLO, TEXTE, VALIDE } from './commun';

/* =========================================================
 * Scène 1 : inscrire un élève (6 s)
 * ======================================================= */
export function SceneInscription() {
  const f = useCurrentFrame();
  const champs: [string, string, number][] = [
    ['Nom', 'MBARGA', 22],
    ['Prénom', 'Marie-Claire', 38],
    ['Classe', '4ème A', 60],
    ['Tuteur', 'Mme Mbarga Odile · +237 677 12 45 90', 76],
  ];
  const valide = anim(f, 128, 142);
  return (
    <Fond>
      <Etape n={1} titre="Inscrire un élève" sousTitre="Le dossier, le tuteur et la classe en quelques secondes. Le matricule est créé tout seul." />
      <Carte style={{ left: 980, top: 150, width: 820, padding: 48, opacity: anim(f, 6, 22), translate: `0px ${anim(f, 6, 26, 60, 0)}px` }}>
        <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 38, margin: 0, letterSpacing: '-0.02em' }}>Nouvelle inscription</p>
        <p style={{ fontSize: 22, color: DOUX, margin: '8px 0 34px' }}>Année scolaire 2026-2027</p>
        <div style={{ display: 'grid', gap: 22 }}>
          {champs.map(([l, v, de]) => (
            <div key={l}>
              <p style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>{l}</p>
              <div style={{ height: 64, borderRadius: 14, border: `2px solid ${f >= de && f < de + 30 ? BLEU : LIGNE}`, padding: '0 22px', display: 'flex', alignItems: 'center', fontSize: 26, fontWeight: l === 'Nom' ? 700 : 500 }}>
                <Saisie texte={v} de={de} vitesse={l === 'Tuteur' ? 2.4 : 1.4} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 34, height: 74, borderRadius: 16, background: f >= 120 ? VALIDE : BLEU, color: 'white', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 700, scale: `${1 - anim(f, 116, 122, 0, 0.04) + anim(f, 122, 128, 0, 0.04)}` }}>
          {f >= 120 ? '✓ Élève inscrit' : 'Inscrire l’élève'}
        </div>
      </Carte>
      <div style={{ position: 'absolute', left: 110, top: 520, opacity: valide, translate: `0px ${anim(f, 128, 146, 30, 0)}px` }}>
        <p style={{ fontSize: 26, color: '#C2CFFC', margin: 0 }}>Matricule attribué</p>
        <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, margin: '6px 0 0', letterSpacing: '-0.04em' }}>CBE26-0841</p>
        <p style={{ fontSize: 26, color: '#C2CFFC', marginTop: 18 }}>Scolarité due : <b style={{ color: 'white' }}>150 000 FCFA</b></p>
      </div>
    </Fond>
  );
}

/* =========================================================
 * Scène 2 : saisir les notes (6 s)
 * ======================================================= */
const eleves: [string, number][] = [
  ['MANGA Ornella', 12],
  ['SIMO Franck', 14.5],
  ['NDJOCK Nadège', 9],
  ['EYENGA Ulrich', 16],
  ['MBARGA Marie-Claire', 13.25],
  ['NKOULOU Arnaud', 8.5],
  ['FOTSO Aïcha', 17.75],
];
export function SceneNotes() {
  const f = useCurrentFrame();
  const saisies = eleves.filter((_, i) => f >= 24 + i * 16).map(([, n]) => n);
  const moyenne = saisies.length ? saisies.reduce((a, b) => a + b, 0) / saisies.length : 0;
  return (
    <Fond>
      <Etape n={2} titre="Saisir les notes" sousTitre="Le professeur tape ses notes depuis chez lui, séquence après séquence. La moyenne se calcule en direct." />
      <Carte style={{ left: 980, top: 120, width: 820, opacity: anim(f, 4, 20), translate: `0px ${anim(f, 4, 24, 60, 0)}px` }}>
        <div style={{ padding: '36px 44px 20px', borderBottom: `2px solid ${LIGNE}` }}>
          <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, margin: 0 }}>Mathématiques, Tle C</p>
          <p style={{ fontSize: 22, color: DOUX, margin: '6px 0 0' }}>Séquence 2 · notes sur 20</p>
        </div>
        <div style={{ backgroundImage: `linear-gradient(rgba(37,64,196,0.07) 2px, transparent 2px)`, backgroundSize: '100% 74px' }}>
          {eleves.map(([nom, n], i) => {
            const de = 24 + i * 16;
            const actif = f >= de - 6 && f < de + 10;
            return (
              <div key={nom} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 160px', alignItems: 'center', height: 74, padding: '0 44px', fontSize: 25 }}>
                <span style={{ color: '#8790AD', fontSize: 20 }}>{i + 1}</span>
                <span style={{ fontWeight: 500 }}>{nom}</span>
                <span style={{ height: 54, borderRadius: 12, border: `2px solid ${actif ? BLEU : LIGNE}`, boxShadow: actif ? `0 0 0 6px rgba(37,64,196,0.15)` : 'none', display: 'grid', placeItems: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: n < 10 ? STYLO : TEXTE, opacity: f >= de ? 1 : 0.35 }}>
                  {f >= de ? n.toLocaleString('fr-FR') : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </Carte>
      <div style={{ position: 'absolute', left: 110, top: 520 }}>
        <p style={{ fontSize: 26, color: '#C2CFFC', margin: 0 }}>Moyenne de la classe</p>
        <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 128, margin: 0, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums' }}>{moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: anim(f, 140, 152), fontSize: 26 }}>
          <span style={{ background: VALIDE, borderRadius: 999, padding: '10px 22px', fontWeight: 700 }}>✓ Notes soumises pour validation</span>
        </div>
      </div>
    </Fond>
  );
}

/* =========================================================
 * Scène 3 : générer le bulletin (6 s)
 * ======================================================= */
const lignes: [string, number, number][] = [
  ['Français', 4, 14.5],
  ['Anglais', 3, 16],
  ['Mathématiques', 5, 12.25],
  ['Physique-Chimie', 4, 9.5],
  ['SVT', 2, 15],
  ['Histoire-Géographie', 2, 13],
];
export function SceneBulletin() {
  const f = useCurrentFrame();
  const moy = 13.05 * anim(f, 96, 136);
  return (
    <Fond>
      <Etape n={3} titre="Générer le bulletin" sousTitre="Coefficients, moyennes, rang et appréciation calculés. Le bulletin publié ne change plus." />
      <Carte style={{ left: 1010, top: 70, width: 760, padding: '40px 50px', rotate: `${anim(f, 0, 30, 4, 1.5)}deg`, opacity: anim(f, 0, 16), translate: `0px ${anim(f, 0, 26, 80, 0)}px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `3px solid ${TEXTE}`, paddingBottom: 16 }}>
          <div>
            <p style={{ fontSize: 15, letterSpacing: '0.16em', fontWeight: 700, color: DOUX, margin: 0 }}>RÉPUBLIQUE DU CAMEROUN</p>
            <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, margin: '6px 0 0' }}>Bulletin de notes, 1er trimestre</p>
          </div>
          <img src="/logo.svg" alt="" style={{ width: 56, height: 56 }} />
        </div>
        <p style={{ fontSize: 22, margin: '18px 0 8px' }}><b>MBARGA</b> Marie-Claire · 4ème A · 44 élèves</p>
        {lignes.map(([m, c, n], i) => (
          <div key={m} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px', borderTop: `2px solid ${LIGNE}`, padding: '12px 0', fontSize: 22, opacity: anim(f, 18 + i * 9, 30 + i * 9), translate: `${anim(f, 18 + i * 9, 32 + i * 9, 24, 0)}px 0px` }}>
            <span>{m}</span>
            <span style={{ textAlign: 'center', color: DOUX }}>{c}</span>
            <span style={{ textAlign: 'right', fontWeight: 800, color: n < 10 ? STYLO : TEXTE }}>{n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
          </div>
        ))}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: BLEU_CLAIR, borderRadius: 18, padding: '18px 24px', opacity: anim(f, 90, 102) }}>
          <div>
            <p style={{ fontSize: 18, color: DOUX, margin: 0 }}>Moyenne générale</p>
            <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 60, margin: 0, color: BLEU, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{moy.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, margin: 0, opacity: anim(f, 136, 146) }}>7<sup style={{ fontSize: 20 }}>e</sup><span style={{ fontSize: 24, color: DOUX }}>/44</span></p>
        </div>
        <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, color: STYLO, margin: '18px 0 0', rotate: '-2deg', opacity: anim(f, 146, 158) }}>Assez bien. Peut mieux faire en physique !</p>
      </Carte>
    </Fond>
  );
}

/* =========================================================
 * Scène 4 : encaisser par Mobile Money (6 s)
 * ======================================================= */
export function ScenePaiement() {
  const f = useCurrentFrame();
  const solde = 4_165_400 + 50_000 * anim(f, 92, 120);
  return (
    <Fond>
      <Etape n={4} titre="Encaisser un paiement" sousTitre="Espèces, MTN MoMo ou Orange Money. Un reçu numéroté, et la caisse à jour tout de suite." />
      {/* Téléphone du parent */}
      <div style={{ position: 'absolute', left: 1010, top: 110, width: 380, height: 780, borderRadius: 56, background: '#0B0F24', padding: 14, boxShadow: '0 60px 120px -40px rgba(0,0,0,0.7)', opacity: anim(f, 0, 16), translate: `0px ${anim(f, 0, 26, 80, 0)}px` }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 44, background: PAPIER, overflow: 'hidden', color: TEXTE, padding: 26 }}>
          <p style={{ fontSize: 18, color: DOUX, margin: '30px 0 0', textAlign: 'center' }}>MTN Mobile Money</p>
          <div style={{ marginTop: 26, background: 'white', borderRadius: 24, padding: 22, opacity: anim(f, 26, 38), scale: `${anim(f, 26, 40, 0.92, 1)}` }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: '#FFCC00', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, color: TEXTE }}>MoMo</div>
            <p style={{ fontSize: 18, margin: '16px 0 0', color: DOUX }}>Paiement à</p>
            <p style={{ fontSize: 22, fontWeight: 700, margin: '2px 0 0' }}>Collège Les Étoiles</p>
            <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 36, margin: '14px 0 0', whiteSpace: 'nowrap' }}>50 000 FCFA</p>
            <p style={{ fontSize: 16, color: DOUX, margin: '6px 0 0' }}>Motif : CBE26-0841</p>
            <div style={{ marginTop: 20, height: 56, borderRadius: 14, background: f >= 70 ? VALIDE : '#FFCC00', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20, color: f >= 70 ? 'white' : TEXTE }}>{f >= 70 ? '✓ Paiement réussi' : 'Confirmer'}</div>
          </div>
        </div>
      </div>
      {/* Reçu */}
      <Carte style={{ left: 1430, top: 330, width: 400, padding: 30, opacity: anim(f, 84, 96), translate: `${anim(f, 84, 104, 60, 0)}px 0px`, rotate: '2deg' }}>
        <p style={{ fontSize: 16, color: DOUX, margin: 0 }}>Reçu n° REC-000483</p>
        <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, margin: '8px 0 0', color: VALIDE }}>+ 50 000</p>
        <p style={{ fontSize: 18, margin: '6px 0 0' }}>MBARGA Marie-Claire · 4ème A</p>
        <p style={{ fontSize: 16, color: DOUX, margin: '4px 0 0' }}>2e tranche · reste 25 000 FCFA</p>
      </Carte>
      <div style={{ position: 'absolute', left: 110, top: 540 }}>
        <p style={{ fontSize: 26, color: '#C2CFFC', margin: 0 }}>Solde de la caisse</p>
        <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, margin: 0, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums' }}>{fcfa(solde).replace(' FCFA', '')}</p>
        <p style={{ fontSize: 26, color: '#C2CFFC', marginTop: 8 }}>FCFA</p>
      </div>
    </Fond>
  );
}

/* =========================================================
 * Scène 5 : signature (3 s)
 * ======================================================= */
export function SceneFin() {
  const f = useCurrentFrame();
  return (
    <Fond>
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <img src="/logo.svg" alt="" style={{ width: 150, height: 150, borderRadius: 40, opacity: anim(f, 0, 14), scale: `${anim(f, 0, 20, 0.8, 1)}` }} />
        <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 110, margin: '40px 0 0', letterSpacing: '-0.045em', opacity: anim(f, 8, 22), translate: `0px ${anim(f, 8, 26, 30, 0)}px` }}>Franck School</p>
        <p style={{ fontSize: 34, color: '#C2CFFC', margin: '14px 0 0', opacity: anim(f, 18, 32) }}>
          Toute votre école, de l’inscription au bulletin.
        </p>
        <div style={{ marginTop: 40, height: 8, width: `${anim(f, 26, 60, 0, 420)}px`, borderRadius: 99, background: FEUTRE }} />
      </AbsoluteFill>
    </Fond>
  );
}
