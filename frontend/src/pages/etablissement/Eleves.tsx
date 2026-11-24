import clsx from 'clsx';
import { Banknote, Download, FileBadge2, MoreHorizontal, Pencil, Phone, SearchX, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EncaissementModal, InscriptionModal } from '../../components/Actions';
import { Avatar, Button, Drawer, EmptyState, Gauge, Grade, IconButton, PageHeader, Panel, Pill, SearchInput, Segmented, Select, Table, Td, useToast } from '../../components/kit';
import { appreciation, classes, eleves, fcfa, matieresClasse, type Eleve } from '../../data/demo';

const statutTone = { nouveau: 'encre', ancien: 'neutre', redoublant: 'orange' } as const;
type Filtre = 'tous' | 'impayes' | 'difficulte';

export default function Eleves() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [classe, setClasse] = useState('Toutes les classes');
  const [filtre, setFiltre] = useState<Filtre>('tous');
  const [choisi, setChoisi] = useState<Eleve | null>(null);
  const [modal, setModal] = useState<'inscription' | 'paiement' | null>(null);

  const base = useMemo(() => eleves.filter((e) => (classe === 'Toutes les classes' || e.classe === classe) && `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(q.toLowerCase())), [q, classe]);
  const liste = base.filter((e) => (filtre === 'impayes' ? e.paye < e.du : filtre === 'difficulte' ? e.moyenne < 10 : true));

  return (
    <>
      <PageHeader
        title="Élèves"
        lead="842 élèves inscrits pour 2026-2027, dont 37 nouveaux et 19 redoublants."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={() => toast('Liste exportée au format Excel (élèves filtrés).')}>Exporter</Button>
            <Button icon={UserPlus} onClick={() => setModal('inscription')}>Inscrire un élève</Button>
          </>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center">
          <Segmented
            label="Filtrer les élèves"
            value={filtre}
            onChange={setFiltre}
            options={[
              { value: 'tous', label: 'Tous', count: base.length },
              { value: 'impayes', label: 'Impayés', count: base.filter((e) => e.paye < e.du).length },
              { value: 'difficulte', label: 'Moyenne < 10', count: base.filter((e) => e.moyenne < 10).length },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-[1fr_200px] lg:ml-auto lg:w-[520px]">
            <SearchInput value={q} onChange={setQ} label="Rechercher un élève" placeholder="Nom, prénom ou matricule" />
            <Select hideLabel label="Classe" value={classe} onChange={setClasse} options={['Toutes les classes', ...classes]} />
          </div>
        </div>

        {liste.length === 0 ? (
          <EmptyState icon={SearchX} title="Aucun élève ne correspond" text="Essayez un autre nom, ou retirez le filtre de classe." action={<Button variant="secondary" onClick={() => { setQ(''); setClasse('Toutes les classes'); setFiltre('tous'); }}>Effacer les filtres</Button>} />
        ) : (
          <>
          {/* Téléphone : une carte par élève */}
          <ul className="divide-y divide-papier-ligne/70 border-t border-papier-ligne/70 sm:hidden">
            {liste.map((e) => (
              <li key={e.id}>
                <button onClick={() => setChoisi(e)} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left active:bg-papier">
                  <Avatar name={`${e.nom} ${e.prenom}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{e.nom} {e.prenom}</span>
                    <span className="block text-xs text-encre-doux">{e.classe} · <span className="font-mono">{e.matricule}</span></span>
                    {e.paye < e.du && <span className="mt-0.5 block text-xs font-semibold text-stylo chiffres">Reste {fcfa(e.du - e.paye)}</span>}
                  </span>
                  <Grade value={e.moyenne} size="sm" />
                </button>
              </li>
            ))}
          </ul>
          <div className="hidden sm:block">
          <Table caption="Liste des élèves" head={['Élève', 'Classe', 'Statut', { label: 'Moyenne séq. 1', align: 'right' }, 'Scolarité', { label: 'Actions', sr: true }]} minWidth={820}>
            {liste.map((e) => (
              <tr key={e.id} onClick={() => setChoisi(e)} className="group cursor-pointer transition-colors hover:bg-brand-50/35">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={`${e.nom} ${e.prenom}`} />
                    <div className="min-w-0">
                      <button className="block truncate text-left font-semibold text-encre group-hover:text-brand-800" onClick={(ev) => { ev.stopPropagation(); setChoisi(e); }}>
                        {e.nom} {e.prenom}
                      </button>
                      <p className="font-mono text-xs text-encre-pale">{e.matricule}</p>
                    </div>
                  </div>
                </Td>
                <Td className="whitespace-nowrap font-medium">{e.classe}</Td>
                <Td><Pill tone={statutTone[e.statut]}>{e.statut[0].toUpperCase() + e.statut.slice(1)}</Pill></Td>
                <Td className="text-right"><Grade value={e.moyenne} /></Td>
                <Td className="w-[220px]">
                  <Gauge value={(e.paye / e.du) * 100} label={`Scolarité payée par ${e.nom}`} />
                  {e.paye < e.du && <p className="mt-1 text-xs text-stylo chiffres">Reste {fcfa(e.du - e.paye)}</p>}
                </Td>
                <Td className="text-right">
                  <span className="inline-flex" onClick={(ev) => ev.stopPropagation()}>
                    <IconButton icon={Pencil} label={`Modifier ${e.nom} ${e.prenom}`} onClick={() => setChoisi(e)} />
                    <IconButton icon={MoreHorizontal} label={`Plus d’actions pour ${e.nom}`} onClick={() => setChoisi(e)} />
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
          </div>
          </>
        )}
        <div className="flex items-center justify-between border-t border-papier-ligne/70 px-6 py-3.5 text-[13px] text-encre-doux">
          <span>{liste.length} élève{liste.length > 1 ? 's' : ''} affiché{liste.length > 1 ? 's' : ''} sur 842</span>
          <span className="flex gap-1">
            <Button size="sm" variant="ghost" disabled>Précédent</Button>
            <Button size="sm" variant="ghost">Suivant</Button>
          </span>
        </div>
      </Panel>

      {choisi && <Dossier eleve={choisi} onClose={() => setChoisi(null)} onPayer={() => setModal('paiement')} />}
      {modal === 'inscription' && <InscriptionModal onClose={() => setModal(null)} />}
      {modal === 'paiement' && <EncaissementModal eleveInitial={choisi ?? undefined} onClose={() => setModal(null)} />}
    </>
  );
}

