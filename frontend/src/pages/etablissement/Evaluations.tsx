import clsx from 'clsx';
import { Check, Download, Eye, FileBadge2, Lock, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Avatar, Button, Grade, Modal, PageHeader, Panel, Pill, Segmented, SequenceRail, Select, Table, Td, useToast } from '../../components/kit';
import { absences as donneesAbsences, appreciation, classes, ecole, eleves, evaluationsAValider, matieresClasse, note } from '../../data/demo';

/* =========================================================
 * Validation des notes
 * ======================================================= */
type Statut = 'soumise' | 'validee' | 'brouillon' | 'rejetee';
const statutInfo: Record<Statut, { tone: 'feutre' | 'valide' | 'neutre' | 'stylo'; label: string }> = {
  soumise: { tone: 'feutre', label: 'À valider' },
  validee: { tone: 'valide', label: 'Validée' },
  brouillon: { tone: 'neutre', label: 'En saisie' },
  rejetee: { tone: 'stylo', label: 'Renvoyée' },
};

export function ValidationNotes() {
  const toast = useToast();
  const [evals, setEvals] = useState(evaluationsAValider.map((e) => ({ ...e, statut: e.statut as Statut })));
  const [vue, setVue] = useState<'a_valider' | 'toutes'>('a_valider');
  const [detail, setDetail] = useState<(typeof evals)[number] | null>(null);
  const liste = evals.filter((e) => vue === 'toutes' || e.statut === 'soumise');
  const maj = (id: number, statut: Statut) => setEvals((x) => x.map((e) => (e.id === id ? { ...e, statut } : e)));

  return (
    <>
      <PageHeader title="Validation des notes" lead="Les professeurs soumettent une évaluation complète. Vérifiez-la, puis validez-la ou renvoyez-la avec un motif." />
      <Panel className="mb-6 p-5 sm:p-6">
        <SequenceRail />
      </Panel>
      <div className="mb-4">
        <Segmented label="Afficher" value={vue} onChange={setVue} options={[{ value: 'a_valider', label: 'À valider', count: evals.filter((e) => e.statut === 'soumise').length }, { value: 'toutes', label: 'Toutes les évaluations', count: evals.length }]} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {liste.map((e) => (
          <Panel key={e.id} as="article" className="flex flex-col">
            <div className="flex items-start justify-between gap-3 p-5 pb-4">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-encre-doux">{e.type}, séquence 2</p>
                <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.02em]">{e.matiere}, {e.classe}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-encre-doux"><Avatar name={e.prof} size="sm" />{e.prof} · {e.soumise}</p>
              </div>
              <Pill tone={statutInfo[e.statut].tone}>{statutInfo[e.statut].label}</Pill>
            </div>
            <dl className="mx-5 grid grid-cols-4 divide-x divide-papier-ligne rounded-xl bg-papier py-3 text-center">
              <div><dt className="text-[11px] font-medium text-encre-doux">Moyenne</dt><dd className="mt-0.5"><Grade value={e.moyenne} size="sm" /></dd></div>
              <div><dt className="text-[11px] font-medium text-encre-doux">Notes</dt><dd className="mt-0.5 font-bold chiffres">{e.notes}</dd></div>
              <div><dt className="text-[11px] font-medium text-encre-doux">Sous 10</dt><dd className="mt-0.5 font-bold text-stylo chiffres">{e.sousLaMoyenne}</dd></div>
              <div><dt className="text-[11px] font-medium text-encre-doux">Écart</dt><dd className="mt-0.5 text-sm font-bold chiffres">{note(e.min)} – {note(e.max)}</dd></div>
            </dl>
            <div className="mt-auto flex flex-wrap justify-end gap-2 p-5 pt-4">
              <Button size="sm" variant="ghost" icon={Eye} onClick={() => setDetail(e)}>Voir les notes</Button>
              {e.statut === 'soumise' && (
                <>
                  <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => { maj(e.id, 'rejetee'); toast(`Notes renvoyées à ${e.prof} pour correction.`); }}>Renvoyer</Button>
                  <Button size="sm" variant="success" icon={Check} onClick={() => { maj(e.id, 'validee'); toast(`Notes de ${e.matiere}, ${e.classe} validées.`); }}>Valider</Button>
                </>
              )}
            </div>
          </Panel>
        ))}
      </div>

      {detail && (
        <Modal title={`${detail.matiere}, ${detail.classe}`} lead={`${detail.type}, séquence 2 · ${detail.prof}`} onClose={() => setDetail(null)} width="max-w-2xl">
          <ul className="divide-y divide-papier-ligne/70">
            {eleves.slice(0, 12).map((el, i) => {
              const n = [12.5, 15, 8, 17.25, 10.5, 6.5, 13, 18.75, 9.5, 11, 14.5, 3.5][i];
              return (
                <li key={el.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 text-xs text-encre-pale chiffres">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium">{el.nom} {el.prenom}</span>
                  <Grade value={n} size="sm" />
                </li>
              );
            })}
          </ul>
        </Modal>
      )}
    </>
  );
}

