import { cn } from '@/lib/utils';
import { AlertCircle, Check, CheckCircle2, Loader2, Lock, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal } from '@/components/kit';
import { fcfa } from '@/data/demo';
import { parent, type Enfant } from '@/data/parent';

/*
 * Paiement en ligne depuis l'espace parent (demande du propriétaire, 25/11/2026).
 * Le parent paie sans se déplacer : il confirme sur son téléphone (code secret MoMo ou Orange Money).
 * Démonstration : le paiement est simulé. La connexion réelle aux opérateurs se fera
 * avec le backend, via un agrégateur de paiement camerounais (à choisir).
 */
type Operateur = 'momo' | 'om';
type Etape = 'montant' | 'moyen' | 'attente' | 'reussi';

const operateurs: Record<Operateur, { nom: string; teinte: string; prefixes: string }> = {
  momo: { nom: 'MTN Mobile Money', teinte: 'bg-[#FFCC00] text-encre', prefixes: '67, 680-684, 650-654' },
  om: { nom: 'Orange Money', teinte: 'bg-[#FF7900] text-white', prefixes: '69, 655-659' },
};

/** Détecte l'opérateur d'un numéro camerounais (9 chiffres commençant par 6). */
function operateurDe(tel: string): Operateur | null {
  const d = tel.replace(/\D/g, '').replace(/^237/, '');
  if (!/^6\d{8}$/.test(d)) return null;
  const p2 = Number(d.slice(0, 2));
  const p3 = Number(d.slice(0, 3));
  if (p2 === 67 || (p3 >= 680 && p3 <= 684) || (p3 >= 650 && p3 <= 654)) return 'momo';
  if (p2 === 69 || (p3 >= 655 && p3 <= 659)) return 'om';
  return null;
}

