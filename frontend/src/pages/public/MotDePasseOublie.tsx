import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, Loader2, MailCheck, MessageSquareText, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { CadreAuth } from './CadreAuth';

/*
 * Récupération du mot de passe (interface 1, cahier des charges § 4.1).
 * - E-mail : un lien de réinitialisation est envoyé.
 * - Téléphone : un code à 6 chiffres est envoyé par SMS (décision du 25/11/2026,
 *   service SMS branché avec le backend).
 * Pour la démonstration, le code SMS valide est 482 137.
 */
type Etape = 'demande' | 'lien' | 'code' | 'nouveau' | 'termine';

const CODE_DEMO = '482137';
const estTelephone = (v: string) => /^[+\d\s().-]{8,}$/.test(v.trim()) && !v.includes('@');
const masquer = (tel: string) => {
  const d = tel.replace(/\D/g, '');
  return d.length >= 4 ? `•• •• •• ${d.slice(-2)}` : tel;
};

const boutonPrincipal = 'flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-brand-700 font-semibold text-white shadow-encre transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50';

export default function MotDePasseOublie({ depuisLien = false }: { depuisLien?: boolean }) {
  const [etape, setEtape] = useState<Etape>(depuisLien ? 'nouveau' : 'demande');
  const [id, setId] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const titres: Record<Etape, [string, string]> = {
    demande: ['Pas de panique.', 'Un oubli arrive à tout le monde. En deux minutes, vous choisissez un nouveau mot de passe et vous retrouvez votre espace.'],
    lien: ['Regardez vos e-mails.', 'Le lien de réinitialisation est valable 60 minutes. Pensez à vérifier le dossier des courriers indésirables.'],
    code: ['Un code vous attend.', 'Le code reçu par SMS est valable 10 minutes. Ne le communiquez à personne, même pas à l’école.'],
    nouveau: ['Choisissez un mot de passe solide.', 'Évitez votre date de naissance, votre nom ou celui de l’école. Une phrase courte est plus facile à retenir.'],
    termine: ['C’est fait.', 'Votre mot de passe est changé. Vous pouvez vous connecter.'],
  };

  const demander = (e: FormEvent) => {
    e.preventDefault();
    setErreur('');
    const v = id.trim();
    if (!v) return setErreur('Saisissez votre e-mail ou votre numéro de téléphone.');
    if (!v.includes('@') && !estTelephone(v)) return setErreur('Ce n’est ni un e-mail, ni un numéro de téléphone. Exemple : nom@ecole.cm ou 677 12 45 90.');
    setEnvoi(true);
    setTimeout(() => {
      setEnvoi(false);
      setEtape(v.includes('@') ? 'lien' : 'code');
    }, 500);
  };

  return (
    <CadreAuth
      titre={titres[etape][0]}
      texte={titres[etape][1]}
      retour={{ to: '/connexion', label: 'Retour à la connexion' }}
    >
      {etape === 'demande' && (
        <>
          <h1 className="font-display text-[34px] font-bold leading-tight tracking-[-0.03em]">Mot de passe oublié</h1>
          <p className="mt-2 text-encre-doux">Indiquez l’e-mail ou le numéro de téléphone de votre compte. Nous vous envoyons de quoi choisir un nouveau mot de passe.</p>
          <form onSubmit={demander} className="mt-9 flex flex-col gap-5" noValidate>
            {erreur && <Alerte texte={erreur} />}
            <div>
              <label htmlFor="id" className="field-label">E-mail ou téléphone</label>
              <input id="id" value={id} onChange={(e) => setId(e.target.value)} className="field-input" autoComplete="username" placeholder="nom@ecole.cm ou 6XX XX XX XX" aria-invalid={!!erreur} />
              <p className="field-hint">Par e-mail, vous recevez un lien. Par téléphone, vous recevez un code par SMS.</p>
            </div>
            <button type="submit" disabled={envoi} className={boutonPrincipal}>
              {envoi && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {envoi ? 'Envoi en cours…' : 'Recevoir le lien ou le code'}
            </button>
          </form>
        </>
      )}

      {etape === 'lien' && (
        <div role="status">
          <span className="grid size-14 place-items-center rounded-2xl bg-valide-50 text-valide"><MailCheck className="size-7" aria-hidden /></span>
          <h1 className="mt-6 font-display text-[34px] font-bold leading-tight tracking-[-0.03em]">Vérifiez votre messagerie</h1>
          {/* Même message, que le compte existe ou non */}
          <p className="mt-3 text-encre-doux">Si un compte correspond à <b className="text-encre">{id.trim()}</b>, un e-mail avec un lien de réinitialisation vient de partir. Le lien reste valable 60 minutes.</p>
          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => setEtape('demande')} className="min-h-11 cursor-pointer rounded-[10px] text-sm font-semibold text-brand-700 ring-1 ring-inset ring-papier-ligne hover:bg-brand-50/50">Utiliser une autre adresse</button>
            <Link to="/reinitialiser" className="text-center text-[13px] text-encre-pale underline-offset-2 hover:underline">Démonstration : ouvrir le lien reçu</Link>
          </div>
        </div>
      )}

      {etape === 'code' && <SaisieCode tel={id} onValide={() => setEtape('nouveau')} onChanger={() => setEtape('demande')} />}

      {etape === 'nouveau' && <NouveauMotDePasse onFini={() => setEtape('termine')} />}

      {etape === 'termine' && <Termine />}
    </CadreAuth>
  );
}

