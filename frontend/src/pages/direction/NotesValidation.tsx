import { CheckCheck, ClipboardCheck, MessageSquareWarning, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Titre } from '@/components/espace';
import { Button, EmptyState, Pill, Segmented, Table, Td, useToast } from '@/components/kit';
import { note } from '@/data/demo';
import { cn } from '@/lib/utils';
import { Champ, dateHeureFr, Liste, nomEleve, Note, Zone } from '../secretariat/commun';
import { isoMinute, type Releve } from '../secretariat/donnees';
import { noteSeq } from '../secretariat/Evaluations';
import { useSecretariat, visibles } from '../secretariat/store';

/**
 * Notes et validation (cahier admin § 8).
 * Circuit : l'enseignant soumet → l'administrateur vérifie → il valide, ou demande une correction
 * avec un commentaire → l'enseignant corrige et soumet à nouveau → validation définitive.
 * Quand toutes les matières d'une classe sont validées, ses bulletins sont générés automatiquement.
 */
type Onglet = 'a_valider' | 'corrections' | 'validees' | 'historique';

export default function NotesValidation() {
  const { etat, modifier, utilisateur } = useSecretariat();
  const toast = useToast();
  const [onglet, setOnglet] = useState<Onglet>('a_valider');
  const [sequence, setSequence] = useState('Séquence 2');
  const [classe, setClasse] = useState('Toutes les classes');
  const [matiere, setMatiere] = useState('Toutes les matières');
  const [choisi, setChoisi] = useState<number | null>(null);

  const seq = Number(sequence.split(' ')[1]);
  const base = etat.releves.filter((r) => r.sequence === seq && (classe === 'Toutes les classes' || r.classe === classe) && (matiere === 'Toutes les matières' || r.matiere === matiere));
  const parOnglet: Record<Exclude<Onglet, 'historique'>, Releve[]> = {
    a_valider: base.filter((r) => r.statut === 'soumise'),
    corrections: base.filter((r) => r.statut === 'correction'),
    validees: base.filter((r) => r.statut === 'validee'),
  };
  const liste = onglet === 'historique' ? [] : parOnglet[onglet].sort((a, b) => (b.historique.at(-1)?.quand ?? '').localeCompare(a.historique.at(-1)?.quand ?? ''));
  const r = etat.releves.find((x) => x.id === choisi) ?? liste[0];

  const valider = (x: Releve) => {
    modifier('releves', x.id, { statut: 'validee', historique: [...x.historique, { quand: isoMinute(new Date()), action: 'Validation', par: utilisateur }] }, { operation: 'Validation', module: 'Notes', element: `${x.matiere}, ${x.classe}, séquence ${x.sequence}`, apres: `${x.notes} notes validées` });
    // La classe est-elle maintenant complète ?
    const mats = visibles(etat.matieres).filter((m) => m.classe === x.classe);
    const complete = mats.every((m) => m.nom === x.matiere || etat.releves.find((y) => y.classe === x.classe && y.matiere === m.nom && y.sequence === x.sequence)?.statut === 'validee');
    toast(complete ? `Toutes les notes de la ${x.classe} sont validées : ses bulletins sont générés automatiquement.` : `Notes de ${x.matiere} (${x.classe}) validées.`);
    setChoisi(null);
  };
  const corriger = (x: Releve, commentaire: string) => {
    modifier('releves', x.id, { statut: 'correction', historique: [...x.historique, { quand: isoMinute(new Date()), action: 'Correction demandée', par: utilisateur, commentaire }] }, { operation: 'Correction demandée', module: 'Notes', element: `${x.prof} : ${x.matiere}, ${x.classe}, séquence ${x.sequence}`, motif: commentaire });
    toast(`Correction demandée à ${x.prof}.`);
    setChoisi(null);
  };
  const simulerReprise = (x: Releve) => {
    modifier('releves', x.id, { statut: 'soumise', historique: [...x.historique, { quand: isoMinute(new Date()), action: 'Nouvelle soumission', par: x.prof, commentaire: 'Notes corrigées.' }] }, { operation: 'Nouvelle soumission', module: 'Notes', element: `${x.matiere}, ${x.classe}, séquence ${x.sequence}` });
    toast('Démonstration : l’enseignant a soumis ses corrections.');
  };

  const classes = visibles(etat.classes).map((c) => c.nom);
  const matieres = [...new Set(visibles(etat.matieres).map((m) => m.nom))].sort();
  const historique = base.flatMap((x) => x.historique.map((h, i) => ({ ...h, r: x, i }))).sort((a, b) => b.quand.localeCompare(a.quand));

  return (
    <>
      <Titre titre="Notes et validation" texte="Vérifiez les notes soumises par les enseignants, validez-les ou demandez une correction. Dès qu’une classe est entièrement validée, ses bulletins sont générés automatiquement." />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented
          label="Onglets"
          value={onglet}
          onChange={(v) => (setOnglet(v), setChoisi(null))}
          options={[
            { value: 'a_valider', label: 'À valider', count: parOnglet.a_valider.length },
            { value: 'corrections', label: 'Corrections demandées', count: parOnglet.corrections.length },
            { value: 'validees', label: 'Validées', count: parOnglet.validees.length },
            { value: 'historique', label: 'Historique' },
          ]}
        />
        <div className="flex-1" />
        <Liste aria-label="Séquence" value={sequence} onChange={(e) => (setSequence(e.target.value), setChoisi(null))} options={[1, 2, 3, 4, 5, 6].map((n) => `Séquence ${n}`)} className="w-40" />
        <Liste aria-label="Classe" value={classe} onChange={(e) => (setClasse(e.target.value), setChoisi(null))} options={['Toutes les classes', ...classes]} className="w-48" />
        <Liste aria-label="Matière" value={matiere} onChange={(e) => (setMatiere(e.target.value), setChoisi(null))} options={['Toutes les matières', ...matieres]} className="w-52" />
      </div>

      {onglet === 'historique' ? (
        <section className="rounded-[22px] bg-white shadow-feuille">
          {historique.length === 0 ? <EmptyState icon={ClipboardCheck} title="Aucun historique" text="Aucune soumission pour ces critères." /> : (
            <Table caption="Historique des validations" head={['Date et heure', 'Action', 'Classe · matière', 'Par', 'Commentaire']} minWidth={900}>
              {historique.slice(0, 60).map((h) => (
                <tr key={`${h.r.id}-${h.i}`}>
                  <Td className="whitespace-nowrap text-[13px] chiffres">{dateHeureFr(h.quand)}</Td>
                  <Td><Pill tone={h.action === 'Validation' ? 'valide' : h.action === 'Correction demandée' ? 'feutre' : 'encre'}>{h.action}</Pill></Td>
                  <Td><b>{h.r.classe}</b> · {h.r.matiere}</Td>
                  <Td>{h.par}</Td>
                  <Td className="max-w-80 text-[13px]">{h.commentaire ?? '—'}</Td>
                </tr>
              ))}
            </Table>
          )}
        </section>
      ) : liste.length === 0 ? (
        <section className="rounded-[22px] bg-white shadow-feuille">
          <EmptyState icon={CheckCheck} title={onglet === 'a_valider' ? 'Rien à valider' : onglet === 'corrections' ? 'Aucune correction en cours' : 'Aucune note validée'} text="Rien ne correspond à ces critères." />
        </section>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-[22px] bg-white shadow-feuille">
            <Table caption="Saisies de notes" head={['Classe · matière', 'Enseignant', 'Notes', 'Moyenne', 'État']} minWidth={600}>
              {liste.map((x) => {
                const resoumise = x.statut === 'soumise' && x.historique.some((h) => h.action === 'Nouvelle soumission');
                const dernier = x.historique.at(-1);
                return (
                  <tr key={x.id} onClick={() => setChoisi(x.id)} className={cn('cursor-pointer transition-colors hover:bg-papier/70', r?.id === x.id && 'bg-brand-50/60 shadow-[inset_3px_0_0_#1C32A5]')}>
                    <Td><p><b>{x.classe}</b> · {x.matiere}</p><p className="text-xs text-encre-doux">{x.evaluations.join(' + ') || '—'}{dernier ? ` · ${dateHeureFr(dernier.quand)}` : ''}</p></Td>
                    <Td className="text-[13.5px]">{x.prof}</Td>
                    <Td className="chiffres">{x.notes}/{x.attendu}</Td>
                    <Td className="font-display font-bold chiffres">{note(moyenneClasse(x))}</Td>
                    <Td><Pill tone={x.statut === 'validee' ? 'valide' : x.statut === 'correction' ? 'feutre' : 'encre'}>{x.statut === 'validee' ? 'Validée' : x.statut === 'correction' ? 'Correction demandée' : resoumise ? 'Corrigée, à revalider' : 'À valider'}</Pill></Td>
                  </tr>
                );
              })}
            </Table>
          </section>
          {r && <Detail key={r.id} r={r} onValider={valider} onCorriger={corriger} onSimuler={simulerReprise} />}
        </div>
      )}
    </>
  );

  function moyenneClasse(x: Releve) {
    const m = etat.matieres.find((y) => y.classe === x.classe && y.nom === x.matiere);
    const el = visibles(etat.eleves).filter((e) => e.classe === x.classe && e.situation === 'inscrit');
    return m && el.length ? el.reduce((s, e) => s + noteSeq(e, m, x.sequence), 0) / el.length : 0;
  }
}

