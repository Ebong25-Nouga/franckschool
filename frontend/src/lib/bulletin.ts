import type { ModeleBulletin, Parametres } from '@/pages/secretariat/donnees';
import { html } from './imprimer';

/* =========================================================
 * Bulletin trimestriel : un seul « moteur » pour l'aperçu du modèle
 * et pour l'impression des vrais bulletins (décisions 033-034).
 * Partie fixe = modèle réglé par l'administrateur.
 * Partie variable = données de l'élève, remplies par le système.
 * ======================================================= */

export interface LigneBulletin {
  matiere: string;
  prof: string;
  groupe: 1 | 2 | 3;
  coef: number;
  notes: (number | null)[];
  moyenne: number;
  rang: number;
  moyClasse: number;
  min: number;
  max: number;
}
export interface DonneesBulletin {
  trimestre: 1 | 2 | 3;
  annee: string;
  numero: string;
  date: string;
  eleve: { nom: string; matricule: string; naissance: string; sexe: 'M' | 'F'; classe: string; effectif: number; redoublant: boolean; pp: string; photo?: string };
  lignes: LigneBulletin[];
  resultats: { moyenne: number; rang: number; moyClasse: number; max: number; min: number; taux: number; moySeq: number[] };
  assiduite: { justifiees: number; nonJustifiees: number; retards: number };
  appreciation: string;
  annuel?: { trimestres: number[]; moyenne: number; rang: number };
}

export const SEQUENCES_TRIMESTRE: Record<1 | 2 | 3, number[]> = { 1: [1, 2], 2: [3, 4], 3: [5, 6] };
const NOM_TRIMESTRE = { 1: '1<sup>er</sup> trimestre', 2: '2<sup>e</sup> trimestre', 3: '3<sup>e</sup> trimestre' };
const GROUPES = { 1: 'Groupe 1 – Matières littéraires', 2: 'Groupe 2 – Matières scientifiques', 3: 'Groupe 3 – Matières complémentaires' };
/** Au-delà, le bulletin passe sur deux pages (lignes de matières + lignes de groupes). */
const LIGNES_UNE_PAGE = 23;
/** Lignes du tableau gardées sur la 1re page quand le bulletin en a deux. */
const LIGNES_PAGE_1 = 26;

const f = (n: number) => n.toFixed(2).replace('.', ',');
const rangTxt = (r: number) => `${r}<sup>${r === 1 ? 'er' : 'e'}</sup>`;
export const mentionDe = (n: number, mentions: Parametres['mentions']) => [...mentions].sort((a, b) => b.min - a.min).find((m) => n >= m.min)?.libelle ?? '';

