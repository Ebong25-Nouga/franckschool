import { Copy, KeyRound, Lock, MessageCircle, Pencil, Plus, Power, UserCheck, UserCog } from 'lucide-react';
import { useState } from 'react';
import { Titre } from '@/components/espace';
import { Avatar, Button, EmptyState, IconButton, Modal, Pill, Segmented, Table, Td, useToast } from '@/components/kit';
import { cn } from '@/lib/utils';
import { DROITS_ADMIN_SEULEMENT, DROITS_SECRETAIRE, libelleDroit, TOUS_DROITS_SECRETAIRE } from '@/lib/permissions';
import { Champ, dateFr, dateHeureFr, Grille, lienWhatsApp, Liste, ModalMotif, Note, Saisie } from '../secretariat/commun';
import { isoJour, type CompteSecretaire } from '../secretariat/donnees';
import { useSecretariat } from '../secretariat/store';
import { useElementsRetires } from './Historique';

/** Modèles de droits pour aller vite ; l'administrateur ajuste ensuite droit par droit. */
const MODELES: Record<string, string[]> = {
  'Toutes les tâches (sauf supprimer)': TOUS_DROITS_SECRETAIRE.filter((d) => d !== 'supprimer'),
  'Accueil et inscriptions': ['eleves', 'inscriptions', 'parents', 'absences', 'documents'],
  'Caisse et finances': ['eleves', 'caisse', 'depenses', 'remboursements', 'clotures'],
  'Aucun droit (je choisis)': [],
};
const telOk = (t: string) => /^(\+237)?6\d{8}$/.test(t.replace(/\s/g, ''));
const code = () => String(Math.floor(100000 + Math.random() * 900000));

export default function Secretaires() {
  const { etat } = useSecretariat();
  const [choisi, setChoisi] = useState<number>(etat.comptes[0]?.id ?? 0);
  const [nouvelle, setNouvelle] = useState(false);
  const c = etat.comptes.find((x) => x.id === choisi);
  return (
    <>
      <Titre titre="Secrétaires" texte="Créez vos secrétaires et choisissez ce que chacune peut faire. Son menu change dès sa prochaine page ouverte." action={<Button icon={Plus} onClick={() => setNouvelle(true)}>Nouvelle secrétaire</Button>} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <ul className="space-y-2.5">
          {etat.comptes.map((x) => (
            <li key={x.id}>
              <button onClick={() => setChoisi(x.id)} aria-pressed={x.id === choisi} className={cn('flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-feuille transition-shadow', x.id === choisi ? 'ring-2 ring-brand-700' : 'hover:ring-1 hover:ring-brand-200', !x.actif && 'opacity-60')}>
                <Avatar name={x.nom} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{x.nom}</span>
                  <span className="block truncate text-[13px] text-encre-doux">{x.email}</span>
                </span>
                <Pill tone={x.actif ? 'valide' : 'neutre'}>{x.actif ? `${x.droits.length} droits` : 'Désactivée'}</Pill>
              </button>
            </li>
          ))}
        </ul>
        {c ? <Fiche key={c.id} c={c} /> : <EmptyState icon={UserCog} title="Aucune secrétaire" text="Créez votre première secrétaire." />}
      </div>
      {nouvelle && <NouvelleSecretaire onClose={(id) => { setNouvelle(false); if (id) setChoisi(id); }} />}
    </>
  );
}

