import { Copy, KeyRound, Link2, Pencil, Power, UserPlus, Users, Users2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Titre } from '@/components/espace';
import { Avatar, Button, EmptyState, IconButton, Modal, Pill, SearchInput, Segmented, Table, Td, useToast } from '@/components/kit';
import { BoutonsRetrait, Champ, ChoisirEleve, Grille, Liste, ModalMotif, nomEleve, Note, Pagination, Saisie } from './commun';
import type { Enseignant, Parent } from './donnees';
import { useSecretariat, visibles } from './store';

const telOk = (t: string) => /^(\+237)?6\d{8}$/.test(t.replace(/\s/g, ''));

/* =========================================================
 * Parents et tuteurs
 * ======================================================= */
export function Parents() {
  const { etat, modifier, retirer } = useSecretariat();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    const v = params.get('q');
    if (v === null) return;
    setQ(v);
    setPage(1);
    setParams({}, { replace: true });
  }, [params, setParams]);
  const [edition, setEdition] = useState<Parent | 'nouveau' | null>(null);
  const [lier, setLier] = useState<Parent | null>(null);
  const t = q.trim().toLowerCase();
  const liste = visibles(etat.parents).filter((p) => !t || `${p.nom} ${p.telephone} ${p.email ?? ''}`.toLowerCase().includes(t)).sort((a, b) => a.nom.localeCompare(b.nom));
  const enfants = (p: Parent) => visibles(etat.eleves).filter((e) => e.parentIds.includes(p.id));

  return (
    <>
      <Titre titre="Parents et tuteurs" texte="Un parent peut suivre plusieurs enfants. Liez-le à chaque enfant pour qu’il les voie tous dans son espace." action={<Button icon={UserPlus} onClick={() => setEdition('nouveau')}>Ajouter un parent</Button>} />
      <section className="rounded-[22px] bg-white shadow-feuille">
        <div className="p-5 sm:p-6"><SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} label="Rechercher" placeholder="Nom, téléphone ou e-mail" className="max-w-md" /></div>
        {liste.length === 0 ? <EmptyState icon={Users} title="Aucun parent" text="Aucun parent ne correspond à votre recherche." /> : (
          <>
            <Table caption="Parents et tuteurs" head={['Parent ou tuteur', 'Contact', 'Enfants', { label: 'Actions', sr: true }]} minWidth={760}>
              {liste.slice((page - 1) * 12, page * 12).map((p) => (
                <tr key={p.id}>
                  <Td><div className="flex items-center gap-3"><Avatar name={p.nom} /><div><p className="font-semibold">{p.nom}</p><p className="text-xs text-encre-doux">{p.lien}{p.profession ? ` · ${p.profession}` : ''}</p></div></div></Td>
                  <Td><p className="chiffres">{p.telephone}</p><p className="text-xs text-encre-doux">{p.email ?? 'Pas d’e-mail'}</p></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      {enfants(p).map((e) => (
                        <span key={e.id} className="inline-flex items-center gap-1 rounded-full bg-papier-2 py-1 pl-2.5 pr-1 text-xs font-semibold">
                          {nomEleve(e)} · {e.classe}
                          <button
                            onClick={() => {
                              if (e.parentIds.length <= 1) return toast('Impossible : cet élève doit garder au moins un tuteur.');
                              modifier('eleves', e.id, { parentIds: e.parentIds.filter((x) => x !== p.id) }, { operation: 'Retrait du lien', module: 'Parents et tuteurs', element: `${p.nom} ↔ ${nomEleve(e)}` });
                              toast('Lien retiré.');
                            }}
                            className="grid size-5 cursor-pointer place-items-center rounded-full text-encre-pale hover:bg-white hover:text-stylo"
                            aria-label={`Retirer le lien avec ${nomEleve(e)}`}
                          ><X className="size-3" /></button>
                        </span>
                      ))}
                      {enfants(p).length === 0 && <span className="text-xs text-encre-pale">Aucun</span>}
                    </div>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end">
                      <IconButton icon={Link2} label={`Lier un enfant à ${p.nom}`} onClick={() => setLier(p)} />
                      <IconButton icon={Pencil} label={`Modifier ${p.nom}`} onClick={() => setEdition(p)} />
                      <BoutonsRetrait quoi="ce parent" onRetirer={(mode, motif) => (retirer('parents', p.id, mode, motif, { module: 'Parents et tuteurs', element: p.nom }), toast('Fait. L’administrateur peut restaurer ce parent.'))} />
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} total={liste.length} parPage={12} onPage={setPage} quoi="parents" />
          </>
        )}
      </section>
      {edition && <EditionParent p={edition === 'nouveau' ? null : edition} onClose={() => setEdition(null)} />}
      {lier && <LierEnfant p={lier} onClose={() => setLier(null)} />}
    </>
  );
}

