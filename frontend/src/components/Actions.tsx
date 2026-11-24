import clsx from 'clsx';
import { Banknote, Building, Check, CheckCircle2, Printer, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { classes, eleves, fcfa, tranches, type Eleve } from '../data/demo';
import { Avatar, Button, Modal, SearchInput, useToast } from './kit';

/* =========================================================
 * Encaisser un paiement
 * ======================================================= */
const modes = [
  { id: 'Espèces', icon: Banknote, teinte: 'text-brand-700 bg-brand-50' },
  { id: 'MTN MoMo', icon: Smartphone, teinte: 'text-[#7A5B00] bg-[#FFF4C2]' },
  { id: 'Orange Money', icon: Smartphone, teinte: 'text-orange bg-orange-50' },
  { id: 'Banque', icon: Building, teinte: 'text-encre-doux bg-papier-2' },
] as const;

export function EncaissementModal({ onClose, eleveInitial }: { onClose: () => void; eleveInitial?: Eleve }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [eleve, setEleve] = useState<Eleve | undefined>(eleveInitial);
  const [mode, setMode] = useState<(typeof modes)[number]['id']>('Espèces');
  const [montant, setMontant] = useState('');
  const [reference, setReference] = useState('');
  const [fini, setFini] = useState(false);

  const resultats = useMemo(() => (q.length < 2 ? [] : eleves.filter((e) => `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(q.toLowerCase())).slice(0, 5)), [q]);
  const reste = eleve ? eleve.du - eleve.paye : 0;
  const m = Number(montant.replace(/\s/g, '')) || 0;
  const electronique = mode !== 'Espèces';
  const erreurMontant = reste > 0 && m > reste ? `Le montant dépasse le reste à payer (${fcfa(reste)}).` : '';
  const valide = eleve && m > 0 && !erreurMontant && (!electronique || reference.trim().length >= 4);

  if (fini && eleve)
    return (
      <Modal title="Paiement enregistré" onClose={onClose} width="max-w-md" footer={<><Button variant="secondary" icon={Printer} onClick={() => toast('Reçu REC-000483 envoyé à l’impression.')}>Imprimer le reçu</Button><Button onClick={onClose}>Terminer</Button></>}>
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-valide-50 text-valide"><CheckCircle2 className="size-7" aria-hidden /></span>
          <p className="mt-4 font-display text-[34px] font-extrabold tracking-[-0.03em] chiffres">{fcfa(m)}</p>
          <p className="mt-1 text-encre-doux">{eleve.nom} {eleve.prenom}, {eleve.classe}</p>
        </div>
        <dl className="mt-6 divide-y divide-papier-ligne rounded-xl bg-papier px-4 text-sm">
          {[['Reçu', 'REC-000483'], ['Mode', mode], ...(electronique ? [['Référence', reference]] : []), ['Nouveau reste à payer', fcfa(reste - m)]].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5"><dt className="text-encre-doux">{k}</dt><dd className="font-semibold chiffres">{v}</dd></div>
          ))}
        </dl>
      </Modal>
    );

  return (
    <Modal
      title="Encaisser un paiement"
      lead="Le paiement est enregistré à votre nom, avec un reçu numéroté."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button disabled={!valide} onClick={() => setFini(true)}>Enregistrer {m ? fcfa(m) : ''}</Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <p className="field-label">Élève</p>
          {eleve ? (
            <div className="flex items-center gap-3 rounded-xl bg-papier p-3">
              <Avatar name={`${eleve.nom} ${eleve.prenom}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{eleve.nom} {eleve.prenom}</p>
                <p className="text-xs text-encre-doux">{eleve.classe}, reste à payer <b className={reste ? 'text-stylo' : 'text-valide'}>{fcfa(reste)}</b></p>
              </div>
              {!eleveInitial && <Button size="sm" variant="ghost" onClick={() => setEleve(undefined)}>Changer</Button>}
            </div>
          ) : (
            <>
              <SearchInput value={q} onChange={setQ} label="Rechercher l’élève" placeholder="Tapez un nom ou un matricule (ex. MBARGA)" />
              {resultats.length > 0 && (
                <ul className="mt-2 overflow-hidden rounded-xl ring-1 ring-papier-ligne">
                  {resultats.map((e) => (
                    <li key={e.id}>
                      <button onClick={() => setEleve(e)} className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left hover:bg-brand-50/50">
                        <Avatar name={`${e.nom} ${e.prenom}`} size="sm" />
                        <span className="flex-1 text-sm font-medium">{e.nom} {e.prenom}</span>
                        <span className="text-xs text-encre-doux">{e.classe}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {eleve && reste === 0 && (
          <p className="flex items-center gap-2 rounded-xl bg-valide-50 px-4 py-3 text-sm font-semibold text-valide-700"><Check className="size-4" aria-hidden />La scolarité de cet élève est entièrement réglée. Vous pouvez encore encaisser d’autres frais (examen, APE).</p>
        )}

        {eleve && reste > 0 && (
          <div>
            <p className="field-label">Tranche</p>
            <div className="flex flex-wrap gap-2">
              {tranches.map((t) => (
                <button key={t.libelle} onClick={() => setMontant(String(Math.min(t.montant, reste)))} className="cursor-pointer rounded-lg px-3 py-2 text-left text-[13px] ring-1 ring-inset ring-papier-ligne transition-colors hover:bg-brand-50/50 hover:ring-brand-200">
                  <span className="block font-semibold">{t.libelle}</span>
                  <span className="text-encre-doux chiffres">{fcfa(t.montant)}</span>
                </button>
              ))}
              <button onClick={() => setMontant(String(reste))} className="cursor-pointer rounded-lg bg-brand-50 px-3 py-2 text-left text-[13px] text-brand-800 ring-1 ring-inset ring-brand-200">
                <span className="block font-semibold">Solder</span>
                <span className="chiffres">{fcfa(reste)}</span>
              </button>
            </div>
          </div>
        )}

        <div>
          <p className="field-label" id="mode-label">Mode de paiement</p>
          <div role="radiogroup" aria-labelledby="mode-label" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {modes.map((md) => (
              <button
                key={md.id}
                role="radio"
                aria-checked={mode === md.id}
                onClick={() => setMode(md.id)}
                className={clsx('flex cursor-pointer flex-col items-start gap-2 rounded-xl p-3 text-left text-[13px] font-semibold ring-1 ring-inset transition-colors', mode === md.id ? 'bg-brand-50/60 ring-2 ring-brand-600' : 'ring-papier-ligne hover:ring-brand-200')}
              >
                <span className={clsx('grid size-8 place-items-center rounded-lg', md.teinte)}><md.icon className="size-4" aria-hidden /></span>
                {md.id}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="montant" className="field-label">Montant (FCFA)</label>
            <input id="montant" inputMode="numeric" value={montant} onChange={(e) => setMontant(e.target.value.replace(/[^\d]/g, ''))} className={clsx('field-input font-display text-lg font-bold chiffres', erreurMontant && 'border-stylo')} aria-invalid={!!erreurMontant} aria-describedby="montant-aide" />
            <p id="montant-aide" className={clsx('field-hint', erreurMontant && 'text-stylo')}>{erreurMontant || (m ? fcfa(m) : 'Choisissez une tranche ou saisissez un montant.')}</p>
          </div>
          {electronique && (
            <div>
              <label htmlFor="ref" className="field-label">Référence de la transaction</label>
              <input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} className="field-input font-mono text-sm" placeholder="Ex. MP261124.0912.A83" />
              <p className="field-hint">Elle empêche d’enregistrer deux fois le même paiement.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
 * Inscrire un élève (3 étapes)
 * ======================================================= */
const etapes = ['Élève', 'Tuteur', 'Classe'];

export function InscriptionModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [etape, setEtape] = useState(0);
  const [f, setF] = useState({ nom: '', prenom: '', sexe: 'F', naissance: '', lieu: '', tuteur: '', lien: 'Mère', tel: '', classe: '6ème A', statut: 'Nouveau' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const ok = [f.nom && f.prenom && f.naissance, f.tuteur && f.tel.replace(/\D/g, '').length >= 9, true][etape];

  return (
    <Modal
      title="Inscrire un élève"
      lead="Année scolaire 2026-2027"
      onClose={onClose}
      footer={
        <>
          {etape > 0 && <Button variant="ghost" onClick={() => setEtape(etape - 1)}>Retour</Button>}
          {etape < 2 ? (
            <Button disabled={!ok} onClick={() => setEtape(etape + 1)}>Continuer</Button>
          ) : (
            <Button
              onClick={() => {
                toast(`${f.nom.toUpperCase()} ${f.prenom} est inscrit(e) en ${f.classe}. Matricule CBE26-0841.`);
                onClose();
              }}
            >
              Inscrire l’élève
            </Button>
          )}
        </>
      }
    >
      <ol className="mb-6 flex items-center gap-2" aria-label="Étapes">
        {etapes.map((e, i) => (
          <li key={e} className="flex flex-1 items-center gap-2" aria-current={i === etape ? 'step' : undefined}>
            <span className={clsx('grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold', i < etape ? 'bg-valide text-white' : i === etape ? 'bg-brand-700 text-white' : 'bg-papier-2 text-encre-pale')}>
              {i < etape ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className={clsx('text-sm font-semibold', i === etape ? 'text-encre' : 'text-encre-pale')}>{e}</span>
            {i < 2 && <span className="h-px flex-1 bg-papier-ligne" aria-hidden />}
          </li>
        ))}
      </ol>

      {etape === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="i-nom" className="field-label">Nom</label><input id="i-nom" value={f.nom} onChange={set('nom')} className="field-input uppercase" /></div>
          <div><label htmlFor="i-prenom" className="field-label">Prénom</label><input id="i-prenom" value={f.prenom} onChange={set('prenom')} className="field-input" /></div>
          <div>
            <span className="field-label">Sexe</span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Sexe">
              {['F', 'M'].map((s) => (
                <button key={s} role="radio" aria-checked={f.sexe === s} onClick={() => setF({ ...f, sexe: s })} className={clsx('min-h-11 cursor-pointer rounded-[10px] text-sm font-semibold ring-1 ring-inset', f.sexe === s ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-600' : 'ring-papier-ligne')}>
                  {s === 'F' ? 'Fille' : 'Garçon'}
                </button>
              ))}
            </div>
          </div>
          <div><label htmlFor="i-naiss" className="field-label">Date de naissance</label><input id="i-naiss" type="date" value={f.naissance} onChange={set('naissance')} className="field-input" /></div>
          <div className="sm:col-span-2"><label htmlFor="i-lieu" className="field-label">Lieu de naissance</label><input id="i-lieu" value={f.lieu} onChange={set('lieu')} className="field-input" placeholder="Ex. Yaoundé" /></div>
        </div>
      )}
      {etape === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label htmlFor="i-tut" className="field-label">Nom du parent ou tuteur</label><input id="i-tut" value={f.tuteur} onChange={set('tuteur')} className="field-input" /></div>
          <div><label htmlFor="i-lien" className="field-label">Lien</label><select id="i-lien" value={f.lien} onChange={set('lien')} className="field-input">{['Mère', 'Père', 'Tuteur', 'Autre'].map((x) => <option key={x}>{x}</option>)}</select></div>
          <div><label htmlFor="i-tel" className="field-label">Téléphone</label><input id="i-tel" type="tel" inputMode="tel" value={f.tel} onChange={set('tel')} className="field-input" placeholder="+237 6XX XX XX XX" /><p className="field-hint">Utilisé pour les reçus et les informations.</p></div>
        </div>
      )}
      {etape === 2 && (
        <div className="space-y-5">
          <div>
            <span className="field-label">Classe</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {classes.map((c) => (
                <button key={c} onClick={() => setF({ ...f, classe: c })} aria-pressed={f.classe === c} className={clsx('min-h-11 cursor-pointer rounded-[10px] text-sm font-semibold ring-1 ring-inset', f.classe === c ? 'bg-brand-700 text-white ring-brand-700' : 'ring-papier-ligne hover:ring-brand-200')}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="field-label">Statut</span>
            <div className="grid grid-cols-3 gap-2">
              {['Nouveau', 'Ancien', 'Redoublant'].map((s) => (
                <button key={s} onClick={() => setF({ ...f, statut: s })} aria-pressed={f.statut === s} className={clsx('min-h-11 cursor-pointer rounded-[10px] text-sm font-semibold ring-1 ring-inset', f.statut === s ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-600' : 'ring-papier-ligne')}>{s}</button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-papier p-4 text-sm">
            <p className="font-semibold">{f.nom.toUpperCase() || 'NOM'} {f.prenom || 'Prénom'}</p>
            <p className="mt-1 text-encre-doux">{f.classe}, {f.statut.toLowerCase()}. Tuteur : {f.tuteur || '—'} ({f.lien}), {f.tel || '—'}</p>
            <p className="mt-2 text-encre-doux">Frais de l’année : <b className="text-encre">{fcfa(f.classe.startsWith('Tle') || f.classe.startsWith('1ère') ? 185000 : 150000)}</b></p>
          </div>
        </div>
      )}
    </Modal>
  );
}
