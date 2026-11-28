import { BellRing, ChevronDown, ChevronRight, FileBadge2, Printer, Send } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Chiffre, Titre } from '@/components/espace';
import { Button, Grade, Modal, Pill, useToast } from '@/components/kit';
import { appreciation, note } from '@/data/demo';
import { entete, html, imprimer } from '@/lib/imprimer';
import { cn } from '@/lib/utils';
import { dateFr, nomEleve, Note, useDroit } from './commun';
import type { EleveS, Matiere, StatutReleve } from './donnees';
import { aujourdhui, useSecretariat, visibles } from './store';

/* =========================================================
 * Notes et bulletins (décision du 28/11/2026)
 * Une seule page : suivi de la saisie par classe → génération → publication aux parents.
 * ======================================================= */

interface Periode {
  label: string;
  sequences: number[];
}
const PERIODES: Periode[] = [
  { label: 'Séquence 1', sequences: [1] },
  { label: 'Séquence 2', sequences: [2] },
  { label: '1er trimestre', sequences: [1, 2] },
  { label: 'Séquence 3', sequences: [3] },
  { label: 'Séquence 4', sequences: [4] },
  { label: '2e trimestre', sequences: [3, 4] },
  { label: 'Séquence 5', sequences: [5] },
  { label: 'Séquence 6', sequences: [6] },
  { label: '3e trimestre', sequences: [5, 6] },
  { label: 'Annuel', sequences: [1, 2, 3, 4, 5, 6] },
];

const libStatut: Record<StatutReleve, string> = { non_commencee: 'Pas commencée', brouillon: 'En saisie', correction: 'Correction demandée', soumise: 'Soumise, à valider', validee: 'Validée' };
const tonStatut: Record<StatutReleve, 'stylo' | 'feutre' | 'encre' | 'valide'> = { non_commencee: 'stylo', brouillon: 'feutre', correction: 'feutre', soumise: 'encre', validee: 'valide' };
const rangStatut: Record<StatutReleve, number> = { non_commencee: 0, brouillon: 1, correction: 1, soumise: 2, validee: 3 };

/** Note d'un élève dans une matière pour une séquence (démonstration : déduite de sa moyenne). */
// eslint-disable-next-line react-refresh/only-export-components
export const noteSeq = (e: EleveS, m: Matiere, seq: number) => Math.max(0, Math.min(20, Math.round((e.moyenne + (((e.id * 7 + m.id * 13 + seq * 5) % 9) - 4) * 0.6) * 4) / 4));
const notePeriode = (e: EleveS, m: Matiere, seqs: number[]) => seqs.reduce((s, q) => s + noteSeq(e, m, q), 0) / seqs.length;
const moyenne = (l: number[]) => (l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0);