export function cssBulletin(couleur: string) {
  return `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: transparent; font-family: Arial, Helvetica, sans-serif; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .feuille { --c: ${couleur}; width: 794px; height: 1123px; overflow: hidden; background: #fff; padding: 28px 36px 22px; font-size: 10.5px; display: flex; flex-direction: column; page-break-after: always; break-after: page; position: relative; }
  .feuille + .feuille { margin-top: 24px; }
  @media print { .feuille + .feuille { margin-top: 0; } }
  .ent { display: grid; align-items: center; gap: 10px; text-align: center; line-height: 1.35; }
  .ent.centre { grid-template-columns: 1fr 92px 1fr; } .ent.gauche { grid-template-columns: 92px 1fr 1fr; } .ent.droite { grid-template-columns: 1fr 1fr 92px; }
  .ent .t { font-weight: 700; font-size: 10.5px; letter-spacing: .02em; text-transform: uppercase; }
  .ent .d { font-style: italic; font-size: 9.5px; }
  .ent small { display: block; font-size: 8.6px; text-transform: uppercase; letter-spacing: .03em; }
  .ent .sep { margin: 2px auto; width: 46px; border-top: 1px solid #111; }
  .logo { width: 82px; height: 82px; border-radius: 14px; display: grid; place-items: center; margin: auto; overflow: hidden; background: var(--c); color: #fff; font-weight: 800; font-size: 20px; }
  .logo img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
  .ecole { margin-top: 10px; border-top: 2.5px solid var(--c); border-bottom: 2.5px solid var(--c); padding: 6px 0; text-align: center; }
  .ecole h1 { font-family: 'Times New Roman', Georgia, serif; font-size: 19px; color: var(--c); letter-spacing: .04em; text-transform: uppercase; }
  .ecole p { font-size: 9.5px; color: #374151; margin-top: 2px; }
  .titre { margin: 10px 0 8px; text-align: center; }
  .titre h2 { display: inline-block; background: var(--c); color: #fff; padding: 6px 22px; border-radius: 4px; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
  .titre p { font-size: 10px; margin-top: 4px; color: #374151; }
  .id { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #9ca3af; border-radius: 4px; }
  .id.photo { grid-template-columns: 1fr 1fr 74px; }
  .id > div { padding: 5px 8px; line-height: 1.75; }
  .id b { display: inline-block; min-width: 112px; font-weight: 400; color: #4b5563; }
  .id .ph { border-left: 1px solid #9ca3af; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 9px; text-align: center; padding: 0; overflow: hidden; }
  .id .ph img { width: 100%; height: 100%; object-fit: cover; }
  .rappel { display: flex; justify-content: space-between; border: 1px solid #9ca3af; border-radius: 4px; padding: 6px 8px; font-size: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #9ca3af; padding: 3.5px 5px; text-align: center; }
  th { background: #e8ebf7; font-size: 9.4px; color: #1f2937; }
  td.m { text-align: left; } td.m span { display: block; font-size: 8.6px; color: #6b7280; }
  td.ap { text-align: left; font-size: 9.4px; }
  tr.grp td { background: #f3f4f6; font-weight: 700; font-size: 9.6px; } tr.grp td.m { color: var(--c); }
  tr.tot td { background: #e8ebf7; font-weight: 700; }
  .feuille.dense { font-size: 10px; } .dense th, .dense td { padding: 2.4px 5px; } .dense td.m span { display: inline; margin-left: 4px; }
  .feuille.serre { font-size: 9.4px; } .serre th, .serre td { padding: 1.6px 4px; font-size: 9px; } .serre td.m span { display: inline; margin-left: 4px; font-size: 8px; } .serre .ecole { margin-top: 6px; } .serre .titre { margin: 6px 0; }
  .r { color: #b91c1c; }
  .bas { display: grid; grid-template-columns: 1.15fr 1fr; gap: 10px; margin-top: 8px; }
  .bas.seul { grid-template-columns: 1fr; }
  .bloc { border: 1px solid #9ca3af; border-radius: 4px; }
  .bloc h3 { background: #e8ebf7; font-size: 9.6px; padding: 4px 8px; border-bottom: 1px solid #9ca3af; letter-spacing: .03em; text-transform: uppercase; }
  .bloc h3 + .c + h3 { border-top: 1px solid #9ca3af; }
  .bloc .c { padding: 5px 8px; line-height: 1.7; }
  .kv { display: flex; justify-content: space-between; gap: 8px; } .kv b { white-space: nowrap; }
  .big { font-size: 15px; color: var(--c); }
  .cases { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 8px; }
  .case:before { content: ""; display: inline-block; width: 9px; height: 9px; border: 1px solid #374151; margin-right: 5px; vertical-align: -1px; }
  .case.x:before { background: var(--c); border-color: var(--c); box-shadow: inset 0 0 0 1.5px #fff; }
  .annuel { display: grid; grid-template-columns: repeat(6, 1fr); text-align: center; }
  .annuel div { padding: 4px 2px; border-right: 1px solid #d1d5db; line-height: 1.4; } .annuel div:last-child { border-right: 0; }
  .annuel span { display: block; font-size: 8.6px; color: #4b5563; text-transform: uppercase; } .annuel b { font-size: 11.5px; }
  .sig { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
  .sig div { border: 1px solid #9ca3af; border-radius: 4px; height: 74px; padding: 5px 8px; font-size: 9.6px; font-weight: 700; position: relative; }
  .sig small { position: absolute; bottom: 6px; left: 8px; right: 8px; font-weight: 400; color: #374151; text-align: center; }
  .espace { flex: 1; }
  .pied { margin-top: 8px; display: flex; justify-content: space-between; gap: 10px; font-size: 8.4px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 5px; }
  `;
}

