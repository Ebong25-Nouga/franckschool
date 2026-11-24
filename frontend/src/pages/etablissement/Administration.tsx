import clsx from 'clsx';
import { Check, KeyRound, ShieldCheck, Upload, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Avatar, Button, Modal, PageHeader, Panel, PanelHead, Pill, SequenceRail, useToast } from '../../components/kit';
import { ecole } from '../../data/demo';

/* =========================================================
 * Utilisateurs et droits
 * ======================================================= */
const modules = [
  { groupe: 'Scolarité', items: [{ code: 'eleves', label: 'Inscrire et modifier les élèves' }, { code: 'classes', label: 'Gérer classes et matières' }, { code: 'absences', label: 'Saisir les absences' }] },
  { groupe: 'Évaluations', items: [{ code: 'notes', label: 'Consulter les notes' }, { code: 'bulletins', label: 'Générer les bulletins' }] },
  { groupe: 'Caisse', items: [{ code: 'caisse', label: 'Encaisser les paiements' }, { code: 'depenses', label: 'Enregistrer des dépenses' }, { code: 'remboursements', label: 'Demander un remboursement' }, { code: 'clotures', label: 'Clôturer la caisse' }] },
];
const tous = modules.flatMap((m) => m.items.map((i) => i.code));

const comptesInit = [
  { id: 1, nom: 'Jean-Pierre Manga', role: 'Administrateur', email: 'admin@etoiles.cm', actif: true, derniere: 'En ligne', perms: tous },
  { id: 2, nom: 'Nadine Ekotto', role: 'Secrétaire', email: 'secretaire@etoiles.cm', actif: true, derniere: 'il y a 12 min', perms: ['eleves', 'absences', 'caisse', 'remboursements', 'clotures'] },
  { id: 3, nom: 'Paul Biyong', role: 'Secrétaire', email: 'paul.b@etoiles.cm', actif: true, derniere: 'il y a 2 h', perms: ['eleves', 'classes', 'bulletins', 'caisse'] },
  { id: 4, nom: 'Carine Tagne', role: 'Secrétaire', email: 'carine.t@etoiles.cm', actif: false, derniere: 'il y a 3 semaines', perms: ['eleves'] },
];

