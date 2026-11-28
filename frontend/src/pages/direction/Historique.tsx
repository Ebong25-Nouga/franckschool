import { Download, History, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Titre } from '@/components/espace';
import { Avatar, Button, EmptyState, Pill, SearchInput, Segmented, Table, Td, useToast } from '@/components/kit';
import { telechargerCsv } from '@/lib/imprimer';
import { dateHeureFr, Liste, ModalMotif, nomEleve, Note, Pagination } from '../secretariat/commun';
import type { Etat } from '../secretariat/donnees';
import { useSecretariat } from '../secretariat/store';

/* =========================================================
 * Éléments masqués ou supprimés (toutes les listes de l'école)
 * ======================================================= */
type CleRetirable = 'eleves' | 'parents' | 'enseignants' | 'classes' | 'matieres' | 'absences' | 'incidents' | 'annonces';
export interface Retire {
  cle: CleRetirable;
  id: number;
  type: string;
  libelle: string;
  etat: 'masque' | 'supprime';
  par: string;
  le: string;
  motif: string;
}

function retiresDe(etat: Etat): Retire[] {
  const r: Retire[] = [];
  const nomE = (id: number) => {
    const e = etat.eleves.find((x) => x.id === id);
    return e ? nomEleve(e) : 'Élève';
  };
  const ajouter = (cle: CleRetirable, type: string, l: { id: number; etat: string; retirePar?: string; retireLe?: string; motifRetrait?: string }[], libelle: (x: never) => string) =>
    l.filter((x) => x.etat !== 'actif').forEach((x) => r.push({ cle, id: x.id, type, libelle: libelle(x as never), etat: x.etat as Retire['etat'], par: x.retirePar ?? '—', le: x.retireLe ?? '', motif: x.motifRetrait ?? '—' }));
  ajouter('eleves', 'Élève', etat.eleves, (x: Etat['eleves'][number]) => `${nomEleve(x)} (${x.matricule})`);
  ajouter('parents', 'Parent', etat.parents, (x: Etat['parents'][number]) => x.nom);
  ajouter('enseignants', 'Enseignant', etat.enseignants, (x: Etat['enseignants'][number]) => `${x.civilite} ${x.nom} ${x.prenom}`);
  ajouter('classes', 'Classe', etat.classes, (x: Etat['classes'][number]) => x.nom);
  ajouter('matieres', 'Matière', etat.matieres, (x: Etat['matieres'][number]) => `${x.nom} (${x.classe})`);
  ajouter('absences', 'Absence', etat.absences, (x: Etat['absences'][number]) => `${nomE(x.eleveId)}, ${x.date.split('-').reverse().join('/')}`);
  ajouter('incidents', 'Sanction', etat.incidents, (x: Etat['incidents'][number]) => `${x.type} · ${nomE(x.eleveId)}`);
  ajouter('annonces', 'Annonce', etat.annonces, (x: Etat['annonces'][number]) => x.titre);
  return r.sort((a, b) => b.le.localeCompare(a.le));
}

// eslint-disable-next-line react-refresh/only-export-components
export function useElementsRetires() {
  const { etat } = useSecretariat();
  return useMemo(() => retiresDe(etat), [etat]);
}

/* =========================================================
 * Historique des activités
 * ======================================================= */
export default function Historique() {
  const { etat } = useSecretariat();
  const [params] = useSearchParams();
  const retires = useElementsRetires();
  const [onglet, setOnglet] = useState<'journal' | 'retires'>(params.get('onglet') === 'retires' ? 'retires' : 'journal');
  useEffect(() => {
    if (params.get('onglet') === 'retires') setOnglet('retires');
  }, [params]);
  return (
    <>
      <Titre titre="Historique des activités" texte="Toutes les opérations de l’établissement : qui, quoi, quand, avant et après. Le journal ne peut être ni modifié ni effacé, même par l’administrateur." />
      <div className="mb-5">
        <Segmented label="Vue" value={onglet} onChange={setOnglet} options={[{ value: 'journal', label: 'Journal', count: etat.journal.length }, { value: 'retires', label: 'Éléments masqués ou supprimés', count: retires.length }]} />
      </div>
      {onglet === 'journal' ? <Journal /> : <Retires liste={retires} />}
    </>
  );
}