function EditionParent({ p, onClose }: { p: Parent | null; onClose: () => void }) {
  const { ajouter, modifier, etat } = useSecretariat();
  const toast = useToast();
  const [f, setF] = useState({ nom: p?.nom ?? '', lien: p?.lien ?? 'Mère', telephone: p?.telephone ?? '', telephone2: p?.telephone2 ?? '', email: p?.email ?? '', profession: p?.profession ?? '', adresse: p?.adresse ?? '' });
  const [essai, setEssai] = useState(false);
  const doublon = visibles(etat.parents).find((x) => x.id !== p?.id && x.telephone.replace(/\s/g, '') === f.telephone.replace(/\s/g, ''));
  const erreurs = { nom: !f.nom.trim() && 'Le nom est obligatoire.', telephone: !telOk(f.telephone) ? 'Numéro camerounais attendu : 6XX XX XX XX.' : doublon && `Ce numéro appartient déjà à ${doublon.nom}.`, email: f.email && !/^\S+@\S+\.\S+$/.test(f.email) && 'Adresse e-mail invalide.' };
  const enregistrer = () => {
    setEssai(true);
    if (Object.values(erreurs).some(Boolean)) return;
    const d = { ...f, nom: f.nom.trim(), email: f.email.trim() || undefined, telephone2: f.telephone2.trim() || undefined, profession: f.profession.trim() || undefined, adresse: f.adresse.trim() || undefined };
    if (p) {
      modifier('parents', p.id, d, { operation: 'Modification', module: 'Parents et tuteurs', element: p.nom, avant: `${p.nom}, ${p.telephone}, ${p.email ?? '—'}`, apres: `${d.nom}, ${d.telephone}, ${d.email ?? '—'}` });
      toast('Parent mis à jour.');
    } else {
      ajouter('parents', { ...d, etat: 'actif' }, { operation: 'Création', module: 'Parents et tuteurs', element: d.nom });
      toast('Parent ajouté. Liez-le maintenant à son ou ses enfants.');
    }
    onClose();
  };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];
  return (
    <Modal title={p ? 'Modifier le parent' : 'Ajouter un parent'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={enregistrer}>Enregistrer</Button></>}>
      <Grille>
        <Champ label="Nom complet" erreur={err('nom')}><Saisie value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder="Exemple : M. FOTSO Martin" /></Champ>
        <Champ label="Lien avec l’élève"><Liste value={f.lien} onChange={(e) => setF({ ...f, lien: e.target.value })} options={['Mère', 'Père', 'Tuteur', 'Tutrice', 'Oncle', 'Tante', 'Grand-parent']} /></Champ>
        <Champ label="Téléphone principal" erreur={err('telephone')} aide="Sert à la connexion de l’espace parent."><Saisie inputMode="tel" value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} /></Champ>
        <Champ label="Second téléphone"><Saisie inputMode="tel" value={f.telephone2} onChange={(e) => setF({ ...f, telephone2: e.target.value })} /></Champ>
        <Champ label="E-mail" erreur={err('email')}><Saisie type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Champ>
        <Champ label="Profession"><Saisie value={f.profession} onChange={(e) => setF({ ...f, profession: e.target.value })} /></Champ>
        <Champ label="Adresse" className="sm:col-span-2"><Saisie value={f.adresse} onChange={(e) => setF({ ...f, adresse: e.target.value })} /></Champ>
      </Grille>
    </Modal>
  );
}

function LierEnfant({ p, onClose }: { p: Parent; onClose: () => void }) {
  const { etat, modifier } = useSecretariat();
  const toast = useToast();
  const [id, setId] = useState<number | null>(null);
  const e = etat.eleves.find((x) => x.id === id);
  const deja = e?.parentIds.includes(p.id);
  return (
    <Modal title="Lier un enfant" lead={`${p.nom} pourra suivre cet enfant dans son espace parent.`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button disabled={!e || deja} onClick={() => {
      modifier('eleves', e!.id, { parentIds: [...e!.parentIds, p.id] }, { operation: 'Lien', module: 'Parents et tuteurs', element: `${p.nom} ↔ ${nomEleve(e!)}` });
      toast(`${nomEleve(e!)} est lié(e) à ${p.nom}.`);
      onClose();
    }}>Lier</Button></>}>
      <ChoisirEleve valeur={id} onChange={setId} />
      {deja && <p className="mt-3 text-sm font-medium text-stylo">Cet enfant est déjà lié à ce parent.</p>}
    </Modal>
  );
}