function entete(m: ModeleBulletin, p: Parametres) {
  const e = m.entete;
  const col = (pays: string, devise: string, min: string, reg: string, dep: string) =>
    `<div><div class="t">${html(pays)}</div><div class="d">${html(devise)}</div><div class="sep"></div><small>${html(min)}</small><small>${html(reg)}</small><small>${html(dep)}</small></div>`;
  const fr = col(e.paysFr, e.deviseFr, e.ministereFr, e.regionFr, e.departementFr);
  const en = col(e.paysEn, e.deviseEn, e.ministereEn, e.regionEn, e.departementEn);
  const logo = `<div class="logo">${p.logo ? `<img src="${p.logo}" alt="">` : html(p.sigle)}</div>`;
  const cols = m.logoPlace === 'gauche' ? [logo, fr, en] : m.logoPlace === 'droite' ? [fr, en, logo] : [fr, logo, en];
  return `<div class="ent ${m.logoPlace}">${cols.join('')}</div>
  <div class="ecole"><h1>${html(p.nom)}</h1>
    <p>${html([`${p.adresse} – ${p.ville}`, p.telephone && `Tél. ${p.telephone}`, p.email, p.autorisation].filter(Boolean).join(' · '))}</p>
    ${p.devise ? `<p><i>« ${html(p.devise)} »</i></p>` : ''}</div>`;
}

