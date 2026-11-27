import { ecole } from '@/data/demo';

/**
 * Impression d'un document (certificat, reçu, liste…) depuis le navigateur.
 * Le document est écrit dans un cadre invisible puis imprimé : l'utilisateur
 * peut choisir « Enregistrer en PDF » dans la fenêtre d'impression.
 * Plus tard, le serveur Laravel produira aussi les PDF officiels (avec signature et cachet).
 */
const echapper = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const html = (s: string | number) => echapper(String(s));

export function entete(titre: string, numero?: string) {
  return `
  <header class="entete">
    <div class="bilingue">
      <p><b>RÉPUBLIQUE DU CAMEROUN</b><br/>Paix – Travail – Patrie<br/>MINESEC</p>
      <p class="centre"><b>${html(ecole.nom.toUpperCase())}</b><br/>${html(ecole.quartier)}, ${html(ecole.ville)} · ${html(ecole.telephone)}<br/><i>${html(ecole.devise)}</i></p>
      <p class="droite"><b>REPUBLIC OF CAMEROON</b><br/>Peace – Work – Fatherland<br/>MINESEC</p>
    </div>
    <h1>${html(titre)}</h1>
    ${numero ? `<p class="numero">N° ${html(numero)} · Année scolaire ${html(ecole.annee)}</p>` : ''}
  </header>`;
}

const STYLE = `
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0E1533; font-size: 12.5px; line-height: 1.5; margin: 0; }
  .entete { border-bottom: 2px solid #1C32A5; padding-bottom: 10px; margin-bottom: 18px; }
  .bilingue { display: flex; justify-content: space-between; gap: 12px; font-size: 10.5px; }
  .bilingue p { margin: 0; flex: 1; } .centre { text-align: center; } .droite { text-align: right; }
  h1 { text-align: center; font-size: 19px; letter-spacing: .04em; margin: 16px 0 2px; color: #1C32A5; text-transform: uppercase; }
  .numero { text-align: center; margin: 0; color: #4A5170; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #C9CEE0; padding: 6px 8px; text-align: left; }
  th { background: #EEF1FB; font-size: 11.5px; }
  .droite-t { text-align: right; } .gras { font-weight: bold; }
  .signature { display: flex; justify-content: space-between; margin-top: 46px; }
  .signature div { width: 45%; text-align: center; } .signature .ligne { margin-top: 56px; border-top: 1px solid #0E1533; }
  .pied { margin-top: 28px; font-size: 10px; color: #6B7190; border-top: 1px solid #C9CEE0; padding-top: 6px; }
  .encadre { border: 1px solid #C9CEE0; border-radius: 6px; padding: 10px 14px; margin: 12px 0; }
  p { margin: 6px 0; }
`;

export function imprimer(titre: string, corps: string) {
  const cadre = document.createElement('iframe');
  cadre.setAttribute('aria-hidden', 'true');
  cadre.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(cadre);
  const doc = cadre.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"/><title>${html(titre)}</title><style>${STYLE}</style></head><body>${corps}
    <p class="pied">Document édité le ${new Date().toLocaleString('fr-FR')} par Franck School · ${html(ecole.nom)}</p></body></html>`);
  doc.close();
  setTimeout(() => {
    try {
      cadre.contentWindow?.focus();
      cadre.contentWindow?.print();
    } finally {
      setTimeout(() => cadre.remove(), 1500);
    }
  }, 150);
}

/** Téléchargement d'un fichier CSV (ouvrable dans Excel). */
export function telechargerCsv(nom: string, lignes: (string | number)[][]) {
  const texte = '﻿' + lignes.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([texte], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
