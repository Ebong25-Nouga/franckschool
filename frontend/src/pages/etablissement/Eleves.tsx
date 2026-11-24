import { Download, Eye, Pencil, SearchX, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, Progress, SearchInput, Select, Table, Td } from '../../components/ui';
import { classes, eleves, fcfa, type Eleve } from '../../data/demo';

const statutTone = { nouveau: 'brand', ancien: 'slate', redoublant: 'amber' } as const;

export default function Eleves() {
  const [q, setQ] = useState('');
  const [classe, setClasse] = useState('Toutes classes');
  const [statut, setStatut] = useState('Tous statuts');
  const [choisi, setChoisi] = useState<Eleve | null>(null);

  const liste = useMemo(
    () =>
      eleves.filter(
        (e) =>
          (classe === 'Toutes classes' || e.classe === classe) &&
          (statut === 'Tous statuts' || e.statut === statut.toLowerCase()) &&
          `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, classe, statut],
  );

  return (
    <>
      <PageHeader
        title="Élèves"
        subtitle={`${eleves.length} élèves inscrits en 2026-2027`}
        actions={
          <>
            <Button variant="secondary" icon={Download}>Exporter</Button>
            <Button icon={UserPlus}>Inscrire un élève</Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <SearchInput value={q} onChange={setQ} label="Rechercher un élève" placeholder="Nom, prénom ou matricule…" />
          <div className="grid grid-cols-2 gap-3 sm:ml-auto sm:flex">
            <Select hideLabel label="Classe" value={classe} onChange={setClasse} options={['Toutes classes', ...classes]} />
            <Select hideLabel label="Statut" value={statut} onChange={setStatut} options={['Tous statuts', 'Nouveau', 'Ancien', 'Redoublant']} />
          </div>
        </div>

        {liste.length === 0 ? (
          <EmptyState icon={SearchX} title="Aucun élève trouvé" text="Modifiez la recherche ou les filtres." />
        ) : (
          <Table caption="Liste des élèves" head={['Élève', 'Matricule', 'Classe', 'Statut', 'Scolarité payée', '']}>
            {liste.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-slate-50/80">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={`${e.nom} ${e.prenom}`} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{e.nom} {e.prenom}</p>
                      <p className="text-xs text-slate-500">{e.sexe === 'F' ? 'Fille' : 'Garçon'} · {e.tuteur}</p>
                    </div>
                  </div>
                </Td>
                <Td className="font-mono text-xs text-slate-600">{e.matricule}</Td>
                <Td className="whitespace-nowrap font-medium">{e.classe}</Td>
                <Td><Badge tone={statutTone[e.statut]}>{e.statut[0].toUpperCase() + e.statut.slice(1)}</Badge></Td>
                <Td><Progress value={Math.round((e.paye / e.du) * 100)} label={`Scolarité payée de ${e.nom}`} /></Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setChoisi(e)} className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-800" aria-label={`Voir le dossier de ${e.nom} ${e.prenom}`}>
                      <Eye className="size-4" />
                    </button>
                    <button className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label={`Modifier ${e.nom} ${e.prenom}`}>
                      <Pencil className="size-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">{liste.length} résultat{liste.length > 1 ? 's' : ''}</div>
      </Card>

      {choisi && <Dossier eleve={choisi} onClose={() => setChoisi(null)} />}
    </>
  );
}

function Dossier({ eleve: e, onClose }: { eleve: Eleve; onClose: () => void }) {
  const reste = e.du - e.paye;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="dossier-titre">
      <button className="absolute inset-0 cursor-pointer bg-slate-900/40" aria-label="Fermer" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md animate-fade-up flex-col bg-white shadow-pop">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <Avatar name={`${e.nom} ${e.prenom}`} className="size-12 text-sm" />
            <div>
              <h2 id="dossier-titre" className="font-bold text-slate-900">{e.nom} {e.prenom}</h2>
              <p className="text-sm text-slate-500">{e.matricule} · {e.classe}</p>
            </div>
          </div>
          <button onClick={onClose} className="grid size-10 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Fermer le dossier" autoFocus>
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-5 text-sm">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Identité</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div><dt className="text-slate-500">Sexe</dt><dd className="font-medium">{e.sexe === 'F' ? 'Féminin' : 'Masculin'}</dd></div>
              <div><dt className="text-slate-500">Né(e) le</dt><dd className="font-medium">{new Date(e.dateNaissance).toLocaleDateString('fr-FR')}</dd></div>
              <div><dt className="text-slate-500">Statut</dt><dd className="font-medium capitalize">{e.statut}</dd></div>
              <div><dt className="text-slate-500">Année</dt><dd className="font-medium">2026-2027</dd></div>
            </dl>
          </section>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tuteur principal</h3>
            <p className="font-medium text-slate-900">{e.tuteur}</p>
            <p className="text-slate-600">{e.telephone}</p>
          </section>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Scolarité</h3>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex justify-between"><span className="text-slate-600">Montant dû</span><span className="font-semibold tabular-nums">{fcfa(e.du)}</span></div>
              <div className="mt-2 flex justify-between"><span className="text-slate-600">Déjà payé</span><span className="font-semibold tabular-nums text-emerald-700">{fcfa(e.paye)}</span></div>
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3"><span className="font-semibold">Reste à payer</span><span className={`font-bold tabular-nums ${reste ? 'text-red-600' : 'text-emerald-700'}`}>{fcfa(reste)}</span></div>
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Historique des classes</h3>
            <ol className="space-y-2">
              <li className="flex justify-between"><span>2026-2027</span><span className="font-medium">{e.classe}</span></li>
              <li className="flex justify-between text-slate-500"><span>2025-2026</span><span>Classe précédente</span></li>
            </ol>
          </section>
        </div>
        <div className="flex gap-2 border-t border-slate-100 p-4">
          <Button variant="secondary" className="flex-1">Modifier</Button>
          <Button className="flex-1">Encaisser</Button>
        </div>
      </div>
    </div>
  );
}