function useCalculs(periode: Periode) {
  const { etat } = useSecretariat();
  const classes = visibles(etat.classes).map((c) => c.nom);

  /** État d'une matière d'une classe sur la période (la pire des séquences). */
  const matiere = (classe: string, m: Matiere) => {
    const rels = periode.sequences.map((q) => etat.releves.find((r) => r.classe === classe && r.matiere === m.nom && r.sequence === q));
    const statut = rels.reduce<StatutReleve>((pire, r) => (rangStatut[r?.statut ?? 'non_commencee'] < rangStatut[pire] ? r?.statut ?? 'non_commencee' : pire), 'validee');
    const evaluations = [...new Set(rels.flatMap((r) => r?.evaluations ?? []))];
    const notes = rels.reduce((s, r) => s + (r?.notes ?? 0), 0);
    const attendu = rels.reduce((s, r) => s + (r?.attendu ?? 0), 0);
    const relance = rels.find((r) => r?.relance)?.relance;
    const aRelancer = rels.filter((r) => r && r.statut !== 'validee' && r.statut !== 'soumise');
    return { m, statut, evaluations, notes, attendu, relance, aRelancer, rels };
  };

  const classe = (nom: string) => {
    const eleves = visibles(etat.eleves).filter((e) => e.classe === nom && e.situation === 'inscrit');
    const mats = visibles(etat.matieres).filter((m) => m.classe === nom);
    const lignes = mats.map((m) => matiere(nom, m));
    const unites = lignes.length * periode.sequences.length;
    const validees = lignes.reduce((s, l) => s + l.rels.filter((r) => r?.statut === 'validee').length, 0);
    const pret = mats.length > 0 && eleves.length > 0 && lignes.every((l) => l.statut === 'validee');
    // Moyenne de la classe dans une matière, puis moyenne générale (avec coefficients)
    const moyMatiere = (m: Matiere) => moyenne(eleves.map((e) => notePeriode(e, m, periode.sequences)));
    const comptees = lignes.filter((l) => l.statut === 'validee' || l.statut === 'soumise').map((l) => l.m);
    const coefs = comptees.reduce((s, m) => s + m.coef, 0);
    const moyGenerale = coefs ? comptees.reduce((s, m) => s + moyMatiere(m) * m.coef, 0) / coefs : null;
    // Génération automatique dès que tout est validé ; la publication est faite par la direction
    const stocke = etat.bulletins[`${nom}|${periode.label}`];
    const bulletin = stocke?.statut === 'publie' ? stocke : pret ? { statut: 'genere' as const, le: '', par: 'Franck School' } : undefined;
    const enAttente = lignes.filter((l) => l.statut !== 'validee').length;
    // Classement des élèves (toutes matières)
    const coefsTout = mats.reduce((s, m) => s + m.coef, 0);
    const classement = eleves
      .map((e) => {
        const notes = mats.map((m) => ({ m, n: notePeriode(e, m, periode.sequences) }));
        return { e, notes, coefs: coefsTout, moyenne: coefsTout ? notes.reduce((s, x) => s + x.n * x.m.coef, 0) / coefsTout : 0 };
      })
      .sort((a, b) => b.moyenne - a.moyenne)
      .map((l, i) => ({ ...l, rang: i + 1 }));
    return { nom, eleves, lignes, unites, validees, pret, moyMatiere, moyGenerale, bulletin, enAttente, classement };
  };
  return { classes, classe };
}

