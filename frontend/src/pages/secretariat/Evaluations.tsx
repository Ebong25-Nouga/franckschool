import { BellRing, CheckCircle2, FileBadge2, Printer } from 'lucide-react';
import { useState } from 'react';
import { Titre } from '@/components/espace';
import { Button, Gauge, Grade, Pill, Segmented, Table, Td, useToast } from '@/components/kit';
import { appreciation, ecole, note } from '@/data/demo';
import { entete, html, imprimer } from '@/lib/imprimer';
import { Champ, dateFr, Liste, nomEleve, Note } from './commun';
import type { EleveS, Matiere, Releve } from './donnees';
import { aujourdhui, useSecretariat, visibles } from './store';

const libReleve = { brouillon: 'En cours de saisie', soumise: 'Soumise, à valider', validee: 'Validée' } as const;
const tonReleve = { brouillon: 'feutre', soumise: 'encre', validee: 'valide' } as const;

/* =========================================================
 * Notes : consultation et relances
 * ======================================================= */
export function Notes() {
  const { etat, modifier } = useSecretariat();
  const toast = useToast();
  const [vue, setVue] = useState<'classes' | 'evaluations'>('classes');
  const [classe, setClasse] = useState('Toutes');
  const [statut, setStatut] = useState('Tous');
  const classes = visibles(etat.classes).map((c) => c.nom);
  const releves = etat.releves.filter((r) => (classe === 'Toutes' || r.classe === classe) && (statut === 'Tous' || libReleve[r.statut] === statut));
  const relancer = (r: Releve) => {
    modifier('releves', r.id, { relance: aujourdhui() }, { operation: 'Relance', module: 'Notes', element: `${r.prof} : ${r.matiere}, ${r.classe}`, apres: `${r.notes}/${r.attendu} notes saisies` });
    toast(`${r.prof} sera relancé(e) par notification.`);
  };

  return (
    <>
      <Titre titre="Notes" texte="Suivez la saisie des notes de la séquence 2 et relancez les enseignants en retard." />
      <div className="mb-5"><Note>La validation des notes est réservée à l’administrateur. Vous consultez les notes et relancez les enseignants.</Note></div>
      <div className="mb-5"><Segmented label="Vue" value={vue} onChange={setVue} options={[{ value: 'classes', label: 'Avancement par classe' }, { value: 'evaluations', label: 'Évaluations', count: etat.releves.length }]} /></div>
      {vue === 'classes' ? (
        <section className="rounded-[22px] bg-white shadow-feuille">
          <Table caption="Avancement de la saisie par classe" head={['Classe', 'Validées', 'À valider', 'En saisie', 'Avancement']} minWidth={640}>
            {classes.map((c) => {
              const l = etat.releves.filter((r) => r.classe === c);
              const n = (s: Releve['statut']) => l.filter((r) => r.statut === s).length;
              return (
                <tr key={c}>
                  <Td className="font-semibold">{c}</Td>
                  <Td className="chiffres">{n('validee')}</Td>
                  <Td className="chiffres">{n('soumise')}</Td>
                  <Td className={n('brouillon') ? 'font-semibold text-feutre-700 chiffres' : 'chiffres'}>{n('brouillon')}</Td>
                  <Td className="w-64"><Gauge value={l.length ? ((n('validee') + n('soumise')) / l.length) * 100 : 0} label={`Avancement ${c}`} /></Td>
                </tr>
              );
            })}
          </Table>
        </section>
      ) : (
        <section className="rounded-[22px] bg-white shadow-feuille">
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:w-2/3">
            <Liste aria-label="Classe" value={classe} onChange={(e) => setClasse(e.target.value)} options={['Toutes', ...classes]} />
            <Liste aria-label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)} options={['Tous', ...Object.values(libReleve)]} />
          </div>
          <Table caption="Évaluations de la séquence 2" head={['Classe', 'Matière', 'Enseignant', 'Notes saisies', 'Moyenne', 'Statut', { label: 'Action', sr: true }]} minWidth={940}>
            {releves.map((r) => (
              <tr key={r.id}>
                <Td className="font-semibold">{r.classe}</Td>
                <Td>{r.matiere}<p className="text-xs text-encre-doux">{r.type}</p></Td>
                <Td>{r.prof}</Td>
                <Td className="chiffres">{r.notes} / {r.attendu}</Td>
                <Td>{r.statut === 'brouillon' ? <span className="text-encre-pale">—</span> : <Grade value={r.moyenne} size="sm" />}</Td>
                <Td><Pill tone={tonReleve[r.statut]}>{libReleve[r.statut]}</Pill></Td>
                <Td className="text-right">
                  {r.statut === 'brouillon' && (r.relance ? <span className="text-xs text-encre-doux">Relancé le {dateFr(r.relance)}</span> : <Button size="sm" variant="quiet" icon={BellRing} onClick={() => relancer(r)}>Relancer</Button>)}
                </Td>
              </tr>
            ))}
          </Table>
        </section>
      )}
    </>
  );
}

