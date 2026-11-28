import { ArrowRightLeft, Banknote, EyeOff, FileText, FolderOpen, GraduationCap, LogOut as Sortie, Pencil, Phone, Printer, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Titre } from '@/components/espace';
import { Avatar, Button, Drawer, EmptyState, Gauge, Grade, IconButton, Modal, Pill, SearchInput, Segmented, Table, Td, useToast } from '@/components/kit';
import { appreciation } from '@/data/demo';
import { entete, html, imprimer } from '@/lib/imprimer';
import { BoutonsRetrait, Champ, dateFr, Grille, Liste, MenuActions, ModalMotif, montant, nomEleve, Pagination, Saisie, useDroit, Zone, type ActionMenu, espaceCourant, chemin } from './commun';
import type { EleveS, TypeDepart } from './donnees';
import { aujourdhui, useSecretariat, visibles } from './store';

const tonStatut = { nouveau: 'encre', ancien: 'neutre', redoublant: 'orange' } as const;
const PAR_PAGE = 12;

export default function Eleves() {
  const { etat } = useSecretariat();
  const peut = useDroit();
  const [onglet, setOnglet] = useState<'inscrits' | 'partis'>('inscrits');
  const [q, setQ] = useState('');
  const [classe, setClasse] = useState('Toutes');
  const [statut, setStatut] = useState('Tous');
  const [paiement, setPaiement] = useState('Tous');
  const [page, setPage] = useState(1);
  const [ouvert, setOuvert] = useState<number | null>(null);
  const [action, setAction] = useState<{ type: 'modifier' | 'classe' | 'depart' | 'masque' | 'supprime'; id: number } | null>(null);
  const { retirer } = useSecretariat();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  // Ouverture directe d'un dossier depuis la recherche de l'en-tête
  useEffect(() => {
    const id = Number(params.get('eleve'));
    if (!id) return;
    const e = etat.eleves.find((x) => x.id === id);
    if (e) {
      setOnglet(e.situation === 'parti' ? 'partis' : 'inscrits');
      setOuvert(id);
    }
    setParams({}, { replace: true });
  }, [params, setParams, etat.eleves]);

  const tous = visibles(etat.eleves);
  const liste = useMemo(() => {
    const t = q.trim().toLowerCase();
    return tous
      .filter((e) => (onglet === 'inscrits' ? e.situation === 'inscrit' : e.situation === 'parti'))
      .filter((e) => !t || `${e.nom} ${e.prenom} ${e.matricule} ${e.tuteur}`.toLowerCase().includes(t))
      .filter((e) => classe === 'Toutes' || e.classe === classe)
      .filter((e) => statut === 'Tous' || e.statut === statut.toLowerCase())
      .filter((e) => paiement === 'Tous' || (paiement === 'À jour' ? e.paye >= e.du : e.paye < e.du))
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [tous, onglet, q, classe, statut, paiement]);
  const pageListe = liste.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  const filtre = (f: (v: string) => void) => (v: string) => (f(v), setPage(1));
  const choisi = etat.eleves.find((e) => e.id === ouvert);
  const cible = etat.eleves.find((e) => e.id === action?.id);

  return (
    <>
      <Titre
        titre="Élèves"
        texte="Recherchez un élève, ouvrez son dossier, modifiez-le, changez-le de classe ou enregistrez son départ."
        action={peut('inscriptions') && <Link to={chemin('/inscriptions')}><Button icon={UserPlus}>Inscrire un élève</Button></Link>}
      />

      <section className="rounded-[22px] bg-white shadow-feuille">
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <Segmented
            label="Situation"
            value={onglet}
            onChange={(v) => (setOnglet(v), setPage(1))}
            options={[
              { value: 'inscrits', label: 'Inscrits', count: tous.filter((e) => e.situation === 'inscrit').length },
              { value: 'partis', label: 'Partis (transferts, abandons)', count: tous.filter((e) => e.situation === 'parti').length },
            ]}
          />
          <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <SearchInput value={q} onChange={filtre(setQ)} label="Rechercher" placeholder="Nom, prénom, matricule ou tuteur" />
            <Liste aria-label="Classe" value={classe} onChange={(e) => filtre(setClasse)(e.target.value)} options={['Toutes', ...visibles(etat.classes).map((c) => c.nom)]} />
            <Liste aria-label="Statut" value={statut} onChange={(e) => filtre(setStatut)(e.target.value)} options={['Tous', 'Nouveau', 'Ancien', 'Redoublant']} />
            <Liste aria-label="Paiement" value={paiement} onChange={(e) => filtre(setPaiement)(e.target.value)} options={['Tous', 'À jour', 'Reste à payer']} />
          </div>
        </div>

        {liste.length === 0 ? (
          <EmptyState icon={GraduationCap} title="Aucun élève" text={onglet === 'partis' ? 'Aucun départ enregistré pour cette année.' : 'Aucun élève ne correspond à ces critères.'} />
        ) : (
          <>
            <Table caption="Liste des élèves" head={['Élève', 'Classe', 'Statut', 'Tuteur', 'Scolarité', { label: 'Moyenne', align: 'right' }, { label: 'Actions', align: 'right' }]} minWidth={960}>
              {pageListe.map((e) => (
                <tr key={e.id} onClick={() => setOuvert(e.id)} className="cursor-pointer transition-colors hover:bg-papier/70">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={`${e.prenom} ${e.nom}`} />
                      <div className="min-w-0">
                        <button className="block cursor-pointer truncate text-left font-semibold text-encre hover:text-brand-700">{nomEleve(e)}</button>
                        <p className="text-xs text-encre-doux chiffres">{e.matricule}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap font-medium">{e.classe}</Td>
                  <Td>{onglet === 'partis' ? <Pill tone="neutre">{e.depart?.type}</Pill> : <Pill tone={tonStatut[e.statut]}>{e.statut[0].toUpperCase() + e.statut.slice(1)}</Pill>}</Td>
                  <Td><p className="truncate">{e.tuteur}</p><p className="text-xs text-encre-doux">{e.telephone}</p></Td>
                  <Td className="w-48"><Gauge value={(e.paye / e.du) * 100} label={`Scolarité payée de ${nomEleve(e)}`} /></Td>
                  <Td className="text-right"><Grade value={e.moyenne} size="sm" /></Td>
                  <Td className="text-right">
                    <div className="flex justify-end" onClick={(x) => x.stopPropagation()}>
                      {peut('eleves') && e.situation === 'inscrit' && <IconButton icon={Pencil} label={`Modifier ${nomEleve(e)}`} onClick={() => setAction({ type: 'modifier', id: e.id })} />}
                      <MenuActions
                        label={`Plus d’actions pour ${nomEleve(e)}`}
                        actions={[
                          { label: 'Voir le dossier', icone: FolderOpen, onClick: () => setOuvert(e.id) },
                          ...(peut('eleves') && e.situation === 'inscrit'
                            ? [
                                { label: 'Changer de classe', icone: ArrowRightLeft, onClick: () => setAction({ type: 'classe', id: e.id }) },
                                { label: 'Enregistrer un départ', icone: Sortie, onClick: () => setAction({ type: 'depart', id: e.id }) },
                              ]
                            : []),
                          ...(peut('masquer') ? [{ label: 'Masquer', icone: EyeOff, onClick: () => setAction({ type: 'masque', id: e.id }) }] : []),
                          ...(peut('supprimer') ? [{ label: 'Supprimer', icone: Trash2, danger: true, onClick: () => setAction({ type: 'supprime', id: e.id }) }] : []),
                        ] as ActionMenu[]}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} total={liste.length} parPage={PAR_PAGE} onPage={setPage} quoi="élèves" />
          </>
        )}
      </section>

      {choisi && <FicheEleve e={choisi} onClose={() => setOuvert(null)} />}
      {cible && action?.type === 'modifier' && <ModifierEleve e={cible} onClose={() => setAction(null)} />}
      {cible && action?.type === 'classe' && <ChangerClasse e={cible} onClose={() => setAction(null)} />}
      {cible && action?.type === 'depart' && <Depart e={cible} onClose={() => setAction(null)} />}
      {cible && (action?.type === 'masque' || action?.type === 'supprime') && (
        <ModalMotif
          titre={`${action.type === 'masque' ? 'Masquer' : 'Supprimer'} ${nomEleve(cible)}`}
          texte={action.type === 'masque' ? 'L’élève disparaît de vos listes, mais reste visible pour l’administrateur.' : 'Suppression logique : l’élève est placé dans la corbeille de l’administrateur.'}
          bouton={action.type === 'masque' ? 'Masquer' : 'Supprimer'}
          danger={action.type === 'supprime'}
          onValider={(motif) => {
            retirer('eleves', cible.id, action.type as 'masque' | 'supprime', motif, { module: 'Élèves', element: `${nomEleve(cible)} (${cible.matricule})` });
            toast(action.type === 'masque' ? 'Élève masqué. L’administrateur le voit toujours.' : 'Élève placé dans la corbeille de l’administrateur.');
          }}
          onClose={() => setAction(null)}
        />
      )}
    </>
  );
}

/* =========================================================
 * Dossier de l'élève
 * ======================================================= */
function FicheEleve({ e, onClose }: { e: EleveS; onClose: () => void }) {
  const { etat, retirer } = useSecretariat();
  const peut = useDroit();
  const toast = useToast();
  const [fenetre, setFenetre] = useState<'modifier' | 'classe' | 'depart' | null>(null);
  const parents = etat.parents.filter((p) => e.parentIds.includes(p.id) && p.etat === 'actif');
  const paiements = etat.operations.filter((o) => o.eleveId === e.id && (o.type === 'recette' || o.type === 'remboursement'));
  const absences = visibles(etat.absences).filter((a) => a.eleveId === e.id);
  const reste = Math.max(0, e.du - e.paye);
  const parti = e.situation === 'parti';

  return (
    <Drawer onClose={onClose} label={`Dossier de ${nomEleve(e)}`}>
      <div className="seyes relative bg-brand-950 px-6 pb-6 pt-5 text-white">
        <div className="flex justify-end">
          <button onClick={onClose} className="grid size-10 cursor-pointer place-items-center rounded-lg text-brand-200 hover:bg-white/10" aria-label="Fermer le dossier">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Avatar name={`${e.prenom} ${e.nom}`} size="xl" />
          <div className="min-w-0">
            <p className="font-display text-[22px] font-bold leading-tight">{nomEleve(e)}</p>
            <p className="mt-1 text-sm text-brand-200 chiffres">{e.matricule} · {e.classe}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {parti ? <Pill tone="feutre">Parti : {e.depart?.type}</Pill> : <Pill tone={tonStatut[e.statut]}>{e.statut[0].toUpperCase() + e.statut.slice(1)}</Pill>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <div className="flex flex-wrap gap-2">
          {!parti && peut('eleves') && <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setFenetre('modifier')}>Modifier</Button>}
          {!parti && peut('eleves') && <Button size="sm" variant="secondary" icon={ArrowRightLeft} onClick={() => setFenetre('classe')}>Changer de classe</Button>}
          {!parti && peut('eleves') && <Button size="sm" variant="secondary" icon={Sortie} onClick={() => setFenetre('depart')}>Enregistrer un départ</Button>}
          {!parti && peut('caisse') && reste > 0 && <Link to={`${espaceCourant()}/caisse?encaisser=1&eleve=${e.id}`}><Button size="sm" icon={Banknote}>Encaisser</Button></Link>}
          {peut('documents') && <Link to={`${espaceCourant()}/documents?eleve=${e.id}`}><Button size="sm" variant="secondary" icon={FileText}>Documents</Button></Link>}
          <div className="ml-auto flex">
            <BoutonsRetrait
              quoi="cet élève"
              onRetirer={(mode, motif) => {
                retirer('eleves', e.id, mode, motif, { module: 'Élèves', element: `${nomEleve(e)} (${e.matricule})` });
                toast(mode === 'masque' ? 'Élève masqué. L’administrateur le voit toujours.' : 'Élève placé dans la corbeille de l’administrateur.');
                onClose();
              }}
            />
          </div>
        </div>

        {parti && e.depart && (
          <div className="rounded-xl bg-feutre-50 px-4 py-3 text-sm text-feutre-700">
            <b>{e.depart.type}</b> le {dateFr(e.depart.date)}{e.depart.destination ? ` vers ${e.depart.destination}` : ''}. Motif : {e.depart.motif}
          </div>
        )}

        <Section titre="Identité">
          <Ligne k="Né(e) le" v={`${dateFr(e.dateNaissance)} à ${e.lieuNaissance}`} />
          <Ligne k="Sexe" v={e.sexe === 'F' ? 'Féminin' : 'Masculin'} />
          <Ligne k="Adresse" v={e.adresse} />
          <Ligne k="Inscrit le" v={`${dateFr(e.inscritLe)} par ${e.inscritPar}`} />
        </Section>

        <Section titre="Parents et tuteurs">
          {parents.length === 0 ? <p className="text-sm text-encre-doux">Aucun tuteur enregistré.</p> : parents.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl bg-papier px-3.5 py-3">
              <Avatar name={p.nom} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.nom} <span className="font-normal text-encre-doux">· {p.lien}</span></p>
                <p className="text-[13px] text-encre-doux">{p.telephone}{p.profession ? ` · ${p.profession}` : ''}</p>
              </div>
              <a href={`tel:${p.telephone.replace(/\s/g, '')}`} className="grid size-9 place-items-center rounded-lg text-brand-700 hover:bg-brand-50" aria-label={`Appeler ${p.nom}`}><Phone className="size-4" /></a>
            </div>
          ))}
        </Section>

        <Section titre="Scolarité">
          <Gauge value={(e.paye / e.du) * 100} label="Part payée" />
          <Ligne k="Total dû" v={montant(e.du)} />
          <Ligne k="Déjà payé" v={montant(e.paye)} />
          <Ligne k="Reste à payer" v={<span className={reste ? 'font-semibold text-stylo' : 'font-semibold text-valide'}>{reste ? montant(reste) : 'À jour'}</span>} />
          {paiements.length > 0 && (
            <ul className="mt-2 divide-y divide-papier-ligne/70 rounded-xl ring-1 ring-inset ring-papier-ligne">
              {paiements.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[13px]">
                  <span className="min-w-0"><span className="block truncate font-medium">{o.libelle}</span><span className="text-encre-doux">{o.numero} · {dateFr(o.date)} · {o.mode}</span></span>
                  <span className={o.annulee ? 'text-encre-pale line-through' : o.type === 'remboursement' ? 'font-semibold text-stylo' : 'font-semibold'}>{o.type === 'remboursement' ? '−' : ''}{montant(o.montant)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section titre="Résultats et vie scolaire">
          <Ligne k="Moyenne de la séquence 2" v={<span><Grade value={e.moyenne} size="sm" /> · {appreciation(e.moyenne)}</span>} />
          <Ligne k="Absences et retards" v={String(absences.length)} />
        </Section>
      </div>

      {fenetre === 'modifier' && <ModifierEleve e={e} onClose={() => setFenetre(null)} />}
      {fenetre === 'classe' && <ChangerClasse e={e} onClose={() => setFenetre(null)} />}
      {fenetre === 'depart' && <Depart e={e} onClose={() => setFenetre(null)} />}
    </Drawer>
  );
}

const Section = ({ titre, children }: { titre: string; children: ReactNode }) => (
  <section>
    <h3 className="mb-2.5 font-display text-[16px] font-bold">{titre}</h3>
    <div className="space-y-2">{children}</div>
  </section>
);
const Ligne = ({ k, v }: { k: string; v: ReactNode }) => (
  <p className="flex justify-between gap-4 text-sm"><span className="text-encre-doux">{k}</span><span className="text-right font-medium">{v}</span></p>
);

/* ---------- Modifier ---------- */
function ModifierEleve({ e, onClose }: { e: EleveS; onClose: () => void }) {
  const { modifier } = useSecretariat();
  const toast = useToast();
  const [f, setF] = useState({ nom: e.nom, prenom: e.prenom, sexe: e.sexe, dateNaissance: e.dateNaissance, lieuNaissance: e.lieuNaissance, adresse: e.adresse, statut: e.statut });
  const ok = f.nom.trim() && f.prenom.trim() && f.dateNaissance;
  const enregistrer = () => {
    const champs = (Object.keys(f) as (keyof typeof f)[]).filter((k) => f[k] !== e[k]);
    if (!champs.length) return onClose();
    modifier('eleves', e.id, { ...f, nom: f.nom.trim().toUpperCase(), prenom: f.prenom.trim() }, {
      operation: 'Modification',
      module: 'Élèves',
      element: `${nomEleve(e)} (${e.matricule})`,
      avant: champs.map((k) => `${k} : ${e[k]}`).join(' ; '),
      apres: champs.map((k) => `${k} : ${f[k]}`).join(' ; '),
    });
    toast('Dossier de l’élève mis à jour.');
    onClose();
  };
  return (
    <Modal title="Modifier l’élève" lead={`${nomEleve(e)} · ${e.matricule}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button disabled={!ok} onClick={enregistrer}>Enregistrer</Button></>}>
      <Grille>
        <Champ label="Nom"><Saisie value={f.nom} onChange={(x) => setF({ ...f, nom: x.target.value })} /></Champ>
        <Champ label="Prénom"><Saisie value={f.prenom} onChange={(x) => setF({ ...f, prenom: x.target.value })} /></Champ>
        <Champ label="Sexe"><Liste value={f.sexe} onChange={(x) => setF({ ...f, sexe: x.target.value as 'M' | 'F' })} options={[{ value: 'F', label: 'Féminin' }, { value: 'M', label: 'Masculin' }]} /></Champ>
        <Champ label="Statut"><Liste value={f.statut} onChange={(x) => setF({ ...f, statut: x.target.value as EleveS['statut'] })} options={[{ value: 'nouveau', label: 'Nouveau' }, { value: 'ancien', label: 'Ancien' }, { value: 'redoublant', label: 'Redoublant' }]} /></Champ>
        <Champ label="Date de naissance"><Saisie type="date" value={f.dateNaissance} onChange={(x) => setF({ ...f, dateNaissance: x.target.value })} /></Champ>
        <Champ label="Lieu de naissance"><Saisie value={f.lieuNaissance} onChange={(x) => setF({ ...f, lieuNaissance: x.target.value })} /></Champ>
        <Champ label="Adresse" className="sm:col-span-2"><Saisie value={f.adresse} onChange={(x) => setF({ ...f, adresse: x.target.value })} /></Champ>
      </Grille>
      <p className="mt-4 text-[13px] text-encre-doux">Les anciennes valeurs sont conservées dans le journal.</p>
    </Modal>
  );
}

/* ---------- Changer de classe ---------- */
function ChangerClasse({ e, onClose }: { e: EleveS; onClose: () => void }) {
  const { etat, modifier } = useSecretariat();
  const toast = useToast();
  const autres = visibles(etat.classes).filter((c) => c.nom !== e.classe);
  const [classe, setClasse] = useState(autres[0]?.nom ?? '');
  const [motif, setMotif] = useState('');
  const c = autres.find((x) => x.nom === classe);
  const effectif = visibles(etat.eleves).filter((x) => x.classe === classe && x.situation === 'inscrit').length;
  const pleine = !!c && effectif >= c.capacite;
  const ok = classe && motif.trim().length >= 5 && !pleine;
  return (
    <Modal
      title="Changer de classe"
      lead={`${nomEleve(e)} est actuellement en ${e.classe}.`}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button disabled={!ok} onClick={() => {
        modifier('eleves', e.id, { classe }, { operation: 'Changement de classe', module: 'Élèves', element: `${nomEleve(e)} (${e.matricule})`, avant: e.classe, apres: classe, motif: motif.trim() });
        toast(`${nomEleve(e)} est maintenant en ${classe}.`);
        onClose();
      }}>Confirmer</Button></>}
    >
      <div className="space-y-4">
        <Champ label="Nouvelle classe" erreur={pleine && `La ${classe} est pleine (${effectif}/${c?.capacite}).`} aide={c ? `${effectif} élèves sur ${c.capacite} places` : undefined}>
          <Liste value={classe} onChange={(x) => setClasse(x.target.value)} options={autres.map((x) => x.nom)} />
        </Champ>
        <Champ label="Motif (obligatoire)"><Zone value={motif} onChange={(x) => setMotif(x.target.value)} placeholder="Exemple : demande des parents, erreur d’affectation" /></Champ>
      </div>
    </Modal>
  );
}

/* ---------- Départ : transfert, abandon… ---------- */
function Depart({ e, onClose }: { e: EleveS; onClose: () => void }) {
  const { modifier } = useSecretariat();
  const toast = useToast();
  const [type, setType] = useState<TypeDepart>('Transfert');
  const [date, setDate] = useState(aujourdhui());
  const [destination, setDestination] = useState('');
  const [motif, setMotif] = useState('');
  const ok = motif.trim().length >= 5 && (type !== 'Transfert' || destination.trim());
  const certificat = () =>
    imprimer('Certificat de départ', `${entete('Certificat de départ')}
      <p>Je soussigné, Principal du ${html('Collège Bilingue Les Étoiles')}, certifie que l’élève <b>${html(nomEleve(e))}</b>, matricule <b>${html(e.matricule)}</b>, né(e) le ${html(dateFr(e.dateNaissance))} à ${html(e.lieuNaissance)}, inscrit(e) en classe de <b>${html(e.classe)}</b>, a quitté l’établissement le ${html(dateFr(date))}${destination ? ` pour ${html(destination)}` : ''}.</p>
      <p>Situation financière : ${e.paye >= e.du ? 'à jour' : `reste ${html(montant(e.du - e.paye))}`}.</p>
      <div class="signature"><div>Le parent ou tuteur<div class="ligne"></div></div><div>Le Principal<div class="ligne"></div></div></div>`);
  return (
    <Modal
      title="Enregistrer un départ"
      lead={`${nomEleve(e)} · ${e.classe}. L’élève passera dans la liste « Partis » ; son dossier est conservé.`}
      onClose={onClose}
      footer={<>
        <Button variant="ghost" icon={Printer} onClick={certificat}>Certificat de départ</Button>
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button disabled={!ok} onClick={() => {
          modifier('eleves', e.id, { situation: 'parti', depart: { type, date, motif: motif.trim(), destination: destination.trim() || undefined } }, { operation: 'Départ', module: 'Élèves', element: `${nomEleve(e)} (${e.matricule})`, avant: `Inscrit en ${e.classe}`, apres: `${type}${destination ? ` vers ${destination}` : ''}`, motif: motif.trim() });
          toast('Départ enregistré.');
          onClose();
        }}>Enregistrer</Button>
      </>}
    >
      <Grille>
        <Champ label="Type de départ"><Liste value={type} onChange={(x) => setType(x.target.value as TypeDepart)} options={['Transfert', 'Abandon', 'Exclusion', 'Autre']} /></Champ>
        <Champ label="Date"><Saisie type="date" value={date} onChange={(x) => setDate(x.target.value)} /></Champ>
        {type === 'Transfert' && <Champ label="Établissement d’accueil" className="sm:col-span-2"><Saisie value={destination} onChange={(x) => setDestination(x.target.value)} placeholder="Exemple : Lycée de Garoua" /></Champ>}
        <Champ label="Motif (obligatoire)" className="sm:col-span-2"><Zone value={motif} onChange={(x) => setMotif(x.target.value)} placeholder="Exemple : mutation des parents" /></Champ>
      </Grille>
    </Modal>
  );
}