/* ---------- Saisie du code SMS ---------- */
function SaisieCode({ tel, onValide, onChanger }: { tel: string; onValide: () => void; onChanger: () => void }) {
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState('');
  const [essais, setEssais] = useState(0);
  const [attente, setAttente] = useState(60);
  const [verif, setVerif] = useState(false);
  const champ = useRef<HTMLInputElement>(null);
  const bloque = essais >= 5;

  // Le champ est désactivé pendant la vérification : on lui rend le focus ensuite
  useEffect(() => {
    if (!verif && erreur && !bloque) (champ.current ?? document.getElementById('code'))?.focus();
  }, [verif, erreur, bloque]);

  useEffect(() => {
    if (attente <= 0) return;
    const t = setTimeout(() => setAttente(attente - 1), 1000);
    return () => clearTimeout(t);
  }, [attente]);

  const verifier = (valeur: string) => {
    if (valeur.length < 6 || bloque) return;
    setVerif(true);
    setTimeout(() => {
      setVerif(false);
      if (valeur === CODE_DEMO) return onValide();
      const n = essais + 1;
      setEssais(n);
      setCode('');
      setErreur(n >= 5 ? 'Trop d’essais. Demandez un nouveau code.' : `Code incorrect. Il vous reste ${5 - n} essai${5 - n > 1 ? 's' : ''}.`);
    }, 450);
  };

  return (
    <div>
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700"><MessageSquareText className="size-7" aria-hidden /></span>
      <h1 className="mt-6 font-display text-[34px] font-bold leading-tight tracking-[-0.03em]">Saisissez le code reçu</h1>
      <p className="mt-3 text-encre-doux">Un code à 6 chiffres a été envoyé par SMS au <b className="whitespace-nowrap text-encre chiffres">{masquer(tel)}</b>.</p>

      <div className="mt-8 flex flex-col gap-4">
        <label htmlFor="code" className="field-label">Code de vérification</label>
        <InputOTP
          ref={champ}
          id="code"
          maxLength={6}
          inputMode="numeric"
          pattern="^[0-9]*$"
          value={code}
          disabled={verif || bloque}
          onChange={(v) => {
            setCode(v);
            setErreur('');
            if (v.length === 6) verifier(v);
          }}
          containerClassName="justify-between"
          aria-invalid={!!erreur}
          aria-describedby="code-aide"
          autoFocus
        >
          <InputOTPGroup className="*:data-[slot=input-otp-slot]:size-12 *:data-[slot=input-otp-slot]:font-display *:data-[slot=input-otp-slot]:text-xl *:data-[slot=input-otp-slot]:font-bold">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup className="*:data-[slot=input-otp-slot]:size-12 *:data-[slot=input-otp-slot]:font-display *:data-[slot=input-otp-slot]:text-xl *:data-[slot=input-otp-slot]:font-bold">
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p id="code-aide" className={cn('min-h-5 text-[13px]', erreur ? 'font-semibold text-stylo' : 'text-encre-doux')}>
          {verif ? 'Vérification…' : erreur || 'Démonstration : le code est 482 137.'}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-papier-ligne pt-5 text-sm">
        <button onClick={onChanger} className="cursor-pointer font-semibold text-encre-doux hover:text-encre">Changer de numéro</button>
        <button
          disabled={attente > 0}
          onClick={() => {
            setAttente(60);
            setEssais(0);
            setErreur('');
            setCode('');
          }}
          className="cursor-pointer font-semibold text-brand-700 hover:underline disabled:cursor-default disabled:text-encre-pale disabled:no-underline"
        >
          {attente > 0 ? `Renvoyer le code dans ${attente} s` : 'Renvoyer le code'}
        </button>
      </div>
    </div>
  );
}