/** Les pages HTML (une ou deux « feuilles » A4) d'un bulletin. */
export function htmlBulletin(m: ModeleBulletin, p: Parametres, d: DonneesBulletin) {
  const c = m.colonnes;
  const seqs = SEQUENCES_TRIMESTRE[d.trimestre];
  const mention = (n: number) => mentionDe(n, p.mentions);

  // Lignes du tableau (matières, sous-totaux des groupes, total)
  const lignes: string[] = [];
  const ligne = (l: LigneBulletin) =>
    `<tr><td class="m">${html(l.matiere)}${c.enseignant ? `<span>${html(l.prof)}</span>` : ''}</td>${c.sequences ? l.notes.map((n) => `<td>${n === null ? '—' : f(n)}</td>`).join('') : ''}<td class="${l.moyenne < 10 ? 'r' : ''}"><b>${f(l.moyenne)}</b></td><td>${l.coef}</td>${c.total ? `<td>${f(l.moyenne * l.coef)}</td>` : ''}${c.rang ? `<td>${rangTxt(l.rang)}</td>` : ''}${c.moyClasse ? `<td>${f(l.moyClasse)}</td>` : ''}${c.minMax ? `<td>${f(l.min)} – ${f(l.max)}</td>` : ''}${c.appreciation ? `<td class="ap">${html(mention(l.moyenne))}</td>` : ''}</tr>`;
  const avant = 1 + (c.sequences ? seqs.length : 0); // colonnes avant « Moy. »
  const apres = (c.rang ? 1 : 0) + (c.moyClasse ? 1 : 0) + (c.minMax ? 1 : 0) + (c.appreciation ? 1 : 0);
  const sousTotal = (libelle: string, cls: string, coefs: number, pts: number, moy?: number) =>
    `<tr class="${cls}"><td class="m">${libelle}</td>${avant > 1 ? `<td colspan="${avant - 1}"></td>` : ''}<td>${moy === undefined ? '' : f(moy)}</td><td>${coefs}</td>${c.total ? `<td>${f(pts)}</td>` : ''}${apres ? `<td colspan="${apres}"></td>` : ''}</tr>`;
  let totalCoefs = 0;
  let totalPts = 0;
  const parGroupe = m.groupes ? ([1, 2, 3] as const).map((g) => ({ g, l: d.lignes.filter((x) => x.groupe === g) })).filter((x) => x.l.length) : [{ g: 0 as const, l: d.lignes }];
  for (const { g, l } of parGroupe) {
    let cg = 0;
    let pg = 0;
    for (const x of l) {
      lignes.push(ligne(x));
      cg += x.coef;
      pg += x.moyenne * x.coef;
    }
    if (g) lignes.push(sousTotal(GROUPES[g], 'grp', cg, pg, cg ? pg / cg : 0));
    totalCoefs += cg;
    totalPts += pg;
  }
  lignes.push(sousTotal('TOTAL GÉNÉRAL', 'tot', totalCoefs, totalPts));

  const tete = `<thead><tr><th style="width:${c.enseignant ? 185 : 150}px">Matières${c.enseignant ? ' et enseignants' : ''}</th>${c.sequences ? seqs.map((q) => `<th>Séq. ${q}</th>`).join('') : ''}<th>Moy.<br>/20</th><th>Coef.</th>${c.total ? '<th>Total</th>' : ''}${c.rang ? '<th>Rang</th>' : ''}${c.moyClasse ? '<th>Moy.<br>classe</th>' : ''}${c.minMax ? '<th>Min – Max</th>' : ''}${c.appreciation ? '<th style="width:96px">Appréciation</th>' : ''}</tr></thead>`;

  const nb = lignes.length;
  const deuxPages = nb > LIGNES_UNE_PAGE - (d.annuel ? 2 : 0);
  const plus = d.annuel ? 2 : 0;
  const densite = deuxPages || nb + plus > 18 ? 'serre' : nb + plus > 14 ? 'dense' : '';
  const e = d.eleve;
  const titre = `<div class="titre"><h2>${html(m.titre)} du ${NOM_TRIMESTRE[d.trimestre]}</h2><p>Année scolaire ${html(d.annee)} · Séquences ${seqs.join(' et ')}</p></div>`;
  const identite = `<div class="id${m.photo ? ' photo' : ''}">
    <div><b>Nom et prénom :</b> <strong>${html(e.nom)}</strong><br><b>Matricule :</b> ${html(e.matricule)}<br><b>Né(e) le :</b> ${html(e.naissance)}<br><b>Sexe :</b> ${e.sexe === 'F' ? 'Féminin' : 'Masculin'}</div>
    <div><b>Classe :</b> <strong>${html(e.classe)}</strong><br><b>Effectif :</b> ${e.effectif} élèves<br><b>Redoublant(e) :</b> ${e.redoublant ? 'Oui' : 'Non'}<br><b>Professeur principal :</b> ${html(e.pp)}</div>
    ${m.photo ? `<div class="ph">${e.photo ? `<img src="${e.photo}" alt="">` : 'Photo<br>de l’élève'}</div>` : ''}</div>`;

  const r = d.resultats;
  const distinctions = [...m.distinctions].sort((a, b) => a.min - b.min);
  const obtenue = [...distinctions].reverse().find((x) => r.moyenne >= x.min);
  const resultats = `<div class="bloc"><h3>Résultats du trimestre</h3><div class="c">
    <div class="kv"><span>Moyenne générale de l’élève</span><b class="big">${f(r.moyenne)} / 20</b></div>
    <div class="kv"><span>Rang</span><b>${rangTxt(r.rang)} sur ${e.effectif}</b></div>
    <div class="kv"><span>Mention</span><b>${html(mention(r.moyenne))}</b></div>
    <div class="kv"><span>Moyennes des séquences</span><b>${r.moySeq.map((x, i) => `Séq. ${seqs[i]} : ${f(x)}`).join(' · ')}</b></div>
    <div class="kv"><span>Moyenne générale de la classe</span><b>${f(r.moyClasse)}</b></div>
    <div class="kv"><span>Plus forte / plus faible moyenne</span><b>${f(r.max)} / ${f(r.min)}</b></div>
    <div class="kv"><span>Taux de réussite de la classe</span><b>${r.taux.toFixed(1).replace('.', ',')} %</b></div></div></div>`;
  const droite = [
    m.assiduite ? `<h3>Assiduité</h3><div class="c"><div class="kv"><span>Absences justifiées</span><b>${d.assiduite.justifiees}</b></div><div class="kv"><span>Absences non justifiées</span><b class="${d.assiduite.nonJustifiees ? 'r' : ''}">${d.assiduite.nonJustifiees}</b></div><div class="kv"><span>Retards</span><b>${d.assiduite.retards}</b></div></div>` : '',
    distinctions.length ? `<h3>Distinctions du conseil de classe</h3><div class="c cases">${distinctions.map((x) => `<span class="case${obtenue === x ? ' x' : ''}">${html(x.libelle)}</span>`).join('')}<span class="case${obtenue ? '' : ' x'}">Aucune</span></div>` : '',
  ].join('');
  const annuel = d.annuel
    ? `<div class="bloc" style="margin-top:8px"><h3>Bilan de l’année</h3><div class="annuel">${d.annuel.trimestres.map((x, i) => `<div><span>${i + 1}<sup>${i ? 'e' : 'er'}</sup> trimestre</span><b>${f(x)}</b></div>`).join('')}<div><span>Moyenne annuelle</span><b style="color:var(--c)">${f(d.annuel.moyenne)}</b></div><div><span>Rang annuel</span><b>${rangTxt(d.annuel.rang)} / ${e.effectif}</b></div><div><span>Décision</span><b>${d.annuel.moyenne >= 10 ? 'Admis(e)' : 'Redouble'}</b></div></div></div>`
    : '';
  const fin = `<div class="bas${droite ? '' : ' seul'}">${resultats}${droite ? `<div class="bloc">${droite}</div>` : ''}</div>${annuel}
    <div class="bloc" style="margin-top:8px"><h3>Appréciation générale du conseil de classe</h3><div class="c" style="min-height:30px"><i>${html(d.appreciation)}</i></div></div>
    <div class="sig"><div>${html(m.visaParent)}<small>Nom et signature</small></div><div>${html(m.titrePP)}<small>${html(e.pp)}</small></div><div>${html(p.titreSignataire)}<small>${html(p.signataire)}<br>Signature et cachet</small></div></div>`;
  const pied = (n: number, t: number) => `<div class="espace"></div><div class="pied"><span>Bulletin généré par FRANCK SCHOOL le ${html(d.date)} · N° ${html(d.numero)}</span><span>${html(m.piedPage)}${m.piedPage ? ' · ' : ''}Page ${n}/${t}</span></div>`;

  if (!deuxPages) {
    return `<section class="feuille ${densite}">${entete(m, p)}${titre}${identite}<table>${tete}<tbody>${lignes.join('')}</tbody></table>${fin}${pied(1, 1)}</section>`;
  }
  const coupe = LIGNES_PAGE_1;
  return `<section class="feuille ${densite}">${entete(m, p)}${titre}${identite}<table>${tete}<tbody>${lignes.slice(0, coupe).join('')}</tbody></table>${pied(1, 2)}</section>
  <section class="feuille ${densite}"><div class="rappel"><span><b>${html(e.nom)}</b> · ${html(e.matricule)} · ${html(e.classe)}</span><span>${html(m.titre)} du ${NOM_TRIMESTRE[d.trimestre]} · ${html(d.annee)} (suite)</span></div><table>${tete}<tbody>${lignes.slice(coupe).join('')}</tbody></table>${fin}${pied(2, 2)}</section>`;
}

/** Document complet (pour l'aperçu dans un cadre ou l'impression). */
export function documentBulletins(p: Parametres, pages: string, titre = 'Bulletin') {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${html(titre)}</title><style>${cssBulletin(p.couleur)}</style></head><body>${pages}</body></html>`;
}