function Detail({ r, onValider, onCorriger, onSimuler }: { r: Releve; onValider: (r: Releve) => void; onCorriger: (r: Releve, c: string) => void; onSimuler: (r: Releve) => void }) {
  const { etat } = useSecretariat();
  const [commentaire, setCommentaire] = useState('');
  const [essai, setEssai] = useState(false);
  const [tout, setTout] = useState(false);
  const m = etat.matieres.find((y) => y.classe === r.classe && y.nom === r.matiere);
  const notes = useMemo(() => {
    const el = visibles(etat.eleves).filter((e) => e.classe === r.classe && e.situation === 'inscrit').sort((a, b) => a.nom.localeCompare(b.nom));
    return m ? el.map((e) => ({ e, n: noteSeq(e, m, r.sequence) })) : [];
  }, [etat.eleves, m, r.classe, r.sequence]);
  const v = notes.map((x) => x.n);
  const stats = v.length ? [['Moyenne', note(v.reduce((a, b) => a + b, 0) / v.length)], ['Min', note(Math.min(...v))], ['Max', note(Math.max(...v))], ['< 10', String(v.filter((x) => x < 10).length)]] : [];
  const dernier = r.historique.at(-1);
  const demande = [...r.historique].reverse().find((h) => h.action === 'Correction demandée');

  return (
    <section className="rounded-[22px] bg-white p-5 shadow-feuille xl:sticky xl:top-24">
      <p className="text-[13px] text-encre-doux">{r.classe} · Séquence {r.sequence} · {r.evaluations.join(' + ') || '—'}</p>
      <h2 className="font-display text-[21px] font-bold">{r.matiere}{m ? ` · coef ${m.coef}` : ''}</h2>
      <p className="text-[13px] text-encre-doux">{r.prof}{dernier ? ` · ${dernier.action.toLowerCase()} le ${dateHeureFr(dernier.quand)}` : ''}</p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {stats.map(([l, x]) => <div key={l} className="rounded-xl bg-papier px-2.5 py-2"><p className="text-[11.5px] text-encre-doux">{l}</p><p className="font-display text-[17px] font-extrabold chiffres">{x}</p></div>)}
      </div>

      <ul className="mt-4 divide-y divide-papier-ligne/70 rounded-xl ring-1 ring-inset ring-papier-ligne">
        {(tout ? notes : notes.slice(0, 5)).map(({ e, n }) => (
          <li key={e.id} className="flex justify-between px-3.5 py-2 text-[13.5px]"><span className="truncate">{nomEleve(e)}</span><b className={cn('chiffres', n < 10 && 'text-stylo')}>{note(n)}</b></li>
        ))}
        {notes.length > 5 && <li><button onClick={() => setTout(!tout)} className="w-full cursor-pointer px-3.5 py-2 text-left text-[13px] font-semibold text-brand-700 hover:bg-papier">{tout ? 'Réduire' : `Voir les ${notes.length} notes →`}</button></li>}
      </ul>

      {demande && <div className="mt-4"><Note ton="feutre">Correction demandée par {demande.par} le {dateHeureFr(demande.quand)} : « {demande.commentaire} »</Note></div>}

      {r.statut === 'soumise' && (
        <>
          <div className="mt-4"><Champ label="Commentaire (obligatoire pour une correction)" erreur={essai && commentaire.trim().length < 5 && 'Expliquez ce qu’il faut corriger.'}><Zone value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Exemple : la note de la ligne 7 semble inversée avec la ligne 8" /></Champ></div>
          <div className="mt-4 flex flex-wrap justify-between gap-2">
            <Button variant="secondary" icon={MessageSquareWarning} onClick={() => { setEssai(true); if (commentaire.trim().length >= 5) onCorriger(r, commentaire.trim()); }}>Demander une correction</Button>
            <Button icon={CheckCheck} onClick={() => onValider(r)}>Valider les {r.notes} notes</Button>
          </div>
        </>
      )}
      {r.statut === 'correction' && (
        <div className="mt-4 space-y-3">
          <p className="text-[13px] text-encre-doux">L’enseignant corrige depuis son espace (« Demandes de correction »), puis soumet à nouveau.</p>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => onSimuler(r)}>Simuler la nouvelle soumission (démo)</Button>
        </div>
      )}
      {r.statut === 'validee' && <p className="mt-4 text-[13px] font-semibold text-valide">Validée définitivement. Elle compte dans les bulletins.</p>}

      {r.historique.length > 0 && (
        <div className="mt-5 border-t border-papier-ligne/70 pt-4">
          <p className="mb-2 text-xs font-semibold text-encre-pale">Historique</p>
          <ol className="space-y-2">
            {r.historique.map((h, i) => (
              <li key={i} className="text-[13px]"><span className="chiffres text-encre-pale">{dateHeureFr(h.quand)}</span> · <b>{h.action}</b> · {h.par}{h.commentaire ? <span className="block text-encre-doux">« {h.commentaire} »</span> : null}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