function Fiche({ c }: { c: CompteSecretaire }) {
  const { etat, modifier } = useSecretariat();
  const toast = useToast();
  const retires = useElementsRetires().filter((r) => r.par === c.nom);
  const [onglet, setOnglet] = useState<'droits' | 'activite' | 'retires'>('droits');
  const [droits, setDroits] = useState<string[]>(c.droits);
  const [fenetre, setFenetre] = useState<'mdp' | 'etat' | 'infos' | null>(null);
  const change = droits.length !== c.droits.length || droits.some((d) => !c.droits.includes(d));
  const activite = etat.journal.filter((j) => j.utilisateur === c.nom);

  const enregistrer = () => {
    const ajoutes = droits.filter((d) => !c.droits.includes(d));
    const retiresD = c.droits.filter((d) => !droits.includes(d));
    modifier('comptes', c.id, { droits }, {
      operation: 'Changement de droits',
      module: 'Secrétaires',
      element: c.nom,
      avant: retiresD.length ? `Retirés : ${retiresD.map(libelleDroit).join(', ')}` : undefined,
      apres: ajoutes.length ? `Ajoutés : ${ajoutes.map(libelleDroit).join(', ')}` : undefined,
    });
    toast(`Droits de ${c.nom} enregistrés.`);
  };

  return (
    <section className="rounded-[22px] bg-white p-5 shadow-feuille sm:p-6">
      <div className="flex flex-wrap items-center gap-4 border-b border-papier-ligne/70 pb-5">
        <Avatar name={c.nom} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[21px] font-bold">{c.nom}</p>
          <p className="text-[13px] text-encre-doux">{c.email} · {c.telephone}</p>
          <p className="text-[13px] text-encre-doux">Créée le {dateFr(c.creeLe)}{c.derniereConnexion ? ` · dernière connexion le ${dateHeureFr(c.derniereConnexion)}` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <IconButton icon={Pencil} label="Modifier les informations" onClick={() => setFenetre('infos')} />
          <Button size="sm" variant="secondary" icon={KeyRound} onClick={() => setFenetre('mdp')} disabled={!c.actif}>Nouveau mot de passe</Button>
          <Button size="sm" variant={c.actif ? 'secondary' : 'primary'} icon={Power} onClick={() => setFenetre('etat')}>{c.actif ? 'Désactiver' : 'Réactiver'}</Button>
        </div>
      </div>

      <div className="mt-5">
        <Segmented label="Fiche" value={onglet} onChange={setOnglet} options={[{ value: 'droits', label: 'Droits', count: c.droits.length }, { value: 'activite', label: 'Activité', count: activite.length }, { value: 'retires', label: 'Éléments retirés', count: retires.length }]} />
      </div>

      {onglet === 'droits' && (
        <>
          {!c.actif && <div className="mt-4"><Note ton="feutre">Ce compte est désactivé : la secrétaire ne peut plus se connecter, quels que soient ses droits.</Note></div>}
          <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            {DROITS_SECRETAIRE.map((g) => (
              <div key={g.titre}>
                <p className="mb-1 text-xs font-semibold text-encre-pale">{g.titre}</p>
                {g.droits.map((d) => {
                  const on = droits.includes(d.code);
                  return (
                    <label key={d.code} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg py-2" title={d.detail}>
                      <span className="min-w-0"><span className={cn('block text-[14.5px]', on ? 'font-semibold' : 'text-encre-doux')}>{d.libelle}</span><span className="block truncate text-xs text-encre-pale">{d.detail}</span></span>
                      <input type="checkbox" role="switch" checked={on} onChange={() => setDroits(on ? droits.filter((x) => x !== d.code) : [...droits, d.code])} className="peer sr-only" />
                      <span aria-hidden className={cn('relative h-6 w-10 shrink-0 rounded-full transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand-600/20', on ? 'bg-brand-700' : 'bg-papier-ligne')}>
                        <span className={cn('absolute top-[3px] size-[18px] rounded-full bg-white shadow transition-all', on ? 'left-[19px]' : 'left-[3px]')} />
                      </span>
                    </label>
                  );
                })}
              </div>
            ))}
            <div>
              <p className="mb-1 text-xs font-semibold text-encre-pale">Réservé à vous (jamais attribuable)</p>
              <ul className="space-y-1.5 pt-1">{DROITS_ADMIN_SEULEMENT.map((d) => <li key={d} className="flex items-center gap-2 text-[13.5px] text-encre-pale"><Lock className="size-3.5" aria-hidden />{d}</li>)}</ul>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-papier-ligne/70 pt-4">
            <p className="text-[13px] text-encre-doux">Chaque changement de droit est noté dans le journal.</p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={!change} onClick={() => setDroits(c.droits)}>Annuler</Button>
              <Button disabled={!change} onClick={enregistrer}>Enregistrer les droits</Button>
            </div>
          </div>
        </>
      )}

      {onglet === 'activite' && (
        <div className="-mx-5 mt-4 sm:-mx-6">
          {activite.length === 0 ? <p className="px-6 py-6 text-sm text-encre-doux">Aucune opération enregistrée.</p> : (
            <Table caption={`Activité de ${c.nom}`} head={['Date et heure', 'Opération', 'Élément', 'Motif']} minWidth={760}>
              {activite.slice(0, 30).map((j) => (
                <tr key={j.id}>
                  <Td className="whitespace-nowrap text-[13px] chiffres">{dateHeureFr(j.quand)}</Td>
                  <Td><p className={cn('font-semibold', ['Suppression', 'Accès refusé', 'Annulation', 'Masquage'].includes(j.operation) && 'text-stylo')}>{j.operation}</p><p className="text-xs text-encre-doux">{j.module}</p></Td>
                  <Td className="max-w-80 text-[13.5px]">{j.element}</Td>
                  <Td className="max-w-60 text-[13px]">{j.motif ?? '—'}</Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}

      {onglet === 'retires' && (
        <div className="mt-4">
          {retires.length === 0 ? <p className="py-4 text-sm text-encre-doux">{c.nom} n’a masqué ni supprimé aucun élément.</p> : (
            <ul className="divide-y divide-papier-ligne/70">
              {retires.map((r) => (
                <li key={r.cle + r.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1"><Pill tone={r.etat === 'masque' ? 'neutre' : 'stylo'}>{r.etat === 'masque' ? 'Masqué' : 'Supprimé'}</Pill><p className="mt-1 font-semibold">{r.type} · {r.libelle}</p><p className="text-[13px] text-encre-doux">{r.le && dateHeureFr(r.le)} · « {r.motif} »</p></div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[13px] text-encre-doux">La restauration se fait dans « Historique des activités ».</p>
        </div>
      )}

      {fenetre === 'mdp' && <Identifiants c={c} nouveau={false} onClose={() => setFenetre(null)} />}
      {fenetre === 'infos' && <Infos c={c} onClose={() => setFenetre(null)} />}
      {fenetre === 'etat' && (
        <ModalMotif
          titre={c.actif ? `Désactiver ${c.nom}` : `Réactiver ${c.nom}`}
          texte={c.actif ? 'Elle ne pourra plus se connecter. Son historique et ses opérations sont conservés.' : 'Elle pourra de nouveau se connecter avec ses droits actuels.'}
          bouton={c.actif ? 'Désactiver' : 'Réactiver'}
          danger={c.actif}
          rappel="Le compte n’est jamais supprimé : son historique reste consultable."
          onValider={(motif) => {
            modifier('comptes', c.id, { actif: !c.actif }, { operation: c.actif ? 'Désactivation' : 'Réactivation', module: 'Secrétaires', element: c.nom, avant: c.actif ? 'Active' : 'Désactivée', apres: c.actif ? 'Désactivée' : 'Active', motif });
            toast(c.actif ? 'Compte désactivé.' : 'Compte réactivé.');
          }}
          onClose={() => setFenetre(null)}
        />
      )}
    </section>
  );
}

function Infos({ c, onClose }: { c: CompteSecretaire; onClose: () => void }) {
  const { modifier } = useSecretariat();
  const toast = useToast();
  const [f, setF] = useState({ nom: c.nom, telephone: c.telephone });
  const ok = f.nom.trim().length > 2 && telOk(f.telephone);
  return (
    <Modal title="Modifier les informations" lead={c.email} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button disabled={!ok} onClick={() => { modifier('comptes', c.id, { nom: f.nom.trim(), telephone: f.telephone.trim() }, { operation: 'Modification', module: 'Secrétaires', element: c.nom, avant: `${c.nom}, ${c.telephone}`, apres: `${f.nom.trim()}, ${f.telephone.trim()}` }); toast('Informations mises à jour.'); onClose(); }}>Enregistrer</Button></>}>
      <Grille>
        <Champ label="Nom complet"><Saisie value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} /></Champ>
        <Champ label="Téléphone" erreur={!telOk(f.telephone) && 'Numéro camerounais attendu.'}><Saisie value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} /></Champ>
      </Grille>
      <p className="mt-3 text-[13px] text-encre-doux">L’adresse e-mail sert d’identifiant : elle ne se modifie pas.</p>
    </Modal>
  );
}

function NouvelleSecretaire({ onClose }: { onClose: (id?: number) => void }) {
  const { etat, ajouter } = useSecretariat();
  const [f, setF] = useState({ nom: '', email: '', telephone: '', modele: Object.keys(MODELES)[0] });
  const [essai, setEssai] = useState(false);
  const [cree, setCree] = useState<CompteSecretaire | null>(null);
  const doublon = etat.comptes.some((c) => c.email.toLowerCase() === f.email.trim().toLowerCase());
  const erreurs = { nom: f.nom.trim().length < 3 && 'Le nom est obligatoire.', email: !/^\S+@\S+\.\S+$/.test(f.email) ? 'Adresse e-mail invalide.' : doublon && 'Cette adresse est déjà utilisée.', telephone: !telOk(f.telephone) && 'Numéro camerounais attendu.' };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];
  if (cree) return <Identifiants c={cree} nouveau onClose={() => onClose(cree.id)} />;
  return (
    <Modal title="Nouvelle secrétaire" lead="Son compte de connexion est créé ; vous choisissez ses droits." onClose={() => onClose()} footer={<><Button variant="secondary" onClick={() => onClose()}>Annuler</Button><Button icon={KeyRound} onClick={() => {
      setEssai(true);
      if (Object.values(erreurs).some(Boolean)) return;
      const c = { nom: f.nom.trim(), email: f.email.trim().toLowerCase(), telephone: f.telephone.trim(), actif: true, droits: MODELES[f.modele], creeLe: isoJour(new Date()) };
      const id = ajouter('comptes', c, { operation: 'Création', module: 'Secrétaires', element: `${c.nom} (${c.email})`, apres: c.droits.length ? c.droits.map(libelleDroit).join(', ') : 'Aucun droit' });
      setCree({ ...c, id });
    }}>Créer le compte</Button></>}>
      <Grille>
        <Champ label="Nom complet" erreur={err('nom')}><Saisie value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder="Exemple : Mme TAGNE Carine" /></Champ>
        <Champ label="Téléphone" erreur={err('telephone')}><Saisie inputMode="tel" value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} placeholder="6XX XX XX XX" /></Champ>
        <Champ label="E-mail (identifiant)" erreur={err('email')} className="sm:col-span-2"><Saisie type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="prenom.nom@etoiles.cm" /></Champ>
        <Champ label="Droits de départ" className="sm:col-span-2" aide="Vous pourrez ensuite ajuster chaque droit."><Liste value={f.modele} onChange={(e) => setF({ ...f, modele: e.target.value })} options={Object.keys(MODELES)} /></Champ>
      </Grille>
    </Modal>
  );
}

/** Identifiants remis en privé (WhatsApp ou en personne) : le mot de passe n'est affiché qu'une fois. */
function Identifiants({ c, nouveau, onClose }: { c: CompteSecretaire; nouveau: boolean; onClose: () => void }) {
  const { journaliser } = useSecretariat();
  const toast = useToast();
  const [mdp] = useState(code);
  const message = `Bonjour ${c.nom}, voici vos identifiants Franck School (espace secrétariat).\n\nIdentifiant : ${c.email}\nMot de passe provisoire : ${mdp}\n\nVous choisirez votre propre mot de passe à la première connexion.`;
  const remis = (canal: string) => {
    journaliser({ operation: nouveau ? 'Remise des identifiants' : 'Nouveau mot de passe', module: 'Secrétaires', element: c.nom, apres: canal });
    toast(canal === 'WhatsApp' ? 'Identifiants envoyés par WhatsApp.' : 'Identifiants remis en personne.');
    onClose();
  };
  return (
    <Modal title={nouveau ? 'Compte créé' : 'Nouveau mot de passe'} lead={`${c.nom} · à remettre à elle seule`} onClose={onClose} footer={<>
      <Button variant="secondary" icon={UserCheck} onClick={() => remis('En personne')}>Remis en personne</Button>
      <a href={lienWhatsApp(message, c.telephone)} target="_blank" rel="noreferrer" onClick={() => remis('WhatsApp')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#128C4A] px-4 text-sm font-semibold text-white hover:bg-[#0E7A40]"><MessageCircle className="size-4" aria-hidden /> Envoyer par WhatsApp</a>
    </>}>
      <div className="space-y-3">
        {!nouveau && <Note ton="feutre">L’ancien mot de passe ne fonctionnera plus.</Note>}
        {[['Identifiant', c.email], ['Mot de passe provisoire', mdp]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 rounded-xl bg-papier px-4 py-3">
            <span><span className="block text-[13px] text-encre-doux">{k}</span><span className={k === 'Identifiant' ? 'font-semibold' : 'font-mono text-[22px] font-bold tracking-[0.2em]'}>{v}</span></span>
            <IconButton icon={Copy} label={`Copier : ${k}`} onClick={() => navigator.clipboard?.writeText(v).then(() => toast('Copié.'), () => undefined)} />
          </div>
        ))}
        <p className="text-[13px] text-encre-doux">Ce mot de passe n’est affiché qu’une fois et n’est jamais écrit dans le journal.</p>
      </div>
    </Modal>
  );
}
