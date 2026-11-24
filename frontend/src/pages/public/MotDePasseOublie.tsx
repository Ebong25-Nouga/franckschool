import { ArrowLeft, MailCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

export default function MotDePasseOublie() {
  const [envoye, setEnvoye] = useState(false);
  const [id, setId] = useState('');
  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    if (id.trim()) setEnvoye(true);
  };

  return (
    <div className="seyes-clair flex min-h-dvh items-center justify-center bg-papier px-5">
      <div className="w-full max-w-[420px] rounded-[22px] bg-white p-8 shadow-leve">
        <img src="/logo.svg" alt="" className="size-10" />
        {envoye ? (
          <div role="status" className="mt-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-valide-50 text-valide"><MailCheck className="size-6" aria-hidden /></span>
            <h1 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em]">Lien envoyé</h1>
            <p className="mt-2 text-encre-doux">Si un compte correspond à « {id} », un lien pour choisir un nouveau mot de passe vient de partir. Il reste valable 60 minutes.</p>
          </div>
        ) : (
          <form onSubmit={soumettre} className="mt-7">
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Mot de passe oublié</h1>
            <p className="mt-2 text-encre-doux">Indiquez l’e-mail ou le téléphone de votre compte. Vous recevrez un lien de réinitialisation.</p>
            <label htmlFor="id" className="field-label mt-7">E-mail ou téléphone</label>
            <input id="id" value={id} onChange={(e) => setId(e.target.value)} className="field-input" autoComplete="username" required />
            <button className="mt-5 min-h-12 w-full cursor-pointer rounded-[10px] bg-brand-700 font-semibold text-white shadow-encre transition-colors hover:bg-brand-800">Envoyer le lien</button>
          </form>
        )}
        <Link to="/connexion" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