export function NotesBulletins({ direction = false }: { direction?: boolean }) {
  const { etat, modifier, journaliser, etatBulletins } = useSecretariat();
  const [publier, setPublier] = useState<string | null>(null);
  const peut = useDroit();
  const toast = useToast();
  const [periode, setPeriode] = useState(PERIODES[1]);
  const [ouverte, setOuverte] = useState<string | null>(null);
  const { classes, classe } = useCalculs(periode);
  const infos = classes.map(classe);
  const futur = periode.sequences.every((q) => q > 2);

  const compteurs = {
    attente: infos.filter((c) => !c.pret).length,
    generes: infos.filter((c) => c.bulletin?.statut === 'genere').length,
    publies: infos.filter((c) => c.bulletin?.statut === 'publie').length,
  };

  const relancer = (c: ReturnType<typeof classe>, l: ReturnType<typeof classe>['lignes'][number]) => {
    const prof = l.m.prof || 'l’enseignant';
    if (l.aRelancer.length) l.aRelancer.forEach((r) => r && modifier('releves', r.id, { relance: aujourdhui() }, { operation: 'Relance', module: 'Notes', element: `${prof} : ${l.m.nom}, ${c.nom}, séquence ${r.sequence}`, apres: `${r.notes}/${r.attendu} notes saisies` }));
    else journaliser({ operation: 'Relance', module: 'Notes', element: `${prof} : ${l.m.nom}, ${c.nom}, ${periode.label}` });
    toast(`${prof} est relancé(e) par notification.`);
  };

  const bulletin = (c: ReturnType<typeof classe>, l: ReturnType<typeof classe>['classement'][number]) => `
    <section style="page-break-after: always">
      ${entete(`Bulletin de notes · ${periode.label}`)}
      <table>
        <tr><th>Élève</th><td class="gras">${html(nomEleve(l.e))}</td><th>Matricule</th><td>${html(l.e.matricule)}</td></tr>
        <tr><th>Classe</th><td>${html(c.nom)} (${c.classement.length} élèves)</td><th>Né(e) le</th><td>${dateFr(l.e.dateNaissance)} à ${html(l.e.lieuNaissance)}</td></tr>
      </table>
      <table>
        <tr><th>Matière</th><th>Enseignant</th><th class="droite-t">Coef.</th><th class="droite-t">Note /20</th><th class="droite-t">Note × coef.</th><th class="droite-t">Moy. classe</th><th>Appréciation</th></tr>
        ${l.notes.map(({ m, n }) => `<tr><td>${html(m.nom)}</td><td>${html(m.prof)}</td><td class="droite-t">${m.coef}</td><td class="droite-t">${note(n)}</td><td class="droite-t">${note(n * m.coef)}</td><td class="droite-t">${note(c.moyMatiere(m))}</td><td>${appreciation(n)}</td></tr>`).join('')}
        <tr><th colspan="2">Total</th><th class="droite-t">${l.coefs}</th><th></th><th class="droite-t">${note(l.notes.reduce((s, x) => s + x.n * x.m.coef, 0))}</th><th></th><th></th></tr>
      </table>
      <div class="encadre"><b>Moyenne : ${note(l.moyenne)} / 20</b> · Rang : ${l.rang}${l.rang === 1 ? 'er' : 'e'} sur ${c.classement.length} · Moyenne générale de la classe : ${note(c.moyGenerale ?? 0)} · Appréciation : ${appreciation(l.moyenne)}<br/>Absences : ${visibles(etat.absences).filter((a) => a.eleveId === l.e.id).length}</div>
      <div class="signature"><div>Le professeur principal<div class="ligne"></div></div><div>Le Principal<div class="ligne"></div></div></div>
    </section>`;

  const imprimerClasse = (c: ReturnType<typeof classe>) => {
    imprimer(`Bulletins ${c.nom} ${periode.label}`, c.classement.map((l) => bulletin(c, l)).join(''));
    journaliser({ operation: 'Impression', module: 'Bulletins', element: `Bulletins ${c.nom}, ${periode.label}` });
  };

  return (
    <>
      {direction ? (
        <Titre titre="Résultats et bulletins" texte="Les moyennes, rangs et mentions sont calculés automatiquement. Dès qu’une classe est entièrement validée, ses bulletins sont générés : vous les consultez, puis vous les publiez aux parents." />
      ) : (
        <Titre titre="Notes et bulletins" texte="Suivez la saisie des notes de chaque classe et relancez les enseignants en retard. Les bulletins se génèrent tout seuls dès que la classe est entièrement validée." />
      )}

      <div role="tablist" aria-label="Période" className="mb-5 inline-flex max-w-full flex-wrap gap-0.5 rounded-[11px] bg-papier-2 p-1">
        {PERIODES.map((p) => (
          <button key={p.label} role="tab" aria-selected={p === periode} onClick={() => (setPeriode(p), setOuverte(null))} className={cn('min-h-9 cursor-pointer rounded-lg px-3 text-[13px] font-semibold transition-colors', p === periode ? 'bg-white text-encre shadow-feuille' : 'text-encre-doux hover:text-encre')}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Chiffre label="Classes en attente de notes" valeur={String(compteurs.attente)} icone={BellRing} ton="feutre" />
        <Chiffre label={direction ? 'Bulletins générés, à publier' : 'Bulletins générés, à publier par la direction'} valeur={String(compteurs.generes)} icone={FileBadge2} />
        <Chiffre label="Publiés aux parents" valeur={String(compteurs.publies)} icone={Send} ton="valide" />
      </div>

      {futur && <div className="mb-5"><Note>Cette période n’a pas encore commencé : aucune note n’est saisie.</Note></div>}

      <section className="rounded-[22px] bg-white shadow-feuille">
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <caption className="sr-only">État des notes et des bulletins par classe, {periode.label}</caption>
            <thead>
              <tr className="border-b border-papier-ligne/80 bg-papier/60 text-xs font-semibold text-encre-doux">
                <th scope="col" className="px-5 py-2.5 pl-6">Classe</th>
                <th scope="col" className="w-60 px-5 py-2.5">Notes validées</th>
                <th scope="col" className="px-5 py-2.5">Moyenne générale de la classe</th>
                <th scope="col" className="px-5 py-2.5">État</th>
                <th scope="col" className="px-5 py-2.5 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-papier-ligne/70">
              {infos.map((c) => {
                const ouvert = ouverte === c.nom;
                const pct = c.unites ? Math.round((c.validees / c.unites) * 100) : 0;
                return (
                  <Fragment key={c.nom}>
                    <tr className={cn('cursor-pointer transition-colors hover:bg-papier/70', ouvert && 'bg-brand-50/50')} onClick={() => setOuverte(ouvert ? null : c.nom)}>
                      <td className="px-5 py-3.5 pl-6">
                        <button className="flex cursor-pointer items-center gap-1.5 text-[15px] font-bold" aria-expanded={ouvert}>
                          {ouvert ? <ChevronDown className="size-4 text-brand-700" aria-hidden /> : <ChevronRight className="size-4 text-encre-pale" aria-hidden />}
                          {c.nom}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Notes validées en ${c.nom}`}>
                          <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-papier-2"><div className={cn('h-full rounded-full', pct >= 100 ? 'bg-valide' : pct >= 50 ? 'bg-brand-600' : 'bg-orange')} style={{ width: `${Math.max(pct, 3)}%` }} /></div>
                          <span className="w-10 text-right text-xs font-bold chiffres">{pct} %</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.moyGenerale === null ? <span className="text-encre-pale">—</span> : c.pret ? <Grade value={Math.round(c.moyGenerale * 100) / 100} size="sm" /> : <span className="text-[13px] text-encre-doux">Provisoire : <span className="chiffres">{note(c.moyGenerale)}</span></span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {c.bulletin ? (
                          <Pill tone={c.bulletin.statut === 'publie' ? 'valide' : 'encre'}>{c.bulletin.statut === 'publie' ? 'Publiés aux parents' : direction ? 'Générés · à publier' : 'Générés · à publier par la direction'}</Pill>
                        ) : (
                          <Pill tone="feutre">{c.enAttente} matière{c.enAttente > 1 ? 's' : ''} en attente</Pill>
                        )}
                      </td>
                      <td className="px-5 py-3.5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {c.bulletin && peut('bulletins') && <Button size="sm" variant="secondary" icon={Printer} onClick={() => imprimerClasse(c)}>Imprimer</Button>}
                          {direction && c.bulletin?.statut === 'genere' && <Button size="sm" icon={Send} onClick={() => setPublier(c.nom)}>Publier aux parents</Button>}
                          {!c.pret && <Button size="sm" variant="secondary" onClick={() => setOuverte(ouvert ? null : c.nom)}>{ouvert ? 'Masquer le détail' : 'Voir le détail'}</Button>}
                        </div>
                      </td>
                    </tr>
                    {ouvert && (
                      <tr className="bg-brand-50/50">
                        <td colSpan={5} className="px-6 pb-5">
                          <Detail c={c} periode={periode} peutRelancer={peut('notes')} onRelancer={(l) => relancer(c, l)} onBulletin={(l) => imprimer(`Bulletin ${l.e.matricule}`, bulletin(c, l))} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {publier && (
        <Modal title={`Publier les bulletins de la ${publier}`} lead={`${periode.label}. Les parents les verront dans leur espace, rubrique « Notes et bulletins ».`} onClose={() => setPublier(null)} footer={<><Button variant="secondary" onClick={() => setPublier(null)}>Annuler</Button><Button icon={Send} onClick={() => { etatBulletins(publier, periode.label, 'publie'); toast(`Bulletins de la ${publier} publiés aux parents.`); setPublier(null); }}>Publier</Button></>}>
          <Note ton="feutre">Une fois publiés, les bulletins ne se modifient plus. Une erreur de note se corrige par une demande de correction à l’enseignant ; une nouvelle version sera alors générée.</Note>
        </Modal>
      )}
      <p className="mt-4 text-[13px] text-encre-doux">Les bulletins sont calculés et générés automatiquement par Franck School dès que l’administrateur a validé toutes les notes de la classe pour la période. La publication aux parents est faite par la direction.</p>

    </>
  );
}

/* ---------- Détail d'une classe : matières, puis classement ---------- */
function Detail({ c, periode, peutRelancer, onRelancer, onBulletin }: {
  c: ReturnType<ReturnType<typeof useCalculs>['classe']>;
  periode: Periode;
  peutRelancer: boolean;
  onRelancer: (l: ReturnType<ReturnType<typeof useCalculs>['classe']>['lignes'][number]) => void;
  onBulletin: (l: ReturnType<ReturnType<typeof useCalculs>['classe']>['classement'][number]) => void;
}) {
  const [vue, setVue] = useState<'matieres' | 'classement'>(c.pret ? 'classement' : 'matieres');
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-papier-ligne">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-papier-ligne/70 px-4 py-3">
        <p className="text-sm font-bold">{c.nom} · {periode.label}{c.pret && c.classement.length > 0 && <span className="ml-2 font-normal text-encre-doux">· moyenne la plus haute {note(c.classement[0].moyenne)} · la plus basse {note(c.classement[c.classement.length - 1].moyenne)}</span>}</p>
        {c.pret && (
          <div className="inline-flex rounded-lg bg-papier-2 p-0.5">
            {(['matieres', 'classement'] as const).map((v) => (
              <button key={v} onClick={() => setVue(v)} className={cn('min-h-8 cursor-pointer rounded-md px-3 text-[13px] font-semibold', vue === v ? 'bg-white shadow-feuille' : 'text-encre-doux')}>{v === 'matieres' ? 'Par matière' : 'Classement des élèves'}</button>
            ))}
          </div>
        )}
      </div>
      {vue === 'matieres' ? (
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="bg-papier/60 text-left text-xs font-semibold text-encre-doux">
              <th className="px-4 py-2.5">Matière</th><th className="px-4 py-2.5">Enseignant</th><th className="px-4 py-2.5">Évaluations</th><th className="px-4 py-2.5">Moyenne de la classe dans la matière</th><th className="px-4 py-2.5">État</th><th className="px-4 py-2.5"><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-papier-ligne/70">
            {c.lignes.map((l) => (
              <tr key={l.m.id}>
                <td className="px-4 py-3 font-semibold">{l.m.nom} <span className="font-normal text-encre-pale">· coef {l.m.coef}</span></td>
                <td className="px-4 py-3">{l.m.prof || <span className="text-stylo">À attribuer</span>}</td>
                <td className="px-4 py-3 text-encre-doux">{l.evaluations.length ? l.evaluations.join(' + ') : '—'}</td>
                <td className="px-4 py-3">{l.statut === 'validee' || l.statut === 'soumise' ? <Grade value={Math.round(c.moyMatiere(l.m) * 100) / 100} size="sm" /> : <span className="text-encre-pale">—</span>}</td>
                <td className="px-4 py-3"><Pill tone={tonStatut[l.statut]}>{libStatut[l.statut]}{l.statut === 'brouillon' ? ` · ${l.notes}/${l.attendu} notes` : ''}</Pill></td>
                <td className="px-4 py-3 text-right">
                  {l.statut === 'soumise' && <span className="text-xs text-encre-doux">Chez l’administrateur</span>}
                  {(l.statut === 'brouillon' || l.statut === 'non_commencee' || l.statut === 'correction') && peutRelancer && (l.relance ? <span className="text-xs text-encre-doux">Relancé le {dateFr(l.relance)}</span> : <Button size="sm" variant="secondary" icon={BellRing} onClick={() => onRelancer(l)}>Relancer</Button>)}
                </td>
              </tr>
            ))}
            {c.lignes.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-encre-doux">Cette classe n’a pas encore de matière.</td></tr>}
          </tbody>
        </table>
      ) : (
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="bg-papier/60 text-left text-xs font-semibold text-encre-doux">
              <th className="px-4 py-2.5 text-center">Rang</th><th className="px-4 py-2.5">Élève</th><th className="px-4 py-2.5">Moyenne</th><th className="px-4 py-2.5">Mention</th><th className="px-4 py-2.5"><span className="sr-only">Bulletin</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-papier-ligne/70">
            {c.classement.map((l) => (
              <tr key={l.e.id}>
                <td className="px-4 py-3 text-center font-display text-[16px] font-bold chiffres">{l.rang}</td>
                <td className="px-4 py-3 font-semibold">{nomEleve(l.e)} <span className="font-normal text-encre-pale">· {l.e.matricule}</span></td>
                <td className="px-4 py-3"><Grade value={Math.round(l.moyenne * 100) / 100} size="sm" /></td>
                <td className="px-4 py-3">{appreciation(l.moyenne)}</td>
                <td className="px-4 py-3 text-right">{c.bulletin ? <Button size="sm" variant="quiet" icon={Printer} onClick={() => onBulletin(l)}>Bulletin</Button> : <span className="text-xs text-encre-pale">Générez d’abord les bulletins</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