export function PaiementEnLigne({
  enfant,
  reste,
  prochaine,
  onClose,
  onPaye,
}: {
  enfant: Enfant;
  reste: number;
  prochaine?: { libelle: string; montant: number };
  onClose: () => void;
  onPaye: (montant: number, operateur: string, recu: string) => void;
}) {
  const [etape, setEtape] = useState<Etape>('montant');
  const [choix, setChoix] = useState<'tranche' | 'tout' | 'autre'>(prochaine ? 'tranche' : 'tout');
  const [autre, setAutre] = useState('');
  const [op, setOp] = useState<Operateur>('momo');
  const [tel, setTel] = useState(parent.telephone.replace('+237 ', ''));
  const [essai, setEssai] = useState(false);
  const [attente, setAttente] = useState(90);
  const recu = 'REC-000484';
  // Valeurs figées au moment du paiement : le parent met à jour le reste juste après
  const [fige, setFige] = useState<{ montant: number; reste: number } | null>(null);

  const montant = choix === 'tout' ? reste : choix === 'tranche' ? Math.min(prochaine?.montant ?? reste, reste) : Number(autre) || 0;
  const erreurMontant = choix === 'autre' && (montant < 1000 ? 'Le montant minimum est de 1 000 FCFA.' : montant > reste ? `Le montant dépasse le reste à payer (${fcfa(reste)}).` : '');
  const opDuNumero = operateurDe(tel);
  const erreurTel = !opDuNumero ? 'Numéro camerounais à 9 chiffres attendu, par exemple 677 12 45 90.' : opDuNumero !== op ? `Ce numéro est un numéro ${operateurs[opDuNumero].nom}. Choisissez ${operateurs[opDuNumero].nom} ou un autre numéro.` : '';

  // Simulation : l'opérateur confirme après quelques secondes
  useEffect(() => {
    if (etape !== 'attente') return;
    const fin = setTimeout(() => {
      setEtape('reussi');
      onPaye(fige!.montant, operateurs[op].nom, recu);
    }, 4500);
    const t = setInterval(() => setAttente((a) => Math.max(0, a - 1)), 1000);
    return () => {
      clearTimeout(fin);
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etape]);

  const etapes = ['Montant', 'Moyen de paiement', 'Confirmation'];
  const indice = etape === 'montant' ? 0 : etape === 'moyen' ? 1 : 2;

  return (
    <Modal
      title={etape === 'reussi' ? 'Paiement réussi' : 'Payer en ligne'}
      lead={etape === 'reussi' ? undefined : `Scolarité de ${enfant.prenom} ${enfant.nom}, ${enfant.classe}`}
      onClose={etape === 'attente' ? () => {} : onClose}
      width="max-w-lg"
      footer={
        etape === 'montant' ? (
          <>
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button disabled={!!erreurMontant || montant <= 0} onClick={() => setEtape('moyen')}>Continuer</Button>
          </>
        ) : etape === 'moyen' ? (
          <>
            <Button variant="ghost" onClick={() => setEtape('montant')}>Retour</Button>
            <Button
              icon={Lock}
              onClick={() => {
                setEssai(true);
                if (!erreurTel) {
                  setFige({ montant, reste });
                  setEtape('attente');
                }
              }}
            >
              Payer {fcfa(montant)}
            </Button>
          </>
        ) : etape === 'reussi' ? (
          <>
            <Button variant="secondary" onClick={onClose}>Fermer</Button>
            <Link to="/parent/recus" className="inline-flex min-h-11 items-center rounded-[10px] bg-brand-700 px-4 text-sm font-semibold text-white shadow-encre hover:bg-brand-800">Voir le reçu</Link>
          </>
        ) : undefined
      }
    >
      {etape !== 'reussi' && (
        <ol className="mb-6 flex items-center gap-2" aria-label="Étapes du paiement">
          {etapes.map((e, i) => (
            <li key={e} className="flex flex-1 items-center gap-2" aria-current={i === indice ? 'step' : undefined}>
              <span className={cn('grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold', i < indice ? 'bg-valide text-white' : i === indice ? 'bg-brand-700 text-white' : 'bg-papier-2 text-encre-pale')}>
                {i < indice ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={cn('hidden text-[13px] font-semibold sm:inline', i === indice ? 'text-encre' : 'text-encre-pale')}>{e}</span>
              {i < 2 && <span className="h-px flex-1 bg-papier-ligne" aria-hidden />}
            </li>
          ))}
        </ol>
      )}

      {/* 1. Montant */}
      {etape === 'montant' && (
        <fieldset className="flex flex-col gap-2.5">
          <legend className="field-label mb-2.5">Combien voulez-vous payer ?</legend>
          {prochaine && (
            <Choix actif={choix === 'tranche'} onClick={() => setChoix('tranche')} titre={prochaine.libelle} detail="La prochaine échéance" montant={Math.min(prochaine.montant, reste)} />
          )}
          {(!prochaine || prochaine.montant < reste) && <Choix actif={choix === 'tout'} onClick={() => setChoix('tout')} titre="Tout régler" detail="Le solde de l’année" montant={reste} />}
          <Choix actif={choix === 'autre'} onClick={() => setChoix('autre')} titre="Un autre montant" detail="À partir de 1 000 FCFA" />
          {choix === 'autre' && (
            <div className="mt-1">
              <label htmlFor="pay-autre" className="field-label">Montant (FCFA)</label>
              <input id="pay-autre" inputMode="numeric" autoFocus value={autre} onChange={(e) => setAutre(e.target.value.replace(/\D/g, ''))} className={cn('field-input font-display text-xl font-bold chiffres', erreurMontant && autre && 'border-stylo')} aria-invalid={!!erreurMontant && !!autre} aria-describedby="pay-autre-aide" />
              <p id="pay-autre-aide" className={cn('field-hint', erreurMontant && autre && 'font-semibold text-stylo')}>{autre ? erreurMontant || fcfa(montant) : `Reste à payer : ${fcfa(reste)}`}</p>
            </div>
          )}
        </fieldset>
      )}

      {/* 2. Moyen de paiement */}
      {etape === 'moyen' && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="field-label" id="op-label">Moyen de paiement</p>
            <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-labelledby="op-label">
              {(Object.keys(operateurs) as Operateur[]).map((o) => (
                <button key={o} role="radio" aria-checked={op === o} onClick={() => setOp(o)} className={cn('flex cursor-pointer flex-col items-start gap-2.5 rounded-2xl p-4 text-left ring-1 ring-inset transition-colors', op === o ? 'bg-brand-50/60 ring-2 ring-brand-600' : 'ring-papier-ligne hover:ring-brand-200')}>
                  <span className={cn('grid h-8 place-items-center rounded-lg px-2.5 text-[12px] font-black', operateurs[o].teinte)}>{o === 'momo' ? 'MoMo' : 'Orange'}</span>
                  <span className="text-sm font-semibold">{operateurs[o].nom}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="pay-tel" className="field-label">Numéro qui va payer</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] font-semibold text-encre-doux">+237</span>
              <input id="pay-tel" type="tel" inputMode="tel" autoComplete="tel-national" value={tel} onChange={(e) => setTel(e.target.value)} className={cn('field-input pl-14 font-semibold chiffres', essai && erreurTel && 'border-stylo')} aria-invalid={essai && !!erreurTel} aria-describedby="pay-tel-aide" />
            </div>
            <p id="pay-tel-aide" className={cn('field-hint', essai && erreurTel ? 'font-semibold text-stylo' : '')}>
              {essai && erreurTel ? erreurTel : opDuNumero ? `✓ Numéro ${operateurs[opDuNumero].nom}` : `Numéros ${operateurs[op].nom} : ${operateurs[op].prefixes}…`}
            </p>
          </div>
          <dl className="divide-y divide-papier-ligne rounded-2xl bg-papier px-4 text-sm">
            <div className="flex justify-between py-2.5"><dt className="text-encre-doux">Élève</dt><dd className="font-semibold">{enfant.prenom} {enfant.nom} ({enfant.matricule})</dd></div>
            <div className="flex justify-between py-2.5"><dt className="text-encre-doux">Objet</dt><dd className="font-semibold">{choix === 'tranche' && prochaine ? `Scolarité, ${prochaine.libelle}` : 'Scolarité'}</dd></div>
            <div className="flex items-center justify-between py-3"><dt className="font-semibold">Total à payer</dt><dd className="font-display text-xl font-extrabold chiffres">{fcfa(montant)}</dd></div>
          </dl>
          <p className="flex items-start gap-2 text-[13px] text-encre-doux"><Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />Vous validez le paiement sur votre téléphone avec votre code secret. Franck School ne voit jamais ce code.</p>
        </div>
      )}

      {/* 3. Validation sur le téléphone */}
      {etape === 'attente' && (
        <div className="py-4 text-center" role="status" aria-live="polite">
          <span className="relative mx-auto grid size-20 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand-200/60 [animation-duration:1.8s]" aria-hidden />
            <span className="relative grid size-20 place-items-center rounded-full bg-brand-50 text-brand-700"><Smartphone className="size-9" aria-hidden /></span>
          </span>
          <p className="mt-6 font-display text-2xl font-bold tracking-[-0.02em]">Validez sur votre téléphone</p>
          <p className="mx-auto mt-2 max-w-sm text-encre-doux">
            Une demande de paiement de <b className="text-encre">{fcfa(fige?.montant ?? montant)}</b> vient d’arriver sur le <b className="whitespace-nowrap text-encre chiffres">{tel}</b>. Tapez votre code secret {operateurs[op].nom} pour confirmer.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-papier px-4 py-2 text-sm text-encre-doux">
            <Loader2 className="size-4 animate-spin" aria-hidden /> En attente de votre confirmation · {attente} s
          </p>
          <p className="mx-auto mt-5 flex max-w-sm items-start gap-2 text-left text-[13px] text-encre-doux">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />Rien reçu ? Vérifiez que votre téléphone est allumé et que le solde est suffisant. Démonstration : le paiement se confirme tout seul.
          </p>
        </div>
      )}

      {/* 4. Réussi */}
      {etape === 'reussi' && (
        <div className="text-center" role="status">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-valide-50 text-valide"><CheckCircle2 className="size-9" aria-hidden /></span>
          <p className="mt-5 font-display text-[36px] font-extrabold leading-none tracking-[-0.03em] chiffres">{fcfa(fige!.montant)}</p>
          <p className="mt-2 text-encre-doux">payés pour {enfant.prenom}, par {operateurs[op].nom}.</p>
          <dl className="mt-6 divide-y divide-papier-ligne rounded-2xl bg-papier px-4 text-left text-sm">
            <div className="flex justify-between py-2.5"><dt className="text-encre-doux">Reçu</dt><dd className="font-mono font-semibold">{recu}</dd></div>
            <div className="flex justify-between py-2.5"><dt className="text-encre-doux">Nouveau reste à payer</dt><dd className="font-semibold chiffres">{fcfa(fige!.reste - fige!.montant)}</dd></div>
          </dl>
          <p className="mt-4 text-[13px] text-encre-doux">L’école voit le paiement tout de suite dans sa caisse. Vous recevez aussi une notification.</p>
        </div>
      )}
    </Modal>
  );
}

function Choix({ actif, onClick, titre, detail, montant }: { actif: boolean; onClick: () => void; titre: string; detail: string; montant?: number }) {
  return (
    <button type="button" role="radio" aria-checked={actif} onClick={onClick} className={cn('flex w-full cursor-pointer items-center gap-4 rounded-2xl p-4 text-left ring-1 ring-inset transition-colors', actif ? 'bg-brand-50/60 ring-2 ring-brand-600' : 'ring-papier-ligne hover:ring-brand-200')}>
      <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2', actif ? 'border-brand-700' : 'border-papier-ligne')}>{actif && <span className="size-2.5 rounded-full bg-brand-700" />}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{titre}</span>
        <span className="block text-[13px] text-encre-doux">{detail}</span>
      </span>
      {montant !== undefined && <span className="font-display text-lg font-bold chiffres">{fcfa(montant)}</span>}
    </button>
  );
}
