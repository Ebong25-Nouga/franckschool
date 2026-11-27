import { Check, History, KeyRound, Lock, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/auth';
import { Bloc, Titre } from '@/components/espace';
import { Avatar, Button, EmptyState, Modal, SearchInput, Table, Td, useToast } from '@/components/kit';
import { ecole } from '@/data/demo';
import { DROITS_ADMIN_SEULEMENT, DROITS_SECRETAIRE } from '@/lib/permissions';
import { Champ, dateHeureFr, Liste, Note, Pagination, Saisie } from './commun';
import { useSecretariat } from './store';

/* =========================================================
 * Mon activité : le journal de la secrétaire, en lecture seule
 * ======================================================= */
export function MonActivite() {
  const { etat, utilisateur } = useSecretariat();
  const [module, setModule] = useState('Tous');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const miennes = etat.journal.filter((j) => j.utilisateur === utilisateur);
  const modules = ['Tous', ...new Set(miennes.map((j) => j.module))];
  const t = q.trim().toLowerCase();
  const liste = miennes.filter((j) => (module === 'Tous' || j.module === module) && (!t || `${j.operation} ${j.element} ${j.motif ?? ''}`.toLowerCase().includes(t)));

  return (
    <>
      <Titre titre="Mon activité" texte="Tout ce que vous avez enregistré, avec la date et l’heure. Cet historique ne peut être ni modifié ni effacé." />
      <div className="mb-5"><Note>L’administrateur voit les opérations de toutes les secrétaires, y compris les éléments masqués ou supprimés et leur motif.</Note></div>
      <section className="rounded-[22px] bg-white shadow-feuille">
        <div className="grid gap-3 p-5 sm:p-6 md:grid-cols-[1.5fr_1fr]">
          <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} label="Rechercher" placeholder="Opération, élève, numéro…" />
          <Liste aria-label="Module" value={module} onChange={(e) => (setModule(e.target.value), setPage(1))} options={modules} />
        </div>
        {liste.length === 0 ? <EmptyState icon={History} title="Aucune opération" text="Rien ne correspond à ces critères." /> : (
          <>
            <Table caption="Mon activité" head={['Date et heure', 'Opération', 'Élément', 'Avant → après', 'Motif']} minWidth={980}>
              {liste.slice((page - 1) * 15, page * 15).map((j) => (
                <tr key={j.id}>
                  <Td className="whitespace-nowrap text-[13px] chiffres">{dateHeureFr(j.quand)}</Td>
                  <Td><p className="font-semibold">{j.operation}</p><p className="text-xs text-encre-doux">{j.module}</p></Td>
                  <Td className="max-w-80 text-[13.5px]">{j.element}</Td>
                  <Td className="max-w-72 text-[13px] text-encre-doux">{j.avant || j.apres ? <>{j.avant && <span className="line-through">{j.avant}</span>}{j.avant && j.apres && ' → '}{j.apres}</> : '—'}</Td>
                  <Td className="max-w-60 text-[13px]">{j.motif ?? '—'}</Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} total={liste.length} parPage={15} onPage={setPage} quoi="opérations" />
          </>
        )}
      </section>
    </>
  );
}

/* =========================================================
 * Mon compte
 * ======================================================= */
export function MonCompte() {
  const { session } = useAuth();
  const { reinitialiser, journaliser } = useSecretariat();
  const toast = useToast();
  const [mdp, setMdp] = useState({ actuel: '', nouveau: '', confirmation: '' });
  const [essai, setEssai] = useState(false);
  const [reset, setReset] = useState(false);
  if (!session) return null;
  const erreurs = {
    actuel: !mdp.actuel && 'Saisissez votre mot de passe actuel.',
    nouveau: (mdp.nouveau.length < 8 || !/\d/.test(mdp.nouveau) || !/[A-Za-z]/.test(mdp.nouveau)) && '8 caractères au moins, avec des lettres et des chiffres.',
    confirmation: mdp.confirmation !== mdp.nouveau && 'Les deux mots de passe ne correspondent pas.',
  };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];

  return (
    <>
      <Titre titre="Mon compte" texte="Vos informations, votre mot de passe et les droits que l’administrateur vous a attribués." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Bloc>
            <div className="flex items-center gap-4">
              <Avatar name={session.nom} size="xl" />
              <div>
                <p className="font-display text-xl font-bold">{session.nom}</p>
                <p className="text-encre-doux">{session.fonction}</p>
                <p className="mt-1 text-[13px] text-encre-doux">{ecole.nom}</p>
              </div>
            </div>
          </Bloc>
          <Bloc titre="Changer mon mot de passe" icone={KeyRound}>
            <div className="space-y-4">
              <Champ label="Mot de passe actuel" erreur={err('actuel')}><Saisie type="password" autoComplete="current-password" value={mdp.actuel} onChange={(e) => setMdp({ ...mdp, actuel: e.target.value })} /></Champ>
              <Champ label="Nouveau mot de passe" erreur={err('nouveau')} aide="8 caractères au moins, avec des lettres et des chiffres."><Saisie type="password" autoComplete="new-password" value={mdp.nouveau} onChange={(e) => setMdp({ ...mdp, nouveau: e.target.value })} /></Champ>
              <Champ label="Confirmer" erreur={err('confirmation')}><Saisie type="password" autoComplete="new-password" value={mdp.confirmation} onChange={(e) => setMdp({ ...mdp, confirmation: e.target.value })} /></Champ>
              <Button className="w-full" onClick={() => {
                setEssai(true);
                if (Object.values(erreurs).some(Boolean)) return;
                journaliser({ operation: 'Changement de mot de passe', module: 'Mon compte', element: session.nom });
                toast('Mot de passe modifié (il sera vérifié par le serveur une fois branché).');
                setMdp({ actuel: '', nouveau: '', confirmation: '' });
                setEssai(false);
              }}>Enregistrer</Button>
            </div>
          </Bloc>
          <Bloc titre="Données de démonstration" icone={RotateCcw}>
            <p className="text-sm text-encre-doux">Vos essais sont gardés dans ce navigateur. Vous pouvez revenir aux données de départ.</p>
            <Button className="mt-4" variant="secondary" icon={RotateCcw} onClick={() => setReset(true)}>Réinitialiser</Button>
          </Bloc>
        </div>

        <Bloc titre="Mes droits" icone={ShieldCheck}>
          <p className="mb-4 flex items-center gap-2 text-[13px] text-encre-doux"><Lock className="size-3.5" aria-hidden />Seul l’administrateur peut modifier vos droits. Vous ne pouvez pas les changer vous-même.</p>
          <div className="space-y-5">
            {DROITS_SECRETAIRE.map((g) => (
              <div key={g.titre}>
                <p className="mb-2 text-xs font-semibold text-encre-pale">{g.titre}</p>
                <ul className="space-y-1.5">
                  {g.droits.map((d) => {
                    const a = session.permissions.includes(d.code);
                    return (
                      <li key={d.code} className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-papier">
                        <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${a ? 'bg-valide-50 text-valide' : 'bg-papier-2 text-encre-pale'}`}>{a ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}</span>
                        <span><span className={`block text-sm font-semibold ${a ? '' : 'text-encre-pale'}`}>{d.libelle}</span><span className="block text-[13px] text-encre-doux">{d.detail}</span></span>
                        <span className="sr-only">{a ? 'Accordé' : 'Non accordé'}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <div>
              <p className="mb-2 text-xs font-semibold text-encre-pale">Réservé à l’administrateur</p>
              <ul className="space-y-1 text-[13px] text-encre-doux">{DROITS_ADMIN_SEULEMENT.map((d) => <li key={d} className="flex items-center gap-2 px-3"><Lock className="size-3" aria-hidden />{d}</li>)}</ul>
            </div>
          </div>
        </Bloc>
      </div>
      {reset && (
        <Modal title="Réinitialiser les données ?" lead="Toutes vos opérations d’essai seront effacées de ce navigateur. (Dans la vraie application, rien ne pourra être effacé ainsi.)" onClose={() => setReset(false)} footer={<><Button variant="secondary" onClick={() => setReset(false)}>Annuler</Button><Button variant="danger" onClick={() => (reinitialiser(), setReset(false), toast('Données de démonstration rétablies.'))}>Réinitialiser</Button></>}>
          <p className="text-sm text-encre-doux">Ce bouton n’existe que pour la démonstration.</p>
        </Modal>
      )}
    </>
  );
}