type Onglet = 'dossier' | 'scolarite' | 'notes';

function Dossier({ eleve: e, onClose, onPayer }: { eleve: Eleve; onClose: () => void; onPayer: () => void }) {
  const [onglet, setOnglet] = useState<Onglet>('dossier');
  const reste = e.du - e.paye;
  return (
    <Drawer onClose={onClose} label={`Dossier de ${e.nom} ${e.prenom}`}>
      <div className="relative bg-brand-950 px-6 pb-6 pt-5 text-white seyes">
        <div className="flex justify-end">
          <button onClick={onClose} className="grid size-10 cursor-pointer place-items-center rounded-lg text-brand-200 hover:bg-white/10" aria-label="Fermer le dossier" autoFocus>
            <X className="size-5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Avatar name={`${e.nom} ${e.prenom}`} size="xl" className="ring-4 ring-white/10" />
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-bold tracking-[-0.02em]">{e.prenom} {e.nom}</h2>
            <p className="mt-0.5 text-sm text-brand-200">{e.classe}, matricule {e.matricule}</p>
            <div className="mt-2 flex gap-2"><Pill tone={statutTone[e.statut]}>{e.statut[0].toUpperCase() + e.statut.slice(1)}</Pill></div>
          </div>
        </div>
      </div>

      <div className="border-b border-papier-ligne/70 px-6 pt-4">
        <Segmented label="Sections du dossier" value={onglet} onChange={setOnglet} options={[{ value: 'dossier', label: 'Dossier' }, { value: 'scolarite', label: 'Scolarité' }, { value: 'notes', label: 'Notes' }]} />
        <div className="h-4" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 text-sm">
        {onglet === 'dossier' && (
          <div className="space-y-7">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                ['Sexe', e.sexe === 'F' ? 'Féminin' : 'Masculin'],
                ['Date de naissance', new Date(e.dateNaissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Lieu de naissance', e.lieuNaissance],
                ['Absences (heures)', String(e.absences)],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-encre-doux">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>
              ))}
            </dl>
            <div>
              <h3 className="text-[13px] font-semibold text-encre-doux">Tuteur principal</h3>
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-papier p-3.5">
                <Avatar name={e.tuteur} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{e.tuteur}</p>
                  <p className="text-encre-doux">{e.lien}, {e.telephone}</p>
                </div>
                <IconButton icon={Phone} label="Copier le numéro" tone="encre" onClick={() => navigator.clipboard?.writeText(e.telephone).catch(() => {})} />
              </div>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-encre-doux">Parcours</h3>
              <ol className="mt-2 space-y-0">
                {[['2026-2027', e.classe, 'En cours'], ['2025-2026', 'Classe précédente', 'Admis'], ['2024-2025', 'Inscription', 'Nouveau']].map(([a, c, d], i) => (
                  <li key={a} className="relative flex gap-4 pb-4 pl-5">
                    <span className={clsx('absolute left-0 top-1.5 size-2.5 rounded-full', i === 0 ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-papier-ligne')} aria-hidden />
                    {i < 2 && <span className="absolute left-[4.5px] top-5 h-full w-px bg-papier-ligne" aria-hidden />}
                    <span className="w-20 shrink-0 font-semibold chiffres">{a}</span>
                    <span className="flex-1 text-encre-doux">{c}</span>
                    <span className="text-xs font-semibold text-encre-doux">{d}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {onglet === 'scolarite' && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-papier p-5">
              <p className="text-encre-doux">Reste à payer</p>
              <p className={clsx('mt-1 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] chiffres', reste ? 'text-stylo' : 'text-valide')}>{fcfa(reste)}</p>
              <Gauge value={(e.paye / e.du) * 100} label="Scolarité payée" className="mt-4" />
              <p className="mt-2 text-xs text-encre-doux chiffres">{fcfa(e.paye)} payés sur {fcfa(e.du)}</p>
            </div>
            <ul className="divide-y divide-papier-ligne/70">
              {[['Inscription', 25000, 'Payée'], ['1re tranche', 50000, e.paye >= 75000 ? 'Payée' : 'Due'], ['2e tranche', 50000, e.paye >= 125000 ? 'Payée' : 'Due le 30/11'], ['3e tranche', e.du - 125000, e.paye >= e.du ? 'Payée' : 'Due le 15/01']].map(([l, m, s]) => (
                <li key={l as string} className="flex items-center justify-between py-3">
                  <span className="font-medium">{l}</span>
                  <span className="flex items-center gap-3">
                    <span className="chiffres">{fcfa(m as number)}</span>
                    <Pill tone={s === 'Payée' ? 'valide' : 'stylo'}>{s as string}</Pill>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {onglet === 'notes' && (
          <div>
            <div className="mb-4 flex items-end justify-between rounded-2xl bg-brand-50 p-5">
              <div>
                <p className="text-encre-doux">Moyenne de la séquence 1</p>
                <p className="mt-1 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-brand-800 chiffres">{e.moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</p>
              </div>
              <p className="text-right font-semibold">{appreciation(e.moyenne)}<br /><span className="text-sm font-medium text-encre-doux">Rang 12e/{44}</span></p>
            </div>
            <ul className="divide-y divide-papier-ligne/70">
              {matieresClasse.slice(0, 7).map((m, i) => {
                const n = Math.max(4, Math.min(19.5, e.moyenne + [1.5, -2, 2.25, -3, 0.5, 3, -1][i]));
                return (
                  <li key={m.code} className="flex items-center justify-between py-2.5">
                    <span>{m.nom} <span className="text-xs text-encre-pale">coef. {m.coef}</span></span>
                    <Grade value={n} size="sm" />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-papier-ligne/70 bg-papier/60 p-4">
        <Button variant="secondary" icon={FileBadge2}>Bulletin</Button>
        <Button icon={Banknote} onClick={onPayer} disabled={!reste}>Encaisser</Button>
      </div>
    </Drawer>
  );
}
