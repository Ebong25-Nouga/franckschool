import { Archive, Bell, CalendarPlus, CalendarRange, Check, Copy, ImagePlus, KeyRound, Lock, Monitor, Plus, Save, ShieldAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth';
import { Bloc, Titre } from '@/components/espace';
import { Avatar, Button, Modal, Pill, Segmented, Table, Td, useToast } from '@/components/kit';
import { cn } from '@/lib/utils';
import { teintes } from '@/lib/teintes';
import { Champ, dateFr, dateHeureFr, Grille, lienEcole, montant, Note, Saisie } from '../secretariat/commun';
import { Annonces } from '../secretariat/Communication';
import type { AnneeScolaire, Parametres as ParametresT } from '../secretariat/donnees';
import { aujourdhui, useSecretariat } from '../secretariat/store';
import { useNotificationsDirection } from './EspaceDirection';

/* =========================================================
 * Années scolaires (cahier admin § 12)
 * ======================================================= */
export function AnneesScolaires() {
  const { etat, modifier, ajouter } = useSecretariat();
  const toast = useToast();
  const active = etat.anneesScolaires.find((a) => a.statut === 'active')!;
  const preparation = etat.anneesScolaires.find((a) => a.statut === 'preparation');
  const archivees = etat.anneesScolaires.filter((a) => a.statut === 'archivee');
  const [dates, setDates] = useState(active.sequences);
  const [nouvelle, setNouvelle] = useState(false);
  const [activer, setActiver] = useState<AnneeScolaire | null>(null);
  const change = JSON.stringify(dates) !== JSON.stringify(active.sequences);
  const incoherent = dates.some((q, i) => q.fin < q.debut || (i > 0 && q.debut <= dates[i - 1].fin));
  const finAnnee = active.sequences.at(-1)?.fin ?? '';
  const terminee = aujourdhui() > finAnnee;
  const trimestre = (n: number) => Math.ceil(n / 2);

  return (
    <>
      <Titre titre="Années scolaires" texte="Fixez les dates des séquences, préparez l’année suivante et consultez les années passées. Changer d’année ne supprime jamais les données précédentes." action={!preparation && <Button icon={CalendarPlus} onClick={() => setNouvelle(true)}>Préparer l’année suivante</Button>} />

      <Bloc titre={`Année active · ${active.annee}`} icone={CalendarRange} action={<Pill tone="valide">Active</Pill>}>
        <div className="-mx-5 sm:-mx-6">
          <Table caption="Dates des séquences" head={['Séquence', 'Trimestre', 'Début', 'Fin', 'État']} minWidth={640}>
            {dates.map((q, i) => {
              const etatQ = q.fin < aujourdhui() ? 'Terminée' : q.debut <= aujourdhui() ? 'En cours' : 'À venir';
              return (
                <tr key={q.n}>
                  <Td className="font-semibold">Séquence {q.n}</Td>
                  <Td>{trimestre(q.n)}{trimestre(q.n) === 1 ? 'er' : 'e'} trimestre</Td>
                  <Td><Saisie type="date" value={q.debut} disabled={etatQ === 'Terminée'} onChange={(e) => setDates(dates.map((x, j) => (j === i ? { ...x, debut: e.target.value } : x)))} className="max-w-44" /></Td>
                  <Td><Saisie type="date" value={q.fin} disabled={etatQ === 'Terminée'} onChange={(e) => setDates(dates.map((x, j) => (j === i ? { ...x, fin: e.target.value } : x)))} className="max-w-44" /></Td>
                  <Td><Pill tone={etatQ === 'Terminée' ? 'neutre' : etatQ === 'En cours' ? 'encre' : 'feutre'}>{etatQ}</Pill></Td>
                </tr>
              );
            })}
          </Table>
        </div>
        {incoherent && <p className="mt-3 text-[13px] font-medium text-stylo">Les dates se chevauchent ou une séquence finit avant de commencer.</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-encre-doux">Une séquence terminée ne se modifie plus.</p>
          <Button icon={Save} disabled={!change || incoherent} onClick={() => { modifier('anneesScolaires', active.id, { sequences: dates }, { operation: 'Modification', module: 'Années scolaires', element: `Dates des séquences ${active.annee}`, avant: active.sequences.map((q) => `S${q.n} ${dateFr(q.debut)}–${dateFr(q.fin)}`).join(' ; '), apres: dates.map((q) => `S${q.n} ${dateFr(q.debut)}–${dateFr(q.fin)}`).join(' ; ') }); toast('Dates des séquences enregistrées.'); }}>Enregistrer les dates</Button>
        </div>
      </Bloc>

      {preparation && (
        <Bloc titre={`Année en préparation · ${preparation.annee}`} icone={CalendarPlus} className="mt-6" action={<Pill tone="feutre">En préparation</Pill>}>
          <p className="text-sm text-encre-doux">Rentrée prévue le {dateFr(preparation.sequences[0]?.debut ?? '')}. Classes et matières reprises de {active.annee}. Les réinscriptions se feront dans cette année.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button disabled={!terminee} onClick={() => setActiver(preparation)}>Définir comme année active</Button>
            {!terminee && <p className="text-[13px] text-encre-doux">Possible après la fin de l’année en cours ({dateFr(finAnnee)}).</p>}
          </div>
        </Bloc>
      )}

      <Bloc titre="Années passées" icone={Archive} className="mt-6">
        <ul className="divide-y divide-papier-ligne/70">
          {archivees.map((a) => {
            const info = etat.annees.find((x) => x.annee === a.annee);
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.annee} <Pill tone="neutre"><Lock className="size-3" aria-hidden /> Archivée</Pill></p>
                  {info && <p className="text-[13px] text-encre-doux">{info.effectif} élèves · réussite {info.reussite} % · recettes {montant(info.recettes)}</p>}
                </div>
                <Link to="/direction/annees"><Button size="sm" variant="secondary">Consulter classes, élèves et résultats</Button></Link>
              </li>
            );
          })}
        </ul>
      </Bloc>

      {nouvelle && (
        <Modal title="Préparer l’année suivante" lead={`Année ${active.annee.split('-').map((x) => Number(x) + 1).join('-')}`} onClose={() => setNouvelle(false)} footer={<><Button variant="secondary" onClick={() => setNouvelle(false)}>Annuler</Button><Button onClick={() => {
          const annee = active.annee.split('-').map((x) => Number(x) + 1).join('-');
          const plus1 = (d: string) => `${Number(d.slice(0, 4)) + 1}${d.slice(4)}`;
          ajouter('anneesScolaires', { annee, statut: 'preparation', sequences: active.sequences.map((q) => ({ ...q, debut: plus1(q.debut), fin: plus1(q.fin) })) }, { operation: 'Création', module: 'Années scolaires', element: `Année ${annee} (en préparation)` });
          toast(`Année ${annee} créée en préparation.`);
          setNouvelle(false);
        }}>Créer l’année</Button></>}>
          <ul className="space-y-2 text-sm">
            {['Les dates des séquences sont proposées un an plus tard (modifiables).', 'Les classes et les matières sont reprises (modifiables).', 'Les élèves seront réinscrits par le secrétariat, selon les décisions de fin d’année.', 'L’année en cours reste active jusqu’à votre décision.'].map((t) => <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-valide" aria-hidden />{t}</li>)}
          </ul>
        </Modal>
      )}
      {activer && (
        <Modal title={`Activer l’année ${activer.annee}`} onClose={() => setActiver(null)} footer={<><Button variant="secondary" onClick={() => setActiver(null)}>Annuler</Button><Button onClick={() => {
          modifier('anneesScolaires', active.id, { statut: 'archivee' }, { operation: 'Archivage', module: 'Années scolaires', element: `Année ${active.annee}` });
          modifier('anneesScolaires', activer.id, { statut: 'active' }, { operation: 'Activation', module: 'Années scolaires', element: `Année ${activer.annee}` });
          toast(`L’année ${activer.annee} est maintenant active.`);
          setActiver(null);
        }}>Activer</Button></>}>
          <Note ton="feutre">L’année {active.annee} sera archivée : ses classes, élèves, notes, bulletins et paiements restent consultables, mais ne se modifient plus.</Note>
        </Modal>
      )}
    </>
  );
}

/* =========================================================
 * Notifications et communication (cahier admin § 13)
 * ======================================================= */
export function NotificationsDirection() {
  const notifications = useNotificationsDirection();
  const [onglet, setOnglet] = useState<'recues' | 'envoyer'>('recues');
  return (
    <>
      <Titre titre="Notifications" texte="Ce qui demande votre attention, et les informations que vous envoyez aux parents, aux enseignants et au personnel." />
      <div className="mb-5"><Segmented label="Vue" value={onglet} onChange={setOnglet} options={[{ value: 'recues', label: 'Reçues', count: notifications.length }, { value: 'envoyer', label: 'Envoyer une information' }]} /></div>
      {onglet === 'recues' ? (
        <section className="rounded-[22px] bg-white shadow-feuille">
          {notifications.length === 0 ? <p className="p-8 text-center text-sm text-encre-doux">Aucune notification.</p> : (
            <ul className="divide-y divide-papier-ligne/70">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link to={n.to ?? '/direction'} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-papier sm:px-6">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Bell className="size-4" aria-hidden /></span>
                    <span className="min-w-0"><span className="block font-semibold">{n.titre}</span><span className="block text-[13.5px] text-encre-doux">{n.texte}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <div className="mb-5"><Note>Les annonces apparaissent dans l’application des destinataires. L’envoi par e-mail et par SMS sera fait par le serveur.</Note></div>
          <Annonces sansTitre />
        </>
      )}
    </>
  );
}

/* =========================================================
 * Paramètres de l'établissement (cahier admin § 14)
 * ======================================================= */
export function Parametres() {
  const { etat, majParametres } = useSecretariat();
  const toast = useToast();
  const [p, setP] = useState<ParametresT>(etat.parametres);
  const [onglet, setOnglet] = useState<'identite' | 'bulletins' | 'scolaires'>('identite');
  const change = JSON.stringify(p) !== JSON.stringify(etat.parametres);
  const champ = <K extends keyof ParametresT>(k: K) => ({ value: p[k] as string, onChange: (e: { target: { value: string } }) => setP({ ...p, [k]: e.target.value }) });
  const totalParts = p.tranches.reduce((s, t) => s + t.part, 0);
  const enregistrer = () => {
    const avant = etat.parametres;
    const diff = (Object.keys(p) as (keyof ParametresT)[]).filter((k) => JSON.stringify(p[k]) !== JSON.stringify(avant[k]));
    majParametres(p, { operation: 'Modification', module: 'Paramètres', element: `Paramètres de l’établissement (${diff.join(', ')})`, avant: diff.filter((k) => typeof avant[k] === 'string').map((k) => `${k} : ${avant[k]}`).join(' ; ') || undefined, apres: diff.filter((k) => typeof p[k] === 'string').map((k) => `${k} : ${p[k] === p.logo ? 'nouveau logo' : p[k]}`).join(' ; ') || undefined });
    toast('Paramètres enregistrés.');
  };
  const logo = (f?: File) => {
    if (!f) return;
    if (f.size > 500_000) return toast('Logo trop lourd : 500 Ko au maximum.');
    const r = new FileReader();
    r.onload = () => setP((x) => ({ ...x, logo: String(r.result) }));
    r.readAsDataURL(f);
  };

  return (
    <>
      <Titre titre="Paramètres de l’établissement" texte="Identité de l’école, informations des bulletins et paramètres scolaires." action={<Button icon={Save} disabled={!change || totalParts !== 100} onClick={enregistrer}>Enregistrer</Button>} />
      <div className="mb-5"><Segmented label="Rubrique" value={onglet} onChange={setOnglet} options={[{ value: 'identite', label: 'Identité et coordonnées' }, { value: 'bulletins', label: 'Bulletins' }, { value: 'scolaires', label: 'Paramètres scolaires' }]} /></div>

      {onglet === 'identite' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Bloc titre="Identité et coordonnées">
            <Grille>
              <Champ label="Nom de l’établissement" className="sm:col-span-2"><Saisie {...champ('nom')} /></Champ>
              <Champ label="Sigle"><Saisie {...champ('sigle')} /></Champ>
              <Champ label="Devise"><Saisie {...champ('devise')} /></Champ>
              <Champ label="Adresse"><Saisie {...champ('adresse')} /></Champ>
              <Champ label="Ville"><Saisie {...champ('ville')} /></Champ>
              <Champ label="Téléphone"><Saisie {...champ('telephone')} /></Champ>
              <Champ label="E-mail"><Saisie type="email" {...champ('email')} /></Champ>
              <Champ label="Autorisation d’ouverture" className="sm:col-span-2"><Saisie {...champ('autorisation')} /></Champ>
            </Grille>
          </Bloc>
          <div className="space-y-6">
            <Bloc titre="Logo">
              <div className="flex items-center gap-4">
                <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-700 font-display text-xl font-extrabold text-white">{p.logo ? <img src={p.logo} alt="Logo de l’établissement" className="size-full object-cover" /> : p.sigle}</span>
                <div className="space-y-2">
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-white px-3.5 text-sm font-semibold ring-1 ring-inset ring-papier-ligne hover:ring-brand-300"><ImagePlus className="size-4" aria-hidden />Choisir une image<input type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={(e) => logo(e.target.files?.[0])} /></label>
                  {p.logo && <button onClick={() => setP({ ...p, logo: undefined })} className="flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-stylo hover:underline"><Trash2 className="size-3.5" aria-hidden />Retirer</button>}
                  <p className="text-xs text-encre-doux">PNG, JPG ou SVG, 500 Ko au maximum.</p>
                </div>
              </div>
            </Bloc>
            <Bloc titre="Couleur de l’établissement">
              <div className="grid grid-cols-2 gap-2">
                {teintes.map((t) => (
                  <button key={t.hex} onClick={() => setP({ ...p, couleur: t.hex })} aria-pressed={p.couleur === t.hex} className={cn('flex cursor-pointer items-center gap-2 rounded-xl p-2.5 text-left text-sm font-semibold ring-1 ring-inset', p.couleur === t.hex ? 'ring-2 ring-encre' : 'ring-papier-ligne hover:ring-brand-300')}>
                    <span className="size-6 rounded-lg" style={{ background: t.hex }} />{t.nom}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-encre-doux">Appliquée aux espaces secrétariat et direction après l’enregistrement.</p>
            </Bloc>
            <Bloc titre="Lien de l’école">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-papier px-4 py-3"><span className="font-semibold">{lienEcole}</span><Button size="sm" variant="ghost" icon={Copy} onClick={() => navigator.clipboard?.writeText(lienEcole).then(() => toast('Lien copié.'), () => undefined)}>Copier</Button></div>
              <p className="mt-2 text-xs text-encre-doux">Le lien que les parents utilisent pour se connecter. Il est fixé par Franck School.</p>
            </Bloc>
          </div>
        </div>
      )}

      {onglet === 'bulletins' && (
        <Bloc titre="Bulletins">
          <p className="max-w-2xl text-[15px] text-encre-doux">L’en-tête, le logo, les colonnes, les mentions, les distinctions et les signatures du bulletin se règlent dans la page <b className="text-encre">Modèle de bulletin</b>, avec un aperçu en direct.</p>
          <Link to="/direction/modele-bulletin" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-[10px] bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800">Ouvrir le modèle de bulletin</Link>
        </Bloc>
      )}

      {onglet === 'scolaires' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Bloc titre="Frais de scolarité par niveau">
            <ul className="space-y-3">
              {p.frais.map((f, i) => (
                <li key={i} className="grid grid-cols-[1fr_150px] items-center gap-3">
                  <span className="text-sm font-medium">{f.niveau}</span>
                  <Saisie inputMode="numeric" value={String(f.montant)} onChange={(e) => setP({ ...p, frais: p.frais.map((x, j) => (j === i ? { ...x, montant: Number(e.target.value.replace(/\D/g, '')) || 0 } : x)) })} aria-label={`Montant ${f.niveau}`} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-encre-doux">En FCFA, pour l’année. Les nouvelles inscriptions utiliseront ces montants. Pas de réduction (décision 008).</p>
          </Bloc>
          <Bloc titre="Tranches de paiement">
            <ul className="space-y-3">
              {p.tranches.map((t, i) => (
                <li key={i} className="grid grid-cols-[1fr_90px_160px] items-center gap-2">
                  <Saisie value={t.libelle} onChange={(e) => setP({ ...p, tranches: p.tranches.map((x, j) => (j === i ? { ...x, libelle: e.target.value } : x)) })} aria-label="Tranche" />
                  <Saisie inputMode="numeric" value={String(t.part)} onChange={(e) => setP({ ...p, tranches: p.tranches.map((x, j) => (j === i ? { ...x, part: Number(e.target.value.replace(/\D/g, '')) || 0 } : x)) })} aria-label={`Part de ${t.libelle} en %`} />
                  <Saisie type="date" value={t.limite} onChange={(e) => setP({ ...p, tranches: p.tranches.map((x, j) => (j === i ? { ...x, limite: e.target.value } : x)) })} aria-label={`Date limite de ${t.libelle}`} />
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => setP({ ...p, tranches: [...p.tranches, { libelle: 'Nouvelle tranche', part: 0, limite: aujourdhui() }] })} className="flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline"><Plus className="size-3.5" aria-hidden />Ajouter une tranche</button>
              <span className={cn('text-[13px] font-semibold', totalParts === 100 ? 'text-valide' : 'text-stylo')}>Total : {totalParts} %{totalParts !== 100 && ' (doit faire 100 %)'}</span>
            </div>
          </Bloc>
        </div>
      )}
      {change && <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-3 rounded-2xl bg-encre px-5 py-3 text-white shadow-leve"><span className="text-sm">Modifications non enregistrées.</span><div className="flex gap-2"><Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setP(etat.parametres)}>Annuler</Button><Button size="sm" variant="success" disabled={totalParts !== 100} onClick={enregistrer}>Enregistrer</Button></div></div>}
    </>
  );
}

/* =========================================================
 * Mon profil (cahier admin § 16)
 * ======================================================= */
export function MonProfil() {
  const { session } = useAuth();
  const { etat, journaliser } = useSecretariat();
  const toast = useToast();
  const [f, setF] = useState({ telephone: '+237 699 00 11 22', email: 'admin@etoiles.cm' });
  const [mdp, setMdp] = useState({ actuel: '', nouveau: '', confirmation: '' });
  const [essai, setEssai] = useState(false);
  if (!session) return null;
  const erreurs = { actuel: !mdp.actuel && 'Saisissez votre mot de passe actuel.', nouveau: (mdp.nouveau.length < 8 || !/\d/.test(mdp.nouveau) || !/[A-Za-z]/.test(mdp.nouveau)) && '8 caractères au moins, avec des lettres et des chiffres.', confirmation: mdp.confirmation !== mdp.nouveau && 'Les deux mots de passe ne correspondent pas.' };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];
  const echecs = etat.connexions.filter((c) => c.resultat === 'Échouée');
  return (
    <>
      <Titre titre="Mon profil" texte="Vos informations, votre mot de passe et la sécurité de votre compte." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Bloc>
            <div className="flex items-center gap-4"><Avatar name={session.nom} size="xl" /><div><p className="font-display text-xl font-bold">{session.nom}</p><p className="text-encre-doux">{session.fonction}</p><p className="text-[13px] text-encre-doux">{etat.parametres.nom}</p></div></div>
            <div className="mt-5"><Grille>
              <Champ label="Téléphone"><Saisie value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} /></Champ>
              <Champ label="E-mail (identifiant)" aide="Changé uniquement par Franck School."><Saisie value={f.email} readOnly className="bg-papier" /></Champ>
            </Grille></div>
            <Button className="mt-4" variant="secondary" onClick={() => { journaliser({ operation: 'Modification', module: 'Mon profil', element: session.nom, apres: `Téléphone : ${f.telephone}` }); toast('Informations enregistrées.'); }}>Enregistrer</Button>
          </Bloc>
          <Bloc titre="Changer mon mot de passe" icone={KeyRound}>
            <div className="space-y-4">
              <Champ label="Mot de passe actuel" erreur={err('actuel')}><Saisie type="password" autoComplete="current-password" value={mdp.actuel} onChange={(e) => setMdp({ ...mdp, actuel: e.target.value })} /></Champ>
              <Champ label="Nouveau mot de passe" erreur={err('nouveau')}><Saisie type="password" autoComplete="new-password" value={mdp.nouveau} onChange={(e) => setMdp({ ...mdp, nouveau: e.target.value })} /></Champ>
              <Champ label="Confirmer" erreur={err('confirmation')}><Saisie type="password" autoComplete="new-password" value={mdp.confirmation} onChange={(e) => setMdp({ ...mdp, confirmation: e.target.value })} /></Champ>
              <Button className="w-full" onClick={() => { setEssai(true); if (Object.values(erreurs).some(Boolean)) return; journaliser({ operation: 'Changement de mot de passe', module: 'Mon profil', element: session.nom }); toast('Mot de passe modifié (vérifié par le serveur une fois branché).'); setMdp({ actuel: '', nouveau: '', confirmation: '' }); setEssai(false); }}>Enregistrer</Button>
            </div>
          </Bloc>
        </div>
        <div className="space-y-6">
          <Bloc titre="Notifications de sécurité" icone={ShieldAlert}>
            {echecs.length === 0 ? <p className="text-sm text-encre-doux">Rien à signaler.</p> : (
              <ul className="space-y-2">
                {echecs.map((c) => <li key={c.id} className="rounded-xl bg-feutre-50 px-4 py-3 text-sm text-feutre-700">Tentative de connexion échouée le {dateHeureFr(c.quand)} · {c.appareil} · {c.lieu}</li>)}
                <li className="rounded-xl bg-papier px-4 py-3 text-sm text-encre-doux">Si ce n’était pas vous, changez votre mot de passe.</li>
              </ul>
            )}
          </Bloc>
          <Bloc titre="Historique de connexion" icone={Monitor}>
            <ul className="divide-y divide-papier-ligne/70">
              {etat.connexions.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span><span className="block font-medium">{c.appareil}</span><span className="text-[13px] text-encre-doux">{dateHeureFr(c.quand)} · {c.lieu}</span></span>
                  <Pill tone={c.resultat === 'Réussie' ? 'valide' : 'stylo'}>{c.resultat}</Pill>
                </li>
              ))}
            </ul>
          </Bloc>
        </div>
      </div>
    </>
  );
}