/* =========================================================
 * Enseignants
 * ======================================================= */
export function Enseignants() {
  const { etat, retirer } = useSecretariat();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [filtre, setFiltre] = useState<'tous' | 'Permanent' | 'Vacataire' | 'inactifs'>('tous');
  const [edition, setEdition] = useState<Enseignant | 'nouveau' | null>(null);
  const [affecter, setAffecter] = useState<Enseignant | null>(null);
  const [etatCompte, setEtatCompte] = useState<Enseignant | null>(null);
  const [identifiants, setIdentifiants] = useState<{ nom: string; email: string; mdp: string } | null>(null);
  const tous = visibles(etat.enseignants);
  const t = q.trim().toLowerCase();
  const liste = tous
    .filter((e) => (filtre === 'tous' ? true : filtre === 'inactifs' ? !e.actif : e.contrat === filtre && e.actif))
    .filter((e) => !t || `${e.nom} ${e.prenom} ${e.specialite}`.toLowerCase().includes(t));
  const pp = (e: Enseignant) => visibles(etat.classes).find((c) => c.pp === `${e.civilite} ${e.nom} ${e.prenom}`)?.nom;

  return (
    <>
      <Titre titre="Enseignants" texte="Ajoutez un enseignant, créez ses identifiants de connexion et attribuez-lui ses classes et matières." action={<Button icon={UserPlus} onClick={() => setEdition('nouveau')}>Ajouter un enseignant</Button>} />
      <section className="rounded-[22px] bg-white shadow-feuille">
        <div className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
          <Segmented label="Filtre" value={filtre} onChange={setFiltre} options={[{ value: 'tous', label: 'Tous', count: tous.length }, { value: 'Permanent', label: 'Permanents' }, { value: 'Vacataire', label: 'Vacataires' }, { value: 'inactifs', label: 'Désactivés', count: tous.filter((e) => !e.actif).length }]} />
          <SearchInput value={q} onChange={setQ} label="Rechercher" placeholder="Nom ou matière" className="md:max-w-xs" />
        </div>
        {liste.length === 0 ? <EmptyState icon={Users2} title="Aucun enseignant" text="Aucun enseignant ne correspond à ces critères." /> : (
          <Table caption="Enseignants" head={['Enseignant', 'Matières', 'Classes', 'Contrat', 'État', { label: 'Actions', sr: true }]} minWidth={900}>
            {liste.map((e) => (
              <tr key={e.id} className={e.actif ? '' : 'opacity-60'}>
                <Td><div className="flex items-center gap-3"><Avatar name={`${e.prenom} ${e.nom}`} /><div><p className="font-semibold">{e.civilite} {e.nom} {e.prenom}</p><p className="text-xs text-encre-doux">{e.telephone} · {e.email}</p></div></div></Td>
                <Td>{e.matieres.join(', ')}</Td>
                <Td><p>{e.classes.join(', ') || '—'}</p>{pp(e) && <p className="text-xs font-semibold text-feutre-700">Prof. principal de la {pp(e)}</p>}</Td>
                <Td>{e.contrat}<p className="text-xs text-encre-doux">{e.heures} h / semaine</p></Td>
                <Td>{e.actif ? <Pill tone="valide">Actif</Pill> : <Pill tone="neutre">Désactivé</Pill>}</Td>
                <Td className="text-right">
                  <div className="flex justify-end">
                    <IconButton icon={Link2} label="Classes et matières" onClick={() => setAffecter(e)} />
                    <IconButton icon={Pencil} label="Modifier" onClick={() => setEdition(e)} />
                    <IconButton icon={Power} label={e.actif ? 'Désactiver le compte' : 'Réactiver le compte'} tone={e.actif ? 'stylo' : 'encre'} onClick={() => setEtatCompte(e)} />
                    <BoutonsRetrait quoi="cet enseignant" onRetirer={(mode, motif) => (retirer('enseignants', e.id, mode, motif, { module: 'Enseignants', element: `${e.civilite} ${e.nom} ${e.prenom}` }), toast('Fait. L’administrateur peut restaurer cet enseignant.'))} />
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </section>
      {edition && <EditionEnseignant e={edition === 'nouveau' ? null : edition} onClose={() => setEdition(null)} onCree={setIdentifiants} />}
      {affecter && <Affectations e={affecter} onClose={() => setAffecter(null)} />}
      {etatCompte && <CompteEnseignant e={etatCompte} onClose={() => setEtatCompte(null)} />}
      {identifiants && (
        <Modal title="Identifiants de connexion" lead={`À remettre à ${identifiants.nom}. Ce mot de passe provisoire ne sera plus affiché.`} onClose={() => setIdentifiants(null)} footer={<Button onClick={() => setIdentifiants(null)}>J’ai noté les identifiants</Button>}>
          <div className="space-y-3">
            {[['Identifiant', identifiants.email], ['Mot de passe provisoire', identifiants.mdp]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 rounded-xl bg-papier px-4 py-3">
                <span><span className="block text-[13px] text-encre-doux">{k}</span><span className="font-mono text-[15px] font-semibold">{v}</span></span>
                <IconButton icon={Copy} label={`Copier ${k}`} onClick={() => navigator.clipboard?.writeText(v).then(() => toast('Copié.'), () => undefined)} />
              </div>
            ))}
            <Note>L’enseignant devra changer ce mot de passe à sa première connexion. L’envoi par SMS sera fait par le serveur.</Note>
          </div>
        </Modal>
      )}
    </>
  );
}

function motDePasse() {
  const c = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

function EditionEnseignant({ e, onClose, onCree }: { e: Enseignant | null; onClose: () => void; onCree: (x: { nom: string; email: string; mdp: string }) => void }) {
  const { ajouter, modifier, etat } = useSecretariat();
  const toast = useToast();
  const [f, setF] = useState({ civilite: e?.civilite ?? 'M.', nom: e?.nom ?? '', prenom: e?.prenom ?? '', specialite: e?.specialite ?? '', telephone: e?.telephone ?? '', email: e?.email ?? '', contrat: e?.contrat ?? 'Permanent', heures: String(e?.heures ?? 18) });
  const [essai, setEssai] = useState(false);
  const doublon = etat.enseignants.find((x) => x.id !== e?.id && x.email.toLowerCase() === f.email.trim().toLowerCase());
  const erreurs = {
    nom: !f.nom.trim() && 'Le nom est obligatoire.',
    prenom: !f.prenom.trim() && 'Le prénom est obligatoire.',
    specialite: !f.specialite.trim() && 'La spécialité est obligatoire.',
    telephone: !telOk(f.telephone) && 'Numéro camerounais attendu.',
    email: !/^\S+@\S+\.\S+$/.test(f.email) ? 'Adresse e-mail invalide.' : doublon && 'Cette adresse est déjà utilisée.',
  };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];
  const enregistrer = () => {
    setEssai(true);
    if (Object.values(erreurs).some(Boolean)) return;
    const d = { civilite: f.civilite as 'M.' | 'Mme', nom: f.nom.trim().toUpperCase(), prenom: f.prenom.trim(), specialite: f.specialite.trim(), telephone: f.telephone.trim(), email: f.email.trim().toLowerCase(), contrat: f.contrat as Enseignant['contrat'], heures: Number(f.heures) || 0 };
    const nom = `${d.civilite} ${d.nom} ${d.prenom}`;
    if (e) {
      modifier('enseignants', e.id, d, { operation: 'Modification', module: 'Enseignants', element: nom, avant: `${e.specialite}, ${e.contrat}, ${e.telephone}`, apres: `${d.specialite}, ${d.contrat}, ${d.telephone}` });
      toast('Enseignant mis à jour.');
      onClose();
    } else {
      ajouter('enseignants', { ...d, classes: [], matieres: [d.specialite], actif: true, etat: 'actif' }, { operation: 'Création', module: 'Enseignants', element: `${nom} (compte créé)` });
      onClose();
      onCree({ nom, email: d.email, mdp: motDePasse() });
    }
  };
  return (
    <Modal title={e ? 'Modifier l’enseignant' : 'Ajouter un enseignant'} lead={e ? undefined : 'Un compte de connexion à l’espace enseignant sera créé.'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button icon={e ? undefined : KeyRound} onClick={enregistrer}>{e ? 'Enregistrer' : 'Créer le compte'}</Button></>}>
      <Grille>
        <Champ label="Civilité"><Liste value={f.civilite} onChange={(x) => setF({ ...f, civilite: x.target.value as 'M.' | 'Mme' })} options={['M.', 'Mme']} /></Champ>
        <Champ label="Spécialité" erreur={err('specialite')}><Saisie value={f.specialite} onChange={(x) => setF({ ...f, specialite: x.target.value })} placeholder="Exemple : Mathématiques" /></Champ>
        <Champ label="Nom" erreur={err('nom')}><Saisie value={f.nom} onChange={(x) => setF({ ...f, nom: x.target.value })} /></Champ>
        <Champ label="Prénom" erreur={err('prenom')}><Saisie value={f.prenom} onChange={(x) => setF({ ...f, prenom: x.target.value })} /></Champ>
        <Champ label="Téléphone" erreur={err('telephone')}><Saisie inputMode="tel" value={f.telephone} onChange={(x) => setF({ ...f, telephone: x.target.value })} /></Champ>
        <Champ label="E-mail (identifiant)" erreur={err('email')}><Saisie type="email" value={f.email} onChange={(x) => setF({ ...f, email: x.target.value })} /></Champ>
        <Champ label="Contrat"><Liste value={f.contrat} onChange={(x) => setF({ ...f, contrat: x.target.value as Enseignant['contrat'] })} options={['Permanent', 'Vacataire']} /></Champ>
        <Champ label="Heures par semaine"><Saisie type="number" min={0} max={40} value={f.heures} onChange={(x) => setF({ ...f, heures: x.target.value })} /></Champ>
      </Grille>
    </Modal>
  );
}

function Affectations({ e, onClose }: { e: Enseignant; onClose: () => void }) {
  const { etat, modifier } = useSecretariat();
  const toast = useToast();
  const classes = visibles(etat.classes).map((c) => c.nom);
  const toutesMatieres = useMemo(() => [...new Set(visibles(etat.matieres).map((m) => m.nom))].sort(), [etat.matieres]);
  const [cl, setCl] = useState<string[]>(e.classes);
  const [mat, setMat] = useState<string[]>(e.matieres);
  const bascule = (l: string[], v: string) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]);
  const Cases = ({ items, choix, set }: { items: string[]; choix: string[]; set: (v: string[]) => void }) => (
    <div className="flex flex-wrap gap-2">
      {items.map((v) => (
        <button key={v} type="button" aria-pressed={choix.includes(v)} onClick={() => set(bascule(choix, v))} className={`min-h-10 cursor-pointer rounded-xl px-3.5 text-sm font-semibold ring-1 ring-inset transition-colors ${choix.includes(v) ? 'bg-brand-700 text-white ring-brand-700' : 'bg-white text-encre ring-papier-ligne hover:ring-brand-300'}`}>{v}</button>
      ))}
    </div>
  );
  return (
    <Modal title="Classes et matières" lead={`${e.civilite} ${e.nom} ${e.prenom}`} width="max-w-2xl" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={() => {
      modifier('enseignants', e.id, { classes: cl, matieres: mat }, { operation: 'Affectation', module: 'Enseignants', element: `${e.civilite} ${e.nom} ${e.prenom}`, avant: `Classes : ${e.classes.join(', ') || '—'} ; matières : ${e.matieres.join(', ')}`, apres: `Classes : ${cl.join(', ') || '—'} ; matières : ${mat.join(', ')}` });
      toast('Affectations enregistrées.');
      onClose();
    }}>Enregistrer</Button></>}>
      <p className="field-label">Classes</p>
      <Cases items={classes} choix={cl} set={setCl} />
      <p className="field-label mt-5">Matières enseignées</p>
      <Cases items={toutesMatieres} choix={mat} set={setMat} />
      <p className="mt-5 text-[13px] text-encre-doux">Le professeur principal se désigne dans « Classes ».</p>
    </Modal>
  );
}

function CompteEnseignant({ e, onClose }: { e: Enseignant; onClose: () => void }) {
  const { modifier } = useSecretariat();
  const toast = useToast();
  const nom = `${e.civilite} ${e.nom} ${e.prenom}`;
  return (
    <ModalMotif
      titre={e.actif ? 'Désactiver le compte' : 'Réactiver le compte'}
      texte={e.actif ? `${nom} ne pourra plus se connecter. Ses notes et son historique sont conservés.` : `${nom} pourra de nouveau se connecter.`}
      bouton={e.actif ? 'Désactiver' : 'Réactiver'}
      danger={e.actif}
      rappel="Le compte n’est pas supprimé : l’historique de l’enseignant reste consultable par l’administrateur."
      onValider={(motif) => {
        modifier('enseignants', e.id, { actif: !e.actif }, { operation: e.actif ? 'Désactivation' : 'Réactivation', module: 'Enseignants', element: nom, avant: e.actif ? 'Actif' : 'Désactivé', apres: e.actif ? 'Désactivé' : 'Actif', motif });
        toast(e.actif ? 'Compte désactivé.' : 'Compte réactivé.');
      }}
      onClose={onClose}
    />
  );
}