function Journal() {
  const { etat } = useSecretariat();
  const [q, setQ] = useState('');
  const [qui, setQui] = useState('Tout le monde');
  const [role, setRole] = useState('Tous les rôles');
  const [module, setModule] = useState('Tous les modules');
  const [operation, setOperation] = useState('Toutes les opérations');
  const [depuis, setDepuis] = useState('Toute la période');
  const [page, setPage] = useState(1);
  const uniques = (f: (j: Etat['journal'][number]) => string) => [...new Set(etat.journal.map(f))].sort();
  const limite = { 'Toute la période': '', 'Aujourd’hui': 0, '7 derniers jours': 6, '30 derniers jours': 29 }[depuis];
  const dateMin = typeof limite === 'number' ? new Date(Date.now() - limite * 864e5).toISOString().slice(0, 10) : '';
  const t = q.trim().toLowerCase();
  const liste = etat.journal
    .filter((j) => qui === 'Tout le monde' || j.utilisateur === qui)
    .filter((j) => role === 'Tous les rôles' || j.role === role)
    .filter((j) => module === 'Tous les modules' || j.module === module)
    .filter((j) => operation === 'Toutes les opérations' || j.operation === operation)
    .filter((j) => !dateMin || j.quand.slice(0, 10) >= dateMin)
    .filter((j) => !t || `${j.element} ${j.motif ?? ''} ${j.avant ?? ''} ${j.apres ?? ''}`.toLowerCase().includes(t))
    .sort((a, b) => b.quand.localeCompare(a.quand) || b.id - a.id);
  const raz = () => setPage(1);
  const exporter = () =>
    telechargerCsv('journal-etablissement.csv', [['Date', 'Utilisateur', 'Rôle', 'Opération', 'Module', 'Élément', 'Avant', 'Après', 'Motif'], ...liste.map((j) => [dateHeureFr(j.quand), j.utilisateur, j.role, j.operation, j.module, j.element, j.avant ?? '', j.apres ?? '', j.motif ?? ''])]);
  return (
    <section className="rounded-[22px] bg-white shadow-feuille">
      <div className="grid gap-3 p-5 sm:p-6 md:grid-cols-3">
        <SearchInput value={q} onChange={(v) => (setQ(v), raz())} label="Rechercher" placeholder="Rechercher un élément, un motif…" className="md:col-span-3" />
        <Liste aria-label="Utilisateur" value={qui} onChange={(e) => (setQui(e.target.value), raz())} options={['Tout le monde', ...uniques((j) => j.utilisateur)]} />
        <Liste aria-label="Rôle" value={role} onChange={(e) => (setRole(e.target.value), raz())} options={['Tous les rôles', ...uniques((j) => j.role)]} />
        <Liste aria-label="Module" value={module} onChange={(e) => (setModule(e.target.value), raz())} options={['Tous les modules', ...uniques((j) => j.module)]} />
        <Liste aria-label="Opération" value={operation} onChange={(e) => (setOperation(e.target.value), raz())} options={['Toutes les opérations', ...uniques((j) => j.operation)]} />
        <Liste aria-label="Période" value={depuis} onChange={(e) => (setDepuis(e.target.value), raz())} options={['Toute la période', 'Aujourd’hui', '7 derniers jours', '30 derniers jours']} />
      </div>
      <div className="flex items-center justify-between gap-3 px-5 pb-3 sm:px-6">
        <p className="text-sm text-encre-doux">{liste.length} opération(s)</p>
        <Button size="sm" variant="secondary" icon={Download} onClick={exporter}>Exporter (Excel)</Button>
      </div>
      {liste.length === 0 ? <EmptyState icon={History} title="Aucune opération" text="Rien ne correspond à ces critères." /> : (
        <>
          <Table caption="Journal de l’établissement" head={['Date et heure', 'Qui', 'Opération', 'Élément', 'Avant → après', 'Motif']} minWidth={1080}>
            {liste.slice((page - 1) * 15, page * 15).map((j) => (
              <tr key={j.id}>
                <Td className="whitespace-nowrap text-[13px] chiffres">{dateHeureFr(j.quand)}</Td>
                <Td><div className="flex items-center gap-2.5"><Avatar name={j.utilisateur} size="sm" /><span><span className="block text-sm font-semibold">{j.utilisateur}</span><span className="block text-xs text-encre-doux">{j.role}</span></span></div></Td>
                <Td><p className={`font-semibold ${['Suppression', 'Accès refusé', 'Annulation'].includes(j.operation) ? 'text-stylo' : ''}`}>{j.operation}</p><p className="text-xs text-encre-doux">{j.module}</p></Td>
                <Td className="max-w-72 text-[13.5px]">{j.element}</Td>
                <Td className="max-w-72 text-[13px] text-encre-doux">{j.avant || j.apres ? <>{j.avant && <span className="line-through">{j.avant}</span>}{j.avant && j.apres && ' → '}{j.apres}</> : '—'}</Td>
                <Td className="max-w-56 text-[13px]">{j.motif ?? '—'}</Td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} total={liste.length} parPage={15} onPage={setPage} quoi="opérations" />
        </>
      )}
    </section>
  );
}

function Retires({ liste }: { liste: Retire[] }) {
  const { restaurer } = useSecretariat();
  const toast = useToast();
  const [filtre, setFiltre] = useState<'tous' | 'masque' | 'supprime'>('tous');
  const [choisi, setChoisi] = useState<Retire | null>(null);
  const l = liste.filter((r) => filtre === 'tous' || r.etat === filtre);
  return (
    <section className="rounded-[22px] bg-white shadow-feuille">
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <Note>Rien n’est effacé de la base de données : un élément masqué ou supprimé par une secrétaire reste ici, avec l’auteur, la date et le motif. Vous pouvez le restaurer.</Note>
        <Segmented label="Filtre" value={filtre} onChange={setFiltre} options={[{ value: 'tous', label: 'Tous', count: liste.length }, { value: 'masque', label: 'Masqués', count: liste.filter((r) => r.etat === 'masque').length }, { value: 'supprime', label: 'Supprimés', count: liste.filter((r) => r.etat === 'supprime').length }]} />
      </div>
      {l.length === 0 ? <EmptyState icon={Trash2} title="Rien à restaurer" text="Aucun élément masqué ou supprimé." /> : (
        <Table caption="Éléments retirés" head={['Élément', 'État', 'Par', 'Le', 'Motif', { label: 'Action', sr: true }]} minWidth={900}>
          {l.map((r) => (
            <tr key={r.cle + r.id}>
              <Td><p className="text-xs text-encre-doux">{r.type}</p><p className="font-semibold">{r.libelle}</p></Td>
              <Td><Pill tone={r.etat === 'masque' ? 'neutre' : 'stylo'}>{r.etat === 'masque' ? 'Masqué' : 'Supprimé'}</Pill></Td>
              <Td>{r.par}</Td>
              <Td className="whitespace-nowrap text-[13px] chiffres">{r.le ? dateHeureFr(r.le) : '—'}</Td>
              <Td className="max-w-64 text-[13px]">« {r.motif} »</Td>
              <Td className="text-right"><Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => setChoisi(r)}>Restaurer</Button></Td>
            </tr>
          ))}
        </Table>
      )}
      {choisi && (
        <ModalMotif
          titre={`Restaurer : ${choisi.libelle}`}
          texte={`${choisi.type} ${choisi.etat === 'masque' ? 'masqué' : 'supprimé'} par ${choisi.par}. Il réapparaîtra dans les listes de l’établissement.`}
          bouton="Restaurer"
          rappel="La restauration est notée dans le journal avec votre motif."
          onValider={(motif) => {
            restaurer(choisi.cle, choisi.id, motif, { module: choisi.type, element: choisi.libelle });
            toast(`${choisi.type} restauré(e).`);
          }}
          onClose={() => setChoisi(null)}
        />
      )}
    </section>
  );
}