export function Utilisateurs() {
  const toast = useToast();
  const [comptes, setComptes] = useState(comptesInit);
  const [sel, setSel] = useState(2);
  const [creer, setCreer] = useState(false);
  const c = comptes.find((x) => x.id === sel)!;
  const admin = c.role === 'Administrateur';
  const basculer = (code: string) => setComptes((cs) => cs.map((x) => (x.id === sel ? { ...x, perms: x.perms.includes(code) ? x.perms.filter((p) => p !== code) : [...x.perms, code] } : x)));

  return (
    <>
      <PageHeader title="Utilisateurs et droits" lead="Chaque secrétaire a ses propres droits. Son menu s’adapte dès que vous enregistrez." actions={<Button icon={UserPlus} onClick={() => setCreer(true)}>Créer un compte secrétaire</Button>} />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel className="self-start">
          <PanelHead title="Comptes administratifs" hint={`${comptes.length} comptes, ${comptes.filter((x) => x.actif).length} actifs`} />
          <ul className="space-y-1 px-3 pb-3">
            {comptes.map((x) => (
              <li key={x.id}>
                <button onClick={() => setSel(x.id)} aria-pressed={sel === x.id} className={clsx('flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors', sel === x.id ? 'bg-brand-50 ring-1 ring-inset ring-brand-200' : 'hover:bg-papier')}>
                  <span className="relative">
                    <Avatar name={x.nom} />
                    <span className={clsx('absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white', x.actif ? 'bg-valide' : 'bg-encre-pale')} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{x.nom}</span>
                    <span className="block truncate text-xs text-encre-doux">{x.role} · {x.derniere}</span>
                  </span>
                  {!x.actif && <Pill tone="neutre" dot={false}>Désactivé</Pill>}
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-center gap-4 border-b border-papier-ligne/70 p-6">
            <Avatar name={c.nom} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-bold tracking-[-0.02em]">{c.nom}</h2>
              <p className="text-sm text-encre-doux">{c.email} · {c.role}</p>
            </div>
            {!admin && (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" icon={KeyRound} onClick={() => toast(`Lien de réinitialisation envoyé à ${c.email}.`)}>Mot de passe</Button>
                <Button size="sm" variant="secondary" onClick={() => { setComptes((cs) => cs.map((x) => (x.id === sel ? { ...x, actif: !x.actif } : x))); toast(c.actif ? `Compte de ${c.nom} désactivé. Son historique est conservé.` : `Compte de ${c.nom} réactivé.`); }}>
                  {c.actif ? 'Désactiver' : 'Réactiver'}
                </Button>
              </div>
            )}
          </div>

          <div className="p-6">
            {admin ? (
              <p className="flex gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-900"><ShieldCheck className="size-5 shrink-0" aria-hidden />L’administrateur dispose de tous les droits de l’établissement. Ses droits ne se modifient pas ici.</p>
            ) : (
              <div className="space-y-6">
                {modules.map((m) => (
                  <fieldset key={m.groupe}>
                    <legend className="mb-2.5 text-[13px] font-semibold text-encre-doux">{m.groupe}</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {m.items.map((it) => {
                        const on = c.perms.includes(it.code);
                        return (
                          <label key={it.code} className={clsx('flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium ring-1 ring-inset transition-colors', on ? 'bg-brand-50/60 ring-brand-200' : 'ring-papier-ligne hover:ring-brand-200')}>
                            {it.label}
                            <span className="relative inline-flex shrink-0">
                              <input type="checkbox" checked={on} onChange={() => basculer(it.code)} className="peer sr-only" />
                              <span className="h-6 w-10 rounded-full bg-papier-ligne transition-colors peer-checked:bg-brand-700 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2" />
                              <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
                <p className="flex gap-3 rounded-xl bg-feutre-50 p-4 text-sm text-encre"><ShieldCheck className="size-5 shrink-0 text-feutre-700" aria-hidden />Une secrétaire ne peut jamais rembourser seule : elle fait une demande, vous décidez. Chaque changement de droits est enregistré dans le journal.</p>
                <div className="flex justify-end"><Button icon={Check} onClick={() => toast(`Droits de ${c.nom} enregistrés.`)}>Enregistrer les droits</Button></div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {creer && (
        <Modal title="Créer un compte secrétaire" lead="Elle recevra un lien pour choisir son mot de passe." onClose={() => setCreer(false)} footer={<><Button variant="secondary" onClick={() => setCreer(false)}>Annuler</Button><Button onClick={() => { toast('Compte créé. Invitation envoyée.'); setCreer(false); }}>Créer le compte</Button></>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="s-nom" className="field-label">Nom complet</label><input id="s-nom" className="field-input" /></div>
            <div><label htmlFor="s-tel" className="field-label">Téléphone</label><input id="s-tel" type="tel" className="field-input" placeholder="+237 6XX XX XX XX" /></div>
            <div className="sm:col-span-2"><label htmlFor="s-mail" className="field-label">E-mail</label><input id="s-mail" type="email" className="field-input" /></div>
          </div>
          <p className="mt-4 text-sm text-encre-doux">Vous choisirez ses droits juste après la création.</p>
        </Modal>
      )}
    </>
  );
}

/* =========================================================
 * Paramètres de l'établissement
 * ======================================================= */
const teintes: { nom: string; hex: string; rgb: Record<number, string> }[] = [
  { nom: 'Bleu encre', hex: '#1C32A5', rgb: { 50: '240 244 255', 100: '224 231 255', 200: '194 207 252', 300: '150 170 245', 400: '98 124 232', 500: '58 86 214', 600: '37 64 196', 700: '28 50 165', 800: '23 39 128', 900: '17 28 94', 950: '10 16 56' } },
  { nom: 'Bleu roi', hex: '#1D4ED8', rgb: { 50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253', 400: '96 165 250', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216', 800: '30 64 175', 900: '30 58 138', 950: '23 37 84' } },
  { nom: 'Bleu nuit', hex: '#1E3A5F', rgb: { 50: '240 245 250', 100: '220 230 241', 200: '186 204 226', 300: '140 168 203', 400: '92 128 172', 500: '61 99 145', 600: '45 79 121', 700: '36 64 100', 800: '30 58 95', 900: '23 43 71', 950: '14 27 46' } },
  { nom: 'Bleu lagune', hex: '#0E6E9C', rgb: { 50: '236 248 253', 100: '208 237 249', 200: '164 219 242', 300: '106 193 230', 400: '50 160 210', 500: '22 132 186', 600: '14 110 156', 700: '14 89 126', 800: '17 74 104', 900: '18 61 86', 950: '10 38 56' } },
];

export function Parametres() {
  const toast = useToast();
  const [teinte, setTeinte] = useState(() => getComputedStyle(document.documentElement).getPropertyValue('--brand-700').trim());
  const appliquer = (t: (typeof teintes)[number]) => {
    Object.entries(t.rgb).forEach(([k, v]) => document.documentElement.style.setProperty(`--brand-${k}`, v));
    setTeinte(t.rgb[700]);
    toast(`Couleur de l’école : ${t.nom}. Toute l’interface l’utilise désormais.`);
  };

  return (
    <>
      <PageHeader title="Paramètres" lead="Identité de l’établissement, année scolaire et règles de notation." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHead title="Identité de l’établissement" />
          <div className="grid gap-4 px-6 pb-6 sm:grid-cols-[96px_1fr]">
            <div>
              <div className="grid size-24 place-items-center rounded-2xl bg-papier ring-1 ring-papier-ligne"><img src="/logo.svg" alt="Logo actuel" className="size-14" /></div>
              <Button size="sm" variant="ghost" icon={Upload} className="mt-2 w-full">Changer</Button>
            </div>
            <div className="grid gap-4">
              <div><label htmlFor="p-nom" className="field-label">Nom</label><input id="p-nom" defaultValue={ecole.nom} className="field-input" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="p-ville" className="field-label">Ville</label><input id="p-ville" defaultValue={ecole.ville} className="field-input" /></div>
                <div><label htmlFor="p-tel" className="field-label">Téléphone</label><input id="p-tel" defaultValue={ecole.telephone} className="field-input" /></div>
              </div>
              <div><label htmlFor="p-devise" className="field-label">Devise (en-tête des bulletins)</label><input id="p-devise" defaultValue={ecole.devise} className="field-input" /></div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Couleur de l’école" hint="Elle s’applique à toute l’interface, aux bulletins et aux reçus." />
          <div className="grid grid-cols-2 gap-3 px-6 pb-6 sm:grid-cols-4">
            {teintes.map((t) => {
              const actif = teinte === t.rgb[700];
              return (
                <button key={t.nom} onClick={() => appliquer(t)} aria-pressed={actif} className={clsx('cursor-pointer rounded-xl p-3 text-left ring-1 ring-inset transition-colors', actif ? 'ring-2 ring-encre' : 'ring-papier-ligne hover:ring-brand-200')}>
                  <span className="flex h-12 overflow-hidden rounded-lg">
                    {[950, 700, 500, 200].map((s) => <span key={s} className="flex-1" style={{ background: `rgb(${t.rgb[s]})` }} />)}
                  </span>
                  <span className="mt-2 flex items-center justify-between text-[13px] font-semibold">{t.nom}{actif && <Check className="size-4" aria-hidden />}</span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Année scolaire 2026-2027" hint="3 trimestres, 6 séquences. Une seule année peut être active." />
          <div className="px-6 pb-6"><SequenceRail /></div>
        </Panel>

        <Panel>
          <PanelHead title="Notation" />
          <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
            <div><label htmlFor="p-max" className="field-label">Note maximale</label><input id="p-max" defaultValue="20" className="field-input chiffres" /></div>
            <div><label htmlFor="p-seuil" className="field-label">Seuil de réussite</label><input id="p-seuil" defaultValue="10" className="field-input chiffres" /></div>
            <div className="sm:col-span-2">
              <p className="field-label">Appréciations</p>
              <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                {[['18', 'Excellent'], ['16', 'Très bien'], ['14', 'Bien'], ['12', 'Assez bien'], ['10', 'Passable'], ['8', 'Insuffisant'], ['0', 'Faible']].map(([n, l]) => (
                  <li key={l} className="rounded-lg bg-papier px-3 py-2"><span className="font-bold chiffres">≥ {n}</span> <span className="text-encre-doux">{l}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      </div>
      <div className="mt-6 flex justify-end"><Button icon={Check} onClick={() => toast('Paramètres enregistrés.')}>Enregistrer les paramètres</Button></div>
    </>
  );
}