/* =========================================================
 * Bulletins
 * ======================================================= */
const periodes = ['Séquence 1', 'Séquence 2', '1er trimestre'];
/** Note d'un élève dans une matière (démonstration : déduite de sa moyenne). */
const noteMatiere = (e: EleveS, m: Matiere) => Math.max(0, Math.min(20, Math.round((e.moyenne + (((e.id * 7 + m.id * 13) % 9) - 4) * 0.6) * 4) / 4));

function calculer(eleves: EleveS[], matieres: Matiere[]) {
  const lignes = eleves.map((e) => {
    const notes = matieres.map((m) => ({ m, n: noteMatiere(e, m) }));
    const coefs = matieres.reduce((s, m) => s + m.coef, 0);
    const moyenne = coefs ? notes.reduce((s, x) => s + x.n * x.m.coef, 0) / coefs : 0;
    return { e, notes, moyenne, coefs };
  });
  const tri = [...lignes].sort((a, b) => b.moyenne - a.moyenne);
  return lignes.map((l) => ({ ...l, rang: tri.indexOf(l) + 1 })).sort((a, b) => a.rang - b.rang);
}

export function Bulletins() {
  const { etat, marquerBulletins } = useSecretariat();
  const toast = useToast();
  const classes = visibles(etat.classes).map((c) => c.nom);
  const [classe, setClasse] = useState(classes[0] ?? '');
  const [periode, setPeriode] = useState('Séquence 2');
  const eleves = visibles(etat.eleves).filter((e) => e.classe === classe && e.situation === 'inscrit');
  const matieres = visibles(etat.matieres).filter((m) => m.classe === classe);
  const lignes = calculer(eleves, matieres);
  const cle = `${classe}|${periode}`;
  const genere = etat.bulletins.includes(cle);
  const releves = etat.releves.filter((r) => r.classe === classe);
  const pret = releves.every((r) => r.statut === 'validee') || periode === 'Séquence 1';
  const moyClasse = lignes.length ? lignes.reduce((s, l) => s + l.moyenne, 0) / lignes.length : 0;

  const bulletin = (l: (typeof lignes)[number]) => `
    <section style="page-break-after: always">
      ${entete(`Bulletin de notes · ${periode}`)}
      <table>
        <tr><th>Élève</th><td class="gras">${html(nomEleve(l.e))}</td><th>Matricule</th><td>${html(l.e.matricule)}</td></tr>
        <tr><th>Classe</th><td>${html(classe)} (${lignes.length} élèves)</td><th>Né(e) le</th><td>${dateFr(l.e.dateNaissance)} à ${html(l.e.lieuNaissance)}</td></tr>
      </table>
      <table>
        <tr><th>Matière</th><th>Enseignant</th><th class="droite-t">Coef.</th><th class="droite-t">Note /20</th><th class="droite-t">Note × coef.</th><th>Appréciation</th></tr>
        ${l.notes.map(({ m, n }) => `<tr><td>${html(m.nom)}</td><td>${html(m.prof)}</td><td class="droite-t">${m.coef}</td><td class="droite-t">${note(n)}</td><td class="droite-t">${note(n * m.coef)}</td><td>${appreciation(n)}</td></tr>`).join('')}
        <tr><th colspan="2">Total</th><th class="droite-t">${l.coefs}</th><th></th><th class="droite-t">${note(l.notes.reduce((s, x) => s + x.n * x.m.coef, 0))}</th><th></th></tr>
      </table>
      <div class="encadre"><b>Moyenne : ${note(l.moyenne)} / 20</b> · Rang : ${l.rang}${l.rang === 1 ? 'er' : 'e'} sur ${lignes.length} · Moyenne de la classe : ${note(moyClasse)} · Appréciation : ${appreciation(l.moyenne)}<br/>Absences : ${visibles(etat.absences).filter((a) => a.eleveId === l.e.id).length}</div>
      <div class="signature"><div>Le professeur principal<div class="ligne"></div></div><div>Le Principal<div class="ligne"></div></div></div>
    </section>`;

  return (
    <>
      <Titre titre="Bulletins" texte="Générez les bulletins d’une classe pour une période, puis imprimez-les ou enregistrez-les en PDF." />
      <section className="mb-6 rounded-[22px] bg-white p-5 shadow-feuille sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <Champ label="Classe" className="w-48"><Liste value={classe} onChange={(e) => setClasse(e.target.value)} options={classes} /></Champ>
          <Champ label="Période" className="w-48"><Liste value={periode} onChange={(e) => setPeriode(e.target.value)} options={periodes} /></Champ>
          <div className="ml-auto flex flex-wrap gap-2">
            {!genere ? (
              <Button icon={FileBadge2} disabled={!pret || !lignes.length} onClick={() => (marquerBulletins(cle, classe, periode), toast(`${lignes.length} bulletins générés pour la ${classe}.`))}>Générer les bulletins</Button>
            ) : (
              <>
                <Pill tone="valide"><CheckCircle2 className="size-3" aria-hidden /> Générés</Pill>
                <Button icon={Printer} onClick={() => imprimer(`Bulletins ${classe} ${periode}`, lignes.map(bulletin).join(''))}>Imprimer toute la classe</Button>
              </>
            )}
          </div>
        </div>
        {!pret && <div className="mt-4"><Note ton="feutre">Toutes les notes de la {classe} ne sont pas encore validées par l’administrateur ({releves.filter((r) => r.statut !== 'validee').length} évaluation(s) en attente). Les bulletins pourront être générés ensuite.</Note></div>}
      </section>

      <section className="rounded-[22px] bg-white shadow-feuille">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
          <h2 className="font-display text-[19px] font-bold">Classement · {classe} · {periode}</h2>
          <p className="text-sm text-encre-doux">Moyenne de la classe : <b className="text-encre chiffres">{note(moyClasse)}</b> · {ecole.annee}</p>
        </div>
        <Table caption="Classement" head={[{ label: 'Rang', align: 'center' }, 'Élève', 'Moyenne', 'Appréciation', { label: 'Bulletin', sr: true }]} minWidth={640}>
          {lignes.map((l) => (
            <tr key={l.e.id}>
              <Td className="text-center font-display text-lg font-bold chiffres">{l.rang}</Td>
              <Td className="font-semibold">{nomEleve(l.e)}<p className="text-xs font-normal text-encre-doux">{l.e.matricule}</p></Td>
              <Td><Grade value={Math.round(l.moyenne * 100) / 100} size="sm" /></Td>
              <Td>{appreciation(l.moyenne)}</Td>
              <Td className="text-right"><Button size="sm" variant="quiet" icon={Printer} disabled={!genere} onClick={() => imprimer(`Bulletin ${l.e.matricule}`, bulletin(l))}>Bulletin</Button></Td>
            </tr>
          ))}
        </Table>
      </section>
    </>
  );
}