/* ---------- Nouveau mot de passe ---------- */
const regles = [
  { id: 'long', label: 'Au moins 8 caractères', test: (v: string) => v.length >= 8 },
  { id: 'chiffre', label: 'Au moins un chiffre', test: (v: string) => /\d/.test(v) },
  { id: 'lettre', label: 'Des lettres majuscules et minuscules', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
];

function NouveauMotDePasse({ onFini }: { onFini: () => void }) {
  const [mdp, setMdp] = useState('');
  const [confirm, setConfirm] = useState('');
  const [voir, setVoir] = useState(false);
  const [essai, setEssai] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const ok = regles.every((r) => r.test(mdp));
  const identiques = mdp === confirm && confirm.length > 0;
  const force = regles.filter((r) => r.test(mdp)).length + (mdp.length >= 12 ? 1 : 0);
  const niveaux = ['Trop faible', 'Faible', 'Moyen', 'Solide', 'Très solide'];

  const enregistrer = (e: FormEvent) => {
    e.preventDefault();
    setEssai(true);
    if (!ok || !identiques) return;
    setEnvoi(true);
    setTimeout(onFini, 500);
  };

  return (
    <>
      <h1 className="font-display text-[34px] font-bold leading-tight tracking-[-0.03em]">Nouveau mot de passe</h1>
      <p className="mt-2 text-encre-doux">Il remplacera l’ancien sur tous vos appareils.</p>
      <form onSubmit={enregistrer} className="mt-9 flex flex-col gap-5" noValidate>
        <div>
          <label htmlFor="n-mdp" className="field-label">Nouveau mot de passe</label>
          <div className="relative">
            <input id="n-mdp" type={voir ? 'text' : 'password'} autoComplete="new-password" value={mdp} onChange={(e) => setMdp(e.target.value)} className="field-input pr-12" aria-describedby="regles" aria-invalid={essai && !ok} />
            <button type="button" onClick={() => setVoir(!voir)} className="absolute inset-y-0 right-0 grid w-12 cursor-pointer place-items-center text-encre-pale hover:text-encre" aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
              {voir ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3" aria-live="polite">
            <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={cn('h-1.5 rounded-full', force >= n ? (force <= 1 ? 'bg-stylo' : force === 2 ? 'bg-orange' : 'bg-valide') : 'bg-papier-2')} />
              ))}
            </div>
            <span className="w-20 text-right text-xs font-semibold text-encre-doux">{mdp ? niveaux[force] : ''}</span>
          </div>
          <ul id="regles" className="mt-3 flex flex-col gap-1.5 text-[13px]">
            {regles.map((r) => {
              const v = r.test(mdp);
              return (
                <li key={r.id} className={cn('flex items-center gap-2', v ? 'text-valide' : essai ? 'text-stylo' : 'text-encre-doux')}>
                  {v ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
                  {r.label}
                  <span className="sr-only">{v ? ' : respecté' : ' : pas encore respecté'}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <label htmlFor="c-mdp" className="field-label">Confirmer le mot de passe</label>
          <input id="c-mdp" type={voir ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field-input" aria-invalid={essai && !identiques} aria-describedby="c-aide" />
          <p id="c-aide" className={cn('field-hint', essai && !identiques && 'font-semibold text-stylo')}>
            {confirm && identiques ? '✓ Les deux mots de passe sont identiques.' : essai && !identiques ? 'Les deux mots de passe ne sont pas identiques.' : 'Retapez le même mot de passe.'}
          </p>
        </div>
        <button type="submit" disabled={envoi} className={boutonPrincipal}>
          {envoi && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {envoi ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
        </button>
      </form>
    </>
  );
}

/* ---------- Terminé ---------- */
function Termine() {
  const nav = useNavigate();
  return (
    <div role="status">
      <span className="grid size-14 place-items-center rounded-2xl bg-valide-50 text-valide"><CheckCircle2 className="size-7" aria-hidden /></span>
      <h1 className="mt-6 font-display text-[34px] font-bold leading-tight tracking-[-0.03em]">Mot de passe modifié</h1>
      <p className="mt-3 text-encre-doux">Votre nouveau mot de passe est enregistré. Par sécurité, vous avez été déconnecté de vos autres appareils.</p>
      <button onClick={() => nav('/connexion')} className={cn(boutonPrincipal, 'mt-8')}>Se connecter</button>
    </div>
  );
}

function Alerte({ texte }: { texte: string }) {
  return (
    <div role="alert" className="flex gap-2.5 rounded-xl bg-stylo-50 p-3.5 text-sm text-stylo-700">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {texte}
    </div>
  );
}