/* =========================================================
 * Bulletins
 * ======================================================= */
export function Bulletins() {
  const toast = useToast();
  const [classe, setClasse] = useState('4ème A');
  const [periode, setPeriode] = useState('1er trimestre');
  const [apercu, setApercu] = useState(eleves[3]);
  const [genere, setGenere] = useState(false);
  const liste = eleves.slice(0, 14).map((e, i) => ({ ...e, moy: [15.42, 14.1, 13.05, 12.8, 12.35, 11.9, 11.2, 10.75, 10.4, 9.85, 9.1, 8.6, 7.95, 7.2][i] }));

  return (
    <>
      <PageHeader
        title="Bulletins"
        lead="Un bulletin publié ne change plus. Après une correction de note, une nouvelle version est créée et l’ancienne reste consultable."
        actions={
          <>
            <Button variant="secondary" icon={Download} disabled={!genere} onClick={() => toast(`44 bulletins de la ${classe} téléchargés (PDF).`)}>Télécharger la classe</Button>
            <Button icon={Sparkles} onClick={() => { setGenere(true); toast(`44 bulletins générés pour la ${classe}, ${periode}.`); }}>Générer les bulletins</Button>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_minmax(0,560px)]">
        <Panel>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <Select label="Classe" value={classe} onChange={setClasse} options={classes} />
            <Select label="Période" value={periode} onChange={setPeriode} options={['1er trimestre', '2e trimestre', '3e trimestre', 'Annuel']} />
          </div>
          <Table caption="Classement de la classe" head={[{ label: 'Rang', align: 'center' }, 'Élève', { label: 'Moyenne', align: 'right' }, 'Appréciation', 'Bulletin']} minWidth={560}>
            {liste.map((e, i) => (
              <tr key={e.id} onClick={() => setApercu(e)} className={clsx('cursor-pointer transition-colors hover:bg-brand-50/35', apercu.id === e.id && 'bg-brand-50/60')}>
                <Td className="text-center font-display font-bold chiffres">{i + 1}<sup className="text-[10px]">{i ? 'e' : 'er'}</sup></Td>
                <Td><span className="font-semibold">{e.nom} {e.prenom}</span></Td>
                <Td className="text-right"><Grade value={e.moy} /></Td>
                <Td className="text-encre-doux">{appreciation(e.moy)}</Td>
                <Td>{genere ? <Pill tone="valide">Publié, v1</Pill> : <Pill tone="neutre">À générer</Pill>}</Td>
              </tr>
            ))}
          </Table>
        </Panel>

        {/* Aperçu du bulletin au format camerounais */}
        <div className="xl:sticky xl:top-24 xl:self-start">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-encre-doux"><FileBadge2 className="size-4" aria-hidden /> Aperçu du bulletin</p>
          <article className="overflow-hidden rounded-[18px] bg-white text-[12px] shadow-leve" aria-label={`Bulletin de ${apercu.nom} ${apercu.prenom}`}>
            <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b-2 border-encre px-6 pb-3 pt-5 text-center">
              <div className="text-left text-[10px] leading-tight text-encre-doux">République du Cameroun<br />Paix, Travail, Patrie<br />Ministère des Enseignements Secondaires</div>
              <img src="/logo.svg" alt="" className="size-10" />
              <div className="text-right text-[10px] leading-tight text-encre-doux">Republic of Cameroon<br />Peace, Work, Fatherland<br />{ecole.ville}</div>
            </header>
            <div className="px-6 py-4">
              <p className="text-center font-display text-[15px] font-bold">{ecole.nom}</p>
              <p className="text-center text-[11px] text-encre-doux">Bulletin de notes, {periode}, année {ecole.annee}</p>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg bg-papier px-3 py-2.5">
                <p>Nom : <b>{apercu.nom} {apercu.prenom}</b></p>
                <p>Classe : <b>{classe}</b> (44 élèves)</p>
                <p>Matricule : <b className="font-mono">{apercu.matricule}</b></p>
                <p>Né(e) le : <b>{new Date(apercu.dateNaissance).toLocaleDateString('fr-FR')}</b> à {apercu.lieuNaissance}</p>
              </div>
              <table className="mt-4 w-full">
                <thead>
                  <tr className="border-b border-encre text-left text-[10px] font-semibold text-encre-doux">
                    <th className="py-1.5">Matière</th><th className="text-center">Séq. 1</th><th className="text-center">Séq. 2</th><th className="text-center">Moy.</th><th className="text-center">Coef.</th><th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {matieresClasse.map((m, i) => {
                    const s1 = Math.max(4, Math.min(19, 12 + [2, 3.5, 1, -1, -2.5, 3, 4, 2, 5][i]));
                    const s2 = Math.max(4, Math.min(19, s1 + [-1, 0.5, 1.5, 0.75, -1.5, 0, -0.5, 1, 0][i]));
                    const moy = (s1 + s2) / 2;
                    return (
                      <tr key={m.code} className="border-b border-papier-ligne">
                        <td className="py-1.5">{m.nom}<span className="block text-[10px] text-encre-pale">{m.prof}</span></td>
                        <td className="text-center chiffres">{note(s1)}</td>
                        <td className="text-center chiffres">{note(s2)}</td>
                        <td className={clsx('text-center font-bold chiffres', moy < 10 && 'text-stylo')}>{note(moy)}</td>
                        <td className="text-center chiffres">{m.coef}</td>
                        <td className="text-right font-semibold chiffres">{note(moy * m.coef)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-brand-700 px-2 py-2.5 text-white"><p className="text-[10px] opacity-80">Moyenne</p><p className="font-display text-xl font-extrabold leading-tight chiffres">13,05</p></div>
                <div className="rounded-lg bg-papier px-2 py-2.5"><p className="text-[10px] text-encre-doux">Rang</p><p className="font-display text-xl font-extrabold leading-tight">7<sup className="text-[10px]">e</sup>/44</p></div>
                <div className="rounded-lg bg-papier px-2 py-2.5"><p className="text-[10px] text-encre-doux">Moy. classe</p><p className="font-display text-xl font-extrabold leading-tight chiffres">10,92</p></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <p className="rounded-lg border border-papier-ligne p-2.5"><span className="text-[10px] text-encre-doux">Appréciation</span><br /><b className="font-display text-[14px] text-stylo">Assez bien. Peut mieux faire en physique.</b></p>
                <p className="rounded-lg border border-papier-ligne p-2.5"><span className="text-[10px] text-encre-doux">Absences</span><br /><b>{apercu.absences} h</b>, dont 0 non justifiée</p>
              </div>
              <div className="mt-4 flex items-end justify-between text-[10px] text-encre-doux">
                <span>Le professeur principal<br /><b className="text-encre">Mme ABENA Lucie</b></span>
                <span className="text-right">Le Principal<br /><b className="text-encre">J.-P. Manga</b></span>
              </div>
            </div>
            <footer className="flex items-center justify-between border-t border-papier-ligne bg-papier px-6 py-2 text-[10px] text-encre-pale">
              <span>{genere ? 'Version 1, publiée le 24/11/2026' : 'Brouillon, non publié'}</span>
              <span className="flex items-center gap-1"><Lock className="size-3" aria-hidden /> Empreinte SHA-256 enregistrée</span>
            </footer>
          </article>
        </div>
      </div>
    </>
  );
}

/* =========================================================
 * Absences et retards
 * ======================================================= */
const absStatut = { non_justifiee: { tone: 'stylo', label: 'Non justifiée' }, en_attente: { tone: 'feutre', label: 'Justificatif à vérifier' }, justifiee: { tone: 'valide', label: 'Justifiée' } } as const;

export function Absences() {
  const toast = useToast();
  const [liste, setListe] = useState(donneesAbsences);
  const [vue, setVue] = useState<'toutes' | 'absence' | 'retard'>('toutes');
  const visibles = liste.filter((a) => vue === 'toutes' || a.type === vue);
  const justifier = (id: number) => { setListe((l) => l.map((a) => (a.id === id ? { ...a, statut: 'justifiee' } : a))); toast('Absence marquée comme justifiée.'); };

  return (
    <>
      <PageHeader title="Absences et retards" lead="Signalés par les professeurs et le secrétariat. Les heures d’absence apparaissent sur le bulletin." actions={<Button icon={Check} onClick={() => toast('Formulaire de signalement ouvert.')}>Signaler une absence</Button>} />
      <Panel className="mb-6 grid divide-y divide-papier-ligne/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-6"><p className="text-[13px] font-medium text-encre-doux">Absents aujourd’hui</p><p className="mt-1.5 font-display text-[30px] font-bold leading-none chiffres">14</p><p className="mt-2 text-[13px] text-encre-doux">Taux de présence : 98,3 %</p></div>
        <div className="p-6"><p className="text-[13px] font-medium text-encre-doux">Retards cette semaine</p><p className="mt-1.5 font-display text-[30px] font-bold leading-none chiffres">23</p><p className="mt-2 text-[13px] text-encre-doux">Le lundi en concentre 9</p></div>
        <div className="p-6"><p className="text-[13px] font-medium text-encre-doux">Non justifiées</p><p className="mt-1.5 font-display text-[30px] font-bold leading-none text-stylo chiffres">31 h</p><p className="mt-2 text-[13px] text-encre-doux">Depuis le début de la séquence</p></div>
      </Panel>
      <Panel>
        <div className="p-5"><Segmented label="Type" value={vue} onChange={setVue} options={[{ value: 'toutes', label: 'Tout' }, { value: 'absence', label: 'Absences' }, { value: 'retard', label: 'Retards' }]} /></div>
        <Table caption="Absences et retards" head={['Élève', 'Date', 'Créneau', 'Cours concernés', 'Statut', { label: 'Action', sr: true }]} minWidth={820}>
          {visibles.map((a) => (
            <tr key={a.id}>
              <Td><div className="flex items-center gap-3"><Avatar name={a.eleve} size="sm" /><div><p className="font-semibold">{a.eleve}</p><p className="text-xs text-encre-doux">{a.classe}</p></div></div></Td>
              <Td className="whitespace-nowrap">{a.date}</Td>
              <Td className="whitespace-nowrap"><span className={clsx('mr-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold', a.type === 'absence' ? 'bg-stylo-50 text-stylo-700' : 'bg-orange-50 text-orange')}>{a.type === 'absence' ? 'Absence' : `Retard ${a.duree}`}</span>{a.creneau}</Td>
              <Td className="text-encre-doux">{a.matiere}{a.motif && <span className="block text-xs">{a.motif}</span>}</Td>
              <Td><Pill tone={absStatut[a.statut as keyof typeof absStatut].tone}>{absStatut[a.statut as keyof typeof absStatut].label}</Pill></Td>
              <Td className="text-right">{a.statut !== 'justifiee' && <Button size="sm" variant="secondary" onClick={() => justifier(a.id)}>Justifier</Button>}</Td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}

